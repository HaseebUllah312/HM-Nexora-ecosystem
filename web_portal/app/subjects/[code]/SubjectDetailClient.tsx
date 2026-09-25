'use client';

import { useState, useEffect, useCallback } from 'react';
import PollsSection from '@/app/components/PollsSection';
import { useDownloadManager } from '@/app/lib/hooks/useDownloadManager';
import OfflineSyncButton from '@/components/study/OfflineSyncButton';

const sections = ['All', 'Handouts', 'Midterm Files', 'Final Term Files', 'Solved Assignments', 'GDB Solutions', 'Quiz Files', 'Past Papers', 'Short Notes'];

const categoryLinks: Record<string, string> = {
    'Computer Science': 'https://drive.google.com/drive/folders/1gn9vOlBosa4sco-W_NvgGWgCV432sLdu?usp=drive_link',
    'Management': 'https://drive.google.com/drive/folders/1yLr8EX3ehDdGdhsKI0YZna9Kk2JbtjZe?usp=drive_link',
    'Mathematics': 'https://drive.google.com/drive/folders/11iCga1LlWk5EvpcZykWNr_glURgUeNeo?usp=drive_link',
    'Science': 'https://drive.google.com/drive/folders/11iCga1LlWk5EvpcZykWNr_glURgUeNeo?usp=drive_link',
    'English': 'https://drive.google.com/drive/folders/1zJW41VjmF7YZJU8OfE2TWMk3jXQ0okcD',
    'General': 'https://drive.google.com/drive/folders/1QI9_QgYZU88uulylWksI3mKXECYDkSHB',
    'Others': 'https://drive.google.com/drive/folders/1i3v79NvfvB6-gCq1KgB-jwSLl3OoX9_O',
};

interface SubjectDetailClientProps {
    code: string;
    initialSubject: any;
    initialResources: any[];
}

