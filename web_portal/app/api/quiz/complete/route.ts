import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/app/lib/supabase';
import { verifySession } from '@/app/lib/session';

export async function POST(req: Request) {
    try {
        const cookie = (await cookies()).get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { subjectCode, score, totalQuestions } = await req.json();

        if (!subjectCode || score === undefined || !totalQuestions) {
            return NextResponse.json({ error: 'Missing completion data' }, { status: 400 });
        }

        const { error } = await supabase.from('quiz_attempts').insert({
            user_id: session.id,
            subject_code: subjectCode,
            score,
            total_questions: totalQuestions,
        });

        if (error) {
            console.error('Failed to record quiz attempt:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // Optional: Trigger an activity log entry
        await supabase.from('activity_logs').insert({
            type: 'user',
            title: 'Quiz Completed',
            description: `${session.username} scored ${score}/${totalQuestions} in ${subjectCode}`,
            severity: 'success',
            actor: session.username
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Quiz complete API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
