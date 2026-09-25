'use client';
import { useState, useEffect } from 'react';

export default function LeaderboardPage() {
    const [topUploaders, setTopUploaders] = useState<any[]>([]);
    const [topAnswerers, setTopAnswerers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/leaderboard');
                if (res.ok) {
                    const data = await res.json();
                    setTopUploaders(data.topUploaders || []);
                    setTopAnswerers(data.topAnswerers || []);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>🏆 Leaderboard</h1>
                    <p>Celebrating our top contributors who help the VU community</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading leaderboard...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                        {/* Top Uploaders */}
                        <div>
                            <h2 style={{ marginBottom: '20px' }}>📤 Top Contributors</h2>
                            {topUploaders.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)' }}>No contributors yet. Be the first!</p>
                            ) : (
                                topUploaders.map(u => (
                                    <div key={u.rank} className="leaderboard-item">
                                        <div className={`leaderboard-rank ${u.rank === 1 ? 'gold' : u.rank === 2 ? 'silver' : u.rank === 3 ? 'bronze' : ''}`}>
                                            {u.rank === 1 ? '🏆' : u.rank === 2 ? '🥇' : u.rank === 3 ? '🥈' : '⭐'}
                                        </div>
                                        <div className="leaderboard-info">
                                            <div className="leaderboard-name">{u.name}</div>
                                            <div className="leaderboard-stats">Contributors • {u.reviews} Reviews • {u.answers} Answers</div>
                                        </div>
                                        <div className="leaderboard-points">{u.points?.toLocaleString() || '0'} pts</div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Top Answerers */}
                        <div>
                            <h2 style={{ marginBottom: '20px' }}>💬 Top Q&A Helpers</h2>
                            {topAnswerers.length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)' }}>Q&A helps coming soon!</p>
                            ) : (
                                topAnswerers.map(u => (
                                    <div key={u.rank} className="leaderboard-item">
                                        <div className={`leaderboard-rank ${u.rank === 1 ? 'gold' : u.rank === 2 ? 'silver' : u.rank === 3 ? 'bronze' : ''}`}>
                                            {u.badge}
                                        </div>
                                        <div className="leaderboard-info">
                                            <div className="leaderboard-name">{u.name}</div>
                                            <div className="leaderboard-stats">{u.answers} answers • {u.accepted} accepted</div>
                                        </div>
                                        <div className="leaderboard-points">{u.points?.toLocaleString() || '0'} pts</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Badge System */}
                <div style={{ marginTop: '60px' }}>
                    <div className="section-header">
                        <h2>🎖️ Badge System</h2>
                        <p>Earn badges by contributing to the community</p>
                    </div>
                    <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                        {[
                            { icon: '🌟', title: 'Newcomer', desc: 'First upload or answer', points: '10 pts' },
                            { icon: '📝', title: 'Contributor', desc: '10+ uploads', points: '100 pts' },
                            { icon: '🎯', title: 'Expert', desc: '50+ accepted answers', points: '500 pts' },
                            { icon: '👑', title: 'Legend', desc: '100+ uploads + 2000 pts', points: '2000 pts' },
                            { icon: '💎', title: 'Diamond', desc: 'Top 3 in leaderboard', points: '3000 pts' },
                            { icon: '🏅', title: 'Mentor', desc: 'Helped 100+ students', points: '1500 pts' },
                        ].map((b, i) => (
                            <div key={i} className="card" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{b.icon}</div>
                                <h3 style={{ fontSize: '1rem' }}>{b.title}</h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '6px 0' }}>{b.desc}</p>
                                <span className="badge badge-primary">{b.points}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
