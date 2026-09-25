'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Skeleton from '@/components/ui/Skeleton';

interface ReviewItem {
    id: string;
    subject_code: string;
    comment: string;
    rating: number;
    user_id: string;
    username: string;
    term: string;
    created_at: string;
}

export default function ManageReviewsPage() {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterSubject, setFilterSubject] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/admin/manage-reviews?limit=5000');
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            } else if (res.status === 401 || res.status === 403) {
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        
        try {
            const res = await fetch(`/api/admin/manage-reviews?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setReviews(reviews.filter(review => review.id !== id));
            } else {
                alert('Failed to delete review');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred');
        }
    };

    const filteredReviews = reviews.filter(r => 
        filterSubject === '' || r.subject_code.toLowerCase().includes(filterSubject.toLowerCase())
    );

    if (loading) {
        return (
            <main className="page" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                <Skeleton width="100%" height="150px" borderRadius="15px" style={{ marginBottom: '20px' }} />
                <Skeleton width="100%" height="400px" borderRadius="15px" />
            </main>
        );
    }

    return (
        <main className="page page-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⭐ Manage Reviews</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>Review, filter, and remove spam reviews globally.</p>
                </div>
                <Link href="/admin">
                    <button style={{
                        background: 'transparent',
                        border: '1px solid var(--accent-primary)',
                        color: 'var(--accent-primary)',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    }}>
                        ← Back to Nexus
                    </button>
                </Link>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ flex: 1, maxWidth: '300px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Filter by Subject Code
                    </label>
                    <input 
                        type="text" 
                        placeholder="e.g. CS101" 
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 15px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '1rem'
                        }}
                    />
                </div>
                <div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Showing {filteredReviews.length} reviews</p>
                </div>
            </div>

            {/* Reviews Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {filteredReviews.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>No reviews found.</p>
                    </div>
                ) : (
                    filteredReviews.map((review, index) => {
                        const isBot = review.user_id === 'admin-bulk-import';
                        return (
                            <div key={review.id} className="glass-card" style={{ 
                                padding: '25px', 
                                borderRadius: '16px', 
                                display: 'flex', 
                                flexDirection: 'column',
                                borderTop: `4px solid ${isBot ? '#10b981' : '#6366f1'}`,
                                position: 'relative'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <span style={{ 
                                            background: 'var(--primary)', 
                                            color: 'white', 
                                            padding: '4px 10px', 
                                            borderRadius: '6px',
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem'
                                        }}>
                                            Sr. {filteredReviews.length - index}
                                        </span>
                                        <span style={{ 
                                            background: 'rgba(99, 102, 241, 0.1)', 
                                            color: '#6366f1', 
                                            padding: '4px 10px', 
                                            borderRadius: '6px',
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem'
                                        }}>
                                            {review.subject_code}
                                        </span>
                                        <p style={{ margin: '8px 0 0 0', width: '100%', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(review.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: isBot ? '#10b981' : 'var(--text-secondary)' }}>
                                            {isBot ? '🤖 Bot' : '👤 User'}
                                        </span>
                                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>★ {review.rating}</span>
                                    </div>
                                </div>
                                
                                <div style={{ 
                                    background: 'var(--bg-primary)', 
                                    padding: '15px', 
                                    borderRadius: '8px', 
                                    flex: 1,
                                    marginBottom: '20px',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-wrap',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    {review.comment}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Term: {review.term === 'midterm' ? 'Midterm' : 'Final'}
                                    </span>
                                    <button 
                                        onClick={() => handleDelete(review.id)}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            color: '#ef4444',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                    >
                                        Delete Spam
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <style jsx global>{`
                .glass-card {
                    background: var(--bg-card);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    border: 1px solid var(--border-color);
                }
            `}</style>
        </main>
    );
}
