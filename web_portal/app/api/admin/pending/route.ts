import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/app/lib/supabase';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';

const subjectsFilePath = path.join(process.cwd(), 'data/subjects.json');

// Helper to read JSON
function readJson(filePath: string) {
    if (!fs.existsSync(filePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        return [];
    }
}

// GET: List all pending uploads from Supabase
export async function GET() {
    try {
        const { data: pending, error } = await supabase
            .from('pending_uploads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pending uploads:', error);
            return NextResponse.json({ error: 'Failed to fetch pending uploads' }, { status: 500 });
        }

        // Map database columns to the format the frontend expects temporarily
        const formattedPending = pending.map(p => ({
            id: p.id,
            code: p.code,
            title: p.title,
            type: p.type,
            link: `/api/download/${p.link}`, // Convert Google Drive ID to our proxy link!
            rawDriveId: p.link, // Keep raw ID just in case
            submittedBy: p.submitted_by,
            date: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
        }));

        return NextResponse.json(formattedPending);
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Approve an upload (Move to approved_materials table)
export async function POST(req: NextRequest) {
    try {
        const cookie = (await cookies()).get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const { id, code, title, type, link } = body;

        // 1. Add to approved_materials
        const { error: insertError } = await supabase
            .from('approved_materials')
            .insert([{
                title,
                type,
                code,
                link, // This is the /api/download/xxxx proxy link
                submitted_by: body.submittedBy || null
            }]);

        if (insertError) {
            console.error('Error inserting into approved_materials:', insertError);
            return NextResponse.json({ error: 'Failed to approve record into database' }, { status: 500 });
        }

        // 2. Remove from pending_uploads table
        const { error: deleteError } = await supabase
            .from('pending_uploads')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting from pending_uploads:', deleteError);
        }

        // 3. Log activity
        await supabase.from('activity_logs').insert({
            type: 'content',
            title: 'Content Approved',
            description: `${session.username} approved "${title}" for ${code}`,
            severity: 'success',
            actor: session.username
        });

        return NextResponse.json({ success: true, message: 'Approved and published to database' });

    } catch (error) {
        console.error('Approve error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Reject an upload (Remove from database)
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
            .from('pending_uploads')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
        }

        // Log activity
        await supabase.from('activity_logs').insert({
            type: 'content',
            title: 'Content Rejected',
            description: `${session.username} rejected "${title || 'Unknown content'}"`,
            severity: 'warning',
            actor: session.username
        });

        return NextResponse.json({ success: true, message: 'Rejected and removed' });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
