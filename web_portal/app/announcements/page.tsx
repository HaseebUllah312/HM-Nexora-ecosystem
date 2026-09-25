'use client';
import { categoryLabels } from '@/data/announcements';
import { useState, useEffect } from 'react';

// We define the interface to match our DB schema
interface Announcement {
    id: string;
    title: string;
    description: string;
    date: string;
    category: string;
    important: boolean;
}

export default function AnnouncementsPage() {
    const [filter, setFilter] = useState('all');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const cats = ['all', ...Object.keys(categoryLabels)];

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch('/api/system/announcements');
                if (res.ok) {
                    const data = await res.json();
                    setAnnouncements(data);
                }
            } catch (error) {
                console.error("Failed to fetch announcements:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, []);

    const filtered = filter === 'all' ? announcements : announcements.filter(a => a.category === filter);

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header">
                    <h1>📢 Announcements & Updates</h1>
                    <p>Stay updated with the latest VU news and notifications</p>
                </div>

                {/* WhatsApp Channel Promotion */}
                {/* WhatsApp Channel Promotion */}
                <div className="glass-card-navy" style={{
                    padding: '24px',
                    marginBottom: '32px',
                    textAlign: 'center',
                    border: '1px solid rgba(37, 211, 102, 0.4)',
                    background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, var(--bg-secondary) 100%)'
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#25D366' }}>📱 Follow Our WhatsApp Channel</h3>
                    <p style={{ margin: '0 0 20px 0', color: 'var(--text-secondary)' }}>Get instant notifications for all announcements and important updates</p>
                    <a
                        href="https://whatsapp.com/channel/0029Vb5PcRb11ulIA5AYpj2K"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{
                            backgroundColor: '#25D366',
                            color: 'white',
                            padding: '12px 32px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: '800',
                            border: 'none',
                            boxShadow: '0 0 20px rgba(37, 211, 102, 0.3)'
                        }}
                    >
                        Join Now
                    </a>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '32px', justifyContent: 'center' }}>
                    {cats.map(c => (
                        <button 
                            key={c} 
                            className="capsule-btn" 
                            style={{ 
                                background: filter === c ? 'var(--accent-glow)' : 'var(--bg-card)',
                                borderColor: filter === c ? 'var(--accent-secondary)' : 'var(--border-color)',
                                color: filter === c ? 'var(--accent-secondary)' : 'var(--text-secondary)'
                            }}
                            onClick={() => setFilter(c)}
                        >
                            {c === 'all' ? '📌 All' : (categoryLabels[c] || c)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        Loading announcements...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        No announcements found for this category.
                    </div>
                ) : (
                    filtered.map(a => (
                        <div key={a.id} className={`announcement-card ${a.important ? 'important' : ''}`}>
                            <div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                                    <span className="badge badge-primary">{categoryLabels[a.category] || a.category}</span>
                                    {a.important && <span className="badge badge-warning">⚠️ Important</span>}
                                </div>
                                <h3 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>{a.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{a.description}</p>
                                <div className="announcement-date">📅 {new Date(a.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
