import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

// GET: Fetch all approved resources for a specific subject code
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
    try {
        const { code } = await params;

        if (!code) {
            return NextResponse.json({ error: 'Code parameter is required' }, { status: 400 });
        }

        const { data: resources, error } = await supabase
            .from('approved_materials')
            .select('title, type, link, created_at, submitted_by')
            .ilike('code', code.toUpperCase())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching approved materials:', error);
            return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
        }

        return NextResponse.json(resources || []);

    } catch (e) {
        console.error('API Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
