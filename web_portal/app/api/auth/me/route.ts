import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('session')?.value;
    const session = cookie ? await verifySession(cookie) : null;

    if (!session) {
        return NextResponse.json({ user: null });
    }

    // Fetch fresh user data from Supabase to capture avatar_url changes and live role edits
    const { data: dbUser, error } = await supabase
        .from('users')
        .select('id, username, role, avatar_url, email, followed_subjects')
        .eq('id', session.id)
        .single();

    if (error || !dbUser) {
        // Fallback to session data if profile lookup fails
        return NextResponse.json({
            user: {
                id: session.id,
                username: session.username,
                role: session.role,
                avatar_url: session.avatar_url,
                email: (session as any).email || null,
                followed_subjects: []
            }
        });
    }

    return NextResponse.json({
        user: {
            id: dbUser.id,
            username: dbUser.username,
            role: dbUser.role,
            avatar_url: dbUser.avatar_url,
            email: dbUser.email,
            followed_subjects: dbUser.followed_subjects || []
        }
    });
}