export default function SubjectDetailClient({ code, initialSubject, initialResources }: SubjectDetailClientProps) {
    const [subject, setSubject] = useState<any>(initialSubject);
    const [dynamicResources, setDynamicResources] = useState<any[]>(initialResources);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [reviewTab, setReviewTab] = useState<'midterm' | 'final'>('midterm');
    const [userRating, setUserRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviews, setReviews] = useState<any[]>([]);
    const [isReviewsLoading, setIsReviewsLoading] = useState(true);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const { prefetchFile } = useDownloadManager();

    // Fetch User
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setCurrentUser(data.user);
            })
            .catch(err => console.error('Auth check error:', err));
    }, []);

    // Merge static resources from subjects.ts with dynamic ones from Supabase
    const allResources = [...(dynamicResources || []), ...(subject?.resources || [])];

    // Background prefetching for small files
    useEffect(() => {
        if (allResources.length > 0) {
            // Only prefetch the first few small files to avoid overwhelming the network
            allResources.slice(0, 5).forEach(f => {
                let fileId = '';
                if (f.link?.startsWith('/api/download/')) {
                    fileId = f.link.replace('/api/download/', '').split('?')[0];
                } else if (f.link?.includes('/file/d/')) {
                    fileId = f.link.split('/file/d/')[1].split('/')[0];
                }

                if (fileId) {
                    prefetchFile(fileId, f.title || 'Resource', f.size || 0);
                }
            });
        }
    }, [allResources, prefetchFile]);

    // Fetch Reviews
    const fetchReviews = useCallback(async () => {
        setIsReviewsLoading(true);
        try {
            const res = await fetch(`/api/subjects/${code}/reviews?term=${reviewTab}`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setIsReviewsLoading(false);
        }
    }, [code, reviewTab]);

    useEffect(() => {
        if (code) {
            fetchReviews();
        }
    }, [code, fetchReviews]);

    const handleSubmitReview = async () => {
        if (!currentUser) return alert('Please log in to submit a review.');
        if (userRating === 0 || !reviewText.trim()) return alert('Please provide a rating and a comment.');

        setIsSubmittingReview(true);
        try {
            const res = await fetch(`/api/subjects/${code}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: userRating, comment: reviewText, term: reviewTab })
            });

            if (res.ok) {
                setUserRating(0);
                setReviewText('');
                fetchReviews(); // Refresh the list
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            const res = await fetch(`/api/subjects/${code}/reviews?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setReviews(prev => prev.filter(r => r.id !== id));
            } else {
                alert('Failed to delete review');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        }
    };

    const handleSummarizeReviews = async () => {
        if (reviews.length === 0) return alert('Not enough reviews to summarize yet!');
        setIsSummarizing(true);
        try {
            const res = await fetch(`/api/subjects/${code}/summarize-reviews`, {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok) {
                setAiSummary(data.summary);
            } else {
                alert(data.error || 'Failed to generate summary');
            }
        } catch (error) {
            console.error('Summarize error:', error);
            alert('An error occurred while generating the summary.');
        } finally {
            setIsSummarizing(false);
        }
    };

    if (!subject && !isLoading && allResources.length === 0) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
                    <h1>Subject Not Found</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>The subject code &quot;{code}&quot; was not found in our database.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page" style={{ padding: 0 }}>
            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span className="badge badge-primary" style={{ fontSize: '1.1rem', padding: '6px 16px' }}>{subject?.code}</span>
                    <span className={`diff-${subject?.difficulty?.toLowerCase().replace(' ', '') || 'medium'}`}>{subject?.difficulty || 'Medium'}</span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '16px' }}>{subject.name}</h1>

                <div style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    padding: '24px',
                    marginBottom: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📘</span> Introduction to {subject?.code || code}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', margin: 0 }}>
                        {subject.description
                            ? subject.description
                            : `Welcome to the complete resource hub for ${subject.code} (${subject.name}), a ${subject.credit_hours || subject.creditHours || 3}-credit hour course. Access all verified handouts, past papers, solved assignments, midterm/final term files, and quizzes below to boost your preparation. Navigate through the tabs to find exactly what you need.`}
                    </p>
                </div>

                <div className="stat-grid" style={{ marginTop: '24px' }}>
                    <div className="stat-card"><div className="stat-number">{(subject?.rating || 0).toFixed(1)}</div><div className="stat-label">Rating</div></div>
                    <div className="stat-card"><div className="stat-number">{allResources.length}</div><div className="stat-label">Files</div></div>
                    <div className="stat-card"><div className="stat-number">{(subject?.downloads || 0).toLocaleString()}</div><div className="stat-label">Downloads</div></div>
                    <div className="stat-card"><div className="stat-number">{reviews.length}</div><div className="stat-label">Reviews</div></div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <a href={`/quiz/${subject?.code || code}`} className="btn btn-success" style={{ padding: '12px 24px', fontSize: '1.1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        🧠 Start Topic-Wise Quiz
                    </a>
                    <OfflineSyncButton 
                        subjectCode={code} 
                        files={allResources.map(f => ({ link: f.link, title: f.title }))} 
                    />
                </div>

                <div style={{ marginTop: '16px', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                    <strong>Teachers:</strong> {subject.teachers && subject.teachers.length > 0 ? subject.teachers.join(' • ') : 'TBA'} &nbsp; | &nbsp; <strong>Credit Hours:</strong> {subject.credit_hours || subject.creditHours || 3}
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {sections.map((sec, i) => (
                    <button key={i} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                        {sec}
                    </button>
                ))}
            </div>

            {/* Files */}
            <h3 style={{ marginBottom: '16px' }}>{sections[activeTab]}</h3>
            <div style={{ marginBottom: '40px' }}>
                {isLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading files...</div>
                ) : allResources.length > 0 ? (
                    (() => {
                        const activeCategory = sections[activeTab];
                        const categoryFiles = activeCategory === 'All' ? allResources : allResources.filter(f => f.type?.toLowerCase() === activeCategory.toLowerCase());

                        // Build proxy view/download links — hides Google Drive from users
                        const getDriveLinks = (link: string, title?: string) => {
                            if (!link) return { view: '#', download: '#' };

                            // If it's already a full direct HTTP link (like Supabase Storage), use it directly
                            if (link.startsWith('http')) {
                                return { view: link, download: link };
                            }

                            let fileId = '';
                            const encodedTitle = title ? encodeURIComponent(title) : '';

                            // Our proxy URL format: /api/download/DRIVE_FILE_ID
                            if (link.startsWith('/api/download/')) {
                                fileId = link.replace('/api/download/', '').split('?')[0];
                            }
                            // Local uploads directory (legacy support - will be proxied internally)
                            else if (link.startsWith('/uploads/')) {
                                return { view: link, download: link };
                            }
                            // Standard Google Drive URL formats (legacy)
                            else if (link.includes('/file/d/')) {
                                fileId = link.split('/file/d/')[1].split('/')[0];
                            } else if (link.includes('id=')) {
                                fileId = link.split('id=')[1].split('&')[0];
                            } else if (!link.includes('/') && link.length > 15) {
                                fileId = link; // Treat raw string as drive ID
                            }

                            if (fileId) {
                                return {
                                    // Points to our beautiful new viewer page
                                    view: `/view/${fileId}?title=${encodedTitle}`,
                                    download: `/api/download/${fileId}${encodedTitle ? `?title=${encodedTitle}` : ''}`
                                };
                            }

                            return { view: link, download: link };
                        };

                        if (categoryFiles.length === 0) {
                            return (
                                <div className="card" style={{ padding: '30px', textAlign: 'center', background: 'var(--card-bg-hover)' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📁</div>
                                    <h4>No {activeCategory} found</h4>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Be the first to upload a resource for {subject.code} in this category!</p>
                                </div>
                            );
                        }

                        return (
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{
                                    fontSize: '1.1rem',
                                    marginBottom: '12px',
                                    color: 'var(--accent-primary)',
                                    borderBottom: '2px solid var(--accent-primary)',
                                    paddingBottom: '8px'
                                }}>
                                    {activeCategory}
                                </h4>
                                {categoryFiles.map((f, i) => {
                                    const links = getDriveLinks(f.link, f.title);
                                    return (
                                        <div key={i} className="card" style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '12px',
                                            marginBottom: '12px',
                                            padding: '16px 20px',
                                            transition: 'transform 0.2s',
                                        }}>
                                            <div style={{ flex: 1, minWidth: '200px' }}>
                                                <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{f.title}</h4>
                                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                                    📄 {f.type || activeCategory}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <a
                                                    href={links.view}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ minWidth: '80px' }}
                                                >
                                                    👁 View
                                                </a>
                                                <a
                                                    href={links.download}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-primary btn-sm"
                                                    style={{ minWidth: '100px' }}
                                                >
                                                    ⬇ Download
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '40px', background: 'var(--card-bg-hover)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📂</div>
                        <h3>No specific files found for {subject.code}</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '8px auto 24px' }}>
                            We haven&apos;t indexed individual files for this subject yet. However, you can check our comprehensive archives.
                        </p>
                        <a href={categoryLinks[subject.category] || categoryLinks['Others']} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                            Access {subject.category} Archive on Drive ↗
                        </a>
                    </div>
                )}
            </div>

            {/* Reviews */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0 }}>⭐ Reviews & Ratings</h2>
                    <button 
                        onClick={handleSummarizeReviews} 
                        disabled={isSummarizing || reviews.length === 0}
                        className="btn btn-secondary btn-sm"
                        style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', fontWeight: 'bold' }}
                    >
                        {isSummarizing ? '✨ Generating...' : '✨ Auto-Summarize'}
                    </button>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
                    Total Reviews: {reviews.length}
                </div>
            </div>

            {aiSummary && (
                <div className="glass-card" style={{ 
                    marginBottom: '24px', 
                    padding: '25px', 
                    borderRadius: '16px', 
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                    <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1' }}>
                        ✨ AI Review Summary
                    </h3>
                    <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                        {aiSummary.split('\n').map((line, idx) => {
                            if (line.startsWith('### ')) {
                                return <h4 key={idx} style={{ marginTop: '15px', marginBottom: '5px', color: 'var(--text-primary)' }}>{line.replace('### ', '')}</h4>;
                            } else if (line.startsWith('* ') || line.startsWith('- ')) {
                                return <li key={idx} style={{ marginLeft: '20px' }}>{line.substring(2)}</li>;
                            } else if (line.trim() === '') {
                                return <br key={idx} />;
                            } else {
                                // Bold text handling
                                const parts = line.split(/(\*\*.*?\*\*)/g);
                                return (
                                    <p key={idx} style={{ margin: '0 0 5px 0' }}>
                                        {parts.map((part, i) => {
                                            if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={i}>{part.slice(2, -2)}</strong>;
                                            }
                                            return part;
                                        })}
                                    </p>
                                );
                            }
                        })}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button className={`btn ${reviewTab === 'midterm' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setReviewTab('midterm')}>Midterm Reviews</button>
                <button className={`btn ${reviewTab === 'final' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setReviewTab('final')}>Final Term Reviews</button>
            </div>

            {currentUser ? (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '12px' }}>Write a Review ({reviewTab === 'midterm' ? 'Midterm' : 'Final Term'})</h4>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className={`star ${userRating >= s ? 'active' : ''}`} onClick={() => setUserRating(s)} style={{ fontSize: '1.5rem', cursor: 'pointer', color: userRating >= s ? '#eab308' : '#cbd5e1' }}>★</span>
                        ))}
                    </div>
                    <textarea
                        className="form-textarea"
                        placeholder="Share your experience with this subject..."
                        style={{ marginBottom: '12px' }}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleSubmitReview} disabled={isSubmittingReview}>
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            ) : (
                <div className="card" style={{ marginBottom: '24px', textAlign: 'center', padding: '20px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>You must be logged in to write a review.</p>
                    <a href="/login" className="btn btn-secondary btn-sm" style={{ marginTop: '10px', display: 'inline-block' }}>Log In</a>
                </div>
            )}

            <div style={{ background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.3)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.95rem' }}>📱 <strong>Get the latest past papers & updates directly on WhatsApp!</strong></span>
                <a href="https://whatsapp.com/channel/0029Vb5PcRb11ulIA5AYpj2K" target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm" style={{ background: '#25D366', color: 'white', border: 'none', padding: '6px 12px' }}>
                    Join Channel
                </a>
            </div>

            {isReviewsLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border)', marginBottom: '40px' }}>
                    <p>No reviews have been posted for this category yet. Be the first to review!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                    {reviews.map((rev, index) => (
                        <div key={rev.id} style={{
                            background: 'var(--bg-secondary)',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ 
                                        background: 'var(--accent-primary)', 
                                        color: 'white', 
                                        width: '24px', 
                                        height: '24px', 
                                        borderRadius: '50%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontWeight: 'bold', 
                                        fontSize: '0.8rem' 
                                    }}>
                                        {index + 1}
                                    </div>
                                    {rev.avatar_url ? (
                                        <img src={rev.avatar_url?.startsWith('http') ? rev.avatar_url : `/api/download/${rev.avatar_url}?mode=inline`} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {rev.username?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{rev.username}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                </div>
                                {currentUser?.role === 'owner' && (
                                    <button
                                        onClick={() => handleDeleteReview(rev.id)}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            color: '#ef4444',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        🗑️ Delete
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', color: '#eab308' }}>
                                {[...Array(5)].map((_, i) => <span key={i}>{i < rev.rating ? '★' : '☆'}</span>)}
                            </div>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>{rev.comment}</p>
                            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <button 
                                        onClick={() => setLikedReviews(prev => ({...prev, [rev.id]: !prev[rev.id]}))}
                                        style={{ 
                                            background: 'transparent', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            fontSize: '1.2rem',
                                            transition: 'transform 0.1s ease-in-out',
                                            transform: likedReviews[rev.id] ? 'scale(1.1)' : 'scale(1)',
                                            color: likedReviews[rev.id] ? '#ef4444' : 'var(--text-muted)'
                                        }}
                                    >
                                        {likedReviews[rev.id] ? '❤️' : '🤍'}
                                    </button>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {likedReviews[rev.id] ? 'You loved this' : 'React'}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => {
                                        const text = `📖 *${subject?.code || code} - ${reviewTab === 'midterm' ? 'Midterm' : 'Final Term'} Review*\n\n${rev.comment}\n\n📱 *Follow VU Toolkit for more updates:* \nhttps://whatsapp.com/channel/0029Vb5PcRb11ulIA5AYpj2K`;
                                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    style={{
                                        background: '#25D366',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#1da851'}
                                    onMouseOut={(e) => e.currentTarget.style.background = '#25D366'}
                                >
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                                    </svg>
                                    Share
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Question Polls */}
            <PollsSection subjectCode={code} />
        </div>
    );
}
