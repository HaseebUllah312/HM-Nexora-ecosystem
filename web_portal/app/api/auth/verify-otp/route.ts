import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { hashPassword, generateSalt } from '@/app/lib/password';
import { verifyOTP } from '@/app/lib/otp-storage';
import { sendEmail, getWelcomeEmailTemplate } from '@/app/lib/email';

export async function POST(req: Request) {
    try {
        const { otpToken, username, password, otp } = await req.json();

        if (!otpToken || !username || !password || !otp) {
            return NextResponse.json(
                { error: 'Missing required fields.' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long.' },
                { status: 400 }
            );
        }

        // Verify OTP using the signed token (stateless — no DB needed)
        const otpVerification = await verifyOTP(otpToken, otp);
        if (!otpVerification.valid) {
            return NextResponse.json(
                { error: otpVerification.message },
                { status: 400 }
            );
        }

        const email = otpVerification.email!;

        // Check if username already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', username.trim())
            .maybeSingle();

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already taken.' },
                { status: 409 }
            );
        }

        // Check if email is already registered
        const { data: existingEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email already registered.' },
                { status: 409 }
            );
        }

        // Create new user
        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);
        const userId = crypto.randomUUID();

        const { error: insertError } = await supabase.from('users').insert({
            id: userId,
            username: username.trim(),
            email,
            password_hash: passwordHash,
            salt,
            role: 'student',
            provider: 'local',
            email_notifications_enabled: true,
            is_email_verified: true,
            created_at: new Date().toISOString(),
        });

        if (insertError) {
            console.error('Supabase insert error:', insertError);
            return NextResponse.json(
                { error: 'Failed to create account: ' + (insertError.message || 'Unknown error') },
                { status: 500 }
            );
        }

        // Send welcome email (non-blocking)
        sendEmail(email, 'Welcome to VU Academic Hub! 🎓', getWelcomeEmailTemplate(username, email))
            .catch(console.error);

        return NextResponse.json({
            success: true,
            message: 'Registration successful! Please login with your credentials.',
            userId,
        });

    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error. Please try again.' },
            { status: 500 }
        );
    }
}
