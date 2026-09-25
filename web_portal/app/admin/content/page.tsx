'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContentItem {
    id: string;
    title: string;
    type: 'material' | 'announcement' | 'quiz';
    subject: string;
    uploadedBy: string;
    uploadDate: string;
    status: 'approved' | 'pending' | 'rejected';
    size?: string;
    link?: string;
    rawDriveId?: string;
}

export default function ContentManagementPage() {
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [apiCounts, setApiCounts] = useState({ pending: 0, approved: 0, total: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'material' | 'announcement' | 'quiz'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // New Audit State
    const [activeTab, setActiveTab] = useState<'all' | 'audit'>('all');
    const [auditSubjects, setAuditSubjects] = useState<any[]>([]);
    const [jsonMismatches, setJsonMismatches] = useState<{ missingInDb: string[], missingInJson: string[] }>({ missingInDb: [], missingInJson: [] });
    const [auditLoading, setAuditLoading] = useState(false);

    const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

    useEffect(() => {
        fetchAllContent();
    }, []);

    const fetchAllContent = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/all-content');
            if (res.ok) {
                const responseData = await res.json();
                const { data, counts } = responseData;

                // Data comes back with both pending and approved items
                const mappedData: ContentItem[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    type: (item.type || 'material') as any,
                    subject: item.code,
                    uploadedBy: item.submittedBy || 'Unknown User',
                    uploadDate: item.date,
                    status: item.status as any,
                    rawDriveId: item.rawDriveId,
                    link: item.link
                }));
                setContents(mappedData);
                setApiCounts(counts || { pending: 0, approved: 0, total: 0 });
                setError(null);
            } else {
                setError('Failed to load content');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAuditData = async () => {
        setAuditLoading(true);
        try {
            // 1. Fetch all subjects with counts from our updated API
            const res = await fetch('/api/subjects');
            const dbSubjects = await res.json();
            setAuditSubjects(dbSubjects);

            // 2. Fetch Sync Status (DB vs JSON)
            const syncRes = await fetch('/api/admin/audit/subjects-sync');
            if (syncRes.ok) {
                const syncData = await syncRes.json();
                setJsonMismatches({
                    missingInDb: syncData.missingInDb || [],
                    missingInJson: syncData.missingInJson || []
                });
            }
        } catch (err) {
            console.error('Audit fetch error:', err);
        } finally {
            setAuditLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'audit') {
            fetchAuditData();
        }
    }, [activeTab]);

    const filteredContents = contents.filter(item => {
        const matchType = filterType === 'all' || item.type === filterType;
        const matchStatus = filterStatus === 'all' || item.status === filterStatus;
        const matchSearch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchType && matchStatus && matchSearch;
    });

    const handleApproveContent = async (id: string) => {
        const itemToApprove = contents.find(c => c.id === id);
        if (!itemToApprove) return;

        try {
            const res = await fetch('/api/admin/pending', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: itemToApprove.id,
                    code: itemToApprove.subject,
                    title: itemToApprove.title,
                    type: itemToApprove.type,
                    link: (itemToApprove as any).link
                })
            });

            if (res.ok) {
                setContents(contents.filter(item => item.id !== id));
                alert('Upload approved successfully! The file is now live via the Supabase database.');
            } else {
                alert('Failed to approve upload');
            }
        } catch (e) {
            alert('Error approving upload');
        }
    };

    const handleRejectContent = async (id: string) => {
        try {
            const item = contents.find(c => c.id === id);
            if (!item) return;

            // Delete from appropriate table based on status
            const res = await fetch(item.status === 'pending' ? '/api/admin/pending' : '/api/admin/approved', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, title: item.title })
            });

            if (res.ok) {
                setContents(contents.filter(c => c.id !== id));
                alert('Content removed successfully');
            } else {
                alert('Failed to delete content');
            }
        } catch (e) {
            alert('Error deleting content');
        }
    };

    const handleDeleteContent = handleRejectContent; // Deleting a pending item is the same as rejecting it

    const pendingContents = filteredContents.filter(item => item.status === 'pending');
    const allPendingSelected = pendingContents.length > 0 && pendingContents.every(item => selectedIds.includes(item.id));

    const handleSelectAll = () => {
        if (allPendingSelected) {
            setSelectedIds(selectedIds.filter(id => !pendingContents.find(item => item.id === id)));
        } else {
            const newSelected = new Set([...selectedIds, ...pendingContents.map(item => item.id)]);
            setSelectedIds(Array.from(newSelected));
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleApproveSelected = async () => {
        let successCount = 0;
        for (const id of selectedIds) {
            const item = contents.find(c => c.id === id);
            if (item) {
                await fetch('/api/admin/pending', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: item.id,
                        code: item.subject,
                        title: item.title,
                        type: item.type,
                        link: (item as any).link
                    })
                });
                successCount++;
            }
        }

        setSelectedIds([]);
        fetchAllContent();
        alert(`Finished processing selected items. Proceeded with ${successCount} approvals.`);
    };

    const handleApproveAll = async () => {
        const pendingCount = contents.filter(c => c.status === 'pending').length;
        if (pendingCount === 0) {
            alert('No pending files to approve');
            return;
        }

        const confirmApprove = confirm(`Are you sure you want to approve all ${pendingCount} pending files? This action cannot be undone.`);
        if (!confirmApprove) return;

        try {
            const res = await fetch('/api/admin/pending/bulk-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve-all' })
            });

            const data = await res.json();
            if (res.ok) {
                fetchAllContent();
                alert(`✅ Successfully approved all ${data.processed} pending files!`);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (e) {
            alert('Error approving all files');
        }
    };

    const handleRejectAll = async () => {
        const pendingCount = contents.filter(c => c.status === 'pending').length;
        if (pendingCount === 0) {
            alert('No pending files to reject');
            return;
        }

        const confirmReject = confirm(`Are you sure you want to reject all ${pendingCount} pending files? This action cannot be undone.`);
        if (!confirmReject) return;

        try {
            const res = await fetch('/api/admin/pending/bulk-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject-all' })
            });

            const data = await res.json();
            if (res.ok) {
                fetchAllContent();
                alert(`❌ Successfully rejected all ${data.processed} pending files!`);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (e) {
            alert('Error rejecting all files');
        }
    };

    return (
        <main className="page" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📚 Content Management</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage subjects, materials, and user uploads</p>
                </div>
                <Link href="/admin">
                    <button style={{
                        background: 'transparent',
                        border: '1px solid var(--accent-primary)',
                        color: 'var(--accent-primary)',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}>
                        ← Back to Dashboard
                    </button>
                </Link>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '1px' }}>
                <button 
                    onClick={() => setActiveTab('all')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'all' ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid ' + (activeTab === 'all' ? 'var(--border-color)' : 'transparent'),
                        borderBottomColor: activeTab === 'all' ? 'var(--bg-secondary)' : 'var(--border-color)',
                        borderRadius: '12px 12px 0 0',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'all' ? 'bold' : 'normal',
                        color: activeTab === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        marginBottom: '-1px',
                        transition: '0.2s'
                    }}
                >
                    📑 All Content
                </button>
                <button 
                    onClick={() => setActiveTab('audit')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'audit' ? 'var(--bg-secondary)' : 'transparent',
                        border: '1px solid ' + (activeTab === 'audit' ? 'var(--border-color)' : 'transparent'),
                        borderBottomColor: activeTab === 'audit' ? 'var(--bg-secondary)' : 'var(--border-color)',
                        borderRadius: '12px 12px 0 0',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'audit' ? 'bold' : 'normal',
                        color: activeTab === 'audit' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        marginBottom: '-1px',
                        transition: '0.2s'
                    }}
                >
                    🔍 Materials Audit
                </button>
            </div>

            {activeTab === 'all' ? (
                <>

            {/* Quick Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {(() => {
                    const uniqueSubjects = new Set(contents.map(c => c.subject)).size;

                    return [
                        { label: 'Total Materials', value: formatNumber(apiCounts.approved), icon: '📄' },
                        { label: 'Pending Review', value: formatNumber(apiCounts.pending), icon: '⏳' },
                        { label: 'Total Subjects', value: formatNumber(uniqueSubjects), icon: '📚' },
                        { label: 'All Content', value: formatNumber(apiCounts.total), icon: '⭐' }
                    ];
                })().map((stat, idx) => (
                    <div key={idx} style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <p style={{ fontSize: '1.5rem', margin: 0 }}>{stat.icon}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '8px 0 4px 0' }}>
                            {stat.label}
                        </p>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                border: '1px solid var(--border-color)'
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                        Search
                    </label>
                    <input
                        type="text"
                        placeholder="Search content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                        Type
                    </label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="all">All Types</option>
                        <option value="material">Materials</option>
                        <option value="announcement">Announcements</option>
                        <option value="quiz">Quizzes</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem' }}>
                        Status
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div style={{ marginBottom: '15px', padding: '10px 20px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <span style={{ fontWeight: '600', color: '#22c55e', fontSize: '1.05rem' }}>{selectedIds.length} pending items selected</span>
                    <button
                        onClick={handleApproveSelected}
                        style={{
                            background: '#22c55e',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)'
                        }}
                    >
                        Approve Selected ✅
                    </button>
                </div>
            )}

            {/* Approve All / Reject All Buttons */}
            {contents.filter(c => c.status === 'pending').length > 0 && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px 20px',
                    background: 'rgba(249, 115, 22, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <p style={{ fontWeight: '600', color: '#f97316', margin: '0 0 5px 0', fontSize: '1rem' }}>
                            🚀 Quick Actions for Pending Files
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                            {contents.filter(c => c.status === 'pending').length} files awaiting approval
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleApproveAll}
                            style={{
                                background: '#22c55e',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)'
                            }}
                        >
                            ✅ Approve All
                        </button>
                        <button
                            onClick={handleRejectAll}
                            style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem'
                            }}
                        >
                            ❌ Reject All
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div style={{ marginBottom: '15px', padding: '10px 20px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <span style={{ fontWeight: '600', color: '#22c55e', fontSize: '1.05rem' }}>{selectedIds.length} pending items selected</span>
                    <button
                        onClick={handleApproveSelected}
                        style={{
                            background: '#22c55e',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)'
                        }}
                    >
                        Approve Selected ✅
                    </button>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px 20px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444'
                }}>
                    ❌ {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px 20px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6'
                }}>
                    ⏳ Loading content...
                </div>
            )}

            {/* Content Table */}
            <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.95rem'
                }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                            <th style={{ padding: '15px', textAlign: 'center', width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={allPendingSelected}
                                    onChange={handleSelectAll}
                                    disabled={pendingContents.length === 0}
                                    style={{ cursor: pendingContents.length > 0 ? 'pointer' : 'default', width: '16px', height: '16px' }}
                                    title="Select all viewable pending items"
                                />
                            </th>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Title</th>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Type</th>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Subject</th>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Uploaded By</th>
                            <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContents.map((content) => (
                            <tr key={content.id} style={{ borderBottom: '1px solid var(--border-color)', background: selectedIds.includes(content.id) ? 'var(--success-bg)' : 'transparent' }}>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    {content.status === 'pending' && (
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(content.id)}
                                            onChange={() => handleSelectOne(content.id)}
                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                        />
                                    )}
                                </td>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{content.title}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        background: content.type === 'material' ? 'rgba(34, 197, 94, 0.1)' :
                                            content.type === 'announcement' ? 'rgba(59, 130, 246, 0.1)' :
                                                'rgba(249, 115, 22, 0.1)',
                                        color: content.type === 'material' ? '#22c55e' :
                                            content.type === 'announcement' ? 'var(--accent-primary)' :
                                                '#f97316',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem'
                                    }}>
                                        {content.type === 'material' ? '📄' : content.type === 'announcement' ? '📢' : '✅'} {content.type}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>{content.subject}</td>
                                <td style={{ padding: '15px', color: 'var(--text-secondary)' }}>{content.uploadedBy}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        background: content.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                                            content.status === 'pending' ? 'rgba(249, 115, 22, 0.1)' :
                                                'rgba(239, 68, 68, 0.1)',
                                        color: content.status === 'approved' ? '#22c55e' :
                                            content.status === 'pending' ? '#f97316' :
                                                '#ef4444',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem'
                                    }}>
                                        {content.status === 'approved' ? '✅' : content.status === 'pending' ? '⏳' : '❌'} {content.status}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    {content.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                            <a
                                                href={content.link?.startsWith('http') ? content.link : content.link?.includes('/api/download/') ? content.link : `/api/download/${content.link}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    background: 'var(--accent-glow)',
                                                    border: '1px solid var(--accent-primary)',
                                                    color: 'var(--accent-primary)',
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    textDecoration: 'none',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                className="btn-hover-smooth"
                                            >
                                                👁️ View
                                            </a>
                                            <button
                                                onClick={() => handleApproveContent(content.id)}
                                                style={{
                                                    background: 'rgba(34, 197, 94, 0.2)',
                                                    border: '1px solid #22c55e',
                                                    color: '#22c55e',
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectContent(content.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    border: '1px solid #ef4444',
                                                    color: '#ef4444',
                                                    padding: '8px 14px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {content.status === 'approved' && (
                                        <a
                                            href={content.link?.startsWith('http') ? content.link : content.link?.includes('/api/download/') ? content.link : `/api/download/${content.link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                background: 'var(--accent-glow)',
                                                border: '1px solid var(--accent-primary)',
                                                color: 'var(--accent-primary)',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            👁️ View
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDeleteContent(content.id)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            fontSize: '0.85rem',
                                            marginLeft: content.status === 'pending' ? '5px' : '0'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredContents.length === 0 && (
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center',
                    marginTop: '20px'
                }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>No content found</p>
                </div>
            )}
            </>
            ) : (
                <div className="audit-section">
                    <div className="glass-card" style={{ padding: '25px', marginBottom: '30px', border: '1px solid rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.05)' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#f59e0b' }}>⚠️ Content Gap Identification</h3>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                            The following subjects are missing one or more critical study resources (Midterm, Final, Handouts, or Quizzes).
                            Filling these gaps will ensure 100% coverage for <strong>HM Nexora</strong> students.
                        </p>
                    </div>

                    {(jsonMismatches.missingInDb.length > 0 || jsonMismatches.missingInJson.length > 0) && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div className="card" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                                <h4 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>📂 Missing in Database</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Subjects in <code>subjects.json</code> but not in Supabase:</p>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {jsonMismatches.missingInDb.length > 0 ? jsonMismatches.missingInDb.map(c => (
                                        <span key={c} className="badge" style={{ background: '#ef4444', color: 'white' }}>{c}</span>
                                    )) : <span style={{ color: 'var(--success)' }}>None 🎉</span>}
                                </div>
                            </div>
                            <div className="card" style={{ borderColor: '#3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}>
                                <h4 style={{ color: '#3b82f6', margin: '0 0 10px 0' }}>📝 Missing in subjects.json</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Subjects in Supabase but not in <code>subjects.json</code>:</p>
                                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {jsonMismatches.missingInJson.length > 0 ? jsonMismatches.missingInJson.map(c => (
                                        <span key={c} className="badge" style={{ background: '#3b82f6', color: 'white' }}>{c}</span>
                                    )) : <span style={{ color: 'var(--success)' }}>None 🎉</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>Subject</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Midterm</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Final</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Handout</th>
                                    <th style={{ padding: '15px', textAlign: 'center' }}>Quiz</th>
                                    <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLoading ? (
                                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>⏳ Analyzing database content...</td></tr>
                                ) : auditSubjects.filter(s => s.midtermCount === 0 || s.finalCount === 0 || s.handoutsCount === 0 || s.quizzesCount === 0).length === 0 ? (
                                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>✅ Amazing! All subjects have complete materials.</td></tr>
                                ) : (
                                    auditSubjects.filter(s => s.midtermCount === 0 || s.finalCount === 0 || s.handoutsCount === 0 || s.quizzesCount === 0).map(s => (
                                        <tr key={s.code} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{ fontWeight: 'bold' }}>{s.code}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.name}</div>
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                {s.midtermCount > 0 ? '✅' : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>MISSING</span>}
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                {s.finalCount > 0 ? '✅' : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>MISSING</span>}
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                {s.handoutsCount > 0 ? '✅' : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>MISSING</span>}
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center' }}>
                                                {s.quizzesCount > 0 ? '✅' : <span style={{ color: '#ef4444', fontWeight: 'bold' }}>MISSING</span>}
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'right' }}>
                                                <Link href="/upload" className="btn btn-sm btn-primary">Upload Missing</Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
}
