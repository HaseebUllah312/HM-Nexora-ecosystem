'use client';
import { subjects } from '@/data/subjects';
import Link from 'next/link';

export default function ToughSubjectsPage() {
    const toughSubjects = [...subjects].filter(s => s.difficulty === 'Hard' || s.difficulty === 'Very Hard').sort((a, b) => a.rating - b.rating);

    const strategies: Record<string, { tips: string[]; recommendedNotes: string; recommendedTeacher: string }> = {
        'CS501': { tips: ['Focus on pipeline concepts', 'Practice cache memory problems', 'Understand parallel architectures'], recommendedNotes: 'Dr. Farhan\'s official handouts', recommendedTeacher: 'Dr. Farhan' },
        'MTH301': { tips: ['Master partial derivatives step by step', 'Practice double/triple integrals daily', 'Use visualization tools for 3D concepts'], recommendedNotes: 'Handwritten Notes + YouTube tutorials', recommendedTeacher: 'Dr. Zaheer' },
        'CS301': { tips: ['Implement each data structure by hand', 'Practice tree traversals extensively', 'Understand time complexity deeply'], recommendedNotes: 'Junaid sir past papers + MCQ collections', recommendedTeacher: 'Dr. Junaid' },
        'MTH501': { tips: ['Practice matrix operations daily', 'Understand eigenvalue calculations', 'Focus on vector space proofs'], recommendedNotes: 'Official handouts + solved exercises', recommendedTeacher: 'Dr. Tahir' },
        'default': { tips: ['Study from past papers', 'Focus on important MCQs', 'Practice consistently', 'Join study groups'], recommendedNotes: 'Official VU handouts', recommendedTeacher: 'Check student reviews' },
    };

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>📌 Tough Subject Strategies</h1>
                    <p>Expert tips and strategies for the most challenging VU courses</p>
                </div>

                <div className="card" style={{ padding: '20px', marginBottom: '32px', background: 'var(--warning-bg)', borderColor: 'var(--warning)' }}>
                    <p style={{ fontSize: '0.92rem' }}>⚠️ <strong>Based on student ratings:</strong> These are the subjects VU students find most challenging. Don&apos;t worry — with the right strategy, you can ace them!</p>
                </div>

                <div className="card-grid-2" style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
                    {toughSubjects.map(s => {
                        const strat = strategies[s.code] || strategies['default'];
                        return (
                            <div key={s.code} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span className="badge badge-primary">{s.code}</span>
                                    <span className={`diff-${(s.difficulty || '').toLowerCase().replace(' ', '')}`}>{s.difficulty}</span>
                                </div>
                                <h3>{s.name}</h3>
                                <div className="rating-display" style={{ margin: '8px 0' }}>
                                    <div className="stars">{[1, 2, 3, 4, 5].map(i => <span key={i} className={`star ${(s.rating || 0) >= i ? 'active' : ''}`}>★</span>)}</div>
                                    <span className="rating-number">{(s.rating || 0).toFixed(1)}</span>
                                    <span className="rating-count">({s.totalReviews || 0} reviews)</span>
                                </div>

                                <h4 style={{ fontSize: '0.88rem', color: 'var(--accent-primary)', marginTop: '16px', marginBottom: '8px' }}>📋 Study Strategy:</h4>
                                <ul style={{ paddingLeft: '16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                    {strat.tips.map((t, i) => <li key={i} style={{ marginBottom: '4px' }}>{t}</li>)}
                                </ul>

                                <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                                    <div>📚 <strong>Recommended Notes:</strong> {strat.recommendedNotes}</div>
                                    <div>👨‍🏫 <strong>Best Teacher:</strong> {strat.recommendedTeacher}</div>
                                </div>

                                <Link href={`/subjects/${(s.code || '').toLowerCase()}`} className="btn btn-outline btn-sm btn-block" style={{ marginTop: '12px' }}>View Subject Files →</Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
