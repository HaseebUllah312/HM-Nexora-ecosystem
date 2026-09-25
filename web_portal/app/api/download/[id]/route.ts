import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/app/lib/googleDrive';
import { supabase } from '@/app/lib/supabase';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> } // In Next.js 15, params is a Promise
) {
    const params = await context.params;
    const fileId = params.id;
    const mode = req.nextUrl.searchParams.get('mode'); // 'view' = inline, else = download
    const titleParam = req.nextUrl.searchParams.get('title'); // optional friendly filename

    if (!fileId) {
        return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    try {
        // 1. Get Access Token
        let accessToken: string;
        try {
            accessToken = await getAccessToken();
        } catch (authError: any) {
            console.error('[Download API] Auth failed:', authError.message);
            return NextResponse.json({ 
                error: (authError instanceof Error ? authError.message : String(authError)) || 'Authentication with Google failed' 
            }, { status: 401 });
        }

        // 2. Get file metadata (like filename and mimeType)
        const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!metaRes.ok) {
            const errorText = await metaRes.text();
            console.error('[Download API] Metadata fetch failed:', metaRes.status, errorText);
            return NextResponse.json({ error: `Google API Error (${metaRes.status}): ${errorText}` }, { status: metaRes.status });
        }

        const metaData = await metaRes.json();
        const googleName = metaData.name || 'document';
        const googleMime = metaData.mimeType || 'application/octet-stream';
        let downloadName = titleParam || googleName;

        // Ensure extension is preserved if title doesn't have one
        const googleExt = googleName.includes('.') ? googleName.split('.').pop() : null;
        const titleHasExt = downloadName.includes('.');

        if (!titleHasExt && googleExt) {
            downloadName = `${downloadName}.${googleExt}`;
        }

        // 3. Fetch the actual file content
        const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!fileRes.ok) {
            const errorText = await fileRes.text();
            console.error('[Download API] Media fetch failed:', fileRes.status, errorText);
            return NextResponse.json({ error: `Google API Error (${fileRes.status}): ${errorText}` }, { status: fileRes.status });
        }

        const isInline = mode === 'view' || mode === 'inline';

        let effectiveMime = googleMime;
        const lowerName = downloadName.toLowerCase();
        if (effectiveMime === 'application/octet-stream' || !effectiveMime) {
            if (lowerName.endsWith('.pdf')) effectiveMime = 'application/pdf';
            else if (lowerName.endsWith('.png')) effectiveMime = 'image/png';
            else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) effectiveMime = 'image/jpeg';
            else if (lowerName.endsWith('.docx')) effectiveMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        // Use RFC 5987 compatible Content-Disposition
        const safeFilename = encodeURIComponent(downloadName);
        const asciiFilename = downloadName.normalize('NFD').replace(/[^\x20-\x7E]/g, '') || 'document';

        console.log(`[Download API] Serving file: ${downloadName} (${effectiveMime}), Mode: ${isInline ? 'inline' : 'attachment'}`);

        // --- TRACK DOWNLOAD ---
        try {
            // Find the subject code for this file
            const { data: material } = await supabase
                .from('approved_materials')
                .select('code')
                .eq('link', fileId)
                .single();

            if (material?.code) {
                const { data: subject } = await supabase
                    .from('subjects')
                    .select('downloads')
                    .ilike('code', material.code)
                    .single();
                
                if (subject) {
                    await supabase
                        .from('subjects')
                        .update({ downloads: (subject.downloads || 0) + 1 })
                        .ilike('code', material.code);
                    console.log(`[Download API] Tracked download for subject: ${material.code}`);
                }
            }
        } catch (trackError) {
            console.warn('[Download API] Failed to track download:', trackError);
        }
        // --- END TRACK DOWNLOAD ---

        return new NextResponse(fileRes.body, {
            status: 200,
            headers: {
                'Content-Type': effectiveMime,
                'Content-Disposition': isInline
                    ? `inline; filename="${asciiFilename}"; filename*=UTF-8''${safeFilename}`
                    : `attachment; filename="${asciiFilename}"; filename*=UTF-8''${safeFilename}`,
                'Cache-Control': 'public, max-age=3600',
            },
        });

    } catch (error: any) {
        console.error('Error proxying file from Google Drive:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch file' }, { status: 500 });
    }
}

