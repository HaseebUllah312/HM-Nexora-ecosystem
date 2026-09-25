'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ToolsPage() {
    const [activeCalc, setActiveCalc] = useState<string | null>(null);

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>🧮 Academic Tools</h1>
                    <p>Handy calculators and utilities for VU students</p>
                </div>

                {!activeCalc ? (
                    <div className="tools-grid">
                        { [
                            { id: 'cgpa', icon: '📊', title: 'CGPA Calculator', desc: 'Calculate your semester GPA and overall CGPA' },
                            { id: 'percentage', icon: '📈', title: 'Percentage Calculator', desc: 'Convert grades to percentage and vice versa' },
                            { id: 'wordcount', icon: '📝', title: 'Word Counter', desc: 'Count words, characters, and paragraphs' },
                            { id: 'citation', icon: '📑', title: 'Citation Generator', desc: 'Generate APA, MLA, and IEEE citations' },
                            { id: 'plagiarism', icon: '🔍', title: 'Plagiarism Checker', desc: 'Basic text similarity and plagiarism check' },
                        ].map(tool => (
                            <div key={tool.id} className="tool-card" onClick={() => setActiveCalc(tool.id)}>
                                <div className="tool-icon">{tool.icon}</div>
                                <h3>{tool.title}</h3>
                                <p>{tool.desc}</p>
                            </div>
                        ))}
                        <Link href="/semester-planner" className="tool-card">
                            <div className="tool-icon">📅</div>
                            <h3>Semester Planner</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Plan your study schedule</p>
                        </Link>
                        <Link href="/past-paper-analyzer" className="tool-card">
                            <div className="tool-icon">📈</div>
                            <h3>Past Paper Analyzer</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Find repeated questions</p>
                        </Link>
                    </div>
                ) : (
                    <div>
                        <button className="btn btn-outline" style={{ marginBottom: '24px' }} onClick={() => setActiveCalc(null)}>← Back to Tools</button>
                        {activeCalc === 'cgpa' && <CGPACalculator />}
                        {activeCalc === 'percentage' && <PercentageCalculator />}
                        {activeCalc === 'wordcount' && <WordCounter />}
                        {activeCalc === 'citation' && <CitationGenerator />}
                        {activeCalc === 'plagiarism' && <PlagiarismChecker />}
                    </div>
                )}
            </div>
        </div>
    );
}

function CGPACalculator() {
    const gradePoints: Record<string, number> = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };
    const [rows, setRows] = useState([{ subject: '', creditHours: 3, grade: 'A' }]);

    const addRow = () => setRows([...rows, { subject: '', creditHours: 3, grade: 'A' }]);
    const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
    const updateRow = (i: number, field: string, value: string | number) => {
        const newRows = [...rows];
        (newRows[i] as Record<string, string | number>)[field] = value;
        setRows(newRows);
    };

    const totalCredits = rows.reduce((sum, r) => sum + r.creditHours, 0);
    const totalPoints = rows.reduce((sum, r) => sum + r.creditHours * (gradePoints[r.grade] || 0), 0);
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>📊 CGPA Calculator</h2>
            {rows.map((row, i) => (
                <div key={i} className="calc-row">
                    <input className="form-input" placeholder="Subject name" value={row.subject} onChange={e => updateRow(i, 'subject', e.target.value)} style={{ flex: 2 }} />
                    <select className="form-select" value={row.creditHours} onChange={e => updateRow(i, 'creditHours', Number(e.target.value))} style={{ padding: '8px', borderRadius: '8px' }}>
                        {[1, 2, 3, 4].map(ch => <option key={ch} value={ch}>{ch} CH</option>)}
                    </select>
                    <select className="form-select" value={row.grade} onChange={e => updateRow(i, 'grade', e.target.value)} style={{ padding: '8px', borderRadius: '8px' }}>
                        {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <button className="btn btn-danger btn-sm" onClick={() => removeRow(i)} style={{ height: '44px' }}>✕</button>
                </div>
            ))}
            <button className="btn btn-secondary" onClick={addRow} style={{ marginTop: '12px', width: '100%' }}>+ Add Subject</button>
            <div className="calc-result">
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Your Estimated GPA</div>
                <div className="calc-result-number">{gpa}</div>
                <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Credit Hours: {totalCredits}</div>
            </div>
        </div>
    );
}

function PercentageCalculator() {
    const [obtained, setObtained] = useState('');
    const [total, setTotal] = useState('');
    const pct = obtained && total && Number(total) > 0 ? ((Number(obtained) / Number(total)) * 100).toFixed(2) : '0.00';

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>📈 Percentage Calculator</h2>
            <div className="card glass-card-navy" style={{ padding: '32px' }}>
                <div className="form-group">
                    <label className="form-label">Obtained Marks</label>
                    <input className="form-input" type="number" value={obtained} onChange={e => setObtained(e.target.value)} placeholder="e.g. 75" />
                </div>
                <div className="form-group">
                    <label className="form-label">Total Marks</label>
                    <input className="form-input" type="number" value={total} onChange={e => setTotal(e.target.value)} placeholder="e.g. 100" />
                </div>
                <div className="calc-result">
                    <div className="calc-result-number">{pct}%</div>
                </div>
            </div>
        </div>
    );
}

