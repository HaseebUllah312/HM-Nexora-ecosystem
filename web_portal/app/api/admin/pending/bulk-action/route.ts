import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifySession } from '@/app/lib/session';
import { cookies } from 'next/headers';

// Verify admin authentication
const verifyAdmin = async () => {
    const cookie = (await cookies()).get('session')?.value;
    if (!cookie) return null;
    const session = await verifySession(cookie);
    if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
        return null;
    }
    return session;
};

// GET: Get count of pending files
export async function GET() {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { data: pending, error } = await supabase
            .from('pending_uploads')
            .select('count', { count: 'exact' });

        if (error) {
            console.error('Error fetching pending count:', error);
            return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
        }

        return NextResponse.json({ count: pending?.length || 0 });
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Approve all or reject all pending uploads
export async function POST(req: NextRequest) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { action } = body; // 'approve-all' or 'reject-all'

        if (!['approve-all', 'reject-all'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Get all pending uploads
        const { data: allPending, error: fetchError } = await supabase
            .from('pending_uploads')
            .select('*');

        if (fetchError) {
            console.error('Error fetching pending uploads:', fetchError);
            return NextResponse.json({ error: 'Failed to fetch pending uploads' }, { status: 500 });
        }

        if (!allPending || allPending.length === 0) {
            return NextResponse.json({ success: true, processed: 0, message: 'No pending files to process' });
        }

        let successCount = 0;

        if (action === 'approve-all') {
            // Move all pending to approved_materials
            for (const item of allPending) {
                const { error: insertError } = await supabase
                    .from('approved_materials')
                    .insert([{
                        title: item.title,
                        type: item.type,
                        code: item.code,
                        link: `/api/download/${item.link}`,
                        submitted_by: item.submitted_by
                    }]);

                if (!insertError) {
                    successCount++;
                }
            }

            // Delete all from pending_uploads
            const { error: deleteError } = await supabase
                .from('pending_uploads')
                .delete()
                .gt('id', 0); // Delete all

            if (deleteError) {
                console.error('Error clearing pending uploads:', deleteError);
            }

        } else if (action === 'reject-all') {
            // Simply delete all pending uploads
            const { error: deleteError } = await supabase
                .from('pending_uploads')
                .delete()
                .gt('id', 0); // Delete all

            if (!deleteError) {
                successCount = allPending.length;
            }
        }

        return NextResponse.json({
            success: true,
            processed: successCount,
            action: action,
            message: `${action === 'approve-all' ? 'Approved' : 'Rejected'} ${successCount} files`
        });

    } catch (error) {
        console.error('Bulk action error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
