import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export const revalidate = 60; // Revalidate every minute for "live" feel

export async function GET() {
    try {
        // 1. Get Subject Count
        const { count: subjectCount, error: subError } = await supabase
            .from('subjects')
            .select('*', { count: 'exact', head: true });

        // 2. Get User Count (Active Students)
        const { count: userCount, error: userError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // 3. Get totals for Downloads and Files
        const [
            { data: totals, error: totalsError },
            { count: totalFiles, error: filesError }
        ] = await Promise.all([
            supabase.from('subjects').select('downloads'),
            supabase.from('approved_materials').select('*', { count: 'exact', head: true })
        ]);

        if (subError || userError || totalsError || filesError) {
            console.error('Public stats error:', { subError, userError, totalsError, filesError });
            return NextResponse.json({ error: 'Failed to fetch platform stats' }, { status: 500 });
        }

        const totalDownloads = (totals || []).reduce((acc, s) => acc + (s.downloads || 0), 0);

        // 4. Get Top Subjects (Top Rated) with live file counts
        const { data: topSubjects } = await supabase
            .from('subjects')
            .select(`
                *,
                totalFiles:approved_materials(count)
            `)
            .order('rating', { ascending: false })
            .limit(6);

        // 5. Get Top Downloaded with live file counts
        const { data: topDownloaded } = await supabase
            .from('subjects')
            .select(`
                *,
                totalFiles:approved_materials(count)
            `)
            .order('downloads', { ascending: false })
            .limit(6);

        // 6. Get Top Contributors (Leaderboard) - Based on points/uploads
        const { data: contributors } = await supabase
            .from('users')
            .select('id, username, points, uploads, avatar_url')
            .order('points', { ascending: false })
            .limit(5);

        // Process file counts for the top lists
        const mapFileCounts = (list: any[]) => (list || []).map(s => ({
            ...s,
            totalFiles: s.totalFiles?.[0]?.count || 0
        }));

        return NextResponse.json({
            subjects: subjectCount || 0,
            students: userCount || 0,
            downloads: totalDownloads,
            files: totalFiles || 0,
            topSubjects: mapFileCounts(topSubjects || []),
            topDownloaded: mapFileCounts(topDownloaded || []),
            leaderboard: contributors || []
        });
    } catch (error: any) {
        console.error('Public stats API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
