import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/app/lib/supabase';
import { verifySession } from '@/app/lib/session';

const getCurrentUser = async () => {
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) return null;
    return await verifySession(cookie);
}

export async function GET(req: Request) {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        let query = supabase
            .from('users')
            .select('id, username, email, role, provider, created_at, is_email_verified');

        if (search) {
            query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data: users, error } = await query
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch users error:', error);
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
        }

        return NextResponse.json(users);
    } catch (error) {
        console.error('Admin users GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const currentUser = await getCurrentUser();

    // Only Owner can promote/demote
    if (!currentUser || currentUser.role !== 'owner') {
        return NextResponse.json({ error: 'Forbidden: Only Owner can manage roles' }, { status: 403 });
    }

    try {
        const { userId, newRole } = await req.json();

        // Validate role
        if (!['owner', 'admin', 'student'].includes(newRole)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // 1. Fetch the target user to check if it's the Main Owner
        const { data: targetUser, error: fetchError } = await supabase
            .from('users')
            .select('email, role')
            .eq('id', userId)
            .single();

        if (fetchError || !targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. CRITICAL: Protect the Main Owner (haseebsaleem312@gmail.com)
        // No one can demote OR change the role of the Main Owner.
        if (targetUser.email === 'haseebsaleem312@gmail.com') {
            return NextResponse.json({ error: 'Forbidden: The Main Owner role cannot be changed or revoked.' }, { status: 403 });
        }

        // 3. Update in Supabase
        const { error: updateError } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId);

        if (updateError) {
            console.error('Supabase update role error:', updateError);
            return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
        }

        // 4. Log the activity
        await supabase.from('activity_logs').insert({
            type: 'security',
            title: 'User Role Updated',
            description: `${currentUser.username} changed role of ${targetUser.email} to ${newRole}`,
            severity: 'warning',
            actor: currentUser.username
        });

        return NextResponse.json({ success: true, message: `User role updated to ${newRole}` });

    } catch (error) {
        console.error('Update role error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
