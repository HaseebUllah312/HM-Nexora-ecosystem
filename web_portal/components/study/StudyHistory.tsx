'use client';
import { useState, useEffect } from 'react';

export default function StudyHistory({ refreshTrigger }: { refreshTrigger: number }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/user/study-logs');
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [refreshTrigger]);

    const deleteLog = async (id: string) => {
        if (!confirm('Delete this study record?')) return;
        try {
            const res = await fetch(`/api/user/study-logs?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchLogs();
        } catch (err) {
            console.error('Error deleting log:', err);
        }
    };

    if (loading) return <div>Loading history...</div>;

    return (
        <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Study History</h3>
            {logs.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No entries yet. Start logging your progress!</p>
            ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {logs.map(log => (
                        <div key={log.id} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                            <button 
                                onClick={() => deleteLog(log.id)}
                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '5px' }}
                            >
                                ✕
                            </button>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingRight: '20px' }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '1.1rem' }}>{log.subject_code}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.study_date}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                                ⏱️ Duration: <span style={{ fontWeight: '500' }}>{log.duration} minutes</span>
                            </div>
                            {log.topics && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '8px', background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '6px' }}>
                                    <strong>Topics:</strong> {log.topics}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
