/**
 * Stateless OTP storage using signed JWTs.
 * No database table required — works perfectly on Vercel serverless.
 *
 * Flow:
 *  1. storeOTP()  → returns a signed token (string) containing the OTP
 *  2. Frontend stores the token (returned in API response)
 *  3. verifyOTP() → validates the token signature + checks OTP + checks expiry
 */

import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
    process.env.SESSION_SECRET || 'otp-secret-change-in-production'
);

interface OTPPayload {
    email: string;
    username: string;
    otp: string;
    type: string;
}

/** Creates a signed OTP token valid until expiresAt */
export async function storeOTP(
    email: string,
    username: string,
    otp: string,
    expiresAt: Date
): Promise<string> {
    const token = await new SignJWT({ email: email.toLowerCase().trim(), username, otp, type: 'otp' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
        .sign(SECRET);

    return token;
}

/** Verifies the OTP token and checks the provided OTP matches */
export async function verifyOTP(
    token: string,
    providedOTP: string
): Promise<{ valid: boolean; message: string; email?: string; username?: string }> {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        const data = payload as unknown as OTPPayload;

        if (data.otp !== providedOTP) {
            return { valid: false, message: 'Incorrect OTP. Please check your email and try again.' };
        }

        return {
            valid: true,
            message: 'OTP verified successfully.',
            email: data.email,
            username: data.username,
        };
    } catch (err: any) {
        if (err?.code === 'ERR_JWT_EXPIRED') {
            return { valid: false, message: 'OTP has expired. Please request a new verification code.' };
        }
        return { valid: false, message: 'Invalid verification code. Please request a new one.' };
    }
}
