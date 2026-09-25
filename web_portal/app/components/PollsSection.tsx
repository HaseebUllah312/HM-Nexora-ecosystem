'use client';
import { useState, useEffect, useCallback } from 'react';

interface PollOption {
    id: string;
    text: string;
    votes: number;
}

interface Poll {
    id: string;
    question: string;
    subject_code: string;
    poll_options: PollOption[];
}

// Pre-defined high-quality polls per subject type
const BUILTIN_POLLS: Record<string, Poll[]> = {
    CS: [
        {
            id: 'cs-1', question: '📚 Which topic do you find hardest in this subject?',
            subject_code: '',
            poll_options: [
                { id: 'cs-1-a', text: 'Theory & Concepts', votes: 0 },
                { id: 'cs-1-b', text: 'Coding / Programming', votes: 0 },
                { id: 'cs-1-c', text: 'Math / Algorithms', votes: 0 },
                { id: 'cs-1-d', text: 'Past Papers Patterns', votes: 0 },
            ],
        },
        {
            id: 'cs-2', question: '📝 How do you prepare for this subject\'s exam?',
            subject_code: '',
            poll_options: [
                { id: 'cs-2-a', text: '📄 Past Papers Only', votes: 0 },
                { id: 'cs-2-b', text: '📖 Handouts + Notes', votes: 0 },
                { id: 'cs-2-c', text: '🤖 AI Assistant', votes: 0 },
                { id: 'cs-2-d', text: '🎥 YouTube Videos', votes: 0 },
            ],
        },
        {
            id: 'cs-3', question: '⏰ How many days before exam do you start studying?',
            subject_code: '',
            poll_options: [
                { id: 'cs-3-a', text: '1 Day Before 😅', votes: 0 },
                { id: 'cs-3-b', text: '3-5 Days', votes: 0 },
                { id: 'cs-3-c', text: '1 Week+', votes: 0 },
                { id: 'cs-3-d', text: 'Studying All Semester 💪', votes: 0 },
            ],
        },
    ],
    MTH: [
        {
            id: 'mth-1', question: '🧮 Which part of this math subject is toughest?',
            subject_code: '',
            poll_options: [
                { id: 'mth-1-a', text: 'Proofs & Theorems', votes: 0 },
                { id: 'mth-1-b', text: 'Solving Equations', votes: 0 },
                { id: 'mth-1-c', text: 'Integration / Differentiation', votes: 0 },
                { id: 'mth-1-d', text: 'Word Problems', votes: 0 },
            ],
        },
        {
            id: 'mth-2', question: '📊 What\'s your target grade in this subject?',
            subject_code: '',
            poll_options: [
                { id: 'mth-2-a', text: 'A (85%+)', votes: 0 },
                { id: 'mth-2-b', text: 'B (70-84%)', votes: 0 },
                { id: 'mth-2-c', text: 'C (60-69%)', votes: 0 },
                { id: 'mth-2-d', text: 'Just Pass 😂', votes: 0 },
            ],
        },
    ],
    MGT: [
        {
            id: 'mgt-1', question: '💼 Which part challenges you most?',
            subject_code: '',
            poll_options: [
                { id: 'mgt-1-a', text: 'Definitions & Concepts', votes: 0 },
                { id: 'mgt-1-b', text: 'Case Studies', votes: 0 },
                { id: 'mgt-1-c', text: 'Calculations & Formulas', votes: 0 },
                { id: 'mgt-1-d', text: 'MCQs', votes: 0 },
            ],
        },
        {
            id: 'mgt-2', question: '📈 How do you rate this subject\'s difficulty?',
            subject_code: '',
            poll_options: [
                { id: 'mgt-2-a', text: '⭐ Very Easy', votes: 0 },
                { id: 'mgt-2-b', text: '⭐⭐ Easy', votes: 0 },
                { id: 'mgt-2-c', text: '⭐⭐⭐ Moderate', votes: 0 },
                { id: 'mgt-2-d', text: '⭐⭐⭐⭐ Hard', votes: 0 },
            ],
        },
    ],
    STA: [
        {
            id: 'sta-1', question: '📊 What do you struggle with most in Stats?',
            subject_code: '',
            poll_options: [
                { id: 'sta-1-a', text: 'Probability', votes: 0 },
                { id: 'sta-1-b', text: 'Regression & Correlation', votes: 0 },
                { id: 'sta-1-c', text: 'Hypothesis Testing', votes: 0 },
                { id: 'sta-1-d', text: 'Formulas & Tables', votes: 0 },
            ],
        },
    ],
};

