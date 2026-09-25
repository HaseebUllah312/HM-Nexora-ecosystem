import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { createSession } from '@/app/lib/session';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    const requestUrl = new URL(req.url);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
        `${requestUrl.protocol}//${requestUrl.host}`;

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=Google login failed', baseUrl));
    }

    // Validate required env vars up front
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET env vars');
        return NextResponse.redirect(new URL('/login?error=OAuth+not+configured+on+server', baseUrl));
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
        return NextResponse.redirect(new URL('/login?error=Database+not+configured+on+server', baseUrl));
    }

    try {
        // Exchange code for tokens
        const redirectUri = `${baseUrl}/api/auth/google/callback`;

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID || '',
                client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) {
            console.error('Google token error:', tokenData.error);
            return NextResponse.redirect(new URL('/login?error=Google login failed', baseUrl));
        }

        // Get User Info from Google
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const googleUser = await userResponse.json();

        if (!googleUser.email) {
            return NextResponse.redirect(new URL('/login?error=Could not get Google account info', baseUrl));
        }

        // Owner email — always granted owner role
        const OWNER_EMAIL = 'haseebsaleem312@gmail.com';
        const isOwner = googleUser.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

        // Find or create user
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', googleUser.email)
            .maybeSingle();

        let userId: string;
        let username: string;
        let role: string;

        if (!existingUser) {
            console.log('Creating new Google user:', googleUser.email);
            userId = crypto.randomUUID();
            // Build a clean username from name or email (no spaces/special chars)
            username = (googleUser.name || googleUser.email.split('@')[0])
                .replace(/[^a-zA-Z0-9_]/g, '_')
                .slice(0, 30);
            role = isOwner ? 'owner' : 'student';

            const insertData: Record<string, any> = {
                id: userId,
                username,
                email: googleUser.email,
                provider: 'google',
                role,
                is_email_verified: true,
                created_at: new Date().toISOString(),
            };

            // Add optional fields only if they exist in schema
            if (googleUser.picture) insertData.image = googleUser.picture;

            const { error } = await supabase.from('users').insert(insertData);

            if (error) {
                console.error('Supabase insert error:', error.message, error.details);
                return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Account creation failed: ' + error.message)}`, baseUrl));
            }
        } else {
            console.log('Google user found:', existingUser.email);
            userId = existingUser.id;
            username = existingUser.username;
            role = existingUser.role;

            const updates: any = { is_email_verified: true };

            if (isOwner && role !== 'owner') {
                updates.role = 'owner';
                role = 'owner';
                console.log('Upgraded', googleUser.email, 'to owner role');
            }

            await supabase.from('users').update(updates).eq('id', userId);
        }

        const sessionToken = await createSession({ id: userId, username, role: role as any });

        const response = NextResponse.redirect(new URL('/dashboard', baseUrl));
        response.cookies.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Callback error:', error);
        return NextResponse.redirect(new URL('/login?error=An error occurred', baseUrl));
    }
}
