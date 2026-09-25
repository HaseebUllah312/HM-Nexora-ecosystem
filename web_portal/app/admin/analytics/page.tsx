'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
    dailyRegistrations: { date: string; count: number }[];
    featureUsage: { feature: string; count: number }[];
    platformMetrics: {
        avgSessionDuration: string;
        serverUptime: string;
        apiResponseTime: string;
        errorRate: string;
    };
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        dailyRegistrations: [],
        featureUsage: [],
        platformMetrics: {
            avgSessionDuration: '22 min',
            serverUptime: '99.9%',
            apiResponseTime: '145ms',
            errorRate: '0.02%'
        }
    });
    const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
    const [dateRange, setDateRange] = useState('7d');

    useEffect(() => {
        // Placeholder for real analytics when tracking is enabled
        setAnalytics(prev => ({
            ...prev,
            dailyRegistrations: [
                { date: 'Today', count: 0 }
            ]
        }));
    }, [dateRange]);

    const handleExport = async () => {
        try {
            const response = await fetch('/api/admin/analytics/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ format: exportFormat, dateRange })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics.${exportFormat}`;
                a.click();
            }
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    const maxCount = Math.max(...analytics.dailyRegistrations.map(d => d.count));
    const maxFeatureCount = Math.max(...analytics.featureUsage.map(f => f.count));

    return (
        <main className="page" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊 Analytics & Reporting</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Track platform performance and user engagement</p>
                </div>
                <Link href="/admin">
                    <button style={{
                        background: 'transparent',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}>
                        ← Back to Dashboard
                    </button>
                </Link>
            </div>

            {/* Date Range & Export */}
            <div style={{
                background: 'rgba(102, 126, 234, 0.08)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['7d', '30d', '90d'].map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: dateRange === range ? '2px solid var(--primary)' : '1px solid rgba(102, 126, 234, 0.3)',
                                background: dateRange === range ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '6px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="csv">CSV</option>
                        <option value="pdf">PDF</option>
                    </select>
                    <button
                        onClick={handleExport}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        📥 Export Report
                    </button>
                </div>
            </div>

            {/* Platform Metrics */}
            <section style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>⚡ Platform Performance</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px'
                }}>
                    {[
                        { label: 'Avg Session Duration', value: analytics.platformMetrics.avgSessionDuration, icon: '⏱️', color: 'rgba(102, 126, 234, 0.1)' },
                        { label: 'Server Uptime', value: analytics.platformMetrics.serverUptime, icon: '✅', color: 'rgba(34, 197, 94, 0.1)' },
                        { label: 'API Response Time', value: analytics.platformMetrics.apiResponseTime, icon: '⚡', color: 'rgba(59, 130, 246, 0.1)' },
                        { label: 'Error Rate', value: analytics.platformMetrics.errorRate, icon: '❌', color: 'rgba(239, 68, 68, 0.1)' }
                    ].map((metric, idx) => (
                        <div key={idx} style={{
                            background: metric.color,
                            borderRadius: '12px',
                            border: `1px solid ${metric.color.replace('0.1)', '0.2)')}`,
                            padding: '25px'
                        }}>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontSize: '0.9rem' }}>
                                {metric.icon} {metric.label}
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                                {metric.value}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* User Registration Trend */}
            <section style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>📈 User Registration Trend</h2>
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    padding: '30px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-around',
                        height: '300px',
                        gap: '10px'
                    }}>
                        {analytics.dailyRegistrations.map((day, idx) => (
                            <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{
                                    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                                    width: '100%',
                                    height: `${(day.count / maxCount) * 250}px`,
                                    borderRadius: '8px 8px 0 0',
                                    margin: '0 auto',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center',
                                    paddingBottom: '8px'
                                }}>
                                    <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        {day.count}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.8rem', marginTop: '10px', color: 'var(--text-secondary)' }}>
                                    {day.date.split(' ')[0]}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Usage Analytics */}
            <section style={{ marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>🎯 Feature Usage Analytics</h2>
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '20px' }}>
                        {analytics.featureUsage.map((feature, idx) => (
                            <div key={idx} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <p style={{ fontWeight: '500' }}>{feature.feature}</p>
                                    <p style={{ color: 'var(--text-secondary)' }}>{feature.count?.toLocaleString() || '0'} uses</p>
                                </div>
                                <div style={{
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    height: '8px',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                        height: '100%',
                                        width: `${(feature.count / maxFeatureCount) * 100}%`,
                                        borderRadius: '4px'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Data Export Cards */}
            <section>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>📄 Generate Custom Reports</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px'
                }}>
                    {[
                        { title: 'User Report', desc: 'Detailed user statistics and insights', icon: '👥' },
                        { title: 'Activity Report', desc: 'Feature usage and engagement metrics', icon: '📊' },
                        { title: 'Performance Report', desc: 'Server and API performance data', icon: '⚙️' },
                        { title: 'Content Report', desc: 'Upload and material statistics', icon: '📚' }
                    ].map((report, idx) => (
                        <div
                            key={idx}
                            style={{
                                background: 'rgba(102, 126, 234, 0.08)',
                                borderRadius: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                padding: '25px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e: any) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e: any) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{report.icon}</div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{report.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>
                                {report.desc}
                            </p>
                            <button style={{
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                width: '100%'
                            }}>
                                Generate →
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
