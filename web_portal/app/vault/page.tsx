'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import SubjectSelection from '@/components/dashboard/SubjectSelection';
import { motion, AnimatePresence } from 'framer-motion';
import { useDownloadManager } from '@/app/lib/hooks/useDownloadManager';
import Skeleton from '@/components/ui/Skeleton';
import { HiOutlineTrash, HiOutlineCloudArrowDown, HiOutlineAdjustmentsHorizontal, HiOutlineArrowPath, HiOutlineEye, HiOutlineDocumentText } from 'react-icons/hi2';

export default function StudyVaultPage() {
    const [user, setUser] = useState<any>(null);
    const [followedSubjects, setFollowedSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSelection, setShowSelection] = useState(false);
    const [syncEnabled, setSyncEnabled] = useState(true);
    const [cachedFiles, setCachedFiles] = useState<{ url: string, title: string, size: number, id: string }[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);

    const { prefetchFile } = useDownloadManager();

    const fetchCache = useCallback(async () => {
        if (typeof window === 'undefined') return;
        try {
            const cache = await caches.open('academic-files-v1');
            const keys = await cache.keys();
            const files = await Promise.all(keys.map(async (request) => {
                const response = await cache.match(request);
                const blob = await response?.blob();
                const urlObj = new URL(request.url, window.location.href);
                // Extract drive ID from URL /api/download/[id]
                const idMatch = request.url.match(/\/api\/download\/([^?]+)/);
                return {
                    url: request.url,
                    id: idMatch ? idMatch[1] : '',
                    title: urlObj.searchParams.get('title') || 'Unknown File',
                    size: blob?.size || 0
                };
            }));
            setCachedFiles(files);
        } catch (e) {
            console.warn("Cache access failed", e);
        }
    }, []);

    const fetchVaultData = useCallback(async () => {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            
            if (data.user?.followed_subjects?.length > 0) {
                // 1. Fetch available subjects from DB
                const { data: dbSubjects } = await supabase
                    .from('subjects')
                    .select('*')
                    .in('code', data.user.followed_subjects);
                
                // 2. Fetch file counts from approved_materials
                const { data: fileCountsRaw } = await supabase
                    .from('approved_materials')
                    .select('code')
                    .in('code', data.user.followed_subjects);
                
                const countMap: Record<string, number> = {};
                fileCountsRaw?.forEach(fc => {
                    countMap[fc.code] = (countMap[fc.code] || 0) + 1;
                });
                
                // 3. Construct subjects with fallback roles for those missing in DB
                const reconciledSubjects = data.user.followed_subjects.map((code: string) => {
                    const dbSub = dbSubjects?.find(s => s.code === code);
                    return {
                        id: dbSub?.id || code,
                        code: code,
                        name: dbSub?.name || `${code} - Subject`,
                        fileCount: countMap[code] || 0
                    };
                });

                setFollowedSubjects(reconciledSubjects);
            } else {
                setFollowedSubjects([]);
            }
        }
    }, []);

    useEffect(() => {
        fetchVaultData().then(() => setLoading(false));
        fetchCache();
        
        const enabled = localStorage.getItem('background_sync_enabled') !== 'false';
        setSyncEnabled(enabled);
    }, [fetchVaultData, fetchCache]);

    const handleSyncAll = async () => {
        if (!user?.followed_subjects || user.followed_subjects.length === 0) return;
        
        setIsSyncing(true);
        setSyncProgress(0);

        try {
            const res = await fetch('/api/vault/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjectCodes: user.followed_subjects })
            });

            if (res.ok) {
                const { files } = await res.json();
                if (files && files.length > 0) {
                    let completed = 0;
                    for (const file of files) {
                        await prefetchFile(file.drive_id, file.title, file.size || 0);
                        completed++;
                        setSyncProgress(Math.round((completed / files.length) * 100));
                    }
                }
            }
            await fetchCache();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setIsSyncing(false);
            setSyncProgress(0);
        }
    };

    const toggleSync = () => {
        const newVal = !syncEnabled;
        setSyncEnabled(newVal);
        localStorage.setItem('background_sync_enabled', newVal.toString());
    };

    const deleteCachedFile = async (url: string) => {
        const cache = await caches.open('academic-files-v1');
        await cache.delete(url);
        fetchCache();
    };

    if (loading) {
        return (
            <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔐</div>
                <h2>Vault Locked</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please sign in to access your personal study vault and offline resources.</p>
                <Link href="/login" className="btn btn-primary">Sign In to Continue</Link>
            </div>
        );
    }

    return (
        <div className="page anim-fade-in" style={{ paddingBottom: '100px' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '2.5rem' }}>💎</span>
                            <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Study Vault</h1>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Your professional academic locker with full offline capabilities.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={handleSyncAll}
                            disabled={isSyncing || followedSubjects.length === 0}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <HiOutlineArrowPath className={isSyncing ? 'anim-spin' : ''} size={20} />
                            {isSyncing ? `Syncing ${syncProgress}%` : 'Sync All Files'}
                        </button>
                        <button 
                            onClick={() => setShowSelection(true)}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <HiOutlineAdjustmentsHorizontal size={20} />
                            Manage
                        </button>
                    </div>
                </div>

                <div className="grid-2" style={{ marginBottom: '40px' }}>
                    {/* FOLLOWED SUBJECTS */}
                    <div>
                        <h3 className="section-title" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>📖 My Subjects</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{followedSubjects.length}/10 Active</span>
                        </h3>
                        
                        {loading ? (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} height="120px" borderRadius="16px" />
                                ))}
                            </div>
                        ) : followedSubjects.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-tertiary)', border: '1px dashed var(--border-color)' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No subjects followed yet.</p>
                                <button onClick={() => setShowSelection(true)} className="btn btn-outline btn-sm">Add First Subject</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {followedSubjects.map((subject) => (
                                    <div key={subject.id} className="card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>{subject.code}</div>
                                                <h4 style={{ margin: '2px 0 0', fontSize: '1.05rem' }}>{subject.name}</h4>
                                            </div>
                                            <div style={{ background: 'var(--accent-glow)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                                {subject.fileCount || 0} Files
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            <Link href={`/subjects/${subject.code.toLowerCase()}/materials`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem', padding: '6px' }}>Materials</Link>
                                            <Link href={`/mcq-practice?subject=${subject.code}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.8rem', padding: '6px' }}>Practice</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* STORAGE & SYNC CONTROLS */}
                    <div id="storage-section">
                        <h3 className="section-title" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>📦 Storage Manager</span>
                            <button onClick={fetchCache} title="Refresh Cache" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <HiOutlineArrowPath size={16} />
                            </button>
                        </h3>
                        
                        <div className="card" style={{ marginBottom: '16px', padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Background Auto-Sync</h4>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automatically keep resources updated</p>
                                </div>
                                <div 
                                    onClick={toggleSync}
                                    style={{
                                        width: '46px',
                                        height: '24px',
                                        background: syncEnabled ? 'var(--accent-primary)' : 'var(--border-color)',
                                        borderRadius: '12px',
                                        padding: '3px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: syncEnabled ? 'flex-end' : 'flex-start',
                                        transition: '0.3s'
                                    }}
                                >
                                    <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Offline Files</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>{cachedFiles.length} Ready</span>
                            </div>
                            
                            <div className="no-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {cachedFiles.length === 0 ? (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <HiOutlineCloudArrowDown size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                        <p>No files available offline yet.<br/>Use "Sync All" to download materials.</p>
                                    </div>
                                ) : (
                                    cachedFiles.map(file => (
                                        <div key={file.url} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }} className="hover-bg">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '65%' }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                                                    <HiOutlineDocumentText size={20} />
                                                </div>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-primary)' }}>{file.title}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: '#10b981' }}>●</span>
                                                        {(file.size / (1024 * 1024)).toFixed(1)} MB • Offline Ready
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <Link href={`/view/${file.id}?title=${encodeURIComponent(file.title)}`} className="btn btn-icon btn-sm" title="View Offline">
                                                    <HiOutlineEye size={18} />
                                                </Link>
                                                <button 
                                                    onClick={() => deleteCachedFile(file.url)}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '6px' }}
                                                >
                                                    <HiOutlineTrash size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Total Data Usage:</span>
                                <strong style={{ color: 'var(--accent-primary)' }}>{(cachedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {showSelection && (
                        <div style={{ position: 'relative', zIndex: 2000 }}>
                            <SubjectSelection 
                                onClose={() => {
                                    setShowSelection(false);
                                    fetchVaultData();
                                }} 
                                currentSubjects={user?.followed_subjects || []}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
