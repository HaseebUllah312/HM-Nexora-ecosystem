import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fileId, code, title, category } = body;

        if (!fileId || !code || !title || !category) {
            return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('pending_uploads')
            .insert({
                code: code.toUpperCase(),
                title: title.trim(),
                type: category.trim(),
                link: fileId,
                submitted_by: 'Student' // Could pull from session if needed
            })
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, record: data[0] });
    } catch (e: any) {
        console.error('Complete error:', e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
