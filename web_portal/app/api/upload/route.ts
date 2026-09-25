import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { uploadToDrive } from '@/app/lib/googleDrive';

// Health check
export async function GET(req: NextRequest) {
    return NextResponse.json({
        status: 'ok',
        message: 'Upload API is working',
        timestamp: new Date().toISOString()
    });
}

export async function POST(req: NextRequest) {
    const requestId = Math.random().toString(36).substr(2, 9);
    const startTime = Date.now();

    try {
        console.log(`[UPLOAD-${requestId}] Request received at ${new Date().toISOString()}`);

        const formData = await req.formData();
        const code = formData.get('code') as string;
        const title = formData.get('title') as string;
        const type = formData.get('type') as string;
        const file = formData.get('file') as File;

        console.log(`[UPLOAD-${requestId}] Parsed FormData:`, {
            code: code || 'missing',
            title: title || 'missing',
            type: type || 'missing',
            fileName: file?.name || 'missing',
            fileSize: file?.size || 0,
            fileType: file?.type || 'missing'
        });

        // Validate required fields
        if (!code || !title || !type || !file) {
            console.error(`[UPLOAD-${requestId}] Validation failed - missing fields`);
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: ' + ['code', 'title', 'type', 'file']
                    .filter(f => !formData.get(f))
                    .join(', '),
                requestId
            }, { status: 400 });
        }

        // --- DUPLICATE CHECK ---
        const cleanTitle = title.trim();

        console.log(`[UPLOAD-${requestId}] Checking for duplicates in pending_uploads for title: "${cleanTitle}"`);
        const { data: pendingMatch } = await supabase
            .from('pending_uploads')
            .select('id')
            .ilike('title', cleanTitle)
            .limit(1);

        if (pendingMatch && pendingMatch.length > 0) {
            console.warn(`[UPLOAD-${requestId}] Duplicate found in pending_uploads. ID:`, pendingMatch[0].id);
            return NextResponse.json({
                success: false,
                error: 'This file has already been uploaded and is pending approval.',
                requestId
            }, { status: 409 });
        }

        console.log(`[UPLOAD-${requestId}] Checking for duplicates in approved_materials for title: "${cleanTitle}"`);
        const { data: approvedMatch } = await supabase
            .from('approved_materials')
            .select('id')
            .ilike('title', cleanTitle)
            .limit(1);

        if (approvedMatch && approvedMatch.length > 0) {
            console.warn(`[UPLOAD-${requestId}] Duplicate found in approved_materials. ID:`, approvedMatch[0].id);
            return NextResponse.json({
                success: false,
                error: 'Error: This file already exists in our library of approved materials.',
                requestId
            }, { status: 409 });
        }
        // --- END DUPLICATE CHECK ---

        // Convert file to buffer
        console.log(`[UPLOAD-${requestId}] Converting file to buffer...`);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log(`[UPLOAD-${requestId}] Buffer created, size: ${buffer.length} bytes`);

        // 1. Upload to Supabase Storage (Direct CDN Link)
        const fileName = `${requestId}-${file.name.replace(/\s+/g, '_')}`;
        console.log(`[UPLOAD-${requestId}] Starting Supabase Storage upload: ${fileName}`);
        
        const { data: storageData, error: storageError } = await supabase.storage
            .from('materials')
            .upload(fileName, buffer, {
                contentType: file.type || 'application/pdf',
                upsert: false
            });

        if (storageError) {
            console.error(`[UPLOAD-${requestId}] ❌ Supabase Storage failed:`, storageError);
            throw new Error(`Storage upload failed: ${storageError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('materials')
            .getPublicUrl(fileName);

        console.log(`[UPLOAD-${requestId}] ✅ Supabase upload successful: ${publicUrl}`);

        // 2. Backup Upload to Google Drive
        let driveFileId = '';
        try {
            driveFileId = await uploadToDrive(buffer, file.name, file.type || 'application/octet-stream');
            console.log(`[UPLOAD-${requestId}] ✅ Drive backup successful: ${driveFileId}`);
        } catch (driveError) {
            console.warn(`[UPLOAD-${requestId}] ⚠️ Drive backup failed (non-critical):`, driveError);
        }

        // Get session for actor
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const cookie = cookieStore.get('session')?.value;
        const session = cookie ? await (await import('@/app/lib/session')).verifySession(cookie) : null;
        const actor = session?.username || 'Guest';

        // Save to Supabase
        console.log(`[UPLOAD-${requestId}] Saving metadata to Supabase...`);
        let { error: dbError, data } = await supabase
            .from('pending_uploads')
            .insert({
                code: code.toUpperCase(),
                title: title.trim(),
                type: type.trim(),
                link: publicUrl, // Direct link saves Vercel bandwidth
                drive_id: driveFileId, // Backup
                submitted_by: actor
            })
            .select();

        if (dbError && (dbError.code === '42703' || dbError.message?.includes('drive_id'))) {
            console.warn(`[UPLOAD-${requestId}] ⚠️ 'drive_id' column missing in Supabase, retrying insert without it...`);
            const retryResult = await supabase
                .from('pending_uploads')
                .insert({
                    code: code.toUpperCase(),
                    title: title.trim(),
                    type: type.trim(),
                    link: publicUrl,
                    submitted_by: actor
                })
                .select();
            dbError = retryResult.error;
            data = retryResult.data;
        }

        if (dbError) {
            console.error(`[UPLOAD-${requestId}] ❌ Supabase error:`, dbError);
            return NextResponse.json({
                success: false,
                error: `Database error: ${dbError.message}`,
                requestId
            }, { status: 500 });
        }

        // Log activity
        await supabase.from('activity_logs').insert({
            type: 'content',
            title: 'New Material Uploaded',
            description: `${actor} uploaded "${title.trim()}" for ${code.toUpperCase()}`,
            severity: 'info',
            actor: actor
        });

        const duration = Date.now() - startTime;
        console.log(`[UPLOAD-${requestId}] ✅ COMPLETE (${duration}ms)`, { publicUrl, driveFileId, dbRecord: data?.[0]?.id });

        return NextResponse.json({
            success: true,
            message: 'Upload successful',
            fileId: publicUrl,
            driveId: driveFileId,
            requestId,
            duration
        }, { status: 200 });

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[UPLOAD-${requestId}] ❌ ERROR (${duration}ms):`, error);

        const errorMsg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({
            success: false,
            error: errorMsg,
            requestId,
            duration
        }, { status: 500 });
    }
}

// Options for CORS
export async function OPTIONS(req: NextRequest) {
    return NextResponse.json(
        { status: 'ok' },
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        }
    );
}
