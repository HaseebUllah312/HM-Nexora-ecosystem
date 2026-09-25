'use client';
import { useState, useEffect, useCallback } from 'react';

interface Question {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
    topic: string;
    subject?: string;
}

interface VUExamModeProps {
    questions: Question[];
    subject: string;
    examType: string;
    customLabel?: string;
    onFinish: (answers: (number | null)[], score: number) => void;
    onBack: () => void;
}

export default function VUExamMode({ questions, subject, examType, customLabel, onFinish, onBack }: VUExamModeProps) {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions?.length || 0).fill(null));
    const [flagged, setFlagged] = useState<boolean[]>(new Array(questions?.length || 0).fill(false));
    const [showExplanation, setShowExplanation] = useState<boolean[]>(new Array(questions?.length || 0).fill(false));
    const [timeLeft, setTimeLeft] = useState(questions.length * 60); // 1 min per question
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

    const handleFinish = useCallback(() => {
        let score = 0;
        questions.forEach((q, i) => { if (answers[i] === q.correct) score++; });
        onFinish(answers, score);
    }, [questions, answers, onFinish]);

    // Timer
    useEffect(() => {
        if (timeLeft <= 0) { handleFinish(); return; }
        const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [timeLeft, handleFinish]);

    const selectAnswer = (optIdx: number) => {
        const newAnswers = [...answers];
        newAnswers[currentQ] = optIdx;
        setAnswers(newAnswers);

        // Show explanation after selecting
        const newExpl = [...showExplanation];
        newExpl[currentQ] = true;
        setShowExplanation(newExpl);
    };

    const toggleFlag = () => {
        const f = [...flagged];
        f[currentQ] = !f[currentQ];
        setFlagged(f);
    };

    const goTo = (idx: number) => {
        if (idx >= 0 && idx < questions.length) setCurrentQ(idx);
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // Timer circle
    const totalTime = questions.length * 60;
    const pct = timeLeft / totalTime;
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = circumference * pct;
    const timerColor = timeLeft < 60 ? '#ef4444' : timeLeft < 300 ? '#f59e0b' : '#22c55e';

    const attempted = (answers || []).filter(a => a !== null).length;
    const flaggedCount = (flagged || []).filter(Boolean).length;
    const q = (questions && questions[currentQ]) || { question: 'Loading...', options: [], correct: -1, explanation: '', topic: '' };
    const examLabel = examType === 'midterm' ? 'Midterm' : 'Final Term';

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif',
        }}>
            {/* TOP HEADER — VU Style */}
            <div style={{
                background: 'var(--accent-primary)',
                padding: '10px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '3px solid var(--accent-secondary)',
                position: 'relative',
            }}>
                {/* Subject */}
                <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎓</span>
                    </div>
                    <div>
                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '0.02em' }}>
                            {subject} - {customLabel || (examType === 'midterm' ? 'Midterm' : 'Final Term')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
                            {examLabel} Assessment Portal
                        </div>
                    </div>
                </div>

                {/* Circular Timer — Center */}
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '5px' }}>
                    <svg width="90" height="90">
                        <circle cx="45" cy="45" r={radius} fill="var(--accent-primary)" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                        <circle
                            cx="45" cy="45" r={radius}
                            fill="none"
                            stroke={timerColor}
                            strokeWidth="6"
                            strokeDasharray={`${strokeDash} ${circumference}`}
                            strokeLinecap="round"
                            transform="rotate(-90 45 45)"
                            style={{ transition: 'stroke-dasharray 0.5s, stroke 0.5s' }}
                        />
                        <text x="45" y="42" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">
                            {formatTime(timeLeft)}
                        </text>
                        <text x="45" y="56" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9">
                            Time Left
                        </text>
                    </svg>
                </div>

                {/* Login info */}
                <div style={{ color: 'white', textAlign: 'right', fontSize: '0.82rem' }}>
                    <div style={{ color: 'rgba(255,255,255,0.7)' }}>HM nexora</div>
                    <div style={{ fontWeight: 'bold' }}>Practice Mode</div>
                </div>
            </div>

            {/* QUESTION BAR */}
            <div style={{
                background: 'var(--bg-tertiary)',
                padding: '8px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: '600',
                borderBottom: '1px solid var(--border-color)',
            }}>
                <span>Question No : {currentQ + 1} of {questions.length}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span>Marks: 1 &nbsp;|&nbsp; Topic: {q.topic}</span>
                    {flagged[currentQ] && (
                        <span style={{ background: '#f59e0b', color: '#1a1a2e', padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem' }}>
                            🚩 Flagged
                        </span>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* LEFT: Question + Options */}
                <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>

                    {/* Question Text */}
                    <div style={{
                        padding: '24px 28px',
                        background: 'var(--bg-secondary)',
                        borderBottom: '1px solid var(--border-color)',
                        fontSize: '1rem',
                        lineHeight: '1.7',
                        color: 'var(--text-primary)',
                        minHeight: '100px',
                    }}>
                        <strong style={{ color: 'var(--accent-secondary)', marginRight: '8px' }}>Q{currentQ + 1}.</strong>
                        {q.question}
                    </div>

                    {/* Answer Section */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            background: 'var(--accent-primary)',
                            color: 'white',
                            padding: '8px 20px',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            letterSpacing: '0.05em',
                        }}>
                            Answer
                        </div>

                        {(q.options || []).map((opt, i) => {
                            const isSelected = answers[currentQ] === i;
                            const isCorrect = i === q.correct;
                            const hasAnswered = answers[currentQ] !== null && showExplanation[currentQ];
                            let borderColor = 'var(--border-color)';
                            let bg = 'var(--bg-secondary)';
                            let textColor = 'var(--text-primary)';

                            if (hasAnswered) {
                                if (isCorrect) { borderColor = '#22c55e'; bg = '#f0fdf4'; textColor = '#166534'; }
                                else if (isSelected && !isCorrect) { borderColor = '#ef4444'; bg = '#fef2f2'; textColor = '#991b1b'; }
                            } else if (isSelected) {
                                borderColor = '#f59e0b'; bg = '#fffbeb';
                            }

                            return (
                                <div
                                    key={i}
                                    onClick={() => !hasAnswered && selectAnswer(i)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '16px',
                                        padding: '14px 20px',
                                        background: bg,
                                        border: `2px solid ${borderColor}`,
                                        cursor: hasAnswered ? 'default' : 'pointer',
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                        borderTop: 'none',
                                        borderBottom: `2px solid ${borderColor}`,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {/* Radio button */}
                                    <div style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        border: `2px solid ${isSelected || (hasAnswered && isCorrect) ? borderColor : '#9ca3af'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginTop: '1px',
                                        flexShrink: 0,
                                        background: (isSelected && !hasAnswered) ? '#f59e0b' : (hasAnswered && isCorrect) ? '#22c55e' : (hasAnswered && isSelected && !isCorrect) ? '#ef4444' : 'white',
                                    }}>
                                        {(isSelected || (hasAnswered && isCorrect)) && (
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'white' }} />
                                        )}
                                    </div>

                                    {/* Option text */}
                                    <div style={{ flex: 1, color: textColor, fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        <span style={{ fontWeight: '600', marginRight: '8px' }}>
                                            {String.fromCharCode(65 + i)}.
                                        </span>
                                        {opt}
                                        {hasAnswered && isCorrect && (
                                            <span style={{ marginLeft: '10px', color: '#22c55e', fontWeight: 'bold' }}>✅ Correct</span>
                                        )}
                                        {hasAnswered && isSelected && !isCorrect && (
                                            <span style={{ marginLeft: '10px', color: '#ef4444', fontWeight: 'bold' }}>❌ Wrong</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Explanation — shown after answering */}
                        {showExplanation[currentQ] && answers[currentQ] !== null && (
                            <div style={{
                                margin: '16px 20px',
                                padding: '16px 20px',
                                background: answers[currentQ] === q.correct
                                    ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
                                    : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                                borderRadius: '12px',
                                border: `1px solid ${answers[currentQ] === q.correct ? '#86efac' : '#fca5a5'}`,
                            }}>
                                <div style={{ fontWeight: '700', marginBottom: '8px', color: answers[currentQ] === q.correct ? '#166534' : '#991b1b', fontSize: '0.95rem' }}>
                                    {answers[currentQ] === q.correct
                                        ? '✅ Correct! Great job!'
                                        : `❌ Incorrect. Correct answer: ${String.fromCharCode(65 + q.correct)}. ${q.options[q.correct]}`
                                    }
                                </div>
                                <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: '1.6' }}>
                                    <strong>💡 Explanation:</strong> {q.explanation}
                                </div>
                            </div>
                        )}

                        {/* Prompt to answer */}
                        {answers[currentQ] === null && (
                            <div style={{ padding: '16px 20px', color: '#6b7280', fontSize: '0.88rem', fontStyle: 'italic' }}>
                                👆 Select an option to answer. Explanation will appear after you choose.
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Summary Sidebar */}
                <div style={{
                    width: '260px',
                    background: 'var(--bg-primary)',
                    borderLeft: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                }}>
                    <div style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        padding: '16px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        Question Palette
                    </div>

                    {/* Question Number Grid */}
                    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                        {questions.map((_, i) => {
                            const isAnswered = answers[i] !== null;
                            const isFlagged = flagged[i];
                            const isActive = i === currentQ;
                            let bg = 'rgba(255,255,255,0.05)'; // unanswered
                            let color = '#9ca3af';
                            let border = '1px solid rgba(255,255,255,0.1)';

                            if (isAnswered) { bg = 'var(--success)'; color = 'white'; border = 'none'; }
                            if (isFlagged) { bg = 'var(--warning)'; color = 'white'; border = 'none'; }
                            if (isActive) { bg = 'var(--accent-primary)'; color = 'white'; border = '2px solid var(--accent-secondary)'; }

                            return (
                                <div
                                    key={i}
                                    onClick={() => goTo(i)}
                                    style={{
                                        aspectRatio: '1',
                                        borderRadius: '8px',
                                        background: bg,
                                        color: color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        border: border,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {i + 1}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-color)' }}>
                        {[
                            { color: '#7c3aed', label: 'Current' },
                            { color: '#22c55e', label: 'Answered' },
                            { color: '#f59e0b', label: 'Flagged' },
                            { color: 'var(--text-muted)', label: 'Not answered' },
                        ].map(({ color, label }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: color }} />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', textAlign: 'center' }}>
                            {Math.round((attempted / questions.length) * 100)}%
                        </div>
                        {[
                            { label: 'Attempted', val: attempted, color: '#22c55e' },
                            { label: 'Flagged', val: flaggedCount, color: '#f59e0b' },
                            { label: 'Total', val: questions.length, color: 'var(--text-muted)' },
                        ].map(({ label, val, color }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                <span style={{ color, fontWeight: 'bold' }}>{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BOTTOM NAVIGATION — VU Style */}
            <div style={{
                background: 'var(--accent-primary)',
                padding: '10px 16px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                borderTop: '2px solid var(--accent-secondary)',
                flexWrap: 'wrap',
            }}>
                {/* Finish Exam */}
                <button
                    onClick={() => setShowFinishConfirm(true)}
                    style={{
                        background: '#ef4444', color: 'white', border: 'none',
                        padding: '10px 18px', borderRadius: '6px', cursor: 'pointer',
                        fontWeight: '700', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                >
                    📋 Finish Exam
                </button>

                {/* Flag */}
                <button
                    onClick={toggleFlag}
                    style={{
                        background: flagged[currentQ] ? '#d97706' : '#7c3aed', color: 'white', border: 'none',
                        padding: '10px 18px', borderRadius: '6px', cursor: 'pointer',
                        fontWeight: '700', fontSize: '0.88rem',
                    }}
                >
                    🚩 {flagged[currentQ] ? 'Unflag' : 'Flag'}
                </button>

                {/* First */}
                <button
                    onClick={() => goTo(0)}
                    style={{
                        background: '#f59e0b', color: '#1a1a2e', border: 'none',
                        padding: '10px 18px', borderRadius: '6px', cursor: 'pointer',
                        fontWeight: '700', fontSize: '0.88rem',
                    }}
                >
                    ❮❮ First
                </button>

                {/* Last */}
                <button
                    onClick={() => goTo(questions.length - 1)}
                    style={{
                        background: '#f59e0b', color: '#1a1a2e', border: 'none',
                        padding: '10px 18px', borderRadius: '6px', cursor: 'pointer',
                        fontWeight: '700', fontSize: '0.88rem',
                    }}
                >
                    Last ❯❯
                </button>

                {/* Previous */}
                <button
                    onClick={() => goTo(currentQ - 1)}
                    disabled={currentQ === 0}
                    style={{
                        background: currentQ === 0 ? '#374151' : '#ea580c', color: 'white', border: 'none',
                        padding: '10px 18px', borderRadius: '6px', cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: '700', fontSize: '0.88rem',
                    }}
                >
                    ❮ Previous
                </button>

                {/* Next / Save & Next */}
                <button
                    onClick={() => goTo(currentQ + 1)}
                    disabled={currentQ === questions.length - 1}
                    style={{
                        background: currentQ === questions.length - 1 ? '#374151' : '#22c55e',
                        color: 'white', border: 'none',
                        padding: '10px 18px', borderRadius: '6px',
                        cursor: currentQ === questions.length - 1 ? 'not-allowed' : 'pointer',
                        fontWeight: '700', fontSize: '0.88rem',
                    }}
                >
                    Next ❯
                </button>

                {/* Save */}
                <button
                    onClick={() => goTo(currentQ + 1)}
                    style={{
                        background: '#0891b2', color: 'white', border: 'none',
                        padding: '10px 18px', borderRadius: '6px', cursor: 'pointer',
                        fontWeight: '700', fontSize: '0.88rem',
                        marginLeft: 'auto',
                    }}
                >
                    💾 Save
                </button>
            </div>

            {/* FINISH CONFIRM DIALOG */}
            {showFinishConfirm && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '32px',
                        maxWidth: '420px', width: '90%', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
                        <h3 style={{ color: '#1a1a2e', marginBottom: '8px' }}>Finish Exam?</h3>
                        <p style={{ color: '#6b7280', marginBottom: '8px', fontSize: '0.9rem' }}>
                            You have answered <strong style={{ color: '#22c55e' }}>{attempted}</strong> of <strong>{questions.length}</strong> questions.
                        </p>
                        {attempted < questions.length && (
                            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '20px' }}>
                                ⚠️ {questions.length - attempted} questions unanswered!
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowFinishConfirm(false)}
                                style={{
                                    background: '#f3f4f6', color: '#374151', border: 'none',
                                    padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                                }}
                            >
                                Continue Exam
                            </button>
                            <button
                                onClick={handleFinish}
                                style={{
                                    background: '#ef4444', color: 'white', border: 'none',
                                    padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700',
                                }}
                            >
                                Yes, Finish!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
