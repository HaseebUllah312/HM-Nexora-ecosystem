'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useClickOutside } from '@/app/lib/hooks/useClickOutside';
import { categoryLabels } from '@/data/announcements';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '@/components/ui/Skeleton';

interface Announcement {
    id: string | number;
    title: string;
    description: string;
    date: string;
    category: string;
    important: boolean;
    image_url?: string;
    imageUrl?: string; // Support both naming conventions
}

export default function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [activeTab, setActiveTab] = useState<'personal' | 'general'>('personal');
    const [hasMounted, setHasMounted] = useState(false);
    const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => setShowDropdown(false));

    useEffect(() => {
        const totalUnread = unreadNotifications;
        if (totalUnread > 0) {
            if ('setAppBadge' in navigator) {
                (navigator as any).setAppBadge(totalUnread);
            }
        } else {
            if ('clearAppBadge' in navigator) {
                (navigator as any).clearAppBadge();
            }
        }
    }, [unreadNotifications]);

    useEffect(() => {
        setHasMounted(true);
        if (!userId) return;

        // Fetch Notifications
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('user_notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (data) {
                setNotifications(data);
                setUnreadNotifications(data.filter(n => !n.read).length);
            }
        };

        // Fetch Announcements
        const fetchAnnouncements = async () => {
            setLoadingAnnouncements(true);
            try {
                const res = await fetch('/api/system/announcements');
                if (res.ok) {
                    const data = await res.json();
                    setAnnouncements(data.slice(0, 5)); // Only show latest 5 in bell
                }
            } catch (err) {
                console.error("Failed to fetch announcements:", err);
            } finally {
                setLoadingAnnouncements(false);
            }
        };

        fetchNotifications();
        fetchAnnouncements();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`user_notifications_${userId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'user_notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev.slice(0, 9)]);
                setUnreadNotifications(prev => prev + 1);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const markAsRead = async () => {
        if (unreadNotifications === 0) return;
        setUnreadNotifications(0);
        await supabase
            .from('user_notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);
    };

    if (!hasMounted) return null;

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
                onClick={() => { 
                    setShowDropdown(!showDropdown); 
                    if (!showDropdown && activeTab === 'personal') markAsRead(); 
                }}
                className="theme-toggle"
                style={{ 
                    fontSize: '1.2rem', 
                    position: 'relative',
                    width: '42px',
                    height: '42px'
                }}
            >
                🔔
                {unreadNotifications > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        minWidth: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        border: '2px solid var(--bg-primary)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        {unreadNotifications}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="card" 
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            width: '340px',
                            maxHeight: '500px',
                            overflow: 'hidden',
                            marginTop: '12px',
                            zIndex: 1000,
                            padding: 0,
                            boxShadow: 'var(--shadow-xl)',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'var(--bg-glass)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        {/* Tabs */}
                        <div style={{ 
                            display: 'flex', 
                            borderBottom: '1px solid var(--border-color)',
                            background: 'rgba(var(--accent-primary-rgb), 0.03)'
                        }}>
                            <button 
                                onClick={() => { setActiveTab('personal'); markAsRead(); }}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === 'personal' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                    color: activeTab === 'personal' ? 'var(--accent-primary)' : 'var(--text-muted)',
                                    fontWeight: activeTab === 'personal' ? '700' : '500',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Notifications
                                {unreadNotifications > 0 && <span style={{ marginLeft: '6px', opacity: 0.6 }}>({unreadNotifications})</span>}
                            </button>
                            <button 
                                onClick={() => setActiveTab('general')}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === 'general' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                    color: activeTab === 'general' ? 'var(--accent-primary)' : 'var(--text-muted)',
                                    fontWeight: activeTab === 'general' ? '700' : '500',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Announcements
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                            {activeTab === 'personal' ? (
                                notifications.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.5 }}>📭</div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No personal notifications yet.</p>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} style={{ 
                                            padding: '12px', 
                                            borderRadius: '10px',
                                            marginBottom: '8px',
                                            background: n.read ? 'transparent' : 'rgba(var(--accent-primary-rgb), 0.05)',
                                            border: '1px solid transparent',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: '1.4' }}>
                                                {n.message}
                                            </p>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>
                                                {new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                    ))
                                )
                            ) : (
                                loadingAnnouncements ? (
                                    <div style={{ padding: '0px' }}>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} style={{ 
                                                padding: '12px', 
                                                borderRadius: '12px',
                                                marginBottom: '12px',
                                                background: 'rgba(var(--accent-primary-rgb), 0.02)',
                                                border: '1px solid var(--border-color)',
                                            }}>
                                                <Skeleton height="80px" borderRadius="8px" style={{ marginBottom: '10px', opacity: 0.1 }} />
                                                <Skeleton width="60%" height="18px" style={{ marginBottom: '8px', opacity: 0.1 }} />
                                                <Skeleton width="90%" height="32px" style={{ opacity: 0.05 }} />
                                            </div>
                                        ))}
                                    </div>
                                ) : announcements.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.5 }}>📢</div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Stay tuned for updates!</p>
                                    </div>
                                ) : (
                                    announcements.map(a => (
                                        <div key={a.id} style={{ 
                                            padding: '0', 
                                            borderRadius: '12px',
                                            marginBottom: '12px',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                            overflow: 'hidden',
                                            transition: 'transform 0.2s ease',
                                        }}
                                        className="announcement-item-hover"
                                        >
                                            {(a.image_url || a.imageUrl) && (
                                                <div style={{ width: '100%', height: '100px', overflow: 'hidden' }}>
                                                    <img 
                                                        src={a.image_url || a.imageUrl} 
                                                        alt={a.title} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            )}
                                            <div style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                                    <span style={{ 
                                                        fontSize: '0.65rem', 
                                                        fontWeight: 'bold', 
                                                        textTransform: 'uppercase',
                                                        color: 'var(--accent-primary)',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {categoryLabels[a.category] || a.category}
                                                    </span>
                                                    {a.important && <span style={{ fontSize: '0.65rem' }}>⚠️</span>}
                                                </div>
                                                <h5 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
                                                    {a.title}
                                                </h5>
                                                <p style={{ 
                                                    fontSize: '0.78rem', 
                                                    color: 'var(--text-secondary)', 
                                                    lineHeight: '1.4',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    marginBottom: '8px'
                                                }}>
                                                    {a.description}
                                                </p>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                        {new Date(a.date).toLocaleDateString()}
                                                    </span>
                                                    <a href="/announcements" style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
                                                        View Details →
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>

                        {/* Footer Link */}
                        <div style={{ 
                            padding: '12px', 
                            textAlign: 'center', 
                            borderTop: '1px solid var(--border-color)',
                            background: 'rgba(var(--accent-primary-rgb), 0.02)'
                        }}>
                            <a 
                                href={activeTab === 'personal' ? '/profile/notifications' : '/announcements'}
                                style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-primary)' }}
                            >
                                {activeTab === 'personal' ? 'View All Notifications' : 'View All Announcements'}
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <style jsx>{`
                .announcement-item-hover:hover {
                    transform: translateY(-2px);
                    border-color: var(--accent-primary);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .spinner-sm {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--border-color);
                    border-top: 2px solid var(--accent-primary);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
