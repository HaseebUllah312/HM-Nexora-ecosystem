import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/app/lib/supabase';
import { verifySession } from '@/app/lib/session';

const checkAdmin = async () => {
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) return null;
    const session = await verifySession(cookie);
    if (!session || (session.role !== 'admin' && session.role !== 'owner')) return null;
    return session;
}

export async function GET() {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    return NextResponse.json(reports);
}

export async function PATCH(req: Request) {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id, status } = await req.json();

        const { error } = await supabase
            .from('reports')
            .update({ status })
            .eq('id', id);

        if (error) return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });

        // Log the moderation action
        await supabase.from('activity_logs').insert({
            type: 'security',
            title: `Report ${status.toUpperCase()}`,
            description: `Admin ${admin.username} marked report ${id} as ${status}`,
            severity: status === 'approved' ? 'success' : 'info',
            actor: admin.username
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
