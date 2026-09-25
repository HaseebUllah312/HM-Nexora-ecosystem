import { SignJWT, jwtVerify } from 'jose';

// --- Configuration ---
const SECRET_KEY = process.env.SESSION_SECRET || 'CHANGE_THIS_IN_PRODUCTION_TO_A_LONG_RANDOM_STRING';
const KEY = new TextEncoder().encode(SECRET_KEY);

export type UserRole = 'owner' | 'admin' | 'student';

export interface SessionPayload {
    id: string;
    username: string;
    role: UserRole;
    avatar_url?: string;
    iat?: number;
    exp?: number;
}

/**
 * Creates an encrypted session token.
 */
export async function createSession(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 1 week session
        .sign(KEY);
}

/**
 * Verifies and decrypts a session token.
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, KEY, {
            algorithms: ['HS256'],
        });
        return payload as unknown as SessionPayload;
    } catch (error) {
        return null;
    }
}
