import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
    try {
        const { code } = await params;
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .ilike('code', code)
            .single();

        if (error) {
            console.error('Supabase fetch error:', error);
            if (error.code === 'PGRST116') {
                // Not found
                return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
            }
            return NextResponse.json({ error: 'Failed to fetch subject from DB' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (e) {
        console.error('Subject API error:', e);
        return NextResponse.json({ error: 'Failed to load subject' }, { status: 500 });
    }
}
