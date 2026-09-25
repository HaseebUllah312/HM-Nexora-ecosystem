import React from 'react';

interface Announcement {
    id: number | string;
    title: string;
    description: string;
    date: string;
    category: string;
    important: boolean;
    deadline?: string;
    imageUrl?: string;
}

interface AnnouncementCardProps {
    announcement: Announcement;
    onDelete: (id: string | number) => void;
    categoryLabel: string;
}

export default function AnnouncementCard({ announcement, onDelete, categoryLabel }: AnnouncementCardProps) {
    const formattedDate = announcement.date 
        ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(announcement.date))
        : 'No date';

    return (
        <div style={{
            padding: '20px',
            border: '1px solid rgba(102, 126, 234, 0.15)',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'default',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'relative',
            overflow: 'hidden'
        }}
        className="announcement-card-hover"
        >
            {announcement.imageUrl && (
                <div style={{ 
                    marginBottom: '8px', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    height: '160px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <img 
                        src={announcement.imageUrl} 
                        alt={announcement.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        className="card-image"
                        onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')}
                    />
                </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.25rem', 
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}>
                        {announcement.title || 'Untitled'}
                        {announcement.important && (
                            <span style={{ 
                                fontSize: '0.7rem', 
                                background: 'linear-gradient(135deg, #ff4d4d, #f9cb28)', 
                                color: 'white', 
                                padding: '2px 10px', 
                                borderRadius: '20px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontWeight: '800',
                                boxShadow: '0 2px 10px rgba(255, 77, 77, 0.3)'
                            }}>
                                Important
                            </span>
                        )}
                    </h3>
                </div>
                <button
                    onClick={() => onDelete(announcement.id)}
                    style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                        e.currentTarget.style.color = '#ef4444';
                    }}
                >
                    Delete
                </button>
            </div>

            <p style={{ 
                margin: 0, 
                fontSize: '0.95rem', 
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                opacity: '0.9'
            }}>
                {announcement.description || 'No description provided.'}
            </p>

            <div style={{ 
                marginTop: 'auto',
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '15px',
                borderTop: '1px solid rgba(102, 126, 234, 0.1)',
                fontSize: '0.85rem', 
                color: 'var(--text-muted)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {categoryLabel}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📅 {formattedDate}
                    </span>
                </div>
                {announcement.deadline && (
                    <span style={{ 
                        color: new Date(announcement.deadline) < new Date() ? '#ef4444' : 'var(--primary)',
                        fontWeight: '600',
                        fontSize: '0.8rem'
                    }}>
                        {new Date(announcement.deadline) < new Date() ? '❌ Expired' : `⌛ Due: ${new Date(announcement.deadline).toLocaleDateString()}`}
                    </span>
                )}
            </div>

            <style jsx>{`
                .announcement-card-hover:hover {
                    transform: translateY(-5px);
                    border-color: var(--primary) !important;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    background: rgba(255, 255, 255, 0.05) !important;
                }
                .announcement-card-hover:hover .card-image {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}
