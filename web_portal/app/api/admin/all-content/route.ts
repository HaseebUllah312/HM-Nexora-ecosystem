import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
    try {
        let pending: any[] = [];
        let approved: any[] = [];
        let pendingCount = 0;
        let approvedCount = 0;

        try {
            const { data, count, error } = await supabase
                .from('pending_uploads')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(0, 4999);
            if (!error && data) {
                pending = data;
                pendingCount = count || data.length;
            }
        } catch (e) {
            console.error('Pending uploads fetch error:', e);
        }

        try {
            const { data, count, error } = await supabase
                .from('approved_materials')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(0, 4999);
            if (!error && data) {
                approved = data;
                approvedCount = count || data.length;
            }
        } catch (e) {
            console.error('Approved materials fetch error:', e);
        }

        const formattedPending = pending.map(p => ({
            id: p.id,
            code: p.code,
            title: p.title,
            type: p.type || 'material',
            link: p.link,
            rawDriveId: p.link,
            submittedBy: p.submitted_by || 'Unknown User',
            date: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            status: 'pending'
        }));

        const formattedApproved = approved.map(a => ({
            id: a.id,
            code: a.code,
            title: a.title,
            type: a.type || 'material',
            link: a.link,
            rawDriveId: a.link,
            submittedBy: a.submitted_by || 'Unknown User',
            date: a.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            status: 'approved'
        }));

        const allContent = [...formattedPending, ...formattedApproved];

        return NextResponse.json({
            data: allContent,
            counts: {
                pending: pendingCount,
                approved: approvedCount,
                total: pendingCount + approvedCount
            }
        });
    } catch (e) {
        console.error('Error fetching all content:', e);
        return NextResponse.json({
            data: [],
            counts: { pending: 0, approved: 0, total: 0 }
        });
    }
}