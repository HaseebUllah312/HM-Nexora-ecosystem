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
    image_url?: string;
    created_at: string;
}

export default function SharePaperPage() {
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Form State
    const [subjectCode, setSubjectCode] = useState('');
    const [term, setTerm] = useState('midterm');
    const [examDate, setExamDate] = useState('');
    const [examTime, setExamTime] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // UI State
    const [likedPapers, setLikedPapers] = useState<{ [key: string]: boolean }>({});

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTermFilter, setSearchTermFilter] = useState('all'); // all, midterm, final
    
    // Multi-select State
    const [selectedPapers, setSelectedPapers] = useState<string[]>([]);

    useEffect(() => {
        checkAdmin();
        fetchPapers();
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

    const handleSelectPaper = (id: string) => {
        setSelectedPapers(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const getMultiShareLink = () => {
        const selected = papers.filter(p => selectedPapers.includes(p.id));
        if (selected.length === 0) return '#';
        
        let text = `📚 *New Exams Shared!*\n\n`;
        selected.forEach((paper, idx) => {
            text += `*${idx + 1}. ${paper.subject_code}* (${paper.term === 'midterm' ? 'Midterm' : 'Final'})\n`;
            text += `*Date:* ${paper.exam_date || 'N/A'}\n`;
            text += `*Questions:*\n${paper.content}\n\n`;
            text += `----------\n\n`;
        });
        
        text += `🌐 *View all papers at:* https://hmnexora.tech/share-paper\n\n✨ *Join our Channel:* https://whatsapp.com/channel/0029Vb5PcRb11ulIA5AYpj2K`;
        return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            const formData = new FormData();
            formData.append('subject_code', subjectCode);
            formData.append('term', term);
            formData.append('exam_date', examDate);
            formData.append('exam_time', examTime);
            formData.append('content', content);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const res = await fetch('/api/papers', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            
            if (data.success) {
                setMessage({ text: 'Paper shared successfully!', type: 'success' });
                setSubjectCode('');
                setExamDate('');
                setExamTime('');
                setContent('');
                setImageFile(null);
                setImagePreview(null);
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this paper?')) return;
        try {
            const res = await fetch(`/api/papers?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setPapers(papers.filter(p => p.id !== id));
            } else {
                alert('Failed to delete: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while deleting.');
        }
    };

    const exportAsText = () => {
        if (papers.length === 0) return alert('No papers to export.');
        const textContent = papers.map(p => 
            `Subject: ${p.subject_code}\nTerm: ${p.term.toUpperCase()}\nDate: ${p.exam_date || 'N/A'}\nTime: ${p.exam_time || 'N/A'}\n\nContent:\n${p.content}\n\n${'-'.repeat(40)}\n`
        ).join('\n');
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `HM_Nexora_Papers_${searchTermFilter}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="page" style={{ paddingTop: 'calc(var(--nav-height) + 20px)', paddingBottom: '120px', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
            <div className="solution-bg-text print-hide">HM NEXORA</div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body { background: white !important; color: black !important; }
                    .print-hide { display: none !important; }
                    .print-show { display: block !important; }
                    .card { border: 1px solid #ccc !important; box-shadow: none !important; break-inside: avoid; margin-bottom: 20px; }
                    .badge { border: 1px solid #666 !important; color: black !important; }
                    header, footer, nav, .btn, form { display: none !important; }
                }
            `}} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="print-hide" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
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

                <div className="print-show" style={{ display: 'none', textAlign: 'center', marginBottom: '30px' }}>
                    <h1>HM Nexora - Shared Exam Papers</h1>
                    <p>Generated Document | Filter: {searchTermFilter.toUpperCase()}</p>
                    <hr />
                </div>

                <div className="print-hide" style={{ marginBottom: '24px', padding: '16px 24px', background: 'rgba(34, 211, 238, 0.05)', border: '1px solid rgba(34, 211, 238, 0.3)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                            <span style={{ fontSize: '1.4rem' }}>💬</span> Looking for Exam Reviews?
                        </h3>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Read detailed student experiences and paper reviews.</p>
                    </div>
                    <a href="/reviews" className="btn neural-entrance" style={{ background: 'var(--accent-secondary)', color: '#000', padding: '10px 20px', borderRadius: '100px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(34, 211, 238, 0.2)' }}>
                        Go to Reviews Feed →
                    </a>
                </div>

                <div className="share-page-grid">
                    
                    {/* LEFT PANEL: SHARE PAPER FORM */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card glass-card-navy print-hide share-form-panel" 
                    >
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--accent-secondary)' }}>✈️</span> Share Paper
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

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Attach Image (Optional)</label>
                                <div style={{ 
                                    border: '2px dashed var(--border-color)', 
                                    borderRadius: '8px', 
                                    padding: '20px', 
                                    textAlign: 'center',
                                    position: 'relative',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    cursor: 'pointer'
                                }}>
                                    {imagePreview ? (
                                        <div style={{ position: 'relative' }}>
                                            <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }} />
                                            <button type="button" onClick={(e) => { e.preventDefault(); setImageFile(null); setImagePreview(null); }} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.7 }}>📸</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Click to upload image</div>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleImageChange}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                    />
                                </div>
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
                        <div className="card print-hide" style={{ 
                            background: 'rgba(245, 158, 11, 0.05)', 
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            padding: '16px 24px',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '24px', color: 'var(--warning)' }}>📢</div>
                            <div>
                                <h3 style={{ color: 'var(--warning)', fontSize: '0.9rem', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>Announcement by Admin</h3>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>
                                    Kindly be serious and relevant. Everyone's time is precious in exam days.
                                </p>
                            </div>
                        </div>

                        {/* Search, Filter and Export Actions */}
                        <div className="card print-hide" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '16px', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.02)' }}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, alignItems: 'center' }}>
                                <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
                                    <input 
                                        type="text" 
                                        className="form-input glow-border-cyan" 
                                        placeholder="E.G. ENG101" 
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
                                    <option value="all">All Exams</option>
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
                                    📚 Total Papers: {papers.length}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={exportAsText} className="btn" style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent-secondary)', border: '1px solid var(--accent-secondary)' }}>
                                    📄 Export Text
                                </button>
                                <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                    🖨️ Export PDF
                                </button>
                            </div>
                        </div>

                        {/* Papers List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    Loading papers...
                                </div>
                            ) : papers.length === 0 ? (
                                <div className="card" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)' }}>
                                    <div style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '16px' }}>📄</div>
                                    <h3 style={{ color: 'var(--text-secondary)' }}>No papers available yet.</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Be the first to share your exam experience!</p>
                                </div>
                            ) : (
                                papers.map((paper, index) => (
                                    <div key={paper.id} className="card glass-card-navy neural-entrance" style={{ 
                                        padding: '24px', 
                                        position: 'relative',
                                        border: selectedPapers.includes(paper.id) ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
                                        transition: 'border 0.2s ease'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                {isAdmin && (
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedPapers.includes(paper.id)}
                                                        onChange={() => handleSelectPaper(paper.id)}
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-secondary)' }}
                                                    />
                                                )}
                                                <span style={{ 
                                                    background: 'var(--accent-primary)', 
                                                    color: 'white', 
                                                    padding: '4px 10px', 
                                                    borderRadius: 'var(--radius-sm)', 
                                                    fontWeight: 'bold', 
                                                    fontSize: '0.9rem',
                                                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                                                }}>
                                                    #{papers.length - index}
                                                </span>
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
                                                {paper.exam_date && <div>📅 {paper.exam_date}</div>}
                                                {paper.exam_time && <div>⏰ {paper.exam_time}</div>}
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
                                            fontSize: '0.95rem',
                                            marginBottom: '16px',
                                            cursor: isAdmin ? 'pointer' : 'default'
                                        }} onClick={() => isAdmin && handleSelectPaper(paper.id)}>
                                            {paper.content}
                                        </div>

                                        {paper.image_url && (
                                            <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                                <img src={paper.image_url} alt="Paper attachment" style={{ width: '100%', display: 'block' }} loading="lazy" />
                                            </div>
                                        )}
                                        
                                        <div className="print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => {
                                                        setLikedPapers(prev => ({...prev, [paper.id]: !prev[paper.id]}));
                                                    }}
                                                    className="btn"
                                                    style={{
                                                        background: likedPapers[paper.id] ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                                                        color: likedPapers[paper.id] ? '#ec4899' : 'var(--text-muted)',
                                                        border: `1px solid ${likedPapers[paper.id] ? 'rgba(236, 72, 153, 0.3)' : 'var(--border-color)'}`,
                                                        padding: '8px 16px',
                                                        fontSize: '0.9rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer',
                                                        borderRadius: 'var(--radius-sm)'
                                                    }}
                                                >
                                                    {likedPapers[paper.id] ? '❤️ Helpful' : '🤍 Helpful'}
                                                </button>
                                                {isAdmin && (
                                                    <button 
                                                        onClick={() => handleDelete(paper.id)}
                                                        className="btn"
                                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-sm)' }}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <a 
                                                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`📚 *New ${paper.term === 'midterm' ? 'Midterm' : 'Final Term'} Paper Shared!*\n\n*Subject:* ${paper.subject_code}\n*Date:* ${paper.exam_date || 'N/A'}\n\n*Questions:*\n${paper.content}\n\n🌐 *View papers at:* https://hmnexora.tech/share-paper\n\n✨ *Join our Channel:* https://whatsapp.com/channel/0029Vb5PcRb11ulIA5AYpj2K`)}`}
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
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </motion.div>
                </div>
            </div>

            {isAdmin && selectedPapers.length > 0 && (
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
                        {selectedPapers.length} Selected
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
                        onClick={() => setSelectedPapers([])}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                        </svg>
                        Share {selectedPapers.length} Papers
                    </a>
                    <button onClick={() => setSelectedPapers([])} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>
            )}
        </div>
    );
}
