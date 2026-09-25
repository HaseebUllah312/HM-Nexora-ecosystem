'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDownloadManager } from '@/app/lib/hooks/useDownloadManager';
import { useRecentlyViewed } from '@/app/lib/hooks/useRecentlyViewed';
import { HiOutlineCloudArrowDown, HiCheckCircle } from 'react-icons/hi2';

interface MaterialsClientProps {
    subject: any;
    files: any[];
}

export default function MaterialsClient({ subject, files }: MaterialsClientProps) {
    const router = useRouter();
    const { prefetchFile, isFileCached } = useDownloadManager();
    const { addItem } = useRecentlyViewed();
    const [cachedStatus, setCachedStatus] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState<Record<string, boolean>>({});

    // Check cache status for all files
    useEffect(() => {
        const checkCache = async () => {
            const status: Record<string, boolean> = {};
            for (const file of files) {
                const driveId = file.link.startsWith('/api/download/') 
                    ? file.link.replace('/api/download/', '').split('?')[0]
                    : file.link;
                status[file.id] = await isFileCached(driveId, file.title);
            }
            setCachedStatus(status);
        };
        checkCache();
    }, [files, isFileCached]);

    const handleSaveOffline = async (e: React.MouseEvent, file: any) => {
        e.stopPropagation();
        const driveId = file.link.startsWith('/api/download/') 
            ? file.link.replace('/api/download/', '').split('?')[0]
            : file.link;
        
        setSaving((prev: Record<string, boolean>) => ({ ...prev, [file.id]: true }));
        await prefetchFile(driveId, file.title, file.size || 0);
        
        // Short delay for better UX
        setTimeout(async () => {
            const isCachedNow = await isFileCached(driveId, file.title);
            setCachedStatus((prev: Record<string, boolean>) => ({ ...prev, [file.id]: isCachedNow }));
            setSaving((prev: Record<string, boolean>) => ({ ...prev, [file.id]: false }));
        }, 500);
    };

    // Trigger background prefetch for each small file on mount
    useEffect(() => {
        files?.forEach(file => {
            // Clean link if it already has the prefix for prefetching purposes
            const driveId = file.link.startsWith('/api/download/') 
                ? file.link.replace('/api/download/', '') 
                : file.link;
            prefetchFile(driveId, file.title, file.size || 0);
        });
    }, [files, prefetchFile]);

    return (
        <div className="page anim-fade-in">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <button onClick={() => router.back()} className="btn btn-outline btn-sm">← Back</button>
                </div>
                
                <div className="page-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
                    <div className="subject-code" style={{ marginBottom: '8px' }}>{subject.code}</div>
                    <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{subject.name}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Exclusive study vault for your selected course.</p>
                </div>

                <div className="card" style={{ marginBottom: '32px', background: 'var(--accent-glow)' }}>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-text)', textTransform: 'uppercase' }}>Difficulty</div>
                            <div className={`diff-${subject.difficulty?.toLowerCase().replace(' ', '')}`} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{subject.difficulty || 'TBD'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-text)', textTransform: 'uppercase' }}>Resources</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{files.length} Handouts/Papers</div>
                        </div>
                    </div>
                </div>

                <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>📂 Study Materials</h2>
                
                {files.length === 0 ? (
                    <div className="card" style={{ 
                        textAlign: 'center', 
                        padding: '60px 40px',
                        background: 'rgba(99, 102, 241, 0.05)',
                        border: '2px dashed var(--border-color)',
                        borderRadius: '24px'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💝</div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Be the First to Contribute!</h2>
                        <p style={{ 
                            color: 'var(--text-secondary)', 
                            maxWidth: '500px', 
                            margin: '0 auto 24px',
                            lineHeight: '1.6',
                            fontSize: '1.1rem'
                        }}>
                            We don&apos;t have any materials for <strong>{subject.code}</strong> yet. If you have any handouts, past papers, or notes, kindly upload them to help your fellow students!
                        </p>
                        <Link href="/upload" className="btn btn-primary" style={{ padding: '12px 40px', fontSize: '1.1rem' }}>
                            Upload Resources 📤
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {files.map((file) => (
                            <div key={file.id} className="card" style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '16px 24px',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }} onClick={() => {
                                const link = file.link.startsWith('/api/download/') 
                                    ? file.link.replace('/api/download/', '') 
                                    : file.link;
                                addItem({
                                    id: file.id,
                                    type: 'material',
                                    title: file.title,
                                    code: subject.code
                                });
                                router.push(`/view/${link}?title=${encodeURIComponent(file.title)}`);
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ fontSize: '1.8rem' }}>📄</div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{file.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {file.type || 'Material'} • {new Date(file.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <a 
                                        href={`https://wa.me/923177180123?text=Hi!%20I%20want%20to%20get%20the%20file:%20${encodeURIComponent(file.title)}%20(Code:%20${subject.code})`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-icon btn-sm"
                                        title="Get on WhatsApp"
                                        style={{ 
                                            padding: '8px',
                                            borderRadius: '8px',
                                            background: '#25D366',
                                            borderColor: '#25D366',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '0.75rem',
                                            minWidth: 'auto'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span style={{ fontSize: '1.1rem' }}>💬</span>
                                        <span className="mobile-hide">WhatsApp</span>
                                    </a>
                                    <div className="btn btn-primary btn-sm">View</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
