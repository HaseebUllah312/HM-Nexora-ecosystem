'use client';

import React from 'react';

interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    provider: string;
    created_at: string;
    is_email_verified: boolean;
}

interface UserProfileModalProps {
    user: User | null;
    onClose: () => void;
    onPromote: (userId: string) => void;
    currentUserRole: string | null;
}

export default function UserProfileModal({ user, onClose, onPromote, currentUserRole }: UserProfileModalProps) {
    if (!user) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            zIndex: 3000,
            display: 'flex',
            justifyContent: 'flex-end'
        }}>
            {/* Backdrop */}
            <div 
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.3s ease-out'
                }}
            />

            {/* Panel */}
            <div className="glass" style={{
                width: '100%',
                maxWidth: '500px',
                height: '100%',
                background: 'var(--bg-card)',
                boxShadow: '-20px 0 50px rgba(0,0,0,0.3)',
                padding: '40px',
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                overflowY: 'auto'
            }}>
                {/* Close Button */}
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                }}>✕</button>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        margin: '0 auto 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}>
                        {user.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <h2 style={{ fontSize: '2rem', margin: '0 0 10px 0' }}>{user.username}</h2>
                    <span style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background: 'rgba(102, 126, 234, 0.1)',
                        color: 'var(--primary)',
                        border: '1px solid var(--border-color)'
                    }}>
                        {user.role.toUpperCase()} • ID: {user.id.slice(0, 8)}
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <section>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                            Core Information
                        </h3>
                        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Email</span>
                                <span style={{ fontWeight: '600' }}>{user.email}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Auth Provider</span>
                                <span style={{ fontWeight: '600', color: user.provider === 'google' ? '#4285F4' : 'var(--text-primary)' }}>
                                    {user.provider === 'google' ? 'Google' : 'Email/Password'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Joined Date</span>
                                <span style={{ fontWeight: '600' }}>{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Account Status</span>
                                <span style={{ fontWeight: '700', color: user.is_email_verified ? '#10b981' : '#f59e0b' }}>
                                    {user.is_email_verified ? 'VERIFIED' : 'PENDING'}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                            Platform Activity
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="glass-card" style={{ padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>12</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quizzes Taken</p>
                            </div>
                            <div className="glass-card" style={{ padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>85%</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Score</p>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginTop: 'auto', paddingTop: '40px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'rgba(239, 68, 68, 0.8)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                            Administrative Nexus
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {currentUserRole === 'owner' && user.role !== 'admin' && user.role !== 'owner' && (
                                <button 
                                    onClick={() => onPromote(user.id)}
                                    className="glass" 
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '14px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        border: '1px solid #6366f1',
                                        color: '#6366f1',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    Elevate to Administrator
                                </button>
                            )}
                            <button className="glass" style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '14px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}>
                                Suspend Account Performance
                            </button>
                        </div>
                    </section>
                </div>

                <style jsx>{`
                    @keyframes slideInRight {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}</style>
            </div>
        </div>
    );
}
