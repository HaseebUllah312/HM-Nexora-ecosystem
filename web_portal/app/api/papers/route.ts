import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { cookies } from 'next/headers';
import { verifySession } from '@/app/lib/session';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const term = searchParams.get('term'); // 'midterm' or 'final'

        let query = supabase
            .from('shared_papers')
            .select('*')
            .order('created_at', { ascending: false });

        if (term && term !== 'all') {
            query = query.eq('term', term);
        }

        if (search) {
            query = query.ilike('subject_code', `%${search}%`);
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;

        return NextResponse.json({ success: true, papers: data });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const subject_code = formData.get('subject_code') as string;
        const term = formData.get('term') as string;
        const exam_date = formData.get('exam_date') as string;
        const exam_time = formData.get('exam_time') as string;
        const content = formData.get('content') as string;
        const image = formData.get('image') as File | null;

        if (!subject_code || !term || !content) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        let image_url = null;

        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `images/${fileName}`;

            const buffer = await image.arrayBuffer();

            const { error: uploadError } = await supabase.storage
                .from('shared_papers_images')
                .upload(filePath, buffer, {
                    contentType: image.type,
                    upsert: false
                });

            if (uploadError) {
                console.error("Image upload failed:", uploadError);
                return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
            }

            const { data: publicUrlData } = supabase.storage
                .from('shared_papers_images')
                .getPublicUrl(filePath);

            image_url = publicUrlData.publicUrl;
        }

        const { data, error } = await supabase
            .from('shared_papers')
            .insert([
                {
                    subject_code: subject_code.toUpperCase(),
                    term,
                    exam_date: exam_date || null,
                    exam_time: exam_time || null,
                    content,
                    image_url
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Auto-sync to Reviews Feed so it shows up in /reviews and triggers the WhatsApp Bot
        try {
            await supabase.from('subject_reviews').insert([{
                subject_code: subject_code.toUpperCase(),
                term,
                rating: 5,
                comment: content,
                username: 'Anonymous Student',
                user_id: 'shared-paper-system'
            }]);
        } catch (syncError) {
            console.error("Failed to sync paper to reviews feed:", syncError);
        }

        return NextResponse.json({ success: true, paper: data });
    } catch (error) {
        console.error("Post Paper Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'Missing paper ID' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const session = await verifySession(sessionCookie.value);
        if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const { error } = await supabase
            .from('shared_papers')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Paper Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
