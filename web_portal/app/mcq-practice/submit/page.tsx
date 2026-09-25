'use client';

import { useState, useEffect } from 'react';
// import { allSubjects } from '@/data/all_subjects';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';

export default function SubmitQuestionPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    // Form State
    const [allSubjects, setAllSubjects] = useState<string[]>([]);
    const [subject, setSubject] = useState('');

    useEffect(() => {
        fetch('/api/subjects').then(r => r.json()).then(data => {
            setAllSubjects(data);
            if (data.length > 0) setSubject(data[0]);
        });
    }, []);
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correct, setCorrect] = useState(0);
    const [explanation, setExplanation] = useState('');

    const handleOptionChange = (idx: number, val: string) => {
        const newOptions = [...options];
        newOptions[idx] = val;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // API Call
        try {
            const res = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, question, options, correct, explanation })
            });

            if (!res.ok) throw new Error('Failed to submit');

            setLoading(false);
            setSuccess(true);
        } catch (error) {
            alert('Failed to submit question. Please try again.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
                    <h2>Thank You!</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: '10px 0 24px' }}>
                        Your question has been submitted for review. It will be added to the quiz bank after admin approval.
                    </p>
                    <button className="btn btn-primary" onClick={() => {
                        setSuccess(false);
                        setQuestion('');
                        setOptions(['', '', '', '']);
                        setExplanation('');
                    }}>Submit Another</button>
                    <div style={{ marginTop: '12px' }}>
                        <Link href="/mcq-practice" style={{ fontSize: '0.9rem' }}>Back to Practice</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header">
                    <h1>📝 Contribute to the Community</h1>
                    <p>Submit a high-quality MCQ to help your fellow students.</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <select
                                className="form-select"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                required
                            >
                                {allSubjects.map(code => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Question Text</label>
                            <textarea
                                className="form-textarea"
                                placeholder="e.g., Which protocol is used for email transmission?"
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                required
                                style={{ minHeight: '80px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Options</label>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {options.map((opt, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input
                                            type="radio"
                                            name="correctOption"
                                            checked={correct === i}
                                            onChange={() => setCorrect(i)}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            value={opt}
                                            onChange={e => handleOptionChange(i, e.target.value)}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                * Select the radio button next to the correct answer.
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Explanation (Why is it correct?)</label>
                            <textarea
                                className="form-textarea"
                                placeholder="e.g., SMTP (Simple Mail Transfer Protocol) is the standard for sending emails..."
                                value={explanation}
                                onChange={e => setExplanation(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg btn-block"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Question 🚀'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
