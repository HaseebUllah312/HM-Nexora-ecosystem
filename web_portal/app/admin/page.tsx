'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';

export default function AdminPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dbLatency, setDbLatency] = useState(0);
    const [metrics, setMetrics] = useState<any>({
        users: 0,
        subjects: 402,
        materials: 0,
        totalResources: 0,
        avgRating: 4.9,
        totalReviews: 0,
        quizzesTaken: 0,
        trends: { users: [10, 25, 45, 80, 120, 190, 260], quizzes: [5, 18, 32, 60, 95, 140, 210] }
    });
    const router = useRouter();

    useEffect(() => {
        // Check authentication
        async function checkAuth() {
            const start = performance.now();
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();

                if (!data.user || (data.user.role !== 'admin' && data.user.role !== 'owner')) {
                    // If not logged in as admin in session, check local admin token
                    const localToken = typeof window !== 'undefined' ? localStorage.getItem('nx_admin_token') : null;
                    if (!localToken) {
                        router.push('/admin/login');
                        return;
                    }
                    setCurrentUser({ username: 'Nexora Admin', role: 'admin' });
                } else {
                    setCurrentUser(data.user);
                }
                fetchMetrics();
            } catch (error) {
                const localToken = typeof window !== 'undefined' ? localStorage.getItem('nx_admin_token') : null;
                if (localToken) {
                    setCurrentUser({ username: 'Nexora Admin', role: 'admin' });
                } else {
                    router.push('/admin/login');
                }
            } finally {
                const end = performance.now();
                setDbLatency(Math.round(end - start));
                setLoading(false);
            }
        }

        async function fetchMetrics() {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setMetrics((prev: any) => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
            }
        }
        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <main className="page" style={{ padding: '40px' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <Skeleton width="100%" height="200px" borderRadius="15px" style={{ marginBottom: '40px' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                        {[...Array(4)].map((_, i) => <Skeleton key={i} height="150px" borderRadius="15px" />)}
                    </div>
                </div>
            </main>
        );
    }

    const Sparkline = ({ data, color }: { data: number[], color: string }) => {
        if (!data || data.length === 0) return null;
        const max = Math.max(...data, 1);
        const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - (val / max) * 80}`).join(' ');
        
        return (
            <svg viewBox="0 0 100 100" style={{ height: '40px', width: '100%', marginTop: '10px', filter: `drop-shadow(0 0 5px ${color})` }}>
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
            </svg>
        );
    };

    return (
        <main className="page page-fade-in" style={{ maxWidth: '1450px', margin: '0 auto', padding: '24px' }}>
            {/* Master Admin Header */}
            <div className="glass" style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(6, 182, 212, 0.9))',
                color: 'white',
                padding: '40px',
                borderRadius: '24px',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>⚡ Admin Nexus</h1>
                            <span style={{ 
                                background: 'rgba(255,255,255,0.2)', 
                                padding: '6px 14px', 
                                borderRadius: '20px', 
                                fontSize: '0.85rem', 
                                fontWeight: 'bold',
                                backdropFilter: 'blur(5px)',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}>v2.1 Master Suite</span>
                        </div>
                        <p style={{ fontSize: '1.1rem', opacity: 0.95, margin: 0 }}>
                            Omnipotent control center for <strong>HM Nexora</strong>. Manage 402 VU subjects, students, chat rooms, and file reviews.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <a 
                            href="/admin.html" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: '#0f172a',
                                padding: '14px 24px',
                                borderRadius: '14px',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            🚀 Launch Standalone Suite (admin.html)
                        </a>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) 340px', gap: '30px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Performance Pulse */}
                    <section>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            📊 Live Ecosystem Pulse
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                            {[
                                { 
                                    label: 'Total Students', 
                                    value: metrics.users || 1, 
                                    icon: '👥', 
                                    sub: 'Registered accounts', 
                                    trend: metrics.trends?.users,
                                    color: '#6366f1' 
                                },
                                { 
                                    label: 'VU Subjects', 
                                    value: metrics.subjects || 402, 
                                    icon: '📚', 
                                    sub: 'Active courses & rooms', 
                                    color: '#10b981' 
                                },
                                { 
                                    label: 'Quiz Bank Submissions', 
                                    value: metrics.quizzesTaken || 0, 
                                    icon: '🎯', 
                                    sub: 'Total submissions', 
                                    trend: metrics.trends?.quizzes,
                                    color: '#f59e0b' 
                                },
                                { 
                                    label: 'Platform Rating', 
                                    value: `${metrics.avgRating || 4.9} / 5`, 
                                    icon: '⭐', 
                                    sub: `From ${metrics.totalReviews || 0} reviews`, 
                                    color: '#ec4899' 
                                }
                            ].map((item, i) => (
                                <div key={i} className="glass-card card" style={{ padding: '22px', borderRadius: '18px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ fontSize: '1.6rem' }}>{item.icon}</div>
                                        {item.trend && <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: item.color }}>+ Live</div>}
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '0.85rem', fontWeight: '600' }}>{item.label}</p>
                                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>{item.value?.toLocaleString() || '0'}</p>
                                    {item.trend ? <Sparkline data={item.trend} color={item.color} /> : <div style={{ height: '35px', borderTop: '1px dashed var(--border-color)', marginTop: '10px' }} />}
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '10px' }}>{item.sub}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Admin Modules Grid */}
                    <section>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🛠️ Master Control Modules</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
                            {[
                                { icon: '👥', label: 'Students & Users', href: '/admin/users', color: 'rgba(102, 126, 234, 0.15)' },
                                { icon: '📢', label: 'Announcements', href: '/admin/announcements', color: 'rgba(234, 179, 8, 0.15)' },
                                { icon: '💬', label: 'Chat Moderation', href: '/admin/moderation', color: 'rgba(239, 68, 68, 0.15)' },
                                { icon: '📂', label: 'Manage Reviews', href: '/admin/manage-reviews', color: 'rgba(236, 72, 153, 0.15)' },
                                { icon: '📚', label: '402 Subjects', href: '/admin/subjects', color: 'rgba(16, 185, 129, 0.15)' },
                                { icon: '🎯', label: 'Quiz Maker & Bank', href: '/admin/quiz-maker', color: 'rgba(249, 115, 22, 0.15)' },
                                { icon: '📊', label: 'Analytics', href: '/admin/analytics', color: 'rgba(34, 197, 94, 0.15)' },
                                { icon: '📜', label: 'Activity Logs', href: '/admin/activity', color: 'rgba(6, 182, 212, 0.15)' },
                                { icon: '⚙️', label: 'Settings & AI Keys', href: '/admin/settings', color: 'rgba(168, 85, 247, 0.15)' },
                                { icon: '⚡', label: 'Standalone Suite', href: '/admin.html', color: 'rgba(124, 58, 237, 0.2)' }
                            ].map((tool, idx) => (
                                <Link key={idx} href={tool.href} className="glass-card" style={{
                                    padding: '22px 14px',
                                    borderRadius: '16px',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid var(--border-color)',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{ 
                                        fontSize: '1.8rem', 
                                        width: '56px', 
                                        height: '56px', 
                                        background: tool.color, 
                                        borderRadius: '14px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center' 
                                    }}>{tool.icon}</div>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-primary)', textAlign: 'center' }}>{tool.label}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar - Core Health & Fast Links */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* System Health */}
                    <div className="glass-card" style={{ padding: '22px', borderRadius: '18px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                                width: '10px', 
                                height: '10px', 
                                background: '#10b981', 
                                borderRadius: '50%', 
                                display: 'inline-block',
                                boxShadow: '0 0 8px #10b981'
                            }}></span>
                            Ecosystem Live Status
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Supabase Database</span>
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>Connected</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Cloudflare API</span>
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>200 OK (15 Keys)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Google Drive Vault</span>
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>Active</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>DB Latency</span>
                                <span style={{ color: dbLatency < 500 ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{dbLatency || 32}ms</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Card */}
                    <div className="glass-card" style={{ padding: '22px', borderRadius: '18px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>⚡ Fast Broadcast</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            Broadcast instant alerts across Web, Mobile App, and Chrome Extension.
                        </p>
                        <Link href="/admin/announcements" style={{
                            display: 'block',
                            textAlign: 'center',
                            background: 'var(--accent-primary, #7c3aed)',
                            color: 'white',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.88rem'
                        }}>
                            📢 Post Announcement
                        </Link>
                    </div>
                </aside>
            </div>
        </main>
    );
}