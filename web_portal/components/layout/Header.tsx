'use client';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useClickOutside } from '@/app/lib/hooks/useClickOutside';
import ModernLogo from './ModernLogo';
import NotificationBell from './NotificationBell';

export const navItems = [
    { href: '/', label: 'Home' },
    { href: '/study-scheme', label: 'Study Scheme' },
    { href: '/subjects', label: 'Library' },
    { href: '/reviews', label: 'Reviews Feed' },
    { href: '/tools', label: 'Tools' },
    { href: '/services', label: 'Services' },
    { href: '/upload', label: 'Contribute' },
];

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const { user, loading, refreshUser } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [quickSearch, setQuickSearch] = useState('');
    const userMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    useClickOutside(userMenuRef, () => setUserMenuOpen(false));
    useClickOutside(mobileMenuRef, () => setMobileOpen(false));

    useEffect(() => {
        setUserMenuOpen(false); // Close menu on navigation
        setMobileOpen(false);   // Close mobile menu on navigation
    }, [pathname]);

    useEffect(() => {
        setUserMenuOpen(false); // Close menu on navigation
        setMobileOpen(false);   // Close mobile menu on navigation
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            await refreshUser();
            router.refresh(); 
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleThemeToggle = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setToastMsg(`${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)} Mode Active`);
        setShowToast(true);
        toggleTheme();
        setTimeout(() => setShowToast(false), 2000);
    };

    const openCommandPalette = (e?: React.MouseEvent | React.FormEvent) => {
        if (e) e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-command-palette'));
    };

    return (
        <>
            <header className="header">
                <div className="header-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {pathname !== '/' && (
                            <button 
                                onClick={() => router.back()}
                                className="back-button"
                                aria-label="Go back"
                            >
                                ←
                            </button>
                        )}
                        <Link href="/" className="logo" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <ModernLogo />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="logo-text">HM nexora</span>
                                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: '1', marginTop: '-2px', marginLeft: '2px' }}>by 𝕴𝖙'𝖘 𝕸𝖚𝖌𝖍𝖆𝖑</span>
                            </div>
                        </Link>
                    </div>

                    <div onClick={() => openCommandPalette()} className="header-search-box desktop-only" style={{ 
                        flex: 1, 
                        maxWidth: '280px', 
                        margin: '0 20px',
                        position: 'relative',
                        cursor: 'pointer'
                    }}>
                        <div style={{
                            height: '38px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-full)',
                            padding: '0 12px 0 36px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.82rem',
                            color: 'var(--text-muted)',
                            transition: 'all 0.2s'
                        }}
                        className="search-trigger-hover"
                        >
                            <span style={{ position: 'absolute', left: '12px', opacity: 0.5 }}>🔍</span>
                            <span>Search everything...</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.4, border: '1px solid var(--border-color)', padding: '2px 4px', borderRadius: '4px' }}>Ctrl K</span>
                        </div>
                    </div>

                    <nav className="nav-links">
                        {navItems.map(item => (
                            <Link key={item.href} href={item.href}>{item.label}</Link>
                        ))}
                    </nav>

                    <div className="nav-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button className="theme-toggle" onClick={handleThemeToggle} aria-label="Toggle theme">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>

                        {user && <NotificationBell userId={user.id} />}

                        {!loading && (
                            <div style={{ position: 'relative' }} ref={userMenuRef}>
                                {user ? (
                                    <>
                                        <button
                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                            style={{
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                padding: '4px 12px 4px 6px',
                                                borderRadius: '30px',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                color: 'var(--text-primary)',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                        >
                                            {user?.avatar_url ? (
                                                <img
                                                    src={user.avatar_url.startsWith('http') ? user.avatar_url : `/api/download/${user.avatar_url}?mode=inline`}
                                                    alt="Profile"
                                                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            {user?.username && <span className="header-username desktop-only">{user.username}</span>}
                                        </button>

                                        {userMenuOpen && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                right: 0,
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                padding: '8px 0',
                                                marginTop: '12px',
                                                minWidth: '220px',
                                                boxShadow: 'var(--shadow-lg)',
                                                zIndex: 1000,
                                                overflow: 'hidden',
                                                animation: 'fadeInUp 0.2s ease-out'
                                            }}>
                                                {(user.role === 'admin' || user.role === 'owner') && (
                                                    <Link 
                                                        href="/admin" 
                                                        onClick={() => setUserMenuOpen(false)}
                                                        style={{
                                                        padding: '12px 16px',
                                                        color: 'var(--accent-primary)',
                                                        textDecoration: 'none',
                                                        fontSize: '0.95rem',
                                                        borderBottom: '1px solid var(--border-color)',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontWeight: '600'
                                                    }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                        ⚙️ Admin Dashboard
                                                    </Link>
                                                )}
                                                <Link 
                                                    href="/dashboard" 
                                                    onClick={() => setUserMenuOpen(false)}
                                                    style={{
                                                    padding: '12px 16px',
                                                    color: 'var(--text-primary)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                    📊 Dashboard
                                                </Link>
                                                <Link 
                                                    href="/profile" 
                                                    onClick={() => setUserMenuOpen(false)}
                                                    style={{
                                                    padding: '12px 16px',
                                                    color: 'var(--text-primary)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                    👤 My Profile
                                                </Link>
                                                <Link 
                                                    href="/vault" 
                                                    onClick={() => setUserMenuOpen(false)}
                                                    style={{
                                                    padding: '12px 16px',
                                                    color: 'var(--text-primary)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                    📦 My Study Vault
                                                </Link>
                                                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
                                                <button
                                                    onClick={handleLogout}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#ff6b6b',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        fontSize: '0.95rem',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    🚪 Logout
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="auth-buttons-desktop" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <Link href="/login" className="btn btn-outline btn-sm">
                                            Sign In
                                        </Link>
                                        <Link href="/register" className="btn btn-primary btn-sm">
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" style={{
                            flexDirection: 'column',
                            gap: '5px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '10px'
                        }}>
                            <span style={{ width: '25px', height: '2px', background: 'var(--text-primary)', transition: '0.3s' }} />
                            <span style={{ width: '25px', height: '2px', background: 'var(--text-primary)', transition: '0.3s' }} />
                            <span style={{ width: '25px', height: '2px', background: 'var(--text-primary)', transition: '0.3s' }} />
                        </button>
                    </div>
                </div>
            </header>

            <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} ref={mobileMenuRef}>
                <div style={{ padding: '0 0 20px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>HM nexora</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '15px', paddingLeft: '2px' }}>by 𝕴𝖙'𝖘 𝕸𝖚𝖌𝖍𝖆𝖑</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                            🏠 Home
                        </Link>
                        <Link href="/subjects" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                            📚 Subject Library
                        </Link>
                        <Link href="/vault" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                            📦 My Study Vault
                        </Link>
                        <Link href="/profile" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                            👤 My Profile
                        </Link>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>Resources</h4>
                    {navItems.filter(item => item.href !== '/' && item.href !== '/subjects').map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                            {item.label}
                        </Link>
                    ))}
                </div>

                {user ? (
                    <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                        <button onClick={handleLogout} style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            🚪 Logout
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '20px' }}>
                        <Link href="/login" onClick={() => setMobileOpen(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Sign In</Link>
                        <Link href="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Register</Link>
                    </div>
                )}
                
                <div style={{ display: 'flex', gap: '15px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                    <Link href="/about" onClick={() => setMobileOpen(false)} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>About Us</Link>
                    <Link href="/contact" onClick={() => setMobileOpen(false)} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact</Link>
                </div>
            </div>

            {/* Theme Notification Toast */}
            <div className={`theme-toast ${showToast ? 'show' : ''}`}>
                <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
                {toastMsg}
            </div>
        </>
    );
}
