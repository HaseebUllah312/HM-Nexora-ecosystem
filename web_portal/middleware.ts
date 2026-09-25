import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.SESSION_SECRET || 'CHANGE_THIS_IN_PRODUCTION_TO_A_LONG_RANDOM_STRING';
const KEY = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Define protected routes
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
    const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/vault') || isAdminRoute;
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

    // 2. Get session token
    const token = request.cookies.get('session')?.value;

    // 3. Verify session
    let payload = null;
    if (token) {
        try {
            const { payload: verifiedPayload } = await jwtVerify(token, KEY);
            payload = verifiedPayload as any;
        } catch (error) {
            console.error('Middleware: Session verification failed', error);
        }
    }

    // 4. Handle Authorization
    
    // Redirect logged-in users away from login/register
    if (isAuthRoute && payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Check Bot API Key first
    const apiKeyHeader = request.headers.get('x-api-key');
    const apiKeyQuery = request.nextUrl.searchParams.get('bot_key');
    const apiKey = apiKeyHeader || apiKeyQuery;
    const validApiKey = process.env.BOT_API_KEY;
    const isBotAuthenticated = apiKey && validApiKey && apiKey === validApiKey;

    // Block guests from protected routes (unless it's an authenticated bot)
    if (isProtectedRoute && !payload && !isBotAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Admin & Owner only routes
    if (isAdminRoute && !isBotAuthenticated) {
        if (!payload || (payload.role !== 'admin' && payload.role !== 'owner')) {
            console.warn(`Unauthorized access attempt to ${pathname} by ${payload?.username || 'Guest'}`);
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (except admin api)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - logo.png, icon.png (public assets)
         */
        '/((?!api/auth|api/public-stats|_next/static|_next/image|favicon.ico|logo.png|icon.png|sw.js|manifest.json).*)',
    ],
};
