'use client';
import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from "react-icons/fa";

function RegisterForm() {
    const [step, setStep] = useState(1); // 1: Email & Username, 2: Password, 3: OTP Verification
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpToken, setOtpToken] = useState(''); // Signed JWT from server
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const router = useRouter();

    // Step 1: Send OTP
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !email.trim()) {
            setError('Please fill in all fields');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                body: JSON.stringify({ email: email.trim(), username: username.trim() }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (res.ok) {
                // Use normalized email and save the JWT token from server
                setEmail(data.email);
                setOtpToken(data.otpToken);
                setOtpSent(true);
                setStep(2);
                // Start countdown for resend
                setResendCountdown(60);
            } else {
                setError(data.error || 'Failed to send verification code');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Set password
    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setStep(3);
    };

    // Step 3: Verify OTP and create account
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!otp.trim() || otp.length !== 6) {
            setError('Please enter the 6-digit verification code');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({
                    otpToken,          // Signed JWT containing the OTP
                    username: username.trim(),
                    password: password.trim(),
                    otp: otp.trim()
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (res.ok) {
                // Redirect to login on success
                router.push('/login?success=Account created successfully! Please login.');
            } else {
                setError(data.error || 'Verification failed');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendCountdown > 0) return;

        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                body: JSON.stringify({ email: email.trim(), username: username.trim() }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (res.ok) {
                setEmail(data.email); // Use normalized email from server
                setOtpToken(data.otpToken); // Update token for resend
                setResendCountdown(60);
            } else {
                setError(data.error || 'Failed to resend verification code');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Countdown timer effect
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    return (
        <div className="card glass-card">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2.4rem', fontWeight: '900', marginBottom: '10px', background: 'var(--heading-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Create Account</h1>
                <p style={{ color: 'var(--accent-text)', fontWeight: '500' }}>
                    {step === 1 && 'Step 1 of 3: Email Verification'}
                    {step === 2 && 'Step 2 of 3: Create Password'}
                    {step === 3 && 'Step 3 of 3: Verify Code'}
                </p>
                <div style={{ marginTop: '15px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: '40px',
                            height: '4px',
                            borderRadius: '2px',
                            background: s <= step ? 'var(--primary)' : 'var(--border)',
                            transition: 'all 0.3s ease'
                        }} />
                    ))}
                </div>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: '20px', textAlign: 'center' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* STEP 1: Email & Username */}
            {step === 1 && (
                <form onSubmit={handleSendOTP}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--form-label-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📧 Email Address</label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="your.email@gmail.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                        />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                            We'll send a verification code to this email
                        </p>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--form-label-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>👤 Username</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            disabled={loading}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px' }} disabled={loading}>
                        {loading ? 'Sending Code...' : 'Send Verification Code'}
                    </button>
                </form>
            )}

            {/* STEP 2: Password */}
            {step === 2 && (
                <form onSubmit={handleSetPassword}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--form-label-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔑 Password</label>
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
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                            At least 8 characters. Use upper, lower, numbers for better security
                        </p>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--form-label-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔐 Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                className="form-input"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                                style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex={-1}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px' }} disabled={loading}>
                        {loading ? 'Creating...' : 'Continue to Verification'}
                    </button>

                    <button
                        type="button"
                        onClick={() => { setStep(1); setPassword(''); setConfirmPassword(''); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            marginTop: '15px',
                            width: '100%',
                            textAlign: 'center'
                        }}
                    >
                        ← Change Email
                    </button>
                </form>
            )}

            {/* STEP 3: OTP Verification */}
            {step === 3 && (
                <form onSubmit={handleVerifyOTP}>
                    <div style={{
                        background: 'rgba(102, 126, 234, 0.1)',
                        padding: '15px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        borderLeft: '4px solid var(--primary)'
                    }}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            ✅ Verification code sent to<br />
                            <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                        </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--form-label-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔐 Verification Code</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            required
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                fontSize: '1.5rem',
                                letterSpacing: '8px',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}
                        />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                            Enter the 6-digit code from your email
                        </p>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '8px' }} disabled={loading}>
                        {loading ? 'Verifying...' : 'Create Account'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
                            {resendCountdown > 0
                                ? `Resend code in ${resendCountdown}s`
                                : "Didn't receive the code?"}
                        </p>
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={resendCountdown > 0 || loading}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: resendCountdown > 0 ? 'var(--text-secondary)' : 'var(--primary)',
                                cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer',
                                textDecoration: 'underline',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                            }}
                        >
                            Resend Code
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => { setStep(1); setOtp(''); setPassword(''); setConfirmPassword(''); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            marginTop: '15px',
                            width: '100%',
                            textAlign: 'center'
                        }}
                    >
                        ← Change Email
                    </button>
                </form>
            )}

            {step === 1 && (
                <>
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
                        <span>Sign up with Google</span>
                    </button>
                </>
            )}

            <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.95rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign In</Link>
                </p>
                <p style={{ marginTop: '10px' }}>
                    <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>← Back to Home</Link>
                </p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <div className="page" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--secondary-rgb), 0.1) 100%)'
        }}>
            <Suspense fallback={<div>Loading...</div>}>
                <RegisterForm />
            </Suspense>
        </div>
    );
}
