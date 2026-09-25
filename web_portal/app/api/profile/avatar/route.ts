import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { uploadToDrive } from '@/app/lib/googleDrive';
import { verifySession } from '@/app/lib/session';

export async function POST(req: NextRequest) {
    const requestId = Math.random().toString(36).substr(2, 9);

    try {
        // 1. Verify Authentication
        const cookie = req.cookies.get('session')?.value;
        if (!cookie) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await verifySession(cookie);
        if (!session || !session.id) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        // 2. Parse FormData
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
        }

        // Validate basic image types
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Uploaded file must be an image (JPEG, PNG, WEBP, etc.)' }, { status: 400 });
        }

        console.log(`[AVATAR-${requestId}] User ${session.username} uploading profile picture...`);

        // 3. Convert image file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 4. Upload to Supabase Storage (Public bucket: 'avatars')
        const fileName = `${session.id}-${Date.now()}.${file.type.split('/')[1] || 'jpg'}`;
        console.log(`[AVATAR-${requestId}] Starting Supabase upload: ${fileName}`);

        const { data: storageData, error: storageError } = await supabase.storage
            .from('avatars')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true // Replace old avatar file if same name logic is used
            });

        if (storageError) {
            console.error(`[AVATAR-${requestId}] ❌ Supabase Storage failed:`, storageError);
            return NextResponse.json({ error: `Storage failed: ${storageError.message}` }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        console.log(`[AVATAR-${requestId}] ✅ Supabase upload successful: ${publicUrl}`);

        // 5. Update user database record with the direct CDN URL
        const { error: dbError } = await supabase
            .from('users')
            .update({ avatar_url: publicUrl })
            .eq('id', session.id);

        if (dbError) {
            console.error(`[AVATAR-${requestId}] Supabase update error:`, dbError);
            return NextResponse.json({ error: 'Failed to save avatar link to user profile' }, { status: 500 });
        }

        console.log(`[AVATAR-${requestId}] Successfully updated profile picture for ${session.username}`);

        return NextResponse.json({
            success: true,
            avatar_url: publicUrl
        }, { status: 200 });

    } catch (error) {
        console.error(`[AVATAR-${requestId}] Main logic error:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
