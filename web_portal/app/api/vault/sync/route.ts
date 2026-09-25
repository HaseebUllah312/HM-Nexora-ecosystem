import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import { supabase } from '@/app/lib/supabase';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { subjectCodes } = await req.json();

        if (!Array.isArray(subjectCodes)) {
            return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
        }

        // Fetch all approved files for these subjects
        const { data: rawFiles, error } = await supabase
            .from('approved_materials')
            .select('link, title, size, code, type')
            .in('code', subjectCodes);

        if (error) {
            console.error('Sync Error:', error);
            return NextResponse.json({ error: 'Database fetch failed' }, { status: 500 });
        }

        // Map database fields to the format the frontend expects (drive_id)
        const files = (rawFiles || []).map(f => ({
            drive_id: f.link,
            title: f.title,
            size: f.size,
            subject_code: f.code,
            category: f.type || 'material'
        }));

        return NextResponse.json({ success: true, files });

    } catch (err) {
        console.error('Batch Sync Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
