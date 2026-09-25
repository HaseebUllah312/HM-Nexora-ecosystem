'use client';
import { useState, useEffect } from 'react';

export default function RecentStudySummary({ refreshTrigger }: { refreshTrigger: number }) {
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch('/api/user/study-logs');
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayStr = yesterday.toISOString().split('T')[0];
                        
                        const yesterdayLogs = data.filter((log: any) => log.study_date === yesterdayStr);
                        if (yesterdayLogs.length > 0) {
                            setSummary({
                                date: yesterdayStr,
                                logs: yesterdayLogs,
                                totalDuration: yesterdayLogs.reduce((acc: number, log: any) => acc + log.duration, 0)
                            });
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchRecent();
    }, [refreshTrigger]);

    if (!summary) return null;

    return (
        <div className="card" style={{ padding: '24px', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid var(--primary-color)' }}>
            <h4 style={{ color: 'var(--primary-color)', marginBottom: '12px' }}>📅 Yesterday's Recap ({summary.date})</h4>
            <p style={{ marginBottom: '10px' }}>You studied for <strong>{summary.totalDuration} minutes</strong> across {summary.logs.length} subject(s).</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {summary.logs.map((log: any, i: number) => (
                    <span key={i} style={{ padding: '4px 10px', background: 'var(--bg-secondary)', borderRadius: '20px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                        {log.subject_code} ({log.duration}m)
                    </span>
                ))}
            </div>
            <p style={{ marginTop: '12px', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                "Great job! Keep the momentum going today."
            </p>
        </div>
    );
}
