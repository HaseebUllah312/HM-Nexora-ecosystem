import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { sendEmail, generateOTP, getOTPExpiryTime, getOTPEmailTemplate } from '@/app/lib/email';
import { storeOTP } from '@/app/lib/otp-storage';

export async function POST(req: Request) {
    try {
        const { email, username } = await req.json();

        if (!email || !username) {
            return NextResponse.json(
                { error: 'Email and username are required.' },
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

        // Check if username already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', username.trim())
            .maybeSingle();

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already taken. Please choose another.' },
                { status: 409 }
            );
        }

        // Check if email is already registered
        const { data: existingEmail } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email already registered. Please use a different email or login.' },
                { status: 409 }
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const expiryTime = getOTPExpiryTime();
        const normalizedEmail = email.toLowerCase().trim();

        // Store OTP in a signed JWT token (stateless — no DB needed)
        const otpToken = await storeOTP(normalizedEmail, username, otp, expiryTime);

        // Send OTP email
        const html = getOTPEmailTemplate(username, otp, 'registration');
        const emailSent = await sendEmail(
            normalizedEmail,
            'VU Academic Hub - Email Verification Code 🔐',
            html
        );

        if (!emailSent) {
            return NextResponse.json(
                { error: 'Failed to send verification email. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Verification code sent to your email. Please check your inbox.',
            email: normalizedEmail,
            otpToken, // Frontend must send this back during verification
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error. Please try again.' },
            { status: 500 }
        );
    }
}
