import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '5000');
        const term = searchParams.get('term');
        const search = searchParams.get('search');

        let query = supabase
            .from('subject_reviews')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (term && term !== 'all') {
            query = query.eq('term', term);
        }

        if (search) {
            query = query.ilike('subject_code', `%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching public reviews:', error);
            return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
        }

        return NextResponse.json({ success: true, reviews: data || [] });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
