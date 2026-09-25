'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlError = searchParams.get('error');
    const { refreshUser } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (res.ok) {
                await refreshUser();
                router.refresh(); // Force Next.js to drop the cached client layout
                if (data.role === 'admin' || data.role === 'owner') {
                    router.push('/admin');
                } else {
                    router.push('/dashboard');
                }
            } else {
                setError(data.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card glass-card">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '10px', background: 'var(--heading-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome Back</h1>
                <p style={{ color: 'var(--accent-text)', fontWeight: '500' }}>Sign in to continue your journey</p>
            </div>

            {(error || urlError) && (
                <div className="alert alert-error" style={{ marginBottom: '20px', textAlign: 'center' }}>
                    {error || urlError}
                </div>
            )}

            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--form-label-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                    <input
                        className="form-input"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--form-label-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            className="form-input"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', fontSize: '0.9rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                        <input type="checkbox" /> Remember me
                    </label>
                    <Link href="/forgot-password" style={{ color: 'var(--primary)' }}>Forgot Password?</Link>
                </div>

                <button type="submit" className="btn btn-primary btn-block" style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px' }} disabled={loading}>
                    {loading ? 'Logging in...' : 'Sign In'}
                </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '25px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                <span style={{ padding: '0 10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>

            <button
                onClick={() => window.location.href = '/api/auth/google'}
                className="btn btn-outline btn-block"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'white', color: '#333', border: '1px solid #ddd' }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.52 12.3c0-.85-.08-1.68-.22-2.48H12v4.69h6.46c-.28 1.49-1.12 2.76-2.39 3.61v3h3.87c2.26-2.09 3.56-5.17 3.56-8.82z" fill="#4285F4" />
                    <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.12C3.26 21.3 8.28 24 12 24z" fill="#34A853" />
                    <path d="M5.27 14.28c-.24-.71-.38-1.46-.38-2.26s.14-1.55.38-2.26V6.63H1.29c-1.63 3.25-1.63 7.02 0 10.27l3.98-3.12z" fill="#FBBC05" />
                    <path d="M12 4.75c1.76 0 3.34.61 4.58 1.79l3.44-3.44C17.94 1.17 15.22 0 12 0 8.28 0 3.26 2.7 1.29 6.63l3.98 3.12c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335" />
                </svg>
                <span>Sign in with Google</span>
            </button>

            <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.95rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Create Account</Link>
                </p>
                <p style={{ marginTop: '10px' }}>
                    <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>← Back to Home</Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="page" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--secondary-rgb), 0.1) 100%)'
        }}>
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
