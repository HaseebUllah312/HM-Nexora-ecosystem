import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { getAccessToken, getCredentials } from '@/app/lib/googleDrive';

// Using shared Google Drive utilities for better reliability and consistency


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, fileName, mimeType, size } = body;

        if (!title || !fileName || !mimeType || !size) {
            return NextResponse.json({ success: false, error: 'Missing req fields' }, { status: 400 });
        }

        // 1. Duplicate Check
        const cleanTitle = title.trim();
        const { data: pendingMatch } = await supabase.from('pending_uploads').select('id').ilike('title', cleanTitle).limit(1);
        if (pendingMatch && pendingMatch.length > 0) {
            return NextResponse.json({ success: false, error: 'File already pending' }, { status: 409 });
        }
        const { data: approvedMatch } = await supabase.from('approved_materials').select('id').ilike('title', cleanTitle).limit(1);
        if (approvedMatch && approvedMatch.length > 0) {
            return NextResponse.json({ success: false, error: 'File already exists' }, { status: 409 });
        }

        // 2. Init resumable upload
        const { folderId } = getCredentials();
        const accessToken = await getAccessToken();

        const origin = req.headers.get('origin') || 'https://hmnexora.tech';

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Upload-Content-Type': mimeType,
                'X-Upload-Content-Length': size.toString(),
                'Origin': origin,
            },
            body: JSON.stringify({
                name: fileName,
                parents: [folderId],
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Google API: ${err}`);
        }

        const uploadUrl = response.headers.get('Location');
        if (!uploadUrl) {
            throw new Error('No Location header returned from Google');
        }

        return NextResponse.json({ success: true, uploadUrl });
    } catch (e: any) {
        console.error('Init error:', e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
