'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import UserProfileModal from '@/components/admin/UserProfileModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    provider: string;
    created_at: string;
    is_email_verified: boolean;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [providerFilter, setProviderFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [selectedUserForModal, setSelectedUserForModal] = useState<User | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (type: 'success' | 'error' | 'info', message: string) => {
        setToast({ type, message });
    };

    useEffect(() => {
        fetchUsers();
        getCurrentUserRole();
    }, []);

    const getCurrentUserRole = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                // Get current user from session (admin endpoint returns current user info in header or we check auth)
                // For now, we'll check if any user has role 'owner' to indicate user is owner
                const currentUserData = await fetch('/api/auth/me').then(r => r.json()).catch(() => null);
                if (currentUserData?.user?.role) {
                    setCurrentUserRole(currentUserData.user.role);
                }
            }
        } catch (error) {
            console.error('Error getting current user role:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((user: User) => {
        const username = user.username || '';
        const email = user.email || '';
        const matchSearch = email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = selectedRole === 'all' || user.role === selectedRole;
        const matchProvider = providerFilter === 'all' || user.provider === providerFilter;
        return matchSearch && matchRole && matchProvider;
    });

    const handleSelectUser = (userId: string) => {
        setSelectedUsers((prev: string[]) =>
            prev.includes(userId) ? prev.filter((id: string) => id !== userId) : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map((u: User) => u.id));
        }
    };

    const handleBulkAction = async (action: string) => {
        if (!selectedUsers.length) return;

        if (action === 'promote-admin' && currentUserRole !== 'owner') {
            showToast('error', '⛔ Only the owner can promote users to admin');
            return;
        }

        const actionTitle = action === 'promote-admin' ? 'Bulk Promotion' : 'Bulk Suspension';
        const actionMsg = action === 'promote-admin' 
            ? `Are you sure you want to promote ${selectedUsers.length} users to Admin?`
            : `Are you sure you want to suspend access for ${selectedUsers.length} users?`;

        setConfirmModal({
            isOpen: true,
            title: actionTitle,
            message: actionMsg,
            onConfirm: async () => {
                try {
                    const response = await fetch('/api/admin/users/bulk-action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userIds: selectedUsers, action })
                    });

                    if (response.ok) {
                        fetchUsers();
                        setSelectedUsers([]);
                        showToast('success', `${action} completed for ${selectedUsers.length} users`);
                    } else {
                        const error = await response.json();
                        showToast('error', `Error: ${error.error || 'Operation failed'}`);
                    }
                } catch (error) {
                    console.error('Error performing bulk action:', error);
                    showToast('error', 'Error performing bulk action');
                } finally {
                    setConfirmModal(null);
                }
            }
        });
    };

    const handlePromoteToAdmin = async (userId: string) => {
        if (currentUserRole !== 'owner') {
            showToast('error', '⛔ Only the owner can promote users to admin');
            return;
        }

        const user = users.find(u => u.id === userId);
        if (!user) return;

        setConfirmModal({
            isOpen: true,
            title: 'Promote to Administrator',
            message: `Are you sure you want to elevate ${user.username} to Admin? This gives them full access to all administrative controls except deleting the owner.`,
            onConfirm: async () => {
                try {
                    const response = await fetch('/api/admin/users', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, newRole: 'admin' })
                    });

                    if (response.ok) {
                        fetchUsers();
                        showToast('success', `✅ ${user.username} has been promoted to Admin!`);
                    } else {
                        const error = await response.json();
                        showToast('error', `Error: ${error.error || 'Promotion failed'}`);
                    }
                } catch (error) {
                    console.error('Error promoting to admin:', error);
                    showToast('error', 'Error promoting user to admin');
                } finally {
                    setConfirmModal(null);
                }
            }
        });
    };


    return (
        <main className="page page-fade-in" style={{ maxWidth: '1450px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👥 User Nexus</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage platform access, permissions, and security</p>
                </div>
                <Link href="/admin">
                    <button className="glass" style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                    }}>
                        ← Return to Control Center
                    </button>
                </Link>
            </div>

            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 2000,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#6366f1',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'} {toast.message}
                </div>
            )}

            {/* Search and Filter */}
            <div className="glass-card" style={{
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '30px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                alignItems: 'end'
            }}>
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        🔍 Universal Search
                    </label>
                    <input
                        type="text"
                        placeholder="Search by ID, email, or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Filter by Role
                    </label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem'
                        }}
                    >
                        <option value="all">All Roles</option>
                        <option value="owner">Owner Only</option>
                        <option value="admin">Administrators</option>
                        <option value="student">Standard Students</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Provider
                    </label>
                    <select
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem'
                        }}
                    >
                        <option value="all">All Auth Providers</option>
                        <option value="google">Google Auth</option>
                        <option value="email">Standard Email</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
                <div className="glass" style={{
                    border: '2px solid #10b981',
                    borderRadius: '20px',
                    padding: '20px 30px',
                    marginBottom: '30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(16, 185, 129, 0.05)'
                }}>
                    <p style={{ fontWeight: '700', margin: 0, fontSize: '1.1rem' }}>
                        🎯 {selectedUsers.length} Targets Selected
                    </p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button
                            onClick={() => handleBulkAction('suspend')}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            🚫 Suspend Access
                        </button>
                        <button
                            onClick={() => handleBulkAction('promote-admin')}
                            disabled={currentUserRole !== 'owner'}
                            style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid #6366f1',
                                color: '#6366f1',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                cursor: currentUserRole !== 'owner' ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                opacity: currentUserRole !== 'owner' ? 0.5 : 1
                            }}
                        >
                            ⭐ Elevate to Admin
                        </button>
                    </div>
                </div>
            )}

            {/* Users Table Area */}
            <div className="glass-card" style={{
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
            }}>
                {loading ? (
                    <div style={{ padding: '40px' }}>
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} height="60px" borderRadius="12px" style={{ marginBottom: '15px' }} />
                        ))}
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <EmptyState 
                        title="No matching users"
                        description="Try adjusting your filters or search term."
                        icon="🔍"
                    />
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(102, 126, 234, 0.05)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '20px', textAlign: 'left', width: '50px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={handleSelectAll}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                    </th>
                                    <th style={{ padding: '20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>User Profile</th>
                                    <th style={{ padding: '20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Provider</th>
                                    <th style={{ padding: '20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Tier / Role</th>
                                    <th style={{ padding: '20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Account Status</th>
                                    <th style={{ padding: '20px', textAlign: 'left', fontWeight: '700', color: 'var(--text-secondary)' }}>Member Since</th>
                                    <th style={{ padding: '20px', textAlign: 'center', fontWeight: '700', color: 'var(--text-secondary)' }}>Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user: User) => (
                                    <tr key={user.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '20px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                style={{ width: '18px', height: '18px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ 
                                                    width: '45px', 
                                                    height: '45px', 
                                                    borderRadius: '50%', 
                                                    background: 'var(--accent-gradient)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.2rem',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    position: 'relative'
                                                }}>
                                                    {user.username?.[0]?.toUpperCase() || 'U'}
                                                    {/* Last Active Dot */}
                                                    <span style={{
                                                        position: 'absolute',
                                                        bottom: '2px',
                                                        right: '2px',
                                                        width: '12px',
                                                        height: '12px',
                                                        background: '#10b981',
                                                        border: '2px solid var(--bg-card)',
                                                        borderRadius: '50%',
                                                        zIndex: 2
                                                    }} title="Active Now"></span>
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: '700', margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                                        {user.username}
                                                    </p>
                                                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                background: user.provider === 'google' ? 'rgba(66, 133, 244, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                                color: user.provider === 'google' ? '#4285F4' : 'var(--text-secondary)',
                                                border: `1px solid ${user.provider === 'google' ? 'rgba(66, 133, 244, 0.2)' : 'var(--border-color)'}`
                                            }}>
                                                {user.provider === 'google' ? '🟢 Google' : '📧 Email'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <span style={{
                                                padding: '6px 16px',
                                                borderRadius: '10px',
                                                fontSize: '0.85rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                background: user.role === 'owner' ? 'rgba(239, 68, 68, 0.15)' :
                                                            user.role === 'admin' ? 'rgba(99, 102, 241, 0.15)' :
                                                            'rgba(16, 185, 129, 0.15)',
                                                color: user.role === 'owner' ? '#ef4444' :
                                                       user.role === 'admin' ? '#6366f1' :
                                                       '#10b981'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ 
                                                    width: '10px', 
                                                    height: '10px', 
                                                    borderRadius: '50%', 
                                                    background: user.is_email_verified ? '#10b981' : '#f59e0b'
                                                }}></div>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                                                    {user.is_email_verified ? 'Verified' : 'Pending Verification'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            {user.created_at ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(user.created_at)) : '—'}
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                {user.role !== 'owner' && currentUserRole === 'owner' && (
                                                    <button
                                                        onClick={() => handlePromoteToAdmin(user.id)}
                                                        className="glass"
                                                        style={{
                                                            border: '1px solid var(--primary)',
                                                            color: 'var(--primary)',
                                                            padding: '8px 15px',
                                                            borderRadius: '10px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        Promote
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setSelectedUserForModal(user)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid var(--border-color)',
                                                        color: 'var(--text-secondary)',
                                                        padding: '8px 15px',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedUserForModal && (
                <UserProfileModal
                    user={selectedUserForModal}
                    onClose={() => setSelectedUserForModal(null)}
                    onPromote={handlePromoteToAdmin}
                    currentUserRole={currentUserRole}
                />
            )}
            {confirmModal && (
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal(null)}
                />
            )}

            <style jsx global>{`
                .table-row-hover:hover {
                    background: rgba(102, 126, 234, 0.04) !important;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </main>
    );
}
