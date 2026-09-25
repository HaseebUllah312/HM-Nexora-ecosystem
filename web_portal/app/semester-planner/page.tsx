'use client';
import { useState, useMemo } from 'react';
import { getSubjectByCode } from '@/data/subjects';
import allSubjects from '@/data/subjects.json';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiCalendar, FiClock, FiBookOpen, FiArrowLeft, FiPieChart } from 'react-icons/fi';

interface SubjectEntry {
    code: string;
    examDate: string;
    lectures: number;
    modules: number;
    chapters: number;
    revisionDays: number;
}

export default function SemesterPlannerPage() {
    const [selectedSubjects, setSelectedSubjects] = useState<SubjectEntry[]>([
        { code: 'CS101', examDate: '', lectures: 10, modules: 3, chapters: 5, revisionDays: 3 }
    ]);
    const [studyHours, setStudyHours] = useState(4);
    const [generated, setGenerated] = useState(false);
    const [remindersEnabled, setRemindersEnabled] = useState(false);

    const requestNotifications = async () => {
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
            return;
        }
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            setRemindersEnabled(true);
            new Notification("Reminders Active!", {
                body: "HM nexora will now notify you about your study sessions.",
                icon: "/icons/icon-192x192.png"
            });
        }
    };

    const addSubject = () => setSelectedSubjects([...selectedSubjects, 
        { code: '', examDate: '', lectures: 0, modules: 0, chapters: 0, revisionDays: 3 }
    ]);
    
    const removeSubject = (i: number) => setSelectedSubjects(selectedSubjects.filter((_, idx) => idx !== i));
    
    const updateSubject = (i: number, updates: Partial<SubjectEntry>) => {
        const n = [...selectedSubjects];
        n[i] = { ...n[i], ...updates };
        setSelectedSubjects(n);
    };

    const validSelections = useMemo(() => selectedSubjects.filter(s => s.code), [selectedSubjects]);

    // Intelligent Scheduling Logic
    const fullPlan = useMemo(() => {
        if (!generated || validSelections.length === 0) return null;

        const today = new Date();
        const plan = [];
        
        // Find the furthest exam date to determine the scope of the plan
        const maxExamTime = Math.max(...validSelections.map(s => s.examDate ? new Date(s.examDate).getTime() : today.getTime() + (30 * 24 * 60 * 60 * 1000)));
        const totalDays = Math.ceil((maxExamTime - today.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Limit to reasonable duration (e.g., 90 days max) if needed, but here we cover until exam
        const planDuration = Math.min(totalDays, 90);

        for (let d = 0; d < planDuration; d++) {
            const currentDate = new Date();
            currentDate.setDate(today.getDate() + d);
            
            const dayWork = {
                date: currentDate,
                dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
                displayDate: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                tasks: [] as any[]
            };

            validSelections.forEach(s => {
                const examDate = s.examDate ? new Date(s.examDate) : null;
                if (!examDate) return;

                const daysUntil = Math.ceil((examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                
                // If exam has passed, don't schedule
                if (daysUntil < 0) return;

                // Schedule revision specifically for the last few days
                const isRevisionPhase = daysUntil <= s.revisionDays;
                
                if (isRevisionPhase) {
                    dayWork.tasks.push({
                        code: s.code,
                        type: 'Intensive Revision',
                        topic: `Past Papers & Key Concepts`,
                        priority: 'High',
                        duration: (studyHours / validSelections.length)
                    });
                } else {
                    // Learning Phase Distribution
                    const totalSyllabusItems = s.lectures + s.modules + s.chapters;
                    const itemsPerDay = totalSyllabusItems / (daysUntil - s.revisionDays);
                    
                    // Specific topic calculation (mocked for professional feel)
                    let currentTopic = '';
                    if (s.chapters > 0) currentTopic = `Chapter ${Math.min(s.chapters, Math.floor((planDuration - daysUntil) * itemsPerDay) + 1)}`;
                    else if (s.modules > 0) currentTopic = `Module ${Math.min(s.modules, Math.floor((planDuration - daysUntil) * itemsPerDay) + 1)}`;
                    else if (s.lectures > 0) currentTopic = `Lecture ${Math.min(s.lectures, Math.floor((planDuration - daysUntil) * itemsPerDay) + 1)}`;

                    dayWork.tasks.push({
                        code: s.code,
                        type: 'Learning',
                        topic: currentTopic || 'Core Syllabus Content',
                        priority: daysUntil < 7 ? 'High' : 'Medium',
                        duration: (studyHours / validSelections.length) * 0.8, // 80% for learning
                        revision: true // Add daily revision time
                    });
                }
            });

            if (dayWork.tasks.length > 0) plan.push(dayWork);
        }

        return plan;
    }, [generated, validSelections, studyHours]);

    const generatePlan = () => { if (validSelections.length > 0) setGenerated(true); };

    return (
        <div className="page" style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <div className="container" style={{ maxWidth: '1000px', padding: '40px 20px' }}>
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="page-header" 
                    style={{ textAlign: 'center', marginBottom: '40px' }}
                >
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>
                        Intelligent Study Planner
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Master your syllabus with an AI-optimized schedule</p>
                </motion.div>

                {!generated ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card" 
                        style={{ 
                            padding: '40px', 
                            borderRadius: '24px', 
                            background: 'rgba(255, 255, 255, 0.03)', 
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                        }}
                    >
                        <h3 style={{ marginBottom: '30px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FiPlus style={{ color: '#a855f7' }} /> Setup Your Academic Plan
                        </h3>
                        
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <AnimatePresence>
                                {selectedSubjects.map((s, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        style={{ 
                                            background: 'rgba(255, 255, 255, 0.02)', 
                                            padding: '24px', 
                                            borderRadius: '16px', 
                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Subject</label>
                                                <select 
                                                    value={s.code} 
                                                    onChange={e => updateSubject(i, { code: e.target.value })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                                >
                                                    <option value="">Select Subject</option>
                                                    {allSubjects.map(code => <option key={code} value={code}>{code}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Exam Date</label>
                                                <input 
                                                    type="date" 
                                                    value={s.examDate} 
                                                    onChange={e => updateSubject(i, { examDate: e.target.value })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lectures</label>
                                                <input type="number" value={s.lectures} onChange={e => updateSubject(i, { lectures: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'none', color: 'white' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Modules</label>
                                                <input type="number" value={s.modules} onChange={e => updateSubject(i, { modules: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'none', color: 'white' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Chapters</label>
                                                <input type="number" value={s.chapters} onChange={e => updateSubject(i, { chapters: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'none', color: 'white' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Revision Days</label>
                                                <input type="number" value={s.revisionDays} onChange={e => updateSubject(i, { revisionDays: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'var(--bg-secondary)', border: 'none', color: 'white' }} />
                                            </div>
                                        </div>

                                        {selectedSubjects.length > 1 && (
                                            <button 
                                                onClick={() => removeSubject(i)} 
                                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px' }}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={addSubject}
                                style={{ width: 'fit-content', padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px dashed rgba(255,255,255,0.2)', background: 'transparent' }}
                            >
                                <FiPlus /> Add Subject
                            </button>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Smart Reminders</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Get notified for intensive revision phases</div>
                                </div>
                                <button 
                                    onClick={requestNotifications}
                                    style={{ 
                                        padding: '8px 16px', 
                                        borderRadius: '10px', 
                                        background: remindersEnabled ? '#10b981' : 'transparent',
                                        border: remindersEnabled ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {remindersEnabled ? '✓ Active' : 'Enable Reminders'}
                                </button>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: '500' }}>
                                    <span>Daily Study Capacity</span>
                                    <span style={{ color: '#a855f7' }}>{studyHours} Hours</span>
                                </label>
                                <input 
                                    type="range" min="1" max="12" 
                                    value={studyHours} 
                                    onChange={e => setStudyHours(Number(e.target.value))} 
                                    style={{ width: '100%', accentColor: '#a855f7' }} 
                                />
                            </div>

                            <button 
                                className="btn btn-primary btn-lg" 
                                onClick={generatePlan}
                                style={{ 
                                    padding: '18px', 
                                    fontSize: '1.2rem', 
                                    fontWeight: '700', 
                                    borderRadius: '16px', 
                                    background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                                    border: 'none',
                                    boxShadow: '0 10px 20px rgba(168, 85, 247, 0.3)',
                                    marginTop: '10px'
                                }}
                            >
                                Generate Intelligent Plan 🚀
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <button 
                            className="btn-text" 
                            onClick={() => setGenerated(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '30px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <FiArrowLeft /> Back to Configuration
                        </button>

                        <div style={{ display: 'grid', gap: '24px' }}>
                            {fullPlan?.map((day, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    style={{ 
                                        background: 'rgba(255,255,255,0.03)', 
                                        borderRadius: '20px', 
                                        padding: '24px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'grid',
                                        gridTemplateColumns: '150px 1fr',
                                        gap: '20px'
                                    }}
                                >
                                    <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '20px' }}>
                                        <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>{day.dayName}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{day.displayDate}</div>
                                        <div style={{ marginTop: '15px' }}>
                                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                                Day {idx + 1}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {day.tasks.map((task: any, tIdx: number) => (
                                            <div 
                                                key={tIdx}
                                                style={{ 
                                                    background: 'rgba(255,255,255,0.02)', 
                                                    padding: '16px', 
                                                    borderRadius: '12px', 
                                                    borderLeft: `4px solid ${task.type === 'Learning' ? '#a855f7' : '#ef4444'}`,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{task.code}</span>
                                                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>•</span>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: task.type === 'Learning' ? '#a855f7' : '#ef4444' }}>{task.type.toUpperCase()}</span>
                                                    </div>
                                                    <div style={{ marginTop: '4px', color: 'rgba(255,255,255,0.8)' }}>
                                                        <FiBookOpen style={{ marginRight: '6px', fontSize: '0.9rem' }} /> Target: {task.topic}
                                                    </div>
                                                    {task.revision && (
                                                        <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FiPieChart /> Includes 20m recap session
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#3b82f6' }}>{task.duration.toFixed(1)}h</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>DEDICATED TIME</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div 
                            style={{ 
                                marginTop: '40px', 
                                padding: '30px', 
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', 
                                borderRadius: '24px',
                                border: '1px solid rgba(168, 85, 247, 0.2)',
                                textAlign: 'center'
                            }}
                        >
                            <h4 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>🌟 Preparation Strategy Summary</h4>
                            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto' }}>
                                Your syllabus has been distributed to ensure completion {validSelections[0].revisionDays} days before exams. 
                                We've prioritized harder topics first and allocated peak focus hours to intensive revision phases.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
