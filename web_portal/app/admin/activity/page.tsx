'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityLog {
    id: string;
    type: 'user' | 'content' | 'system' | 'security';
    title: string;
    description: string;
    created_at: string;
    severity: 'info' | 'warning' | 'error' | 'success';
    actor?: string;
}

export default function ActivityPage() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/activity');
            if (res.ok) {
                const data = await res.json();
                setActivities(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch activity logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const [filterType, setFilterType] = useState<'all' | 'user' | 'content' | 'system' | 'security'>('all');
    const [filterSeverity, setFilterSeverity] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

    const filteredActivities = (activities || []).filter(activity => {
        const typeMatch = filterType === 'all' || activity.type === filterType;
        const severityMatch = filterSeverity === 'all' || activity.severity === filterSeverity;
        return typeMatch && severityMatch;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'success': return { bg: 'var(--success-bg)', text: 'var(--success)', icon: '✅' };
            case 'info': return { bg: 'var(--info-bg)', text: 'var(--info)', icon: 'ℹ️' };
            case 'warning': return { bg: 'var(--warning-bg)', text: 'var(--warning)', icon: '⚠️' };
            case 'error': return { bg: 'var(--error-bg)', text: 'var(--error)', icon: '❌' };
            default: return { bg: 'var(--accent-glow)', text: 'var(--accent-primary)', icon: '•' };
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'user': return '👤';
            case 'content': return '📄';
            case 'system': return '⚙️';
            case 'security': return '🔒';
            default: return '•';
        }
    };

    return (
        <main className="page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📋 Activity Log</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>View all platform activities and events</p>
                </div>
                <Link href="/admin">
                    <button className="btn btn-outline">
                        ← Back to Dashboard
                    </button>
                </Link>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
                style={{
                    padding: '20px',
                    marginBottom: '30px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                }}
            >
                <div>
                    <label className="form-label">Activity Type</label>
                    <select
                        className="form-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                    >
                        <option value="all">All Types</option>
                        <option value="user">User Activity</option>
                        <option value="content">Content Activity</option>
                        <option value="system">System Activity</option>
                        <option value="security">Security Events</option>
                    </select>
                </div>

                <div>
                    <label className="form-label">Severity Level</label>
                    <select
                        className="form-select"
                        value={filterSeverity}
                        onChange={(e) => setFilterSeverity(e.target.value as any)}
                    >
                        <option value="all">All Severities</option>
                        <option value="success">Success</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="btn btn-primary btn-block"
                    >
                        {loading ? '⏳ Refreshing...' : '🔄 Refresh Log'}
                    </button>
                </div>
            </motion.div>

            {/* Activity Timeline */}
            <div style={{ position: 'relative', paddingLeft: '40px' }}>
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ textAlign: 'center', padding: '40px' }}
                        >
                            <p>Loading activities...</p>
                        </motion.div>
                    ) : filteredActivities.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="card"
                            style={{ padding: '40px', textAlign: 'center' }}
                        >
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No activities found matching your filters.</p>
                        </motion.div>
                    ) : (
                        filteredActivities.map((activity, idx) => {
                            const colors = getSeverityColor(activity.severity);
                            return (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{
                                        marginBottom: '30px',
                                        paddingBottom: idx < filteredActivities.length - 1 ? '30px' : '0',
                                        borderLeft: idx < filteredActivities.length - 1 ? '2px solid var(--border-color)' : 'none',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Timeline dot */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: '-52px',
                                            top: '0',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: colors.bg,
                                            border: `2px solid ${colors.text}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            zIndex: 2,
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                    >
                                        {colors.icon}
                                    </div>

                                    {/* Activity Card */}
                                    <div
                                        className="card"
                                        style={{
                                            padding: '20px',
                                            borderLeft: `4px solid ${colors.text}`,
                                            transition: 'transform 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'start', flex: 1 }}>
                                                <span style={{ fontSize: '1.8rem', opacity: 0.8 }}>{getTypeIcon(activity.type)}</span>
                                                <div>
                                                    <h3 style={{ fontWeight: '700', margin: '0 0 4px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                                                        {activity.title}
                                                    </h3>
                                                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                                                        {activity.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                style={{
                                                    background: colors.bg,
                                                    color: colors.text,
                                                    padding: '6px 14px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {activity.severity}
                                            </span>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: '15px',
                                            paddingTop: '15px',
                                            borderTop: '1px solid var(--border-color)',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            <span>📅 {activity.created_at ? new Date(activity.created_at).toLocaleString(undefined, {
                                                dateStyle: 'medium',
                                                timeStyle: 'short'
                                            }) : 'Date unknown'}</span>
                                            {activity.actor && (
                                                <span style={{
                                                    background: 'var(--bg-tertiary)',
                                                    padding: '4px 10px',
                                                    borderRadius: 'var(--radius-full)',
                                                    color: 'var(--text-secondary)',
                                                    fontWeight: '500'
                                                }}>
                                                    👤 {activity.actor}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
