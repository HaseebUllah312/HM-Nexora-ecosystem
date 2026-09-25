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
        .from('study_schedules')
        .select('*')
        .eq('user_id', session.id);

    if (error) {
        console.error('Error fetching schedules:', error);
        return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
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
        const { id, subject_code, day_of_week, start_time, end_time, is_alarm_enabled } = await request.json();

        if (!subject_code || !day_of_week || !start_time || !end_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let result;
        if (id) {
            // Update
            result = await supabase
                .from('study_schedules')
                .update({ subject_code, day_of_week, start_time, end_time, is_alarm_enabled })
                .eq('id', id)
                .eq('user_id', session.id)
                .select()
                .single();
        } else {
            // Insert
            result = await supabase
                .from('study_schedules')
                .insert([{
                    user_id: session.id,
                    subject_code,
                    day_of_week,
                    start_time,
                    end_time,
                    is_alarm_enabled: is_alarm_enabled ?? true
                }])
                .select()
                .single();
        }

        if (result.error) {
            console.error('Error saving schedule:', result.error);
            return NextResponse.json({ error: 'Failed to save schedule' }, { status: 500 });
        }

        return NextResponse.json(result.data);
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
        return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('study_schedules')
        .delete()
        .eq('id', id)
        .eq('user_id', session.id);

    if (error) {
        return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
