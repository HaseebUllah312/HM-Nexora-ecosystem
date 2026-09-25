import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';


export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
    // Await params if it's a promise (Next.js 15+ routing change), or just use it if it's not.
    // In Next 14, params is an object. In Next 15 it's a promise.
    const resolvedParams = await context.params;
    const code = resolvedParams.code.toUpperCase();
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term'); // 'midterm' or 'final'

    let query = supabase.from('subject_reviews').select('*').eq('subject_code', code).order('created_at', { ascending: false });

    if (term) {
        query = query.eq('term', term);
    }

    const { data: reviews, error } = await query;

    if (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json(reviews || []);
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
    const resolvedParams = await context.params;
    const code = resolvedParams.code.toUpperCase();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { rating, comment, term } = body;

        if (!rating || !comment || !term) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase.from('subject_reviews').insert([{
            subject_code: code,
            user_id: session.id,
            username: session.username,
            avatar_url: session.avatar_url || null,
            rating: parseInt(rating),
            comment,
            term
        }]).select().single();

        if (error) {
            console.error('Error inserting review:', error);
            return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ code: string }> }) {
    const resolvedParams = await context.params;
    const code = resolvedParams.code.toUpperCase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(sessionCookie.value);
    if (!session || session.role !== 'owner') {
        return NextResponse.json({ error: 'Forbidden: Only owners can delete reviews' }, { status: 403 });
    }

    const { error } = await supabase.from('subject_reviews').delete().eq('id', id).eq('subject_code', code);

    if (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
