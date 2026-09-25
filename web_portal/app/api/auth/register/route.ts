import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { hashPassword, generateSalt } from '@/app/lib/password';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();
        const trimmedUsername = username?.trim();

        if (!trimmedUsername || !password || password.length < 8) {
            return NextResponse.json(
                { error: 'Username is required and password must be at least 8 characters.' },
                { status: 400 }
            );
        }

        // Check if username already taken
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('username', trimmedUsername)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        // Create new user
        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);

        const { error } = await supabase.from('users').insert({
            id: crypto.randomUUID(),
            username: trimmedUsername,
            password_hash: passwordHash,
            salt,
            role: 'student',
            provider: 'local',
            created_at: new Date().toISOString(),
        });

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }

        // Log the activity
        await supabase.from('activity_logs').insert({
            type: 'security',
            title: 'New User Registered',
            description: `A new account was created for: ${trimmedUsername}`,
            severity: 'info',
            actor: trimmedUsername
        });

        return NextResponse.json({ success: true, message: 'Registration successful' });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
