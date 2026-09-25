import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import { autoCategorize } from '@/data/subjects';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// GET: List all subjects with their full details from Supabase
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');

        // 1. Get all codes from master list
        const jsonPath = path.join(process.cwd(), 'data', 'subjects.json');
        let masterCodes: string[] = [];
        if (fs.existsSync(jsonPath)) {
            masterCodes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        }

        // 2. Fetch subjects from Database
        const { data: dbSubjects, error: subjError } = await supabase
            .from('subjects')
            .select('*');

        if (subjError) {
            console.error('Supabase fetch error:', subjError);
            return NextResponse.json({ error: 'Failed to load subjects' }, { status: 500 });
        }

        const dbMap: Record<string, any> = {};
        dbSubjects?.forEach((s: any) => {
            dbMap[s.code.toUpperCase()] = s;
        });

        // 3. Fetch counts from approved_materials with PARALLEL pagination to handle 20k+ records
        const PAGE_SIZE = 1000;
        const CONCURRENCY = 5; // Fetch 5 pages at a time
        let allFileCounts: any[] = [];
        let totalCount = 0;

        // First, get the total count to know how many pages to fetch
        const { count, error: countFetchError } = await supabase
            .from('approved_materials')
            .select('*', { count: 'exact', head: true });
        
        if (countFetchError) {
            console.error('Error getting total materials count:', countFetchError);
        }
        
        totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);
        console.log(`Aggregating ${totalCount} materials across ${totalPages} pages...`);

        // Fetch pages in chunks of CONCURRENCY
        for (let i = 0; i < totalPages; i += CONCURRENCY) {
            const promises = [];
            for (let j = 0; j < CONCURRENCY && (i + j) < totalPages; j++) {
                const pageNum = i + j;
                promises.push(
                    supabase
                        .from('approved_materials')
                        .select('code, type')
                        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)
                );
            }
            
            const results = await Promise.all(promises);
            results.forEach((res, idx) => {
                if (res.error) {
                    console.error(`Error fetching page ${i + idx}:`, res.error);
                } else if (res.data) {
                    allFileCounts = [...allFileCounts, ...res.data];
                }
            });
        }

        console.log(`Successfully aggregated ${allFileCounts.length} material records for ${dbSubjects?.length || masterCodes.length} potential subjects.`);
        
        const stats: Record<string, { total: number, midterm: number, final: number, handouts: number, quizzes: number }> = {};
        
        allFileCounts.forEach(fc => {
            // Normalize code: remove all non-alphanumeric and uppercase
            const upCode = (fc.code || '').toString().trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            
            if (!upCode) return;
            
            if (!stats[upCode]) stats[upCode] = { total: 0, midterm: 0, final: 0, handouts: 0, quizzes: 0 };
            
            stats[upCode].total++;
            const typeValue = (fc.type || '').toLowerCase();
            
            if (typeValue.includes('midterm')) stats[upCode].midterm++;
            else if (typeValue.includes('final')) stats[upCode].final++;
            else if (typeValue.includes('handout') || typeValue.includes('course book')) stats[upCode].handouts++;
            else if (typeValue.includes('quiz')) stats[upCode].quizzes++;
        });

        const normalize = (c: string) => (c || '').toString().trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

        // 4. Merge everything from all sources: master list, database, and materials
        // We use the normalized version as the definitive key
        const allUniqueCodes = new Set([
            ...masterCodes.map(c => normalize(c)),
            ...Object.keys(dbMap).map(c => normalize(c)),
            ...Object.keys(stats).map(c => normalize(c))
        ]);

        let processed = Array.from(allUniqueCodes).map(code => {
            const upCode = code; 
            const dbSubj = dbMap[upCode];
            const sStat = stats[upCode] || { total: 0, midterm: 0, final: 0, handouts: 0, quizzes: 0 };

            return {
                code: upCode,
                name: dbSubj?.name || `${upCode} - Subject Details Coming Soon`,
                category: dbSubj?.category || autoCategorize(upCode),
                credit_hours: dbSubj?.credit_hours || 3,
                difficulty: dbSubj?.difficulty || 'Medium',
                description: dbSubj?.description || `Comprehensive study materials and past papers for ${upCode}.`,
                rating: dbSubj?.rating || 0,
                downloads: dbSubj?.downloads || 0,
                teachers: dbSubj?.teachers || [],
                totalFiles: sStat.total,
                midtermCount: sStat.midterm,
                finalCount: sStat.final,
                handoutsCount: sStat.handouts,
                quizzesCount: sStat.quizzes
            };
        });

        // 5. Apply search filter if provided
        if (search) {
            const q = search.toLowerCase();
            processed = processed.filter(s => 
                s.code.toLowerCase().includes(q) || 
                s.name.toLowerCase().includes(q)
            );
        }

        // 6. Sort return (by code)
        processed.sort((a, b) => a.code.localeCompare(b.code));

        return NextResponse.json(processed);
    } catch (e) {
        console.error('Subjects API error:', e);
        return NextResponse.json({ error: 'Failed to load subjects' }, { status: 500 });
    }
}

// POST: Add new subject (Standardized for Supabase)
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { code, name, category, credit_hours, difficulty } = await req.json();
        if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

        const upperCode = code.toUpperCase();

        const { data, error } = await supabase
            .from('subjects')
            .upsert({
                code: upperCode,
                name: name || upperCode + ' - New Subject',
                category: category || 'General',
                credit_hours: credit_hours || 3,
                difficulty: difficulty || 'Medium'
            })
            .select();

        if (error) {
            console.error('Supabase upsert error:', error);
            return NextResponse.json({ error: 'Failed to save subject to DB' }, { status: 500 });
        }

        // Log the activity
        await supabase.from('activity_logs').insert({
            type: 'content',
            title: 'Subject Added/Updated',
            description: `${session.username} modified subject: ${upperCode}`,
            severity: 'info',
            actor: session.username
        });

        return NextResponse.json({ success: true, subjects: data });
    } catch (e) {
        console.error('Subject POST error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
