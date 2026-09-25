import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/app/lib/supabase';
import { verifySession } from '@/app/lib/session';

export async function POST(req: Request) {
    try {
        const cookie = (await cookies()).get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username, email, weak_topics } = await req.json();

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const updateData: any = { username, email };
        if (weak_topics) updateData.weak_topics = weak_topics;

        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', session.id);

        if (error) {
            console.error('Profile update error:', error);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        // Log the activity
        await supabase.from('activity_logs').insert({
            type: 'user',
            title: 'Profile Updated',
            description: `${session.username} updated their profile info`,
            severity: 'info',
            actor: session.username
        });

        return NextResponse.json({ success: true, message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Profile update API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
