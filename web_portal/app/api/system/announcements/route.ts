import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifySession } from '@/app/lib/session';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        // Map snake_case image_url to camelCase imageUrl for frontend consistency
        const formattedData = (data || []).map(ann => ({
            ...ann,
            imageUrl: ann.image_url
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error('Announcements API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Authenticate admin/owner
        const cookie = (await cookies()).get('session')?.value;
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

        const { title, description, category, important, deadline, sendEmail, targetSubject, userIds, imageUrl } = await req.json();

        if (!title || !description || !category) {
            return NextResponse.json({ error: 'Missing required fields (title, description, category)' }, { status: 400 });
        }

        // Check if user is trying to send email but isn't allowed
        if (sendEmail && user.role !== 'owner') {
            return NextResponse.json({ error: 'Only the account Owner can send email notifications.' }, { status: 403 });
        }

        // Format current date exactly like the static file did (YYYY-MM-DD)
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];

        // 1. Determine if we should create a Web Announcement
        // (In this system, all announcements go to the web list by default)
        const { data: annData, error: annError } = await supabase
            .from('announcements')
            .insert({
                title,
                description,
                category,
                important: important || false,
                date: formattedDate,
                deadline: deadline || null,
                image_url: imageUrl || null,
            })
            .select();

        if (annError) {
            console.error('Supabase insert error:', annError);
            
            // Check for missing column error
            if (annError.code === '42703' || annError.message?.includes('image_url')) {
                return NextResponse.json({ 
                    error: '❌ Database out of sync: The "image_url" column is missing. Please run the SQL command provided in the implementation plan in your Supabase SQL Editor.' 
                }, { status: 500 });
            }

            return NextResponse.json({ error: `Could not create announcement: ${annError.message || 'Unknown database error'}` }, { status: 500 });
        }

        // 2. If email requested and user is owner, trigger notification
        let emailTriggered = false;
        let emailError = null;

        if (sendEmail) {
            if (user.role === 'owner') {
                try {
                    let blastResponse;
                    try {
                        const port = process.env.PORT || '3000';
                        blastResponse = await fetch(`http://127.0.0.1:${port}/api/notifications/send`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.id}`
                            },
                            body: JSON.stringify({ title, description, category, deadline, targetSubject, userIds, imageUrl })
                        });
                    } catch (localErr) {
                        console.warn('Local loopback fetch failed, trying request origin:', localErr);
                        blastResponse = await fetch(`${req.nextUrl.origin}/api/notifications/send`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.id}`
                            },
                            body: JSON.stringify({ title, description, category, deadline, targetSubject, userIds, imageUrl })
                        });
                    }

                    if (blastResponse.ok) {
                        const blastData = await blastResponse.json();
                        emailTriggered = true;
                        console.log(`Email blast successful: ${blastData.message}`);
                    } else {
                        const errData = await blastResponse.json().catch(() => ({}));
                        emailError = errData.error || 'Email service returned an error';
                        console.error(`Email blast failed with status ${blastResponse.status}:`, emailError);
                    }
                } catch (err) {
                    console.error('Email blast fetch failed:', err);
                    emailError = 'Network error while sending emails';
                }
            } else {
                // This shouldn't happen if UI is correct, but for safety:
                return NextResponse.json({ error: 'Forbidden: Only Owners can send email notifications.' }, { status: 403 });
            }
        }

        // 3. Log activity (BEFORE the return so it actually runs)
        try {
            await supabase.from('activity_logs').insert({
                type: 'content',
                title: 'Announcement Created',
                description: `${session?.username || 'System'} published: ${title}`,
                severity: 'info',
                actor: session?.username || 'System'
            });
        } catch (logErr) {
            console.error('Activity log error:', logErr);
        }

        return NextResponse.json({
            success: true,
            announcement: annData[0],
            emailed: emailTriggered,
            emailError: emailError,
            sentCount: emailTriggered ? (annData[0]?.sentCount || 0) : 0,
            message: emailTriggered
                ? '✅ Announcement published and emails sent!'
                : sendEmail && emailError
                    ? `⚠️ Published to web, but email failed: ${emailError}`
                    : '✅ Announcement published to web page.'
        });

    } catch (error) {
        console.error('Create announcement error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        // Authenticate admin/owner
        const cookie = (await cookies()).get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session) {
            return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
        }

        // Always fetch fresh role from DB
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.id)
            .single();

        if (userError || !user || (user.role !== 'admin' && user.role !== 'owner')) {
            return NextResponse.json({ error: 'Unauthorized: Admin or Owner access required' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
        }

        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            return NextResponse.json({ error: `Could not delete announcement: ${error.message || 'Unknown database error'}` }, { status: 500 });
        }

        // Log activity
        await supabase.from('activity_logs').insert({
            type: 'content',
            title: 'Announcement Deleted',
            description: `${session?.username || 'System'} removed an announcement (ID: ${id})`,
            severity: 'warning',
            actor: session?.username || 'System'
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete announcement error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
