'use client';
import { useState, useEffect } from 'react';
import LivePulse from '@/components/LivePulse';
import { motion } from 'framer-motion';

interface Paper {
    id: string;
    subject_code: string;
    term: string;
    exam_date: string;
    exam_time: string;
    content: string;
    created_at: string;
}

export default function SharePaperPage() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form State
    const [subjectCode, setSubjectCode] = useState('');
    const [term, setTerm] = useState('midterm');
    const [examDate, setExamDate] = useState('');
    const [examTime, setExamTime] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTermFilter, setSearchTermFilter] = useState('all'); // all, midterm, final

    useEffect(() => {
        fetchPapers();
    }, [searchQuery, searchTermFilter]);

    const fetchPapers = async () => {
        setLoading(true);
        try {
            const url = new URL('/api/papers', window.location.origin);
            if (searchQuery) url.searchParams.append('search', searchQuery);
            if (searchTermFilter !== 'all') url.searchParams.append('term', searchTermFilter);
            
            const res = await fetch(url.toString());
            const data = await res.json();
            if (data.success) {
                setPapers(data.papers);
            }
        } catch (error) {
            console.error('Failed to fetch papers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('/api/papers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject_code: subjectCode,
                    term,
                    exam_date: examDate,
                    exam_time: examTime,
                    content
                })
            });

            const data = await res.json();
            
            if (data.success) {
                setMessage({ text: 'Paper shared successfully!', type: 'success' });
                setSubjectCode('');
                setExamDate('');
                setExamTime('');
                setContent('');
                fetchPapers(); // Refresh the list
            } else {
                setMessage({ text: data.error || 'Failed to share paper.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'An error occurred while sharing the paper.', type: 'error' });
        } finally {
            setSubmitting(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        }
    };

    return (
        <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 20px)', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
            <div className="solution-bg-text">HM NEXORA</div>
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 900 }}
                    >
                        <span style={{ 
                            background: 'var(--accent-gradient)', 
                            WebkitBackgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 2px 10px rgba(34, 211, 238, 0.3))'
                        }}>HM nexora</span> 
                        <span style={{ fontSize: '1.4rem', color: 'var(--text-muted)', fontWeight: '500', opacity: 0.8 }}>| Share Paper</span>
                    </motion.h1>
                    <LivePulse />
                </div>

                <div className="responsive-grid" style={{ gridTemplateColumns: '350px 1fr', gap: '30px', alignItems: 'start' }}>
                    
                    {/* LEFT PANEL: SHARE PAPER FORM */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card glass-card-navy" 
                        style={{ padding: '24px', position: 'sticky', top: 'calc(var(--nav-height) + 20px)' }}
                    >
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--accent-secondary)' }}>Γ£ê∩╕Å</span> Share Paper
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject Code *</label>
                                <input 
                                    type="text" 
                                    className="form-input glow-border-cyan" 
                                    placeholder="e.g. CS101" 
                                    required
                                    value={subjectCode}
                                    onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Exam Term *</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input 
                                            type="radio" 
                                            name="term" 
                                            value="midterm" 
                                            checked={term === 'midterm'}
                                            onChange={(e) => setTerm(e.target.value)}
                                            style={{ accentColor: 'var(--accent-secondary)' }}
                                        /> Midterm
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input 
                                            type="radio" 
                                            name="term" 
                                            value="final" 
                                            checked={term === 'final'}
                                            onChange={(e) => setTerm(e.target.value)}
                                            style={{ accentColor: 'var(--accent-secondary)' }}
                                        /> Final Term
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Exam Date</label>
                                    <input 
                                        type="date" 
                                        className="form-input" 
                                        value={examDate}
                                        onChange={(e) => setExamDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</label>
                                    <input 
                                        type="time" 
                                        className="form-input" 
                                        value={examTime}
                                        onChange={(e) => setExamTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paper Content *</label>
                                <textarea 
                                    className="form-input glow-border-cyan" 
                                    placeholder="Type your questions here..." 
                                    required
                                    rows={8}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>

                            {message.text && (
                                <div style={{ 
                                    padding: '10px', 
                                    borderRadius: '8px', 
                                    fontSize: '0.9rem',
                                    background: message.type === 'success' ? 'var(--success-bg)' : 'var(--error-bg)',
                                    color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                                    border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`
                                }}>
                                    {message.text}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={submitting}
                                style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '8px' }}
                            >
                                {submitting ? 'Sharing...' : 'Share Paper'}
                            </button>
                        </form>
                    </motion.div>

                    {/* RIGHT PANEL: FEED */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                    >
                        
                        {/* Announcement Banner */}
                        <div className="card" style={{ 
                            background: 'rgba(245, 158, 11, 0.05)', 
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            padding: '16px 24px',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '24px', color: 'var(--warning)' }}>≡ƒôó</div>
                            <div>
                                <h3 style={{ color: 'var(--warning)', fontSize: '0.9rem', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Announcement by Admin</h3>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    Kindly be serious and relevant. Everyone's time is precious in exam days.
                                </p>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
                                <input 
                                    type="text" 
                                    className="form-input glow-border-cyan" 
                                    placeholder="E.G. ENG101" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                    style={{ paddingLeft: '40px', background: 'var(--bg-card)' }}
                                />
                                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>≡ƒöì</span>
                            </div>
                            
                            <select 
                                className="form-input" 
                                value={searchTermFilter}
                                onChange={(e) => setSearchTermFilter(e.target.value)}
                                style={{ width: 'auto', background: 'var(--bg-card)', cursor: 'pointer' }}
                            >
                                <option value="all">All Exams</option>
                                <option value="midterm">Midterms Only</option>
                                <option value="final">Finals Only</option>
                            </select>
                        </div>

                        {/* Papers List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Loading papers...
                                </div>
                            ) : papers.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)' }}>
                                    <div style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '16px' }}>≡ƒôä</div>
                                    <h3 style={{ color: 'var(--text-secondary)' }}>No papers available yet.</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Be the first to share your exam experience!</p>
                                </div>
                            ) : (
                                papers.map((paper) => (
                                    <div key={paper.id} className="card glass-card-navy neural-entrance" style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <span className="badge" style={{ 
                                                    background: 'var(--accent-glow)', 
                                                    color: 'var(--accent-secondary)',
                                                    border: '1px solid var(--accent-secondary)',
                                                    fontSize: '1.1rem',
                                                    padding: '6px 12px'
                                                }}>
                                                    {paper.subject_code}
                                                </span>
                                                <span className="badge" style={{
                                                    background: paper.term === 'midterm' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                                    color: paper.term === 'midterm' ? '#10b981' : '#8b5cf6',
                                                    border: `1px solid ${paper.term === 'midterm' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`
                                                }}>
                                                    {paper.term === 'midterm' ? 'Midterm' : 'Final Term'}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {paper.exam_date && <div>≡ƒôà {paper.exam_date}</div>}
                                                {paper.exam_time && <div>ΓÅ░ {paper.exam_time}</div>}
                                                <div style={{ marginTop: '4px', opacity: 0.7 }}>
                                                    {new Date(paper.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ 
                                            background: 'var(--bg-primary)', 
                                            padding: '16px', 
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border-color)',
                                            color: 'var(--text-secondary)',
                                            whiteSpace: 'pre-wrap',
                                            lineHeight: '1.6',
                                            fontSize: '0.95rem'
                                        }}>
                                            {paper.content}
                                        </div>
                                        
                                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                            <a 
                                                href={`https://wa.me/923177180123?text=${encodeURIComponent(`≡ƒôÜ *New ${paper.term === 'midterm' ? 'Midterm' : 'Final Term'} Paper Shared!*\n\n*Subject:* ${paper.subject_code}\n*Date:* ${paper.exam_date || 'N/A'}\n\n*Questions:*\n${paper.content}\n\nShared via HM nexora Γ£¿`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn"
                                                style={{ 
                                                    background: '#25D366', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    padding: '8px 16px', 
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)'
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                                </svg>
                                                Share to WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
}
