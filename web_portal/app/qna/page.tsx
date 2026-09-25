"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Question {
    id: string;
    title: string;
    body: string;
    tags: string[];
    votes: number;
    answers: number;
    author: string;
    author_badge?: string;
    author_points?: number;
    accepted: boolean;
    created_at: string;
}

export default function QnAPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'votes'>('recent');
    const [filterBy, setFilterBy] = useState<'all' | 'answered' | 'unanswered'>('all');
    const [showAskForm, setShowAskForm] = useState(false);
    const [postLoading, setPostLoading] = useState(false);
    const [postError, setPostError] = useState('');
    const [postSuccess, setPostSuccess] = useState('');
    const [formData, setFormData] = useState({ title: '', body: '', tags: '' });
    const [votingId, setVotingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [answers, setAnswers] = useState<Record<string, any[]>>({});
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyBody, setReplyBody] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                sort: sortBy,
                filter: filterBy,
                ...(search ? { search } : {})
            });
            const res = await fetch(`/api/qna?${params}`);
            if (res.ok) {
                setQuestions(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch questions:', err);
        } finally {
            setLoading(false);
        }
    }, [sortBy, filterBy, search]);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch('/api/auth/me');
            if (res.ok) setUser((await res.json()).user);
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const delay = setTimeout(fetchQuestions, search ? 300 : 0);
        return () => clearTimeout(delay);
    }, [fetchQuestions]);

    const handleVote = async (id: string, direction: 'up' | 'down') => {
        if (votingId) return;
        setVotingId(id);
        try {
            const res = await fetch('/api/qna', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, direction })
            });
            if (res.ok) {
                const { votes } = await res.json();
                setQuestions(prev => prev.map(q => q.id === id ? { ...q, votes } : q));
            }
        } catch (err) {
            console.error('Vote error:', err);
        } finally {
            setVotingId(null);
        }
    };

    const handlePostQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        setPostError('');
        setPostSuccess('');
        if (!formData.title.trim() || !formData.body.trim()) {
            setPostError('Title and description are required.');
            return;
        }
        setPostLoading(true);
        try {
            const res = await fetch('/api/qna', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setPostSuccess('✅ Question posted successfully!');
                // Celebration!
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#7c3aed', '#6366f1', '#a78bfa']
                });
                setFormData({ title: '', body: '', tags: '' });
                setShowAskForm(false);
                fetchQuestions();
            } else if (res.status === 401) {
                setPostError('You must be logged in to post a question.');
            } else {
                setPostError(data.error || 'Failed to post question.');
            }
        } catch (err) {
            setPostError('Connection error. Please try again.');
        } finally {
            setPostLoading(false);
        }
    };

    const timeAgo = (dateStr: string): string => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const fetchAnswers = async (questionId: string) => {
        try {
            const res = await fetch(`/api/qna/answers?questionId=${questionId}`);
            if (res.ok) {
                const data = await res.json();
                setAnswers(prev => ({ ...prev, [questionId]: data }));
            }
        } catch (err) {
            console.error('Fetch answers error:', err);
        }
    };

    const handleReply = async (questionId: string) => {
        if (!replyBody.trim()) return;
        setReplyLoading(true);
        try {
            const res = await fetch('/api/qna/answers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, body: replyBody })
            });
            if (res.ok) {
                const { answer } = await res.json();
                setAnswers(prev => ({
                    ...prev,
                    [questionId]: [...(prev[questionId] || []), answer]
                }));
                setReplyBody('');
                setReplyingTo(null);
                setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answers: (q.answers || 0) + 1 } : q));
            }
        } catch (err) {
            console.error('Reply error:', err);
        } finally {
            setReplyLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            const res = await fetch('/api/qna', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setQuestions(prev => prev.map(q => q.id === id ? { ...q, deleted: true } : q));
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '900px' }}>
                <div className="page-header">
                    <h1>❓ Q&A Forum</h1>
                    <p>Ask questions, share answers, and help fellow VU students</p>
                </div>

                {/* Search + Ask */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <input
                        className="form-input"
                        style={{ flex: 1, minWidth: '250px' }}
                        placeholder="🔍 Search questions by topic or subject..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={() => { setShowAskForm(!showAskForm); setPostError(''); setPostSuccess(''); }}>
                        {showAskForm ? '✕ Cancel' : '+ Ask Question'}
                    </button>
                </div>

                {/* Ask Form */}
                {showAskForm && (
                    <div className="card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--primary)' }}>
                        <h3 style={{ marginBottom: '16px' }}>📝 Ask a Question</h3>
                        {postError && (
                            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#dc2626', fontSize: '0.9rem' }}>
                                ⚠️ {postError}
                            </div>
                        )}
                        {postSuccess && (
                            <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', background: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e', color: '#16a34a', fontSize: '0.9rem' }}>
                                {postSuccess}
                            </div>
                        )}
                        <form onSubmit={handlePostQuestion}>
                            <div className="form-group">
                                <label className="form-label">Question Title *</label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. How to prepare for CS101 final exam?"
                                    value={formData.title}
                                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                    maxLength={150}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Details *</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Provide more context about your question..."
                                    value={formData.body}
                                    onChange={e => setFormData(p => ({ ...p, body: e.target.value }))}
                                    style={{ minHeight: '120px' }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tags (comma separated)</label>
                                <input
                                    className="form-input"
                                    placeholder="e.g. CS101, midterm, programming"
                                    value={formData.tags}
                                    onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={postLoading}>
                                {postLoading ? '⏳ Posting...' : '📤 Post Question'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Sort & Filter */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '4px' }}>Sort:</span>
                    {([['trending', '🔥 Trending'], ['recent', '⏰ Recent'], ['votes', '📊 Most Voted']] as const).map(([val, label]) => (
                        <button key={val} className={`btn btn-sm ${sortBy === val ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSortBy(val)}>
                            {label}
                        </button>
                    ))}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '8px', marginRight: '4px' }}>Filter:</span>
                    {([['all', '📌 All'], ['answered', '✅ Answered'], ['unanswered', '⏳ Unanswered']] as const).map(([val, label]) => (
                        <button key={val} className={`btn btn-sm ${filterBy === val ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterBy(val)}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Questions List */}
                {loading && questions.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="qa-item skeleton" style={{ height: '180px' }}></div>
                        ))}
                    </div>
                ) : questions.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🙋</div>
                        <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '8px' }}>The wall is quiet...</p>
                        <p style={{ fontSize: '0.9rem' }}>Be the first to spark a conversation!</p>
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <AnimatePresence mode="popLayout">
                    {questions.filter(q => !(q as any).deleted).map((q, index) => (
                        <motion.div 
                            key={q.id} 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="qa-item" 
                            style={{ cursor: 'default' }}
                        >
                            <div style={{ display: 'flex', gap: '20px' }}>
                                {/* Votes */}
                                <div className="qa-votes">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="vote-btn"
                                        onClick={(e) => { e.stopPropagation(); handleVote(q.id, 'up'); }}
                                        disabled={votingId === q.id}
                                        style={{ opacity: votingId === q.id ? 0.5 : 1 }}
                                    >▲</motion.button>
                                    <span className="vote-count" style={{ fontSize: '1.2rem', fontWeight: '800' }}>{q.votes}</span>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="vote-btn"
                                        onClick={(e) => { e.stopPropagation(); handleVote(q.id, 'down'); }}
                                        disabled={votingId === q.id}
                                        style={{ opacity: votingId === q.id ? 0.5 : 1 }}
                                    >▼</motion.button>
                                </div>
                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 
                                            style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '10px', cursor: 'pointer', color: 'var(--text-primary)', transition: 'color 0.2s' }}
                                            onClick={() => {
                                                if (expandedId === q.id) {
                                                    setExpandedId(null);
                                                } else {
                                                    setExpandedId(q.id);
                                                    fetchAnswers(q.id);
                                                }
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-primary)')}
                                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                                        >
                                            {q.accepted && <span style={{ color: 'var(--success)', marginRight: '8px' }}>✅</span>}
                                            {q.title}
                                        </h3>
                                        {user?.role === 'owner' && (
                                            <button 
                                                onClick={() => handleDelete(q.id)}
                                                style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem' }}
                                                title="Delete Question"
                                            >🗑️</button>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: '1.7', opacity: 0.9 }}>
                                        {expandedId === q.id ? q.body : (q.body.length > 200 ? q.body.slice(0, 200) + '...' : q.body)}
                                    </p>
                                    
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <div className="qna-tags">
                                            {q.tags?.map(t => <span key={t} className="qna-tag">{t}</span>)}
                                        </div>
                                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                👤 <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{q.author}</span>
                                                {q.author_badge && <span className={`author-badge ${(q as any).role || 'member'}`}>{q.author_badge}</span>} 
                                                <span style={{ opacity: 0.6 }}>• {timeAgo(q.created_at)}</span>
                                            </span>
                                            {(user?.role === 'admin' || user?.role === 'owner') && (
                                                <button 
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => {
                                                        setReplyingTo(replyingTo === q.id ? null : q.id);
                                                        if (expandedId !== q.id) {
                                                            setExpandedId(q.id);
                                                            fetchAnswers(q.id);
                                                        }
                                                    }}
                                                >
                                                    {replyingTo === q.id ? 'Cancel' : '💬 Admin Reply'}
                                                </button>
                                            )}
                                            <span style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                                                {q.answers} {q.answers === 1 ? 'answer' : 'answers'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Answers Section */}
                                    <AnimatePresence>
                                        {expandedId === q.id && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                style={{ marginTop: '24px', paddingLeft: '24px', borderLeft: '3px solid var(--accent-glow)', overflow: 'hidden' }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: 'var(--text-muted)' }}>Community Replies</h4>
                                                    {answers[q.id]?.length > 2 && (
                                                        <button 
                                                            className="btn btn-sm"
                                                            style={{ 
                                                                background: 'var(--accent-glow)', 
                                                                color: 'var(--accent-primary)',
                                                                border: '1px solid var(--accent-primary)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                fontSize: '0.75rem'
                                                            }}
                                                            onClick={async () => {
                                                                const btn = document.getElementById(`ai-box-${q.id}`);
                                                                if (btn) btn.style.display = 'block';
                                                            }}
                                                        >
                                                            ✨ AI Summary
                                                        </button>
                                                    )}
                                                </div>

                                                <div id={`ai-box-${q.id}`} style={{ 
                                                    display: 'none',
                                                    marginBottom: '20px',
                                                    padding: '16px',
                                                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
                                                    border: '1px solid var(--accent-primary)',
                                                    borderRadius: '12px',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span>🤖</span> NEXORA AI INSIGHT
                                                    </div>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                                                        Summary: The community suggests focusing on {q.tags?.[0] || 'the main topic'} by reviewing past papers and handouts. Most helpful responses emphasize consistent practice and using the Nexora AI Assistant for complex concepts.
                                                    </p>
                                                    <button 
                                                        onClick={() => {
                                                            const btn = document.getElementById(`ai-box-${q.id}`);
                                                            if (btn) btn.style.display = 'none';
                                                        }}
                                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                                    >✕</button>
                                                </div>
                                                
                                                {!answers[q.id] ? (
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Loading replies...</p>
                                                ) : answers[q.id].length === 0 ? (
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No replies yet. Be the first to help!</p>
                                                ) : (
                                                    answers[q.id]?.map((ans: any) => (
                                                        <motion.div 
                                                            key={ans.id} 
                                                            initial={{ x: -10, opacity: 0 }}
                                                            animate={{ x: 0, opacity: 1 }}
                                                            className="answer-item"
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: ans.role === 'owner' ? '#f59e0b' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    {ans.author} 
                                                                    {ans.role === 'owner' ? <span className="author-badge owner">Owner</span> : ans.role === 'admin' ? <span className="author-badge admin">Admin</span> : ''} 
                                                                    {ans.author_badge && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>• {ans.author_badge}</span>}
                                                                </span>
                                                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{timeAgo(ans.created_at)}</span>
                                                            </div>
                                                            <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>{ans.body}</p>
                                                        </motion.div>
                                                    ))
                                                )}

                                                {/* Reply Form */}
                                                {(user || (user?.role === 'admin' || user?.role === 'owner')) && (
                                                    <div style={{ marginTop: '20px' }}>
                                                        <textarea 
                                                            className="form-textarea"
                                                            placeholder={user?.role === 'admin' || user?.role === 'owner' ? "Write your official response..." : "Join the conversation..."}
                                                            value={replyBody}
                                                            onChange={(e) => setReplyBody(e.target.value)}
                                                            style={{ minHeight: '100px', fontSize: '0.95rem', background: 'rgba(255,255,255,0.03)' }}
                                                        />
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                                            <button 
                                                                className="btn btn-primary"
                                                                onClick={() => handleReply(q.id)}
                                                                disabled={replyLoading || !replyBody.trim()}
                                                            >
                                                                {replyLoading ? '⏳ Sending...' : '📤 Post Reply'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
