import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';
import { supabase } from '@/app/lib/supabase';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        // Only Boss/Owner/Admin can reset
        if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Bulk update ALL users to have empty followed_subjects
        const { error } = await supabase
            .from('users')
            .update({ followed_subjects: [] })
            .neq('id', 'placeholder-to-match-all'); // A trick to update all if no filter matches

        // Actually cleaner: update where followed_subjects is not empty
        // However, Supabase update requires a filter. 
        // We can use .neq('id', '00000000-0000-0000-0000-000000000000') 

        const { error: bulkError } = await supabase
            .from('users')
            .update({ followed_subjects: [] })
            .not('followed_subjects', 'is', null);

        if (bulkError) {
            console.error('Bulk reset error:', bulkError);
            return NextResponse.json({ error: 'Failed to reset subjects' }, { status: 500 });
        }

        // Log the reset activity
        await supabase.from('activity_logs').insert({
            type: 'system',
            title: 'Semester Reset Performed',
            description: `All student subjects were cleared by ${session.username} for the new semester.`,
            severity: 'warning',
            actor: session.username
        });

        return NextResponse.json({ success: true, message: 'All student subjects reset successfully' });

    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
