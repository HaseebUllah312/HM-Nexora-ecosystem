import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/app/lib/session';

export async function GET(req: NextRequest) {
    const cookie = req.cookies.get('session')?.value;
    const session = cookie ? await verifySession(cookie) : null;

    if (!session) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, session });
}
