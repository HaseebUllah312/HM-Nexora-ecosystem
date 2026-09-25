import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { createSession } from '@/app/lib/session';
import { verifyPassword } from '@/app/lib/password';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const identifier = email?.trim();
        console.log('Login attempt for:', identifier);

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Look up user by username OR email (case-insensitive)
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .or(`username.ilike.${identifier},email.ilike.${identifier}`)
            .maybeSingle();

        if (fetchError) {
            console.error('Database fetch error during login:', fetchError);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        if (!user) {
            console.log('User not found for identifier:', identifier);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.password_hash) {
            return NextResponse.json(
                { error: 'This account uses Google Sign-In. Please use the Google button.' },
                { status: 401 }
            );
        }

        const isValid = verifyPassword(password, user.password_hash, user.salt);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        let currentRole = user.role;

        // Auto-promote owner if email matches
        if (user.email === 'haseebsaleem312@gmail.com' && currentRole !== 'owner') {
            const { error: updateError } = await supabase
                .from('users')
                .update({ role: 'owner' })
                .eq('id', user.id);

            if (!updateError) {
                currentRole = 'owner';
            }
        }

        const sessionToken = await createSession({
            id: user.id,
            username: user.username,
            role: currentRole,
            avatar_url: user.avatar_url,
        });

        const response = NextResponse.json({ success: true, role: currentRole });
        response.cookies.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        // Log the activity
        await supabase.from('activity_logs').insert({
            type: 'security',
            title: 'User Login',
            description: `${user.username} logged in successfully`,
            severity: 'info',
            actor: user.username
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
