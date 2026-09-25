import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import { supabase } from '@/app/lib/supabase';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { subjects } = await req.json();

        if (!Array.isArray(subjects)) {
            return NextResponse.json({ error: 'Invalid subjects format' }, { status: 400 });
        }

        // Limit to 10 subjects
        const limitedSubjects = subjects.slice(0, 10);

        const { error } = await supabase
            .from('users')
            .update({ followed_subjects: limitedSubjects })
            .eq('id', session.id);

        if (error) {
            console.error('Error updating subjects:', error);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true, subjects: limitedSubjects });

    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
