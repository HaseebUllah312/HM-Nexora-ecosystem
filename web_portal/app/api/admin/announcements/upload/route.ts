import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { uploadToDrive } from '@/app/lib/googleDrive';
import { verifySession } from '@/app/lib/session';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate admin/owner
        const cookieStore = await cookies();
        const cookie = cookieStore.get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session) {
            return NextResponse.json({ error: 'Not logged in. Please log in again.' }, { status: 401 });
        }

        // Always fetch fresh role from DB to be safe
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.id)
            .single();

        if (userError || !user || (user.role !== 'admin' && user.role !== 'owner')) {
            return NextResponse.json({ error: 'Unauthorized: Admin or Owner access required' }, { status: 403 });
        }

        // 2. Parse FormData
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
        }

        // Validate basic image types
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Uploaded file must be an image' }, { status: 400 });
        }

        // 3. Convert image file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 4. Upload to Supabase Storage (Public bucket: 'materials')
        const fileName = `announcements/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        console.log(`[ANN-UPLOAD] Starting Supabase upload: ${fileName}`);

        const { data: storageData, error: storageError } = await supabase.storage
            .from('materials')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (storageError) {
            console.error('[ANN-UPLOAD] ❌ Supabase Storage failed:', storageError);
            throw new Error(`Storage upload failed: ${storageError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('materials')
            .getPublicUrl(fileName);

        console.log(`[ANN-UPLOAD] ✅ Supabase upload successful: ${publicUrl}`);

        return NextResponse.json({
            success: true,
            imageUrl: publicUrl,
            fileId: storageData.path // Using path as unique ID
        });

    } catch (error: any) {
        console.error('Announcement upload error:', error);
        return NextResponse.json({ 
            error: error.message || 'Failed to upload announcement image to secure storage' 
        }, { status: 500 });
    }
}
