'use client';

import { useRouter } from 'next/navigation';

interface NavItem {
    icon: string;
    label: string;
    href: string;
}

const defaultItems: NavItem[] = [
    { icon: '📊', label: 'Quiz', href: '/quiz' },
    { icon: '📚', label: 'MCQ Practice', href: '/mcq-practice' },
    { icon: '✅', label: 'MCQ Practice', href: '/mcq-practice' },
    { icon: '📖', label: 'Resources', href: '/resources' },
    { icon: '🤖', label: 'AI Assistant', href: '/ai-assistant' },
    { icon: '❓', label: 'Q&A Forum', href: '/qna' },
    { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
    { icon: '📤', label: 'Upload Files', href: '/upload' },
    { icon: '👤', label: 'My Profile', href: '/profile' }
];

export default function DashboardNavGrid({ items = defaultItems }: { items?: NavItem[] }) {
    const router = useRouter();

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginTop: '30px'
        }}>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    onClick={() => router.push(item.href)}
                    style={{
                        background: 'rgba(102, 126, 234, 0.08)',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        textDecoration: 'none',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e: any) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.2)';
                    }}
                    onMouseLeave={(e: any) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <div style={{ fontSize: '1.8rem' }}>{item.icon}</div>
                    <p style={{ margin: 0, fontWeight: '500', fontSize: '0.95rem' }}>{item.label}</p>
                </div>
            ))}
        </div>
    );
}
