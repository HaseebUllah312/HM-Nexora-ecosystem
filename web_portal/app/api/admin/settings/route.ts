import { verifySession } from '@/app/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookie = (await cookies()).get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401
            });
        }

        const settings = await request.json();
        
        // In production, save to database
        // For now, just acknowledge the save
        console.log('Settings saved:', settings);

        return new Response(JSON.stringify({ success: true, settings }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500
        });
    }
}

export async function GET(request: Request) {
    try {
        const cookie = (await cookies()).get('session')?.value;
        const session = cookie ? await verifySession(cookie) : null;

        if (!session || (session.role !== 'admin' && session.role !== 'owner')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401
            });
        }

        // Return default settings
        const settings = {
            siteName: 'HM nexora',
            siteDescription: 'Academic learning platform',
            maintenanceMode: false,
            enableRegistrations: true,
            enableUserUploads: true,
            maxUploadSize: 50,
            emailNotificationsEnabled: true,
            apiRateLimit: 1000,
            sessionTimeout: 30,
            twoFactorAuth: false,
            enableOAuth: true
        };

        return new Response(JSON.stringify(settings), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500
        });
    }
}
