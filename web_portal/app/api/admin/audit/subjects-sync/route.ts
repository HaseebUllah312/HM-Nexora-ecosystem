import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 1. Get subjects from Database
        const { data: dbSubjects, error } = await supabase
            .from('subjects')
            .select('code');
        
        if (error) throw error;
        const dbCodes = new Set(dbSubjects.map(s => s.code.toUpperCase()));

        // 2. Get subjects from JSON file
        const jsonPath = path.join(process.cwd(), 'data', 'subjects.json');
        let jsonCodesArr: string[] = [];
        
        if (fs.existsSync(jsonPath)) {
            const fileContent = fs.readFileSync(jsonPath, 'utf8');
            jsonCodesArr = JSON.parse(fileContent);
        }
        
        const jsonCodes = new Set(jsonCodesArr.map(c => c.toUpperCase()));

        // 3. Compare
        const missingInDb = jsonCodesArr.filter(c => !dbCodes.has(c.toUpperCase()));
        const missingInJson = Array.from(dbCodes).filter(c => !jsonCodes.has(c));

        return NextResponse.json({
            dbCount: dbCodes.size,
            jsonCount: jsonCodes.size,
            missingInDb,
            missingInJson
        });
    } catch (e) {
        console.error('Audit API error:', e);
        return NextResponse.json({ error: 'Failed to perform audit' }, { status: 500 });
    }
}
