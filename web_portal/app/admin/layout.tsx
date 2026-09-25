import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Operating Suite | HM Nexora',
    description: 'Master control panel for HM Nexora ecosystem: manage 402 VU subjects, students, community chats, reviews, and question bank.',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #050811)' }}>
            {children}
        </div>
    );
}