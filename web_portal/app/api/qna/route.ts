import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifySession } from '@/app/lib/session';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sort = searchParams.get('sort') || 'recent';
        const search = searchParams.get('search') || '';
        const filter = searchParams.get('filter') || 'all';

        let query = supabase
            .from('qna_questions')
            .select('*');

        if (search) {
            query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
        }

        if (filter === 'answered') {
            query = query.eq('accepted', true);
        } else if (filter === 'unanswered') {
            query = query.eq('accepted', false);
        }

        if (sort === 'votes') {
            query = query.order('votes', { ascending: false });
        } else if (sort === 'trending') {
            query = query.order('answers', { ascending: false }).order('votes', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data: questions, error } = await query;

        if (error) {
            console.error('QnA fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
        }

        // Fetch points for all authors to calculate badges
        const authorNames = Array.from(new Set((questions || []).map(q => q.author)));
        
        // We'll calculate points on the fly for these authors to show real-time status
        // Review = 50, Answer = 100
        const { data: reviews } = await supabase.from('subject_reviews').select('username').in('username', authorNames);
        const { data: answers } = await supabase.from('qna_answers').select('author').in('author', authorNames);

        const pointMap: Record<string, number> = {};
        reviews?.forEach(r => pointMap[r.username] = (pointMap[r.username] || 0) + 50);
        answers?.forEach(a => pointMap[a.author] = (pointMap[a.author] || 0) + 100);

        const badgeQuestions = (questions || []).map(q => {
            const pts = pointMap[q.author] || 0;
            let badge = '';
            if (pts >= 5000) badge = '💎 Platinum Legend';
            else if (pts >= 3000) badge = '🥇 Gold Mentor';
            else if (pts >= 1500) badge = '🥈 Silver Expert';
            else if (pts >= 500) badge = '🥉 Bronze Contributor';
            
            return { ...q, author_badge: badge, author_points: pts };
        });

        return NextResponse.json(badgeQuestions);
    } catch (err) {
        console.error('QnA GET error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');
        const session = sessionCookie ? await verifySession(sessionCookie.value) : null;

        if (!session) {
            return NextResponse.json({ error: 'You must be logged in to post a question.' }, { status: 401 });
        }

        const { title, body, tags } = await req.json();

        if (!title?.trim() || !body?.trim()) {
            return NextResponse.json({ error: 'Title and body are required.' }, { status: 400 });
        }

        const tagArray = typeof tags === 'string'
            ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : (Array.isArray(tags) ? tags : []);

        const { data, error } = await supabase
            .from('qna_questions')
            .insert({
                title: title.trim(),
                body: body.trim(),
                tags: tagArray,
                author: session.username,
                user_id: session.id,
                votes: 0,
                answers: 0,
                accepted: false,
            })
            .select()
            .single();

        if (error) {
            console.error('QnA insert error:', error);
            return NextResponse.json({ error: 'Failed to post question.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, question: data });
    } catch (err) {
        console.error('QnA POST error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    // Vote on a question
    try {
        const { id, direction } = await req.json(); // direction: 'up' | 'down'
        if (!id || !['up', 'down'].includes(direction)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const { data: current } = await supabase
            .from('qna_questions')
            .select('votes')
            .eq('id', id)
            .single();

        const newVotes = (current?.votes || 0) + (direction === 'up' ? 1 : -1);

        const { error } = await supabase
            .from('qna_questions')
            .update({ votes: newVotes })
            .eq('id', id);

        if (error) return NextResponse.json({ error: 'Vote failed' }, { status: 500 });

        return NextResponse.json({ success: true, votes: newVotes });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');
        const session = sessionCookie ? await verifySession(sessionCookie.value) : null;

        if (!session || session.role !== 'owner') {
            return NextResponse.json({ error: 'Only the owner can delete questions.' }, { status: 403 });
        }

        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { error } = await supabase
            .from('qna_questions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('QnA delete error:', error);
            return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
