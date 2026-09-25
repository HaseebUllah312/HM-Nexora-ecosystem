'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Review {
    id: string;
    subject_code: string;
    term: string;
    username: string;
    rating: number;
    comment: string;
    created_at: string;
}

export default function GlobalReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTermFilter, setSearchTermFilter] = useState('all');
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
    const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
    const [generatingSummary, setGeneratingSummary] = useState(false);
    const [showAiChat, setShowAiChat] = useState(false);
    const [aiChatInput, setAiChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, generatingSummary]);

    useEffect(() => {
        checkAdmin();
    }, []);

    useEffect(() => {
        fetchReviews();
        // Clear chat if user does a manual search
        if (!showAiChat) {
            setChatMessages([]);
        }
    }, [searchQuery, searchTermFilter]);

    const checkAdmin = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                if (data.user && (data.user.role === 'admin' || data.user.role === 'owner')) {
                    setIsAdmin(true);
                }
            }
        } catch (error) {
            console.error('Failed to check admin status', error);
        }
    };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const url = new URL('/api/public-reviews', window.location.origin);
            if (searchQuery) url.searchParams.append('search', searchQuery);
            if (searchTermFilter !== 'all') url.searchParams.append('term', searchTermFilter);
            
            const res = await fetch(url.toString());
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateAISummary = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const promptText = aiChatInput.trim();
        if (!promptText) return;

        const newMessages = [...chatMessages, { role: 'user', content: promptText }];
        setChatMessages(newMessages);
        setAiChatInput('');
        setGeneratingSummary(true);
        
        try {
            const res = await fetch('/api/ai-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages })
            });
            const data = await res.json();
            if (data.success) {
                setChatMessages([...newMessages, { role: 'assistant', content: data.summary }]);
                
                // Optionally set search query if AI detected a subject and search is empty
                if (data.subjectDetected && !searchQuery) {
                    setSearchQuery(data.subjectDetected);
                }
            } else {
                alert('AI Error: ' + data.error);
            }
        } catch (err) {
            alert('Failed to get AI response.');
        } finally {
            setGeneratingSummary(false);
        }
    };

    const handleSelectReview = (id: string) => {
        setSelectedReviews(prev => 
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const getMultiShareLink = () => {
        const selected = reviews.filter(r => selectedReviews.includes(r.id));
        if (selected.length === 0) return '#';
        
        let text = `📚 *New Student Reviews Shared!*\n\n`;
        selected.forEach((review, idx) => {
            text += `*${idx + 1}. ${review.subject_code}* (${review.term === 'midterm' ? 'Midterm' : 'Final'})\n`;
            text += `*By:* ${review.username} ⭐${review.rating}/5\n`;
            text += `*Experience:*\n${review.comment}\n\n`;
            text += `----------\n\n`;
        });
        
        text += `🌐 *View all reviews at:* https://hmnexora.tech/reviews\n\n✨ *Join our Channel:* https://whatsapp.com/channel/0029Vb5PcRb11ulIA5AYpj2K`;
        return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    };

    const exportAsText = () => {
        if (reviews.length === 0) return alert('No reviews to export.');
        const textContent = reviews.map(r => 
            `Subject: ${r.subject_code}\nTerm: ${r.term.toUpperCase()}\nUser: ${r.username}\nRating: ${r.rating}/5\n\nReview:\n${r.comment}\n\n${'-'.repeat(40)}\n`
        ).join('\n');
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HM_Nexora_Reviews_${searchTermFilter}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 20px)', paddingBottom: '120px', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative' }}>
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body, html, .page, main { background: #ffffff !important; color: #1f2937 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; min-height: auto !important; padding: 0 !important; margin: 0 !important; }
                    .print-hide, .float-btn-base, .chat-widget, .chat-toggle, [class*="whatsapp"], [class*="youtube"], [class*="float"] { display: none !important; }
                    .print-show { display: block !important; }
                    .card { 
                        border: 1px solid #e5e7eb !important; 
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important; 
                        break-inside: avoid; 
                        margin-bottom: 24px !important; 
                        border-radius: 12px !important; 
                        padding: 24px !important;
                        background: #ffffff !important;
                    }
                    .badge { 
                        font-weight: bold !important;
                        padding: 6px 14px !important; 
                        border-radius: 100px !important; 
                        border: none !important;
                    }
                    .badge-subject { background: #eff6ff !important; color: #2563eb !important; }
                    .badge-term-midterm { background: #f0fdf4 !important; color: #16a34a !important; }
                    .badge-term-final { background: #fdf4ff !important; color: #c026d3 !important; }
                    header, footer, nav, .btn, form { display: none !important; }
                    .print-text { 
                        color: #374151 !important; 
                        background: #f9fafb !important; 
                        border: 1px solid #f3f4f6 !important; 
                        border-radius: 8px !important;
                        padding: 16px !important;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 40px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #e5e7eb;
                    }
                    .print-header h1 {
                        color: #111827 !important;
                        font-size: 28px !important;
                        margin-bottom: 8px !important;
                        font-weight: 800 !important;
                    }
                    .print-header p {
                        color: #6b7280 !important;
                        font-size: 14px !important;
                        text-transform: uppercase !important;
                        letter-spacing: 1px !important;
                    }
                    .print-text-dark { color: #111827 !important; }
                }
            `}} />
            <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                <div className="print-show print-header" style={{ display: 'none' }}>
                    <h1>HM Nexora • Student Reviews</h1>
                    <p>Generated Official Document • Filter: {searchTermFilter.toUpperCase()}</p>
                </div>
                <div className="print-hide" style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '8px' }}
                    >
                        Recent <span style={{ color: 'var(--accent-secondary)' }}>Exam Reviews</span>
                    </motion.h1>
                    <p style={{ color: 'var(--text-muted)' }}>Browse the latest exam experiences shared by students.</p>
                </div>

                <div className="card print-hide" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '16px', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
                        <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
                            <input 
                                type="text" 
                                className="form-input glow-border-cyan" 
                                placeholder="Search e.g. CS101" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                style={{ paddingLeft: '40px', background: 'var(--bg-card)' }}
                            />
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
                        </div>
                        
                        <select 
                            className="form-input" 
                            value={searchTermFilter}
                            onChange={(e) => setSearchTermFilter(e.target.value)}
                            style={{ width: 'auto', background: 'var(--bg-card)', cursor: 'pointer' }}
                        >
                            <option value="all">All Terms</option>
                            <option value="midterm">Midterms Only</option>
                            <option value="final">Finals Only</option>
                        </select>

                        <div style={{ 
                            background: 'rgba(16, 185, 129, 0.1)', 
                            color: '#10b981', 
                            padding: '8px 12px', 
                            borderRadius: '8px', 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold', 
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            📝 Total Reviews: {reviews.length}
                        </div>

                        <button 
                            onClick={() => setShowAiChat(!showAiChat)}
                            className="btn print-hide"
                            style={{ 
                                background: showAiChat ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                fontSize: '0.9rem',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                boxShadow: showAiChat ? 'none' : '0 0 15px rgba(139, 92, 246, 0.4)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {showAiChat ? '❌ Close AI' : '🤖 Ask AI'}
                        </button>
                    </div>

                    {isAdmin && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={exportAsText} className="btn" style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-secondary)', border: '1px solid var(--accent-secondary)' }}>
                                📄 Export Text
                            </button>
                            <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                🖨️ Export PDF
                            </button>
                        </div>
                    )}
                </div>

                {/* AI Chat Inline Panel */}
                {showAiChat && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                        className="card print-show"
                        style={{
                            background: 'rgba(139, 92, 246, 0.05)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            padding: '24px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #8b5cf6, #3b82f6)' }} />
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.5rem' }}>🤖</span> HM Nexora AI Assistant
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', marginBottom: '20px', paddingRight: '12px' }}>
                            {chatMessages.length === 0 && !generatingSummary && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                                    Ask me to summarize reviews, or ask specific questions like "How do I solve the MCQ about Skimming?"
                                </div>
                            )}
                            
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' 
                                }}>
                                    <div style={{
                                        maxWidth: '85%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        background: msg.role === 'user' ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.05)',
                                        color: msg.role === 'user' ? '#fff' : 'var(--text-secondary)',
                                        border: msg.role === 'assistant' ? '1px solid rgba(139, 92, 246, 0.2)' : 'none',
                                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                                        borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '12px'
                                    }}>
                                        {msg.role === 'user' ? (
                                            <div>{msg.content}</div>
                                        ) : (
                                            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>').replace(/\n/g, '<br/>') }} />
                                        )}
                                    </div>
                                </div>
                            ))}

                            {generatingSummary && (
                                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#8b5cf6', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                                        <div style={{ width: '8px', height: '8px', background: '#8b5cf6', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                                        <div style={{ width: '8px', height: '8px', background: '#8b5cf6', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        
                        <form onSubmit={generateAISummary} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <input 
                                type="text"
                                className="form-input"
                                placeholder="Ask a question... (e.g. 'How is ENG201?')"
                                value={aiChatInput}
                                onChange={(e) => setAiChatInput(e.target.value)}
                                style={{ flex: '1 1 200px', minWidth: '0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                                disabled={generatingSummary}
                            />
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={!aiChatInput.trim() || generatingSummary}
                                style={{ flex: '1 1 auto', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', border: 'none', padding: '12px 24px' }}
                            >
                                {generatingSummary ? 'Thinking...' : 'Ask AI'}
                            </button>
                        </form>
                    </motion.div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)' }}>
                            <div style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '16px' }}>📝</div>
                            <h3 style={{ color: 'var(--text-secondary)' }}>No reviews found</h3>
                        </div>
                    ) : (
                        reviews.map((review, index) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={review.id} 
                                className="card glass-card-navy" 
                                style={{ 
                                    padding: '24px', 
                                    border: selectedReviews.includes(review.id) ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
                                    transition: 'border 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {isAdmin && (
                                            <input 
                                                type="checkbox"
                                                className="print-hide"
                                                checked={selectedReviews.includes(review.id)}
                                                onChange={() => handleSelectReview(review.id)}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-secondary)' }}
                                            />
                                        )}
                                        <span className="badge" style={{ 
                                            background: 'var(--primary)', 
                                            color: 'white',
                                            border: 'none',
                                            fontSize: '0.85rem',
                                            padding: '4px 10px',
                                            fontWeight: 'bold',
                                            borderRadius: '6px'
                                        }}>
                                            Sr. {reviews.length - index}
                                        </span>
                                        <span className="badge badge-subject" style={{ 
                                            background: 'var(--accent-glow)', 
                                            color: 'var(--accent-secondary)',
                                            border: '1px solid var(--accent-secondary)',
                                            fontSize: '1rem',
                                            padding: '4px 10px'
                                        }}>
                                            {review.subject_code}
                                        </span>
                                        <span className={`badge badge-term-${review.term}`} style={{
                                            background: review.term === 'midterm' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                            color: review.term === 'midterm' ? '#10b981' : '#8b5cf6',
                                            border: `1px solid ${review.term === 'midterm' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`
                                        }}>
                                            {review.term === 'midterm' ? 'Midterm' : 'Final Term'}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                
                                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="print-text-dark" style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{review.username}</span>
                                    <span style={{ color: 'var(--warning)', fontSize: '0.9rem' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                </div>

                                <div className="print-text" style={{ 
                                    background: 'var(--bg-primary)', 
                                    padding: '16px', 
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.6',
                                    fontSize: '0.95rem',
                                    marginBottom: '16px',
                                    cursor: isAdmin ? 'pointer' : 'default'
                                }} onClick={() => isAdmin && handleSelectReview(review.id)}>
                                    {review.comment}
                                </div>
                                
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    <a 
                                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`📚 *New ${review.term === 'midterm' ? 'Midterm' : 'Final Term'} Review Shared!*\n\n*Subject:* ${review.subject_code}\n*Review by:* ${review.username}\n*Rating:* ${review.rating}/5\n\n*Experience:*\n${review.comment}\n\n🌐 *View all reviews at:* https://hmnexora.tech/reviews\n\n✨ *Join our Channel:* https://whatsapp.com/channel/0029Vb5PcRb11ulIA5AYpj2K`)}`}
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
                                            boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)',
                                            borderRadius: 'var(--radius-sm)'
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                        </svg>
                                        Share to WhatsApp
                                    </a>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
            
            {isAdmin && selectedReviews.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--bg-card)',
                    padding: '16px 24px',
                    borderRadius: '100px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    zIndex: 1000,
                    backdropFilter: 'blur(10px)'
                }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {selectedReviews.length} Selected
                    </span>
                    <a 
                        href={getMultiShareLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn"
                        style={{ 
                            background: '#25D366', 
                            color: 'white', 
                            border: 'none', 
                            padding: '10px 24px', 
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)',
                            borderRadius: '100px',
                            fontWeight: 'bold'
                        }}
                        onClick={() => setSelectedReviews([])}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                        </svg>
                        Share {selectedReviews.length} Reviews
                    </a>
                    <button onClick={() => setSelectedReviews([])} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>
            )}
        </div>
    );
}
