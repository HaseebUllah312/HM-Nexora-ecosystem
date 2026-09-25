import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { sendEmail, generateOTP, getOTPExpiryTime, getOTPEmailTemplate } from '@/app/lib/email';
import { storeOTP } from '@/app/lib/otp-storage';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required.' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        // Check if email exists in database
        const { data: user } = await supabase
            .from('users')
            .select('id, username')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

        if (!user) {
            return NextResponse.json(
                { error: 'Email not found in our system.' },
                { status: 404 }
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const expiryTime = getOTPExpiryTime();

        // Store OTP in signed JWT token (stateless)
        const otpToken = await storeOTP(email.toLowerCase().trim(), user.username, otp, expiryTime);

        // Send OTP email
        const emailSent = await sendEmail(
            email,
            'Password Reset Code - VU Academic Hub',
            getOTPEmailTemplate(user.username, otp, 'password_reset')
        );

        if (!emailSent) {
            return NextResponse.json(
                { error: 'Failed to send reset email. Please try again later.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Reset code sent to your email. Please check your inbox (and spam folder).',
                email: email, // Return email for display
                otpToken, // Frontend must send this back during password reset
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
