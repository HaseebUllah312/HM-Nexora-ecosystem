import { SignJWT, importPKCS8 } from 'jose';

// Type definitions for Google Token responses
interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    refresh_token?: string;
    scope?: string;
}

/**
 * Validates and retrieves credentials from environment variables.
 * Supports both OAuth (Client ID/Secret + Refresh Token) 
 * and Service Account (Client Email + Private Key).
 */
export const getCredentials = () => {
    const creds = {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
        // Service Account specifics
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
        privateKey: process.env.GOOGLE_PRIVATE_KEY,
    };

    if (!creds.folderId) {
        throw new Error('GOOGLE_DRIVE_FOLDER_ID is missing from environment variables.');
    }

    const hasOAuth = creds.clientId && creds.clientSecret && creds.refreshToken;
    const hasServiceAccount = creds.clientEmail && creds.privateKey;

    if (!hasOAuth && !hasServiceAccount) {
        throw new Error('Missing Google Drive credentials. Please provide either Service Account or OAuth variables.');
    }

    return creds;
};

/**
 * Robust Access Token retrieval using native fetch and jose for signing.
 * Bypasses the buggy googleapis SDK which hangs on Windows/Vercel.
 */
export async function getAccessToken(): Promise<string> {
    const creds = getCredentials();
    const { clientEmail, privateKey, clientId, clientSecret, refreshToken } = creds;

    try {
        // A. Prefer Service Account Flow (Easiest to maintain, never expires)
        if (clientEmail && privateKey) {
            const formattedKey = privateKey.replace(/\\n/g, '\n').replace(/"/g, '');
            const key = await importPKCS8(formattedKey, 'RS256');

            const jwt = await new SignJWT({
                scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly',
            })
                .setProtectedHeader({ alg: 'RS256' })
                .setIssuedAt()
                .setIssuer(clientEmail)
                .setAudience('https://oauth2.googleapis.com/token')
                .setExpirationTime('1h')
                .sign(key);

            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: jwt,
                }),
                signal: AbortSignal.timeout(10000), // 10s timeout
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Service Account Token Error: ${JSON.stringify(error)}`);
            }

            const data: GoogleTokenResponse = await response.json();
            return data.access_token;
        }

        // B. Fallback to OAuth Refresh Token Flow
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId!,
                client_secret: clientSecret!,
                refresh_token: refreshToken!,
                grant_type: 'refresh_token',
            }),
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let error;
            try {
                error = JSON.parse(errorText);
            } catch (p) {
                error = { error: errorText };
            }

            console.error('Google OAuth Refresh Response Details:', {
                status: response.status,
                body: error
            });

            if (error.error === 'invalid_grant' || error.error === 'invalid_client') {
                throw new Error(`Google Refresh Token is EXPIRED or REVOKED (or Client ID/Secret is wrong). Error: ${error.error}`);
            }
            throw new Error(`OAuth Refresh Error: ${error.error_description || error.error || response.statusText}`);
        }

        const data: GoogleTokenResponse = await response.json();
        return data.access_token;

    } catch (error: any) {
        console.error('Google Auth Error:', error.message);
        throw error;
    }
}

/**
 * Uploads a file buffer to Google Drive using multipart/related upload.
 */
export async function uploadToDrive(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
        const { folderId } = getCredentials();
        const accessToken = await getAccessToken();

        const boundary = '-------314159265358979323846';
        const metadata = {
            name: fileName,
            parents: [folderId],
        };

        const preamble = [
            `--${boundary}\r\n`,
            'Content-Type: application/json; charset=UTF-8\r\n\r\n',
            JSON.stringify(metadata),
            `\r\n--${boundary}\r\n`,
            `Content-Type: ${mimeType}\r\n\r\n`,
        ].join('');

        const postamble = `\r\n--${boundary}--`;
        
        const multipartBody = Buffer.concat([
            Buffer.from(preamble),
            buffer,
            Buffer.from(postamble)
        ]);

        const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
                'Content-Length': multipartBody.length.toString(),
            },
            body: multipartBody,
            signal: AbortSignal.timeout(30000), // 30s timeout for uploads
        });

        if (!uploadRes.ok) {
            const error = await uploadRes.text();
            throw new Error(`Upload to Drive failed: ${error}`);
        }

        const fileData = await uploadRes.json();
        return fileData.id;
    } catch (err: any) {
        console.error('Upload Process Failed:', err.message);
        throw new Error(err.message || 'Failed to upload to drive');
    }
}

/**
 * Legacy support for parts of the app that might still require the SDK client.
 * Note: Use getAccessToken + fetch instead for high stability.
 */
export async function getDriveClient() {
    const { google } = await import('googleapis');
    const creds = getCredentials();
    
    // This is only for fallback use; if missing it will throw above
    const oauth2Client = new google.auth.OAuth2(
        creds.clientId,
        creds.clientSecret
    );
    oauth2Client.setCredentials({ refresh_token: creds.refreshToken });
    return google.drive({ version: 'v3', auth: oauth2Client });
}
