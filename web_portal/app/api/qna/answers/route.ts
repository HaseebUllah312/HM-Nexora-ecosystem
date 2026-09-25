import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifySession } from '@/app/lib/session';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const questionId = searchParams.get('questionId');

        if (!questionId) {
            return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
        }

        const { data: answers, error } = await supabase
            .from('qna_answers')
            .select('*')
            .eq('question_id', questionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Fetch answers error:', error);
            return NextResponse.json([]);
        }

        const authorNames = Array.from(new Set((answers || []).map(a => a.author)));
        const { data: reviews } = await supabase.from('subject_reviews').select('username').in('username', authorNames);
        const { data: qAnswers } = await supabase.from('qna_answers').select('author').in('author', authorNames);

        const pointMap: Record<string, number> = {};
        reviews?.forEach(r => pointMap[r.username] = (pointMap[r.username] || 0) + 50);
        qAnswers?.forEach(a => pointMap[a.author] = (pointMap[a.author] || 0) + 100);

        const badgeAnswers = (answers || []).map(a => {
            const pts = pointMap[a.author] || 0;
            let badge = '';
            if (pts >= 5000) badge = '💎 Platinum Legend';
            else if (pts >= 3000) badge = '🥇 Gold Mentor';
            else if (pts >= 1500) badge = '🥈 Silver Expert';
            else if (pts >= 500) badge = '🥉 Bronze Contributor';
            
            return { ...a, author_badge: badge, author_points: pts };
        });

        return NextResponse.json(badgeAnswers || []);
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');
        const session = sessionCookie ? await verifySession(sessionCookie.value) : null;

        if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
            return NextResponse.json({ error: 'Only admins and the owner can reply.' }, { status: 403 });
        }

        const { questionId, body } = await req.json();

        if (!questionId || !body?.trim()) {
            return NextResponse.json({ error: 'Question ID and body required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('qna_answers')
            .insert({
                question_id: questionId,
                body: body.trim(),
                author: session.username,
                role: session.role,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Post answer error:', error);
            return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });
        }

        // Increment answer count on question
        const { data: qData } = await supabase
            .from('qna_questions')
            .select('answers, user_id, title')
            .eq('id', questionId)
            .single();
        
        await supabase
            .from('qna_questions')
            .update({ answers: (qData?.answers || 0) + 1 })
            .eq('id', questionId);

        // Add notification for question author
        if (qData?.user_id && qData.user_id !== session.id) {
            await supabase.from('user_notifications').insert({
                user_id: qData.user_id,
                message: `👤 ${session.username} replied to your question: "${qData.title}"`,
                type: 'reply',
                read: false,
                created_at: new Date().toISOString()
            });
        }

        return NextResponse.json({ success: true, answer: data });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
