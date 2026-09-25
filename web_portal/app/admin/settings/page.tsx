'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        siteName: 'HM nexora',
        siteDescription: 'Academic learning platform',
        maintenanceMode: false,
        enableRegistrations: true,
        enableUserUploads: true,
        maxUploadSize: 50,
        emailNotificationsEnabled: true,
        apiRateLimit: 1000,
        sessionTimeout: 30,
        twoFactorAuth: false,
        enableOAuth: true,
        autoBackupEnabled: true,
        backupFrequency: 'daily'
    });

    const [saved, setSaved] = useState(false);

    const handleToggle = (key: string) => {
        setSettings(prev => ({
            ...prev,
            [key]: !(prev as any)[key]
        }));
        setSaved(false);
    };

    const handleChange = (key: string, value: any) => {
        setSettings(prev => {
            const updated: any = { ...prev };
            updated[key] = value;
            return updated;
        });
        setSaved(false);
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const [resetLoading, setResetLoading] = useState(false);

    const handleSemesterReset = async () => {
        if (!confirm('Are you sure you want to RESET ALL student subjects? This will force all students to pick their subjects again for the new semester.')) {
            return;
        }

        setResetLoading(true);
        try {
            const response = await fetch('/api/admin/reset-semester', { method: 'POST' });
            if (response.ok) {
                alert('✅ Semester reset successful! All student subject selections have been cleared.');
            } else {
                alert('❌ Failed to reset semester.');
            }
        } catch (error) {
            alert('❌ Network error during reset.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <main className="page" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚙️ Site Settings</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Manage platform configuration and features</p>
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

            {/* Notification */}
            {saved && (
                <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid #22c55e',
                    color: '#22c55e',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '30px',
                    fontWeight: '500'
                }}>
                    ✅ Settings saved successfully!
                </div>
            )}

            {/* General Settings */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '25px' }}>📋 General Settings</h2>
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    padding: '30px'
                }}>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Site Name</label>
                        <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => handleChange('siteName', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                borderRadius: '8px',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Site Description</label>
                        <textarea
                            value={settings.siteDescription}
                            onChange={(e) => handleChange('siteDescription', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                borderRadius: '8px',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                minHeight: '100px',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px 0',
                        borderTop: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                        <div>
                            <p style={{ fontWeight: '500', margin: '0 0 4px 0' }}>🚨 Maintenance Mode</p>
                            <p style={{ color: 'var(--text-secondary)', font: '0.9rem', margin: 0 }}>
                                Disable access for non-admin users
                            </p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={settings.maintenanceMode}
                                onChange={() => handleToggle('maintenanceMode')}
                                style={{ width: '20px', height: '20px' }}
                            />
                        </label>
                    </div>
                </div>
            </section>

            {/* Feature Toggles */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '25px' }}>✨ Feature Toggles</h2>
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    padding: '30px'
                }}>
                    {[
                        { key: 'enableRegistrations', label: 'User Registrations', icon: '📝' },
                        { key: 'enableUserUploads', label: 'User File Uploads', icon: '📤' },
                        { key: 'emailNotificationsEnabled', label: 'Email Notifications', icon: '✉️' },
                        { key: 'enableOAuth', label: 'Google OAuth Login', icon: '🔐' },
                        { key: 'twoFactorAuth', label: 'Two-Factor Authentication', icon: '🔒' }
                    ].map((feature, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '15px 0',
                                borderBottom: idx < 4 ? '1px solid rgba(102, 126, 234, 0.1)' : 'none'
                            }}
                        >
                            <div>
                                <p style={{ fontWeight: '500', margin: '0 0 4px 0' }}>
                                    {feature.icon} {feature.label}
                                </p>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={settings[feature.key as keyof typeof settings] as boolean}
                                    onChange={() => handleToggle(feature.key)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </label>
                        </div>
                    ))}
                </div>
            </section>

            {/* Upload & Storage Settings */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '25px' }}>💾 Upload & Storage</h2>
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    padding: '30px'
                }}>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Max Upload Size (MB)
                        </label>
                        <input
                            type="number"
                            value={settings.maxUploadSize}
                            onChange={(e) => handleChange('maxUploadSize', parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                borderRadius: '8px',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                boxSizing: 'border-box'
                            }}
                        />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '5px' }}>
                            Maximum file size allowed for user uploads
                        </p>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px 0',
                        borderTop: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                        <div>
                            <p style={{ fontWeight: '500', margin: '0 0 4px 0' }}>🔄 Auto Backup</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                                Automatic database backups
                            </p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={settings.autoBackupEnabled}
                                onChange={() => handleToggle('autoBackupEnabled')}
                                style={{ width: '20px', height: '20px' }}
                            />
                        </label>
                    </div>

                    {settings.autoBackupEnabled && (
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Backup Frequency
                            </label>
                            <select
                                value={settings.backupFrequency}
                                onChange={(e) => handleChange('backupFrequency', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '1px solid rgba(102, 126, 234, 0.3)',
                                    borderRadius: '8px',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>
                    )}
                </div>
            </section>

            {/* Security Settings */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '25px' }}>🔐 Security</h2>
                <div style={{
                    background: 'rgba(102, 126, 234, 0.08)',
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    padding: '30px'
                }}>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            API Rate Limit (requests/hour)
                        </label>
                        <input
                            type="number"
                            value={settings.apiRateLimit}
                            onChange={(e) => handleChange('apiRateLimit', parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                borderRadius: '8px',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Session Timeout (minutes)
                        </label>
                        <input
                            type="number"
                            value={settings.sessionTimeout}
                            onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                borderRadius: '8px',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Semester Management */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '25px', color: '#ef4444' }}>⚠️ Advanced Management</h2>
                <div style={{
                    background: 'rgba(239, 68, 68, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '30px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ maxWidth: '70%' }}>
                            <p style={{ fontWeight: '700', margin: '0 0 8px 0', fontSize: '1.1rem' }}>New Semester Reset</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                                Clicking this button will clear the "Followed Subjects" list for <strong>ALL</strong> users.
                                On their next login, students will be prompted to pick their subjects for the new semester.
                            </p>
                        </div>
                        <button
                            onClick={handleSemesterReset}
                            disabled={resetLoading}
                            style={{
                                background: resetLoading ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: resetLoading ? 'default' : 'pointer',
                                fontWeight: '700',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            {resetLoading ? 'Resetting...' : '🚀 Reset All Subjects'}
                        </button>
                    </div>
                </div>
            </section>

            {/* Save Button */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', borderTop: '1px solid var(--border)', paddingTop: '30px' }}>
                <button
                    onClick={handleSave}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '12px 30px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem'
                    }}
                >
                    💾 Save Settings
                </button>
                <Link href="/admin">
                    <button style={{
                        background: 'transparent',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        color: 'var(--text-primary)',
                        padding: '12px 30px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}>
                        Cancel
                    </button>
                </Link>
            </div>
        </main>
    );
}