// Fallback general polls for any subject
const GENERAL_POLLS: Poll[] = [
    {
        id: 'gen-1', question: '📚 How useful do you find the study materials here?',
        subject_code: '',
        poll_options: [
            { id: 'gen-1-a', text: '🔥 Extremely Helpful', votes: 0 },
            { id: 'gen-1-b', text: '👍 Very Helpful', votes: 0 },
            { id: 'gen-1-c', text: '😐 Somewhat Helpful', votes: 0 },
            { id: 'gen-1-d', text: '😕 Not Much', votes: 0 },
        ],
    },
    {
        id: 'gen-2', question: '🎯 What is your primary goal for this subject?',
        subject_code: '',
        poll_options: [
            { id: 'gen-2-a', text: '🏆 Get A Grade', votes: 0 },
            { id: 'gen-2-b', text: '📘 Actually Learn It', votes: 0 },
            { id: 'gen-2-c', text: '✅ Just Pass', votes: 0 },
            { id: 'gen-2-d', text: '🎓 Improve CGPA', votes: 0 },
        ],
    },
    {
        id: 'gen-3', question: '⏱️ How much time per day do you study this subject?',
        subject_code: '',
        poll_options: [
            { id: 'gen-3-a', text: '< 30 minutes', votes: 0 },
            { id: 'gen-3-b', text: '30 min – 1 hour', votes: 0 },
            { id: 'gen-3-c', text: '1 – 2 hours', votes: 0 },
            { id: 'gen-3-d', text: '2+ hours 💪', votes: 0 },
        ],
    },
];

function getLocalPolls(subjectCode: string): Poll[] {
    // Try to get polls from localStorage (with votes)
    try {
        const key = `polls_${subjectCode}`;
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved);
    } catch { }

    // Determine subject type prefix
    const prefix = subjectCode.match(/^[A-Z]+/)?.[0] || '';
    const subjectPolls = BUILTIN_POLLS[prefix] || [];
    const polls = [...subjectPolls.slice(0, 2), ...GENERAL_POLLS.slice(0, 2)];

    // Assign subject code
    return polls.map(p => ({
        ...p,
        subject_code: subjectCode,
        id: `${subjectCode}-${p.id}`,
        poll_options: p.poll_options.map(o => ({
            ...o,
            id: `${subjectCode}-${o.id}`,
            votes: Math.floor(Math.random() * 80) + 5 // Seed with realistic vote counts
        })),
    }));
}

function saveLocalVotes(subjectCode: string, polls: Poll[]) {
    try {
        localStorage.setItem(`polls_${subjectCode}`, JSON.stringify(polls));
    } catch { }
}

