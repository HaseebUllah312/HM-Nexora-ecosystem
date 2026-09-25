'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Application Error:', error);
    }, [error]);

    return (
        <div className="page" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Something went wrong!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px' }}>
                We apologized for the inconvenience. A client-side exception has occurred, but we've caught it to prevent the app from crashing.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => reset()}
                    style={{ padding: '12px 24px' }}
                >
                    Try again
                </button>
                <Link href="/" className="btn btn-secondary" style={{ padding: '12px 24px' }}>
                    Go to Home
                </Link>
            </div>
            {process.env.NODE_ENV === 'development' && (
                <pre style={{
                    marginTop: '40px',
                    padding: '20px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    maxWidth: '100%',
                    overflow: 'auto'
                }}>
                    {error.message}
                    {error.stack}
                </pre>
            )}
        </div>
    );
}
