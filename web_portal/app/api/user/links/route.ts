import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySession(sessionCookie.value);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
        .from('user_links')
        .select('*')
        .eq('user_id', session.id)
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySession(sessionCookie.value);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { title, url, id, action } = await request.json();

        if (action === 'delete' && id) {
            const { error } = await supabase
                .from('user_links')
                .delete()
                .eq('id', id)
                .eq('user_id', session.id);
            if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
            return NextResponse.json({ success: true });
        }

        if (!title || !url) {
            return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('user_links')
            .insert([{ user_id: session.id, title, url }])
            .select()
            .single();

        if (error) return NextResponse.json({ error: 'Failed to save link' }, { status: 500 });

        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