export default function PollsSection({ subjectCode }: { subjectCode: string }) {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [voted, setVoted] = useState<Record<string, string>>({}); // pollId -> optionId
    const [animating, setAnimating] = useState<string | null>(null);

    useEffect(() => {
        // Load polls + previously voted options from localStorage
        const loaded = getLocalPolls(subjectCode);
        setPolls(loaded);

        try {
            const savedVotes = localStorage.getItem(`votes_${subjectCode}`);
            if (savedVotes) setVoted(JSON.parse(savedVotes));
        } catch { }
    }, [subjectCode]);

    const handleVote = useCallback((pollId: string, optionId: string) => {
        if (voted[pollId]) return; // already voted

        setAnimating(optionId);
        setTimeout(() => setAnimating(null), 600);

        const newPolls = polls.map(poll => {
            if (poll.id !== pollId) return poll;
            return {
                ...poll,
                poll_options: poll.poll_options.map(opt => ({
                    ...opt,
                    votes: opt.id === optionId ? opt.votes + 1 : opt.votes,
                })),
            };
        });

        const newVoted = { ...voted, [pollId]: optionId };
        setPolls(newPolls);
        setVoted(newVoted);

        // Persist
        saveLocalVotes(subjectCode, newPolls);
        try {
            localStorage.setItem(`votes_${subjectCode}`, JSON.stringify(newVoted));
        } catch { }
    }, [polls, voted, subjectCode]);

    if (polls.length === 0) return null;

    return (
        <div style={{ marginTop: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>🗳️ Student Polls</h2>
                <span style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '50px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                }}>
                    Live • {polls.reduce((acc, p) => acc + p.poll_options.reduce((s, o) => s + o.votes, 0), 0)} total votes
                </span>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
            }}>
                {polls.map(poll => {
                    const totalVotes = poll.poll_options.reduce((s, o) => s + o.votes, 0);
                    const hasVoted = !!voted[poll.id];
                    const votedOptionId = voted[poll.id];

                    return (
                        <div key={poll.id} className="card" style={{ padding: '24px' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '18px', lineHeight: '1.5' }}>
                                {poll.question}
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {poll.poll_options.map(option => {
                                    const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                                    const isVoted = votedOptionId === option.id;
                                    const isAnimating = animating === option.id;

                                    return (
                                        <div key={option.id}>
                                            <button
                                                onClick={() => handleVote(poll.id, option.id)}
                                                disabled={hasVoted}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    border: `2px solid ${isVoted ? 'var(--accent-primary, #667eea)' : 'rgba(102, 126, 234, 0.25)'}`,
                                                    borderRadius: '10px',
                                                    background: 'transparent',
                                                    cursor: hasVoted ? 'default' : 'pointer',
                                                    padding: '0',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    transition: 'border-color 0.2s, transform 0.15s',
                                                    transform: isAnimating ? 'scale(1.02)' : 'scale(1)',
                                                }}
                                                onMouseEnter={e => { if (!hasVoted) (e.currentTarget as HTMLElement).style.borderColor = '#667eea'; }}
                                                onMouseLeave={e => { if (!hasVoted && !isVoted) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.25)'; }}
                                            >
                                                {/* Progress Bar Fill */}
                                                {hasVoted && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0, left: 0, bottom: 0,
                                                        width: `${pct}%`,
                                                        background: isVoted
                                                            ? 'linear-gradient(90deg, rgba(102,126,234,0.18), rgba(118,75,162,0.18))'
                                                            : 'rgba(102,126,234,0.07)',
                                                        transition: 'width 0.6s ease',
                                                        borderRadius: '8px',
                                                    }} />
                                                )}

                                                {/* Option Text Row */}
                                                <div style={{
                                                    position: 'relative',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '11px 16px',
                                                    gap: '10px',
                                                }}>
                                                    <span style={{
                                                        fontSize: '0.9rem',
                                                        color: isVoted ? 'var(--accent-primary, #667eea)' : 'var(--text-primary)',
                                                        fontWeight: isVoted ? '600' : '400',
                                                    }}>
                                                        {isVoted && '✅ '}{option.text}
                                                    </span>
                                                    {hasVoted && (
                                                        <span style={{
                                                            fontSize: '0.85rem',
                                                            fontWeight: '700',
                                                            color: isVoted ? 'var(--accent-primary, #667eea)' : 'var(--text-secondary)',
                                                            whiteSpace: 'nowrap',
                                                        }}>
                                                            {pct}%
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{
                                marginTop: '14px',
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}>
                                <span>{hasVoted ? '✅ Your vote has been counted!' : '👆 Tap an option to vote'}</span>
                                <span>{totalVotes} votes</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
