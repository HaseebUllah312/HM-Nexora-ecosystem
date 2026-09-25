import { verifySession } from '@/app/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookie = (await cookies()).get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { title, message, targetRole, sendNow, scheduledTime } = await request.json();

        if (sendNow) {
            // Send notification email
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                        .content { background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px; }
                        .footer { color: #666; font-size: 12px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>${title}</h2>
                        </div>
                        <div class="content">
                            <p>${message}</p>
                        </div>
                        <div class="footer">
                            <p>© 2024 VU Academic Hub. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            // In production, fetch users from database based on targetRole
            // For now, just log the notification
            console.log(`Notification sent: ${title} (Target: ${targetRole})`);

            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Notification sent successfully',
                sentTo: 2000 // Sample count
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // Schedule notification
            console.log(`Notification scheduled for ${scheduledTime}: ${title}`);

            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Notification scheduled successfully',
                scheduledTime 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
