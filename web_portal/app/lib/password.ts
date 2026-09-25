import crypto from 'crypto';

// --- Hashing ---

/**
 * Generates a random salt.
 */
export function generateSalt(length = 16): string {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hashes a password with a given salt using PBKDF2.
 */
export function hashPassword(password: string, salt: string): string {
    // 1000 iterations, 64 length, sha512 digest
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

/**
 * Verifies a password against a stored hash and salt.
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    // Constant time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}
