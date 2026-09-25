'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';

// Types for our Quiz Data
interface Question {
    id: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    question: string;
    options: string[];
    correct: number;
    explanation: string;
}

interface Topic {
    id: string;
    name: string;
    term?: 'Midterm' | 'Final';
    questions: Question[];
}

interface QuizData {
    subject: string;
    title: string;
    topics: Topic[];
}

export default function QuizPage() {
    const params = useParams();
    const code = params.code as string;
    const router = useRouter();

    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    // Quiz State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [activeTab, setActiveTab] = useState<'Midterm' | 'Final'>('Midterm');

    // Fetch Quiz Data
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await fetch(`/api/quiz/data?subject=${code}`);
                if (!response.ok) throw new Error('Failed to fetch quiz data');
                const data = await response.json();
                setQuizData(data as QuizData);
            } catch (error) {
                console.error("Failed to load quiz", error);
                setQuizData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [code]);

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const handleTopicSelect = (topic: Topic) => {
        // Randomize questions
        const shuffledQuestions = shuffleArray(topic.questions).map(q => {
            // Randomize options for each question
            const originalOptions = [...q.options];
            const correctOptionText = originalOptions[q.correct];
            const shuffledOptions = shuffleArray(originalOptions);
            const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

            return {
                ...q,
                options: shuffledOptions,
                correct: newCorrectIndex
            };
        });

        setSelectedTopic({
            ...topic,
            questions: shuffledQuestions
        });
        setCurrentQuestionIndex(0);
        setScore(0);
        setIsFinished(false);
        setShowExplanation(false);
        setSelectedOption(null);
    };

    const handleAnswer = (index: number) => {
        if (showExplanation) return; // Prevent changing after answer
        setSelectedOption(index);
        setShowExplanation(true);

        if (index === selectedTopic?.questions[currentQuestionIndex].correct) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (!selectedTopic) return;
        if (currentQuestionIndex < selectedTopic.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            setIsFinished(true);
        }
    };

    if (loading) return (
        <div className="page">
            <div className="container">
                <Skeleton width="40%" height="40px" style={{ marginBottom: '20px' }} />
                <Skeleton width="60%" height="20px" style={{ marginBottom: '40px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    <Skeleton height="150px" />
                    <Skeleton height="150px" />
                    <Skeleton height="150px" />
                </div>
            </div>
        </div>
    );

    if (!quizData) return (
        <div className="page">
            <div className="container">
                <h1>Quiz Not Found</h1>
                <p>Sorry, we don't have a quiz for <strong>{code}</strong> yet.</p>
                <Link href="/subjects" className="btn btn-primary">Back to Subjects</Link>
            </div>
        </div>
    );



    // ... (existing helper functions)

    // TOPIC SELECTION VIEW
    if (!selectedTopic) {
        // Filter topics by active tab
        // Detect if this subject's data has term tags at all
        const hasTermTags = quizData.topics.some(t => !!t.term);

        let filteredTopics: Topic[];
        if (hasTermTags) {
            // Format A: filter by the active tab's term
            filteredTopics = quizData.topics.filter(t => t.term === activeTab);
        } else {
            // Format B/C: no term tags — split by position
            // First half = Midterm, second half = Final
            const midCutoff = Math.ceil(quizData.topics.length / 2);
            filteredTopics = activeTab === 'Midterm'
                ? quizData.topics.slice(0, midCutoff)
                : quizData.topics.slice(midCutoff);

            // Edge case: only 1 topic — show it in both tabs
            if (quizData.topics.length <= 1) {
                filteredTopics = quizData.topics;
            }
        }

        return (
            <div className="page">
                <div className="container">
                    <Link href={`/subjects/${code}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
                        ← Back to {code}
                    </Link>
                    <h1>🎓 {code}: Practice Mode</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '30px' }}>
                        Select a topic to master your concepts.
                    </p>

                    {/* Tabs */}
                    <div className="tabs" style={{ marginBottom: '30px' }}>
                        <button className={`tab ${activeTab === 'Midterm' ? 'active' : ''}`} onClick={() => setActiveTab('Midterm')}>Midterm Syllabus</button>
                        <button className={`tab ${activeTab === 'Final' ? 'active' : ''}`} onClick={() => setActiveTab('Final')}>Final Syllabus</button>
                    </div>

                    {filteredTopics.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            <h3>No topics found for {activeTab} yet.</h3>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {filteredTopics.map(topic => (
                                <div key={topic.id} className="card topic-card" onClick={() => handleTopicSelect(topic)} style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{topic.name}</h3>
                                        {/* <span className="badge">{topic.questions.length} Qs</span> */}
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{topic.questions.length} Questions • {topic.term}</p>
                                    <div style={{ marginTop: '15px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                                        Start Practice →
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // RESULTS VIEW
    if (isFinished) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
                    <div className="card" style={{ padding: '40px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                            {score === selectedTopic.questions.length ? '🏆' : score > selectedTopic.questions.length / 2 ? '👏' : '📚'}
                        </div>
                        <h2>{selectedTopic.name} Complete!</h2>
                        <p style={{ fontSize: '1.5rem', margin: '20px 0' }}>
                            You scored <strong>{score} / {selectedTopic.questions.length}</strong>
                        </p>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                            <button className="btn btn-outline" onClick={() => setSelectedTopic(null)}>Choose Another Topic</button>
                            <button className="btn btn-primary" onClick={() => handleTopicSelect(selectedTopic)}>Retry Topic ↻</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // QUIZ QUESTION VIEW
    const question = selectedTopic.questions[currentQuestionIndex];

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => setSelectedTopic(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        ← Exit Topic
                    </button>
                    <div>
                        Question {currentQuestionIndex + 1} / {selectedTopic.questions.length}
                    </div>
                </div>

                <div className="progress-bar" style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', marginBottom: '30px' }}>
                    <div style={{
                        width: `${((currentQuestionIndex) / selectedTopic.questions.length) * 100}%`,
                        background: 'var(--primary)',
                        height: '100%',
                        borderRadius: '3px',
                        transition: 'width 0.3s'
                    }} />
                </div>

                <div className="card" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <span className={`badge ${question.difficulty === 'Easy' ? 'badge-success' : question.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                            {question.difficulty}
                        </span>
                        <button
                            className="btn btn-sm btn-outline"
                            style={{ color: 'var(--text-muted)', border: 'none', padding: '4px 8px' }}
                            onClick={() => alert(`Reported Question ID: ${question.id}. Thank you! Admin will review.`)}
                            title="Report Error"
                        >
                            🚩 Report
                        </button>
                    </div>

                    <h2 style={{ marginBottom: '30px', fontSize: '1.4rem', lineHeight: '1.5' }}>
                        {question.question}
                    </h2>

                    <div style={{ display: 'grid', gap: '15px' }}>
                        {question.options.map((opt, idx) => {
                            let bg = 'var(--card-bg-hover)';
                            let border = '1px solid transparent';

                            if (showExplanation) {
                                if (idx === question.correct) {
                                    bg = 'rgba(46, 204, 113, 0.2)'; // Green tint
                                    border = '1px solid var(--success)';
                                } else if (idx === selectedOption && idx !== question.correct) {
                                    bg = 'rgba(231, 76, 60, 0.2)'; // Red tint
                                    border = '1px solid var(--error)';
                                }
                            } else if (selectedOption === idx) {
                                bg = 'var(--primary)';
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={showExplanation}
                                    style={{
                                        padding: '16px',
                                        textAlign: 'left',
                                        borderRadius: '8px',
                                        border: border,
                                        background: bg,
                                        cursor: showExplanation ? 'default' : 'pointer',
                                        fontSize: '1rem',
                                        color: selectedOption === idx && !showExplanation ? 'white' : 'var(--text-primary)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{String.fromCharCode(65 + idx)}.</span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {showExplanation && (
                    <div className="fade-in" style={{ marginTop: '20px' }}>
                        <div style={{
                            background: 'var(--info-bg, #e8f4fd)',
                            borderLeft: '4px solid var(--info, #2196f3)',
                            padding: '20px',
                            borderRadius: '4px',
                            marginBottom: '20px'
                        }}>
                            <h4 style={{ margin: '0 0 10px 0', color: 'var(--info)' }}>💡 Concept Explanation</h4>
                            <p style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>{question.explanation}</p>
                        </div>

                        <button className="btn btn-primary btn-lg btn-block" onClick={nextQuestion}>
                            {currentQuestionIndex < selectedTopic.questions.length - 1 ? 'Next Question →' : 'See Results 🏆'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
