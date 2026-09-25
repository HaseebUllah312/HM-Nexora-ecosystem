'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function BulkReviewsPage() {
    const [rawText, setRawText] = useState('');
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState<{
        success: number;
        failed: number;
        filtered: number;
        details: any[];
    } | null>(null);

    const handleProcess = async () => {
        if (!rawText.trim()) {
            alert('Please paste some reviews first.');
            return;
        }

        setProcessing(true);
        setResults(null);

        try {
            const res = await fetch('/api/admin/bulk-reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: rawText })
            });

            const data = await res.json();
            
            if (res.ok) {
                setResults(data);
                if (data.success > 0) {
                    setRawText(''); // Clear input on success
                }
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error processing bulk reviews:', error);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <main className="page" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦 Bulk Reviews</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Paste raw text containing multiple reviews. The system will automatically detect the subject code, remove promotional content, and save them.
                    </p>
                </div>
                <Link href="/admin">
                    <button style={{
                        background: 'transparent',
                        border: '1px solid var(--accent-primary)',
                        color: 'var(--accent-primary)',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}>
                        ← Back to Dashboard
                    </button>
                </Link>
            </div>

            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '25px',
                marginBottom: '30px'
            }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '1.1rem' }}>
                    Paste Reviews Here
                </label>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                    Tip: Separate each review by a blank line (double enter). The system searches for patterns like "CS101" to attach the review to the correct subject.
                </p>
                <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="E.g.&#10;&#10;CS101 is a great course, the midterm was easy!&#10;&#10;MTH202 was very difficult. Do not buy notes from www.scam.com&#10;&#10;ENG101: Amazing experience, final was straightforward."
                    style={{
                        width: '100%',
                        height: '300px',
                        padding: '15px',
                        borderRadius: '8px',
                        border: '1px solid rgba(102, 126, 234, 0.3)',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '1rem',
                        resize: 'vertical',
                        marginBottom: '20px'
                    }}
                />

                <button
                    onClick={handleProcess}
                    disabled={processing}
                    style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        opacity: processing ? 0.7 : 1,
                        width: '100%',
                        transition: 'all 0.2s ease'
                    }}
                    className="btn-hover-glow"
                >
                    {processing ? '⏳ Processing Reviews...' : '🚀 Process & Save Reviews'}
                </button>
            </div>

            {results && (
                <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '25px'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>📊 Results Summary</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                            <p style={{ margin: '0 0 5px 0', color: '#22c55e', fontWeight: 'bold' }}>✅ Saved</p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{results.success}</p>
                        </div>
                        <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                            <p style={{ margin: '0 0 5px 0', color: '#f97316', fontWeight: 'bold' }}>🚫 Filtered (Promotional)</p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{results.filtered}</p>
                        </div>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <p style={{ margin: '0 0 5px 0', color: '#ef4444', fontWeight: 'bold' }}>❌ Failed / No Subject</p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{results.failed}</p>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Detailed Log</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'var(--bg-tertiary)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        {results.details.map((detail, idx) => (
                            <div key={idx} style={{ 
                                padding: '10px', 
                                borderBottom: idx !== results.details.length - 1 ? '1px solid var(--border-color)' : 'none',
                                color: detail.status === 'success' ? '#22c55e' : detail.status === 'filtered' ? '#f97316' : '#ef4444'
                            }}>
                                <span style={{ fontWeight: 'bold', marginRight: '10px' }}>
                                    {detail.status === 'success' ? '✅' : detail.status === 'filtered' ? '🚫' : '❌'}
                                </span>
                                {detail.status === 'success' && <span>Added to <strong>{detail.subject}</strong>: </span>}
                                <span>{detail.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
