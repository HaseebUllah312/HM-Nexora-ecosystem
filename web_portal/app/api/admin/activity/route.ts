import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/app/lib/supabase';
import { verifySession } from '@/app/lib/session';

export async function GET() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('session')?.value;
    if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const session = await verifySession(cookie);
    if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: logs, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        console.error('Activity log error:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    return NextResponse.json(logs);
}
