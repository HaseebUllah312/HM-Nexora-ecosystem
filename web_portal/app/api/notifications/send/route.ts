import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { sendEmail, getAnnouncementEmailTemplate } from '@/app/lib/email';
import { verifySession } from '@/app/lib/session';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        // Verify admin/owner via session cookie or Authorization header (for internal calls)
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');
        const authHeader = req.headers.get('Authorization');
        
        let session = null;
        if (sessionCookie) {
            session = await verifySession(sessionCookie.value);
        } else if (authHeader?.startsWith('Bearer ')) {
            // We use the raw user ID as a simple internal token for now, 
            // since this is server-to-server and highly restricted by VPC/Environment.
            const userId = authHeader.split(' ')[1];
            if (userId) {
                const { data } = await supabase.from('users').select('id, username, role').eq('id', userId).single();
                if (data) {
                    session = { id: data.id, username: data.username, role: data.role };
                }
            }
        }

        if (!session) {
            return NextResponse.json(
                { error: 'Not logged in. Please log in again.' },
                { status: 401 }
            );
        }

        // Fetch fresh role from DB to be safe
        const { data: roleData, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.id)
            .maybeSingle();

        if (roleError || !roleData || (roleData.role !== 'admin' && roleData.role !== 'owner')) {
            return NextResponse.json(
                { error: 'Admin or Owner access required' },
                { status: 403 }
            );
        }

        const { title, description, category, deadline, targetSubject, userIds, imageUrl } = await req.json();

        if (!title || !description || !category) {
            return NextResponse.json({ error: 'Title, description, and category are required.' }, { status: 400 });
        }

        // Fetch users. 
        // Logic priority: userIds > targetSubject > all
        let query = supabase
            .from('users')
            .select('id, username, email, followed_subjects')

        if (userIds && Array.isArray(userIds) && userIds.length > 0) {
            query = query.in('id', userIds);
        } else if (targetSubject && targetSubject !== 'All') {
            // targetSubject is a single code, followed_subjects is a TEXT ARRAY
            query = query.contains('followed_subjects', [targetSubject]);
        }

        const { data: users, error: fetchError } = await query;

        if (fetchError) {
            console.error('Error fetching users for notification:', fetchError);
            return NextResponse.json(
                { error: `Database error while fetching users: ${fetchError.message}` },
                { status: 500 }
            );
        }

        if (!users || users.length === 0) {
            console.log('No eligible users found for this notification criteria.');
            return NextResponse.json({
                success: true,
                message: 'No users found matching the notification criteria (subject filter or list).',
                sentCount: 0,
            });
        }

        console.log(`Targeting ${users.length} users for email blast...`);

        // Send emails and create in-app notifications
        let successCount = 0;
        let failureCount = 0;

        // Prepare web notifications array for bulk insert
        const webNotifications = users.map(user => ({
            user_id: user.id,
            message: `📢 New Announcement: ${title}`,
            read: false,
            created_at: new Date().toISOString()
        }));

        // 1. Send Emails (Loop through users)
        for (const user of users) {
            if (!user.email) {
                console.warn(`User ${user.id} has no email address. Skipping email.`);
                continue;
            }

            try {
                const html = getAnnouncementEmailTemplate(title, description, category, deadline, imageUrl);
                const sent = await sendEmail(
                    user.email,
                    `VU Academic Hub - ${category}: ${title}`,
                    html
                );

                if (sent) {
                    successCount++;
                } else {
                    failureCount++;
                }
            } catch (error) {
                console.error(`Critical error sending email to ${user.email}:`, error);
                failureCount++;
            }
        }

        // 2. Insert Web Notifications (Bulk)
        if (webNotifications.length > 0) {
            console.log(`Inserting ${webNotifications.length} web notifications...`);
            const { error: webNotifError } = await supabase
                .from('user_notifications')
                .insert(webNotifications);
            
            if (webNotifError) {
                console.error('Failed to create web notifications:', webNotifError);
            } else {
                console.log('✅ Web notifications created successfully.');
            }
        }

        // Log notification event
        try {
            await supabase.from('notification_logs').insert({
                id: crypto.randomUUID(),
                title,
                description,
                category,
                sent_by: session.id,
                successful_sends: successCount,
                failed_sends: failureCount,
                total_users: users.length,
                created_at: new Date().toISOString(),
            });
        } catch (logError) {
            console.error('Error logging notification to DB:', logError);
        }

        return NextResponse.json({
            success: successCount > 0,
            message: successCount > 0 
                ? `Successfully sent to ${successCount} users.${failureCount > 0 ? ` (${failureCount} failed)` : ''}`
                : `Failed to send any emails. Check server logs for details.`,
            sentCount: successCount,
            failureCount: failureCount,
            totalUsers: users.length,
        }, { status: successCount > 0 ? 200 : 500 });

    } catch (error: any) {
        console.error('Send notification route error:', error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}
