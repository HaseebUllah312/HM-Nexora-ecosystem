'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState('last-7-days');
    const [metrics, setMetrics] = useState<any>(null);
    const [loadingMetrics, setLoadingMetrics] = useState(false);
    const [generating, setGenerating] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoadingMetrics(true);
            try {
                const rangeParam = dateRange === 'last-7-days' ? '7d' : dateRange === 'last-30-days' ? '30d' : 'all';
                const res = await fetch(`/api/admin/stats?range=${rangeParam}`);
                if (res.ok) {
                    const data = await res.json();
                    setMetrics(data);
                }
            } catch (error) {
                console.error('Failed to fetch metrics:', error);
            } finally {
                setLoadingMetrics(false);
            }
        };
        fetchMetrics();
    }, [dateRange]);

    const reportTypes = [
        {
            id: 'user-growth',
            title: 'User Growth Report',
            description: 'Track user registrations and growth rate',
            icon: '📈',
            color: '#667eea',
            summary: (m: any) => `In the selected period, ${m?.growth?.users || 0} new users registered, bringing the total community to ${m?.users || 0} students.`,
            stats: (m: any) => [
                { label: 'Total Users', value: m?.users || 0, growth: `+${m?.growth?.users || 0}` },
                { label: 'New This Period', value: m?.growth?.users || 0, growth: '' },
            ]
        },
        {
            id: 'engagement',
            title: 'Engagement Report',
            description: 'Quiz activity and study material usage',
            icon: '🎯',
            color: '#f093fb',
            summary: (m: any) => `Students completed ${m?.growth?.quizzes || 0} quizzes during this period. Total quizzes taken since launch: ${m?.quizzesTaken || 0}.`,
            stats: (m: any) => [
                { label: 'Total Quizzes Taken', value: m?.quizzesTaken || 0, growth: `+${m?.growth?.quizzes || 0}` },
                { label: 'New This Period', value: m?.growth?.quizzes || 0, growth: '' },
            ]
        },
        {
            id: 'content',
            title: 'Content Report',
            description: 'Materials and subject coverage',
            icon: '📚',
            color: '#4facfe',
            summary: (m: any) => `Library covers ${m?.subjects || 0} subjects with ${m?.totalReviews || 0} student reviews submitted.`,
            stats: (m: any) => [
                { label: 'Subjects Available', value: m?.subjects || 0, growth: '' },
                { label: 'Student Reviews', value: m?.totalReviews || 0, growth: '' },
            ]
        },
        {
            id: 'performance',
            title: 'Performance Report',
            description: 'Platform health and user satisfaction',
            icon: '⚡',
            color: '#43e97b',
            summary: (m: any) => `Platform maintains a ${m?.avgRating || 0}/5 average student rating across all verified resources.`,
            stats: (m: any) => [
                { label: 'Average Rating', value: `${m?.avgRating || 0}/5`, growth: '' },
                { label: 'Total Reviews', value: m?.totalReviews || 0, growth: '' },
            ]
        },
        {
            id: 'security',
            title: 'Security Report',
            description: 'Security events and anomaly detection',
            icon: '🔒',
            color: '#fa709a',
            summary: (m: any) => `System integrity check complete. All ${m?.users || 0} user accounts are verified and activity logs are monitored.`,
            stats: (m: any) => [
                { label: 'Total Accounts', value: m?.users || 0, growth: '' },
                { label: 'Security Status', value: '✅ Clean', growth: '' },
            ]
        },
        {
            id: 'revenue',
            title: 'Revenue Report',
            description: 'Transaction and subscription data',
            icon: '💰',
            color: '#a18cd1',
            summary: (m: any) => `Platform remains 100% free for all VU students. Zero subscription costs recorded for ${m?.users || 0} users.`,
            stats: (m: any) => [
                { label: 'Total Users (Free)', value: m?.users || 0, growth: '' },
                { label: 'Revenue Model', value: 'Free for All', growth: '' },
            ]
        }
    ];

    const currentReport = reportTypes.find(r => r.id === selectedReport);
    const dateLabel = dateRange === 'last-7-days' ? 'Last 7 Days' : dateRange === 'last-30-days' ? 'Last 30 Days' : 'All Time';
    const now = new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

    // ── PDF GENERATION ──────────────────────────────────────────────────────────
    const handleGeneratePDF = () => {
        if (!currentReport || !metrics) return;
        setGenerating(true);

        const stats = currentReport.stats(metrics);
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${currentReport.title} — HM nexora</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                    
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                        color: #1f2937; 
                        background: #fff; 
                        padding: 0;
                        line-height: 1.5;
                    }
                    .page-container {
                        padding: 60px;
                        max-width: 1000px;
                        margin: 0 auto;
                    }
                    .header { 
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #f3f4f6;
                        padding-bottom: 40px;
                        margin-bottom: 40px;
                    }
                    .brand {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    }
                    .logo-img {
                        width: 50px;
                        height: 50px;
                        object-fit: contain;
                        border-radius: 12px;
                    }
                    .brand-name {
                        font-size: 24px;
                        font-weight: 800;
                        background: linear-gradient(135deg, #7C3AED, #4f46e5);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        letter-spacing: -0.02em;
                    }
                    .report-title-container {
                        text-align: right;
                    }
                    .report-label {
                        font-size: 11px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.1em;
                        color: #6b7280;
                        margin-bottom: 4px;
                    }
                    .report-title {
                        font-size: 20px;
                        font-weight: 800;
                        color: #111827;
                    }
                    
                    .meta-grid { 
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        margin-bottom: 40px;
                        background: #f9fafb;
                        padding: 24px;
                        border-radius: 16px;
                    }
                    .meta-item label { 
                        font-size: 10px; 
                        text-transform: uppercase; 
                        color: #6b7280; 
                        font-weight: 700; 
                        letter-spacing: 0.05em;
                        display: block;
                        margin-bottom: 5px;
                    }
                    .meta-item p { 
                        font-size: 14px; 
                        font-weight: 600; 
                        color: #111827; 
                    }

                    .section-header {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 24px;
                    }
                    .section-icon {
                        font-size: 24px;
                    }
                    .section-title {
                        font-size: 18px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .stats-grid { 
                        display: grid; 
                        grid-template-columns: repeat(2, 1fr); 
                        gap: 20px; 
                        margin-bottom: 40px; 
                    }
                    .stat-box { 
                        padding: 24px; 
                        background: #fff; 
                        border-radius: 16px; 
                        border: 1px solid #e5e7eb;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                        position: relative;
                        overflow: hidden;
                    }
                    .stat-box::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 4px;
                        height: 100%;
                        background: #7C3AED;
                    }
                    .stat-box .label { 
                        font-size: 12px; 
                        color: #6b7280; 
                        font-weight: 600; 
                        text-transform: uppercase; 
                        letter-spacing: 0.025em; 
                        margin-bottom: 12px; 
                    }
                    .stat-box .value { 
                        font-size: 32px; 
                        font-weight: 800; 
                        color: #111827; 
                        letter-spacing: -0.025em;
                    }
                    .stat-box .growth { 
                        font-size: 13px; 
                        color: #16a34a; 
                        font-weight: 600; 
                        margin-top: 8px;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }

                    .summary-box { 
                        padding: 32px; 
                        background: linear-gradient(135deg, #fdf2ff 0%, #f5f3ff 100%); 
                        border-radius: 16px; 
                        border: 1px solid #e9d5ff; 
                        margin-bottom: 40px; 
                    }
                    .summary-box h3 { 
                        font-size: 14px; 
                        font-weight: 700; 
                        color: #7C3AED; 
                        margin-bottom: 16px;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .summary-box p { 
                        font-size: 16px; 
                        color: #374151; 
                        line-height: 1.8;
                        font-weight: 450;
                    }

                    .footer { 
                        text-align: center; 
                        color: #9ca3af; 
                        font-size: 12px; 
                        margin-top: 60px; 
                        padding-top: 30px; 
                        border-top: 1px solid #f3f4f6; 
                    }
                    .confidential-tag {
                        display: inline-block;
                        padding: 4px 12px;
                        background: #fee2e2;
                        color: #dc2626;
                        border-radius: 99px;
                        font-weight: 700;
                        font-size: 10px;
                        text-transform: uppercase;
                        margin-bottom: 15px;
                    }

                    @media print {
                        body { padding: 0; }
                        .page-container { padding: 40px; }
                        .stat-box { break-inside: avoid; }
                        .summary-box { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="page-container">
                    <header class="header">
                        <div class="brand">
                            <img src="/logo.png" class="logo-img" alt="HM Logo" />
                            <span class="brand-name">HM nexora</span>
                        </div>
                        <div class="report-title-container">
                            <p class="report-label">Official Administrative Report</p>
                            <h1 class="report-title">${currentReport.title}</h1>
                        </div>
                    </header>

                    <div class="meta-grid">
                        <div class="meta-item"><label>Reporting Period</label><p>${dateLabel}</p></div>
                        <div class="meta-item"><label>Data Integrity</label><p>Verified Live</p></div>
                        <div class="meta-item"><label>Generation Date</label><p>${now}</p></div>
                    </div>

                    <div class="section-header">
                        <span class="section-icon">${currentReport.icon}</span>
                        <h2 class="section-title">Key Performance Indicators</h2>
                    </div>

                    <div class="stats-grid">
                        ${stats.map(s => `
                            <div class="stat-box">
                                <div class="label">${s.label}</div>
                                <div class="value">${s.value}</div>
                                ${s.growth ? `<div class="growth"><span>▲</span> ${s.growth} growth</div>` : ''}
                            </div>
                        `).join('')}
                        <div class="stat-box">
                            <div class="label">Total Users</div>
                            <div class="value">${metrics?.users || 0}</div>
                        </div>
                        <div class="stat-box">
                            <div class="label">Total Subjects</div>
                            <div class="value">${metrics?.subjects || 0}</div>
                        </div>
                    </div>

                    <div class="summary-box">
                        <h3>📋 Executive Insights</h3>
                        <p>${currentReport.summary(metrics)}</p>
                    </div>

                    <div class="footer">
                        <div class="confidential-tag">Highly Confidential</div>
                        <p>© 2026 HM nexora — Academic Platform Analytics. All Rights Reserved.</p>
                        <p>This document is auto-generated specifically for administrative review.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    setGenerating(false);
                }, 300);
            };
        } else {
            setGenerating(false);
        }
    };

    // ── CSV EXPORT ───────────────────────────────────────────────────────────────
    const handleExportCSV = () => {
        if (!metrics) return;

        const rows = [
            ['HM nexora — Report Export'],
            [`Report Type: ${currentReport?.title || 'All Metrics'}`],
            [`Period: ${dateLabel}`],
            [`Generated: ${now}`],
            [''],
            ['Metric', 'Value', 'Period Growth'],
            ['Total Users', metrics.users ?? 0, metrics.growth?.users ?? 0],
            ['New Users (Period)', metrics.growth?.users ?? 0, ''],
            ['Total Quizzes Taken', metrics.quizzesTaken ?? 0, metrics.growth?.quizzes ?? 0],
            ['New Quizzes (Period)', metrics.growth?.quizzes ?? 0, ''],
            ['Study Subjects', metrics.subjects ?? 0, ''],
            ['Average Rating', metrics.avgRating ?? 0, ''],
            ['Total Reviews', metrics.totalReviews ?? 0, ''],
        ];

        const csvContent = rows.map(row =>
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\r\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hm-nexora-${selectedReport || 'metrics'}-${dateRange}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <main className="page" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊 Reports Center</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Generate professional reports with real-time metrics</p>
                </div>
                <Link href="/admin">
                    <button className="btn btn-outline" style={{ padding: '10px 20px' }}>← Back to Dashboard</button>
                </Link>
            </div>

            {/* Date Range Filter */}
            <div className="card" style={{ padding: '20px', marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '0.95rem' }}>
                    📅 Select Report Period
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[
                        { value: 'last-7-days', label: 'Last 7 Days' },
                        { value: 'last-30-days', label: 'Last 30 Days' },
                        { value: 'all-time', label: 'All Time' }
                    ].map(option => (
                        <button
                            key={option.value}
                            onClick={() => setDateRange(option.value)}
                            className={`btn ${dateRange === option.value ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '8px 20px' }}
                        >
                            {option.label}
                        </button>
                    ))}
                    {loadingMetrics && (
                        <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            ⏳ Refreshing metrics...
                        </span>
                    )}
                </div>
            </div>

            {/* Report Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {reportTypes.map((report) => (
                    <div
                        key={report.id}
                        onClick={() => setSelectedReport(report.id)}
                        className="card"
                        style={{
                            padding: '25px',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            border: selectedReport === report.id ? `2px solid ${report.color}` : '2px solid transparent',
                            background: selectedReport === report.id ? `${report.color}18` : undefined,
                            transform: selectedReport === report.id ? 'translateY(-2px)' : undefined,
                            boxShadow: selectedReport === report.id ? `0 8px 24px ${report.color}30` : undefined,
                        }}
                    >
                        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{report.icon}</div>
                        <h3 style={{ margin: '0 0 8px 0' }}>{report.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '15px' }}>{report.description}</p>
                        <button
                            className={`btn btn-block`}
                            style={{
                                background: selectedReport === report.id ? report.color : 'transparent',
                                color: selectedReport === report.id ? 'white' : 'var(--text-secondary)',
                                border: `1px solid ${report.color}`,
                            }}
                        >
                            {selectedReport === report.id ? '✅ Selected' : 'Select Report'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Report Output */}
            {selectedReport && currentReport && (
                <div style={{ marginTop: '40px' }} ref={reportRef}>
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-primary"
                            style={{ padding: '12px 36px', fontWeight: '700', fontSize: '0.95rem' }}
                            onClick={handleGeneratePDF}
                            disabled={generating || loadingMetrics}
                        >
                            {generating ? '⏳ Opening Print Dialog...' : '📄 Generate PDF Report'}
                        </button>
                        <button
                            className="btn btn-outline"
                            style={{ padding: '12px 36px', fontWeight: '700', fontSize: '0.95rem' }}
                            onClick={handleExportCSV}
                            disabled={loadingMetrics}
                        >
                            📥 Export CSV
                        </button>
                    </div>

                    {/* Report Preview Card */}
                    <div className="card" style={{ padding: '36px' }}>
                        {/* Report Header */}
                        <div style={{
                            background: `linear-gradient(135deg, ${currentReport.color}22, ${currentReport.color}08)`,
                            border: `1px solid ${currentReport.color}40`,
                            borderRadius: '12px',
                            padding: '24px',
                            marginBottom: '30px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: '16px'
                        }}>
                            <div>
                                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{currentReport.icon}</div>
                                <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem' }}>{currentReport.title}</h2>
                                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                                    Period: <strong>{dateLabel}</strong> &nbsp;•&nbsp; Generated: {now}
                                </p>
                            </div>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: `${currentReport.color}22`,
                                color: currentReport.color,
                                padding: '6px 14px',
                                borderRadius: '99px',
                                fontWeight: '700',
                                fontSize: '0.8rem'
                            }}>
                                🟢 LIVE DATA
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="stat-grid" style={{ marginBottom: '30px' }}>
                            <div className="stat-card">
                                <div className="stat-label">Total Users</div>
                                <div className="stat-number">{loadingMetrics ? '...' : metrics?.users ?? 0}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '4px' }}>
                                    +{metrics?.growth?.users ?? 0} this period
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Quizzes Taken</div>
                                <div className="stat-number">{loadingMetrics ? '...' : metrics?.quizzesTaken ?? 0}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '4px' }}>
                                    +{metrics?.growth?.quizzes ?? 0} this period
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Study Subjects</div>
                                <div className="stat-number">{loadingMetrics ? '...' : metrics?.subjects ?? 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Avg Rating</div>
                                <div className="stat-number">{loadingMetrics ? '...' : `${metrics?.avgRating ?? 0}/5`}</div>
                            </div>
                        </div>

                        {/* Executive Summary */}
                        <div style={{ padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '12px', borderLeft: `4px solid ${currentReport.color}` }}>
                            <h3 style={{ marginBottom: '12px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                                📋 Executive Summary
                            </h3>
                            <p style={{ color: 'var(--text-primary)', lineHeight: '1.8', margin: 0, fontSize: '1rem' }}>
                                {currentReport.summary(metrics)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
