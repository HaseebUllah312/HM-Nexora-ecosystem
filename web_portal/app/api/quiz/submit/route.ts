import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { subject, question, options, correct, explanation } = body;

        // Validation
        if (!subject || !question || !options || options.length < 2 || correct === undefined || !explanation) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get current user session
        const cookie = (await cookies()).get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        // Insert into Supabase
        const { error } = await supabase.from('quiz_submissions').insert({
            subject_code: subject,
            question,
            options,
            correct_option: correct,
            explanation,
            status: 'pending',
            submitted_by: session?.id || null,
        });

        if (error) {
            console.error('Supabase quiz submission error:', error);
            return NextResponse.json({ error: 'Failed to submit question' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Question submitted for review' });

    } catch (error) {
        console.error('Error submitting question:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
