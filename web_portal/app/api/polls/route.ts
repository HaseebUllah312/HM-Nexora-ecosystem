import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET /api/polls?subject=CS101 — fetch polls for a subject
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject')?.toUpperCase();

    if (!subject) {
        return NextResponse.json({ error: 'subject is required' }, { status: 400 });
    }

    try {
        const { data: polls, error } = await supabase
            .from('polls')
            .select('*, poll_options(*)')
            .eq('subject_code', subject)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return NextResponse.json(polls || []);
    } catch (err: any) {
        console.error('Get polls error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
