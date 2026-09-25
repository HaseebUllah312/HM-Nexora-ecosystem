'use client';
import { useState, useEffect } from 'react';
import { HiCloudDownload, HiCheckCircle, HiRefresh } from 'react-icons/hi';

interface OfflineSyncButtonProps {
    subjectCode: string;
    files: { link: string; title: string }[];
}

export default function OfflineSyncButton({ subjectCode, files }: OfflineSyncButtonProps) {
    const [status, setStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
    const [progress, setProgress] = useState(0);

    const storageKey = `offline_sync_${subjectCode}`;

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved === 'synced') setStatus('synced');
    }, [subjectCode, storageKey]);

    const handleSync = async () => {
        if (status === 'syncing') return;
        setStatus('syncing');
        setProgress(0);

        try {
            const urlsToCache = files
                .map(f => f.link)
                .filter(link => link.startsWith('/api/download/'));

            let completed = 0;
            for (const url of urlsToCache) {
                await fetch(url, { method: 'HEAD' }); // Trigger SW caching
                completed++;
                setProgress(Math.round((completed / urlsToCache.length) * 100));
            }

            localStorage.setItem(storageKey, 'synced');
            setStatus('synced');
        } catch (err) {
            console.error('Offline sync failed:', err);
            setStatus('error');
        }
    };

    return (
        <button 
            onClick={handleSync}
            disabled={status === 'syncing'}
            className={`btn ${status === 'synced' ? 'btn-success' : 'btn-secondary'}`}
            style={{ 
                padding: '10px 20px', 
                fontSize: '0.9rem', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {status === 'idle' && <><HiCloudDownload /> Sync for Offline</>}
            {status === 'syncing' && (
                <>
                    <HiRefresh className="animate-spin" /> 
                    Syncing {progress}%
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '3px',
                        background: 'rgba(255,255,255,0.3)',
                        width: `${progress}%`,
                        transition: 'width 0.3s'
                    }} />
                </>
            )}
            {status === 'synced' && <><HiCheckCircle /> Available Offline</>}
            {status === 'error' && <><HiRefresh /> Retry Sync</>}
        </button>
    );
}
