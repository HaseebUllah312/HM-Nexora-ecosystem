import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = authHeader.substring(7);

        const { data: user, error } = await supabase
            .from('users')
            .select('email, email_notifications_enabled')
            .eq('id', userId)
            .maybeSingle();

        if (error || !user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            email: user.email,
            notificationsEnabled: user.email_notifications_enabled,
        });

    } catch (error) {
        console.error('Get notification settings error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = authHeader.substring(7);
        const { emailNotificationsEnabled } = await req.json();

        if (typeof emailNotificationsEnabled !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid notification setting' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('users')
            .update({ email_notifications_enabled: emailNotificationsEnabled })
            .eq('id', userId);

        if (error) {
            console.error('Update error:', error);
            return NextResponse.json(
                { error: 'Failed to update settings' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: emailNotificationsEnabled
                ? 'Notifications enabled'
                : 'Notifications disabled',
        });

    } catch (error) {
        console.error('Update notification settings error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