function WordCounter() {
    const [text, setText] = useState('');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>📝 Word Counter</h2>
            <textarea className="form-textarea" style={{ minHeight: '200px' }} placeholder="Paste or type your text here..." value={text} onChange={e => setText(e.target.value)} />
            <div className="stat-grid" style={{ marginTop: '20px' }}>
                <div className="stat-card"><div className="stat-number">{words}</div><div className="stat-label">Words</div></div>
                <div className="stat-card"><div className="stat-number">{chars}</div><div className="stat-label">Characters</div></div>
                <div className="stat-card"><div className="stat-number">{sentences}</div><div className="stat-label">Sentences</div></div>
                <div className="stat-card"><div className="stat-number">{paragraphs}</div><div className="stat-label">Paragraphs</div></div>
            </div>
        </div>
    );
}

function CitationGenerator() {
    const [authorName, setAuthorName] = useState('');
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('');
    const [publisher, setPublisher] = useState('');
    const [url, setUrl] = useState('');

    const apa = `${authorName || 'Author'} (${year || 'Year'}). ${title || 'Title'}. ${publisher || 'Publisher'}. ${url ? `Retrieved from ${url}` : ''}`.trim();
    const mla = `${authorName || 'Author'}. "${title || 'Title'}." ${publisher || 'Publisher'}, ${year || 'Year'}. ${url ? `Web. ${url}` : ''}`.trim();

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>📑 Citation Generator</h2>
            <div className="card" style={{ padding: '32px' }}>
                <div className="form-group"><label className="form-label">Author Name</label><input className="form-input" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="e.g. John Smith" /></div>
                <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title of work" /></div>
                <div className="form-group"><label className="form-label">Year</label><input className="form-input" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2024" /></div>
                <div className="form-group"><label className="form-label">Publisher / Source</label><input className="form-input" value={publisher} onChange={e => setPublisher(e.target.value)} placeholder="Publisher name" /></div>
                <div className="form-group"><label className="form-label">URL (optional)</label><input className="form-input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." /></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                    <h4 style={{ margin: 0 }}>APA Format:</h4>
                    <button 
                        className="btn btn-sm btn-secondary" 
                        onClick={() => {
                            navigator.clipboard.writeText(apa);
                            alert('APA Citation Copied!');
                        }}
                    >
                        📋 Copy
                    </button>
                </div>
                <div style={{ 
                    padding: '12px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: '0.88rem', 
                    color: 'var(--text-secondary)',
                    marginTop: '8px',
                    userSelect: 'text',
                    WebkitUserSelect: 'text'
                }}>
                    {apa}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <h4 style={{ margin: 0 }}>MLA Format:</h4>
                    <button 
                        className="btn btn-sm btn-secondary" 
                        onClick={() => {
                            navigator.clipboard.writeText(mla);
                            alert('MLA Citation Copied!');
                        }}
                    >
                        📋 Copy
                    </button>
                </div>
                <div style={{ 
                    padding: '12px', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: '0.88rem', 
                    color: 'var(--text-secondary)',
                    marginTop: '8px',
                    userSelect: 'text',
                    WebkitUserSelect: 'text'
                }}>
                    {mla}
                </div>
            </div>
        </div>
    );
}

function PlagiarismChecker() {
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const [result, setResult] = useState<number | null>(null);

    const checkPlagiarism = () => {
        if (!text1.trim() || !text2.trim()) return;
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));
        const common = [...words1].filter(w => words2.has(w));
        const similarity = Math.round((common.length / Math.max(words1.size, words2.size)) * 100);
        setResult(similarity);
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px' }}>🔍 Basic Plagiarism Checker</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <label className="form-label">Text 1 (Original)</label>
                    <textarea className="form-textarea" style={{ minHeight: '200px' }} value={text1} onChange={e => setText1(e.target.value)} placeholder="Paste original text..." />
                </div>
                <div>
                    <label className="form-label">Text 2 (Compare)</label>
                    <textarea className="form-textarea" style={{ minHeight: '200px' }} value={text2} onChange={e => setText2(e.target.value)} placeholder="Paste text to compare..." />
                </div>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: '16px' }} onClick={checkPlagiarism}>Check Similarity</button>
            {result !== null && (
                <div className="calc-result" style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
                    <div className="calc-result-number">{result}%</div>
                    <div style={{ marginTop: '8px', color: result > 50 ? 'var(--error)' : result > 25 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                        {result > 50 ? '⚠️ High Similarity' : result > 25 ? '⚡ Moderate Similarity' : '✅ Low Similarity'}
                    </div>
                </div>
            )}
        </div>
    );
}
