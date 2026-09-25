'use client';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useDownloadManager } from '@/app/lib/hooks/useDownloadManager';

function FileViewerContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params.id as string;
    const title = searchParams.get('title') || 'File Viewer';
    const { downloadFile, getCachedFile } = useDownloadManager();
    const [fileSize, setFileSize] = useState<number>(0);
    const [localUrl, setLocalUrl] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }, []);

    useEffect(() => {
        let currentUrl: string | null = null;
        
        const checkOfflineStatus = async () => {
            if (id && title) {
                const cached = await getCachedFile(id, title);
                if (cached && cached.url) {
                    currentUrl = cached.url;
                    setLocalUrl(cached.url);
                    setIsOffline(true);
                    console.log(`[Viewer] Loading local blob for: ${title}`);
                }
            }
        };

        checkOfflineStatus();

        if (id) {
            fetch(`/api/download/${id}`, { method: 'HEAD' })
                .then(res => {
                    const size = res.headers.get('Content-Length');
                    if (size) setFileSize(parseInt(size));
                })
                .catch(() => {});
        }

        return () => {
            if (currentUrl) {
                URL.revokeObjectURL(currentUrl);
            }
        };
    }, [id, title, getCachedFile]);

    if (!id) return <div className="page"><div className="container">Error: File ID missing</div></div>;

    // Use local blob if available, otherwise fallback to our internal proxy route
    // This bypasses "You need access" issues as it uses the server's Drive credentials
    const fileUrl = localUrl || `/api/download/${id}?mode=view&title=${encodeURIComponent(title)}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0c', color: 'white', overflow: 'hidden' }}>
            {/* Professional Viewer Header */}
            <div style={{
                height: '70px',
                background: 'rgba(20, 20, 25, 0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        ← <span className="mobile-hide" style={{ marginLeft: '6px' }}>Back</span>
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {title}
                        </div>
                        {isOffline && (
                            <span style={{
                                color: '#10b981',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                ● Offline Ready
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => downloadFile(id, title, fileSize)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '8px 16px', borderRadius: '10px' }}
                    >
                        ⬇ <span className="mobile-hide">Download</span>
                    </button>
                </div>
            </div>

            {/* Document Area */}
            <div style={{ flex: 1, position: 'relative', background: '#000' }}>
                {isOffline && isMobile ? (
                    /* Mobile Professional Offline UI - Much better than a broken iframe */
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                        textAlign: 'center',
                        background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0c 100%)'
                    }}>
                        <div style={{ 
                            width: '100px', 
                            height: '100px', 
                            background: 'rgba(16, 185, 129, 0.1)', 
                            borderRadius: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            marginBottom: '24px',
                            boxShadow: '0 0 30px rgba(16, 185, 129, 0.1)'
                        }}>
                            📄
                        </div>
                        <h2 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Offline Document Ready</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '300px', marginBottom: '32px', lineHeight: '1.5' }}>
                            Your browser can&apos;t preview PDFs directly while offline. Click below to open it in your native viewer.
                        </p>
                        <button 
                            onClick={() => window.open(localUrl!, '_blank')}
                            className="btn btn-primary"
                            style={{ 
                                padding: '16px 40px', 
                                borderRadius: '16px', 
                                fontSize: '1.1rem',
                                boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' 
                            }}
                        >
                            Open Offline Copy ↗
                        </button>
                    </div>
                ) : (
                    <>
                        <iframe
                            src={fileUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                background: 'white'
                            }}
                            title={title}
                            allow="autoplay; encrypted-media; fullscreen"
                        />
                        
                        {/* Fallback info for background iframe issues */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: -1,
                            textAlign: 'center',
                            color: '#444',
                            padding: '20px'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📄</div>
                            <h3 style={{ margin: 0, color: '#888' }}>Initializing Reader...</h3>
                            <button 
                                onClick={() => window.open(fileUrl, '_blank')}
                                style={{ color: '#3b82f6', background: 'none', border: 'none', padding: '12px', cursor: 'pointer', textDecoration: 'underline', marginTop: '12px' }}
                            >
                                Tap here if preview doesn&apos;t load
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function FileViewerPage() {
    return (
        <Suspense fallback={<div className="page"><div className="container">Loading viewer...</div></div>}>
            <FileViewerContent />
        </Suspense>
    );
}
