import { verifySession } from '@/app/lib/session';
import { supabase } from '@/app/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookie = (await cookies()).get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { userIds, action } = await request.json();

        // Only owner can promote users to admin
        if (action === 'promote-admin' && session.role !== 'owner') {
            return new Response(JSON.stringify({ error: 'Forbidden: Only owner can promote users to admin' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (action === 'suspend') {
            const { error } = await supabase
                .from('users')
                .update({ role: 'suspended' })
                .in('id', userIds);

            if (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else if (action === 'promote-admin') {
            const { error } = await supabase
                .from('users')
                .update({ role: 'admin' })
                .in('id', userIds);

            if (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } else if (action === 'demote') {
            const { error } = await supabase
                .from('users')
                .update({ role: 'student' })
                .in('id', userIds);

            if (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
