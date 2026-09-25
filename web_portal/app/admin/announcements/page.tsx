'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';
import AnnouncementCard from '@/components/admin/AnnouncementCard';

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

const categories = [
    { value: 'datesheet', label: '📅 Date Sheet' },
    { value: 'result', label: '📊 Results' },
    { value: 'admission', label: '🎓 Admissions' },
    { value: 'scholarship', label: '💰 Scholarships' },
    { value: 'notice', label: '📢 Notices' },
    { value: 'general', label: '📌 General' },
    { value: 'assignment', label: '📝 Assignment' },
    { value: 'quiz', label: '❓ Quiz' },
    { value: 'gdb', label: '💬 GDB' },
];

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'general',
        important: false,
        deadline: '',
        imageUrl: '',
        sendEmail: false,
        targetSubject: 'All',
        userIds: [] as string[],
    });
    const [allSubjects, setAllSubjects] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteError, setDeleteError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
    };

    const filteredAnnouncements = announcements.filter(ann => {
        const matchesSearch = (ann.title + ann.description).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || ann.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.user && (data.user.role === 'admin' || data.user.role === 'owner')) {
                    setCurrentUser(data.user);
                    setIsAuthorized(true);
                    fetchAnnouncements();
                } else {
                    setIsAuthorized(false);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Auth check error:', err);
                setIsAuthorized(false);
                setLoading(false);
            }
        };
        const fetchSubjectsList = async () => {
            try {
                const res = await fetch('/api/subjects');
                if (res.ok) {
                    const data = await res.json();
                    const codes = Array.isArray(data) ? data : (data.subjects || []);
                    setAllSubjects(codes.sort());
                }
            } catch (err) {
                console.error('Error fetching subjects list:', err);
            }
        };

        const fetchUsersList = async () => {
            try {
                const res = await fetch('/api/admin/users');
                if (res.ok) {
                    const data = await res.json();
                    setAllUsers(data || []);
                }
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };

        checkAuthAndFetch();
        fetchSubjectsList();
        fetchUsersList();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch('/api/system/announcements');
            if (response.ok) {
                const data = await response.json();
                setAnnouncements(data);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: finalValue }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file (PNG, JPG, etc.)');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('Image size must be less than 2MB');
            return;
        }

        setUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const res = await fetch('/api/system/announcements/upload', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Upload failed');
            }

            const { imageUrl } = await res.json();
            setFormData(prev => ({ ...prev, imageUrl }));
            setSubmitResult({ type: 'success', message: '📸 Image uploaded successfully!' });
            
        } catch (error: any) {
            console.error('Image upload error:', error);
            setSubmitResult({ type: 'error', message: `Upload failed: ${error.message || 'Unknown error'}` });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitResult(null);
        try {
            const response = await fetch('/api/system/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            let data: any = {};
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                throw new Error(`Server returned HTML error (${response.status})`);
            }

            if (response.ok) {
                showToast('success', data.message || 'Announcement created successfully!');
                setFormData({
                    title: '',
                    description: '',
                    category: 'general',
                    important: false,
                    deadline: '',
                    imageUrl: '',
                    sendEmail: false,
                    targetSubject: 'All',
                    userIds: [],
                });
                fetchAnnouncements();
            } else {
                showToast('error', data.error || 'Failed to create announcement');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            showToast('error', error?.message || 'Connection error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string | number, title: string = 'this announcement') => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Announcement',
            message: `Are you sure you want to permanently delete "${title}"? This action cannot be undone and it will be removed from all student dashboards instantly.`,
            onConfirm: async () => {
                setDeleteError('');
                try {
                    const response = await fetch(`/api/system/announcements?id=${id}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
                        showToast('success', '🗑️ Announcement removed successfully');
                    } else {
                        const data = await response.json();
                        showToast('error', data.error || 'Failed to delete announcement.');
                    }
                } catch (error) {
                    console.error('Error deleting:', error);
                    showToast('error', 'Connection error while deleting.');
                } finally {
                    setConfirmModal(null);
                }
            }
        });
    };

    return (
        <main className="page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📢 Announcements</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage platform announcements</p>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
                {/* Create Form */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    position: 'relative'
                }}>
                    {!isAuthorized && isAuthorized !== null && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            color: 'white',
                            textAlign: 'center',
                            padding: '20px'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Unauthorized</h3>
                            <p>You do not have permission to manage announcements. Only Admins and Owners can access this section.</p>
                            <Link href="/dashboard" style={{ marginTop: '20px', color: 'var(--primary)', fontWeight: 'bold' }}>Back to Dashboard</Link>
                        </div>
                    )}

                    <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Create Announcement</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', opacity: isAuthorized ? 1 : 0.4 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(102, 126, 234, 0.3)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(102, 126, 234, 0.3)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(102, 126, 234, 0.3)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                {categories.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Deadline (Optional)</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(102, 126, 234, 0.3)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Image (Upload or Link)</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ 
                                    border: '1px dashed rgba(102, 126, 234, 0.4)', 
                                    padding: '15px', 
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    background: 'rgba(102, 126, 234, 0.02)'
                                }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                        id="image-upload"
                                    />
                                    <label htmlFor="image-upload" style={{ cursor: uploading ? 'not-allowed' : 'pointer', color: 'var(--primary)' }}>
                                        {uploading ? '⏳ Uploading...' : '📁 Click to Upload from Storage'}
                                    </label>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>- OR -</span>
                                </div>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleInputChange}
                                    placeholder="Paste Image URL here"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                        background: 'var(--bg-primary)',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>
                            {formData.imageUrl && formData.imageUrl.trim() !== '' && (
                                <div style={{ marginTop: '10px' }}>
                                    <p style={{ fontSize: '0.75rem', marginBottom: '5px' }}>Preview:</p>
                                    <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                                        <img 
                                            src={formData.imageUrl} 
                                            alt="Preview" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const parent = e.currentTarget.parentElement;
                                                if (parent) {
                                                    const errorMsg = document.createElement('div');
                                                    errorMsg.innerText = '❌ Invalid Image URL';
                                                    errorMsg.style.cssText = 'height: 100%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #ef4444; background: rgba(239, 68, 68, 0.05);';
                                                    parent.appendChild(errorMsg);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                name="important"
                                id="important"
                                checked={formData.important}
                                onChange={handleInputChange}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <label htmlFor="important" style={{ fontWeight: '500', cursor: 'pointer' }}>
                                Mark as Important ⚠️
                            </label>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            background: currentUser?.role === 'owner' ? 'rgba(102, 126, 234, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                            padding: '12px',
                            borderRadius: '8px',
                            border: currentUser?.role === 'owner' ? '1px dashed rgba(102, 126, 234, 0.2)' : '1px solid rgba(0, 0, 0, 0.05)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: currentUser?.role === 'owner' ? 1 : 0.6 }}>
                                <input
                                    type="checkbox"
                                    name="sendEmail"
                                    id="sendEmail"
                                    checked={formData.sendEmail}
                                    onChange={handleInputChange}
                                    disabled={currentUser?.role !== 'owner'}
                                    style={{ width: '18px', height: '18px', cursor: currentUser?.role === 'owner' ? 'pointer' : 'not-allowed' }}
                                />
                                <label htmlFor="sendEmail" style={{ fontWeight: '600', cursor: currentUser?.role === 'owner' ? 'pointer' : 'not-allowed', fontSize: '0.95rem' }}>
                                    📧 Send Email to All Users
                                </label>
                            </div>

                            {currentUser?.role === 'owner' && formData.sendEmail && (
                                <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600' }}>🎯 Target Subject (Optional)</label>
                                    <select
                                        name="targetSubject"
                                        value={formData.targetSubject}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '6px',
                                            background: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            border: '1px solid rgba(102, 126, 234, 0.2)',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <option value="All">All Users (Global Blast)</option>
                                        {allSubjects.map(code => (
                                            <option key={code} value={code}>{code}</option>
                                        ))}
                                    </select>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                        Setting a subject will only email students who picked that subject for their semester.
                                    </p>

                                    <div style={{ marginTop: '15px', borderTop: '1px solid rgba(102, 126, 234, 0.1)', paddingTop: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>👤 Select Specific Users (Optional)</label>
                                        <div style={{ 
                                            maxHeight: '120px', 
                                            overflowY: 'auto', 
                                            background: 'var(--bg-primary)', 
                                            borderRadius: '6px',
                                            padding: '8px',
                                            border: '1px solid rgba(102, 126, 234, 0.2)'
                                        }}>
                                            {(!allUsers || !Array.isArray(allUsers) || allUsers.length === 0) ? (
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No users found.</p>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                    {allUsers.map(user => {
                                                        if (!user || !user.id) return null;
                                                        return (
                                                            <label key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={Array.isArray(formData.userIds) && formData.userIds.includes(user.id)}
                                                                    onChange={(e) => {
                                                                        const checked = e.target.checked;
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            userIds: checked 
                                                                                ? [...(prev.userIds || []), user.id]
                                                                                : (prev.userIds || []).filter(id => id !== user.id)
                                                                        }));
                                                                    }}
                                                                />
                                                                <span style={{ color: 'var(--text-primary)' }}>{user.username || user.email || 'Unknown User'}</span>
                                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>({user.email || 'No email'})</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                            Selecting specific users will limit the notification to them only.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {currentUser?.role !== 'owner' ? (
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 0 28px', fontStyle: 'italic' }}>
                                    🔒 <strong>Web-Only Mode:</strong> Only the Main Owner can send email blasts.
                                </p>
                            ) : (
                                <p style={{ fontSize: '0.75rem', color: 'var(--primary)', margin: '0 0 0 28px' }}>
                                    ✨ <strong>Owner Choice:</strong> You can publish to web, or both web + email.
                                </p>
                            )}
                        </div>

                        {submitResult && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginTop: '10px',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                background: submitResult.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${submitResult.type === 'success' ? '#22c55e' : '#ef4444'}`,
                                color: submitResult.type === 'success' ? '#16a34a' : '#dc2626',
                            }}>
                                {submitResult.message}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                background: 'var(--primary)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: '600',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                marginTop: '10px',
                                opacity: submitting ? 0.7 : 1,
                                width: '100%'
                            }}
                        >
                            {submitting ? '⏳ Creating...' : '📢 Create Announcement'}
                        </button>
                    </form>
                </div>

                {/* List Announcements */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Existing Announcements</h2>
                        
                        <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>
                            <input 
                                type="text" 
                                placeholder="🔍 Search announcements..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    width: '100%',
                                    maxWidth: '250px'
                                }}
                            />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(c => (
                                    <option key={c.value} value={c.value}>{c.label.split(' ')[1] || c.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {toast && (
                        <div style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            zIndex: 1000,
                            padding: '12px 24px',
                            borderRadius: '12px',
                            background: toast.type === 'success' ? '#10b981' : '#ef4444',
                            color: 'white',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                             {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                        </div>
                    )}

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ padding: '20px', border: '1px solid rgba(102, 126, 234, 0.1)', borderRadius: '16px' }}>
                                    <Skeleton width="60%" height="24px" style={{ marginBottom: '15px' }} />
                                    <Skeleton width="100%" height="60px" style={{ marginBottom: '15px' }} />
                                    <Skeleton width="40%" height="20px" />
                                </div>
                            ))}
                        </div>
                    ) : filteredAnnouncements.length === 0 ? (
                        <EmptyState 
                            title={searchQuery ? "No results found" : "No announcements yet"}
                            description={searchQuery ? `We couldn't find anything matching "${searchQuery}"` : "Share regular updates, results, and deadlines with your students here."}
                            icon={searchQuery ? "🔍" : "📢"}
                            actionLabel={searchQuery ? "Clear Search" : undefined}
                            actionLink={searchQuery ? "#" : undefined}
                        />
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            {filteredAnnouncements.map((a) => (
                                <AnnouncementCard 
                                    key={a.id}
                                    announcement={a}
                                    onDelete={() => handleDelete(a.id, a.title)}
                                    categoryLabel={categories.find(c => c.value === a.category)?.label || a.category || 'General'}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {confirmModal && (
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal(null)}
                    type="danger"
                />
            )}

            <style jsx global>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </main>
    );
}
