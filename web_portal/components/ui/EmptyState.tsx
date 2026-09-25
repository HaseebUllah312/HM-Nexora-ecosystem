import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: string;
    actionLabel?: string;
    actionLink?: string;
}

export default function EmptyState({
    title = "No Data Found",
    description = "There is nothing here yet.",
    icon = "📂",
    actionLabel,
    actionLink
}: EmptyStateProps) {
    return (
        <div className="card" style={{
            textAlign: 'center',
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-tertiary)',
            borderStyle: 'dashed'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.8 }}>{icon}</div>
            <h3 style={{ marginBottom: '10px' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: actionLabel ? '24px' : '0' }}>{description}</p>

            {actionLabel && actionLink && (
                <Link href={actionLink} className="btn btn-primary">
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
