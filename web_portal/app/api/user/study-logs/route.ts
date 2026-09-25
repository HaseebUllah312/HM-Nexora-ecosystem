import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('study_logs')
        .select('*')
        .eq('user_id', session.id)
        .order('study_date', { ascending: false });

    if (error) {
        console.error('Error fetching study logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { subject_code, topics, duration, study_date } = await request.json();

        if (!subject_code || !duration) {
            return NextResponse.json({ error: 'Subject and duration are required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('study_logs')
            .insert([{
                user_id: session.id,
                subject_code,
                topics,
                duration: parseInt(duration),
                study_date: study_date || new Date().toISOString().split('T')[0]
            }])
            .select()
            .single();

        if (error) {
            console.error('Error saving study log:', error);
            return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Log ID required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('study_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', session.id);

    if (error) {
        console.error('Error deleting study log:', error);
        return NextResponse.json({ error: 'Failed to delete log' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
