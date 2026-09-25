import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
        console.error('GOOGLE_CLIENT_ID is not set in environment variables.');
        return NextResponse.json(
            { error: 'OAuth is not configured. GOOGLE_CLIENT_ID is missing.' },
            { status: 500 }
        );
    }

    // Auto-detect base URL from request — works on localhost and any Vercel domain
    const requestUrl = new URL(req.url);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
        `${requestUrl.protocol}//${requestUrl.host}`;
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        redirect_uri: redirectUri,
        client_id: clientId,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };

    const qs = new URLSearchParams(options);
    console.log('Google OAuth redirect_uri:', redirectUri);

    return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
}
