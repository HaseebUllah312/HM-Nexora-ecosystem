import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';

// DELETE: Delete approved material
export async function DELETE(req: NextRequest) {
    try {
        const cookie = (await cookies()).get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { id, title } = body;

        const { error } = await supabase
            .from('approved_materials')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting approved material:', error);
            return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
        }

        // Log activity
        await supabase.from('activity_logs').insert({
            type: 'content',
            title: 'Approved Content Deleted',
            description: `${session.username} permanently removed: ${title || 'Unknown item'}`,
            severity: 'error', // Deleting approved content is high severity
            actor: session.username
        });

        return NextResponse.json({ success: true, message: 'Material deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
