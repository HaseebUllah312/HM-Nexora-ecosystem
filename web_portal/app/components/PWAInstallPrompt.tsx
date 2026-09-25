'use client';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // Register service worker
        if ('serviceWorker' in navigator) {
            const isBot = /googlebot|bingbot|yandexbot|duckduckbot|slurp/i.test(navigator.userAgent);
            if (!isBot) {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
            }
        }

        // Detect if already installed as PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setInstalled(true);
            return;
        }

        // Detect iOS
        const ua = navigator.userAgent;
        const ios = /iphone|ipad|ipod/i.test(ua) && !(window as any).MSStream;
        setIsIOS(ios);

        // Frequency Cap logic: Check if dismissed in last 24 hours
        const lastDismissed = localStorage.getItem('pwa_last_dismissed');
        if (lastDismissed) {
            const now = new Date().getTime();
            const oneDay = 24 * 60 * 60 * 1000;
            if (now - parseInt(lastDismissed) < oneDay) {
                return;
            }
        }

        if (ios) {
            setTimeout(() => setShowBanner(true), 3000);
        }

        // Android / Chrome: capture install event
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setTimeout(() => setShowBanner(true), 3000);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setInstalled(true);
            setDeferredPrompt(null);
        }
        setShowBanner(false);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        // Store timestamp for 24h frequency cap
        localStorage.setItem('pwa_last_dismissed', new Date().getTime().toString());
    };

    if (installed || !showBanner) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 'env(safe-area-inset-top, 20px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            width: 'calc(100% - 24px)',
            maxWidth: '500px',
            background: 'rgba(var(--bg-card-rgb), 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '24px',
            padding: '12px 16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(var(--accent-primary-rgb), 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideDownFade 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            marginTop: '10px'
        }}>
            <style>{`
                @keyframes slideDownFade {
                    from { opacity: 0; transform: translate(-50%, -40px) scale(0.96); }
                    to   { opacity: 1; transform: translate(-50%, 0)   scale(1);    }
                }
            `}</style>

            {/* App Icon */}
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'var(--accent-gradient, linear-gradient(135deg, #6d28d9, #9333ea))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(var(--accent-primary-rgb), 0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'logoShine 3s infinite'
                }} />
                <style>{`
                    @keyframes logoShine {
                        0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                        20%, 100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
                    }
                `}</style>
                🎓
            </div>

            {/* Text Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                        HM nexora
                    </span>
                    <span style={{ 
                        fontSize: '0.65rem', 
                        padding: '2px 6px', 
                        background: 'var(--accent-glow)', 
                        color: 'var(--accent-primary)', 
                        borderRadius: '6px',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                    }}>Official App</span>
                </div>
                <p style={{ 
                    fontSize: '0.78rem', 
                    color: 'var(--text-secondary)', 
                    margin: '0', 
                    lineHeight: 1.3,
                    opacity: 0.9,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {isIOS ? 'Install for full native experience' : 'Add to home screen for offline access'}
                </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {!isIOS && (
                    <button
                        onClick={handleInstall}
                        style={{
                            background: 'var(--accent-gradient)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px 18px',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 10px rgba(var(--accent-primary-rgb), 0.2)',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        GET APP
                    </button>
                )}
                <button
                    onClick={handleDismiss}
                    style={{
                        background: 'rgba(var(--accent-primary-rgb), 0.08)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        flexShrink: 0,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(var(--accent-primary-rgb), 0.15)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(var(--accent-primary-rgb), 0.08)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
