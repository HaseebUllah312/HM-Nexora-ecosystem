'use client';
import { useState, useRef, useEffect } from 'react';

const modes = [
    { id: 'quick', label: '⚡ Quick Answer', desc: 'Short, direct answers' },
    { id: 'detailed', label: '📖 Detailed', desc: 'In-depth explanations' },
    { id: 'exam', label: '📝 Exam Prep', desc: 'Exam-focused guidance' },
    { id: 'quiz', label: '🧠 Quiz Mode', desc: 'Practice questions' },
];

const WELCOME = 'Hello! 👋 I\'m your **AI Study Assistant** powered by Gemini AI.\n\nI can help you with:\n📚 Any subject (CS, IT, Math, Management, English...)\n🧠 MCQ practice & quiz generation\n📝 Assignment & project understanding\n❓ Concept clarification\n📊 Exam tips & paper patterns\n\nSelect a mode above and ask me anything — in Urdu or English! 🎓';

export default function AIAssistantPage() {
    const [mode, setMode] = useState('quick');
    const [messages, setMessages] = useState([
        { role: 'bot', text: WELCOME }
    ]);
    const [input, setInput] = useState('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || loading) return;

        const newMessages = [...messages, { role: 'user', text }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    mode,
                    // Filter history to exclude the initial bot welcome message for cleaner context
                    history: messages.slice(1),
                    weakTopics: user?.weak_topics
                }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'Sorry, I could not process that.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Connection error. Please check your internet and try again.' }]);
        }
        setLoading(false);
    };

    // Auto-scroll to bottom on new messages

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Fetch user and initial query
    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                
                // If user has weak topics, add a personalized hint
                if (data.user?.weak_topics) {
                    const topics = Object.entries(data.user.weak_topics).flatMap(([sub, top]: any) => 
                        top.map((t: string) => `${t} (${sub})`)
                    );
                    if (topics.length > 0) {
                        setMessages(prev => [...prev, { 
                            role: 'bot', 
                            text: `📊 **Personalized Hint:** I noticed you recently struggled with: **${topics.slice(0, 3).join(', ')}**. \n\nWould you like me to explain any of these topics to you in detail?` 
                        }]);
                    }
                }
            }
        };
        fetchUser();

        const query = new URLSearchParams(window.location.search).get('q');
        if (query && messages.length === 1) {
            handleSendMessage(query);
        }
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;
        const msg = input.trim();
        setInput('');
        handleSendMessage(msg);
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="page-header">
                    <h1>🤖 AI Study Assistant</h1>
                    <p>Your personal AI tutor for any subject — powered by Gemini AI</p>
                </div>

                {/* Mode Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                    {modes.map(m => (
                        <button key={m.id} className="card" onClick={() => setMode(m.id)}
                            style={{ 
                                padding: '16px', 
                                cursor: 'pointer', 
                                textAlign: 'center', 
                                border: mode === m.id ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)', 
                                background: mode === m.id ? 'var(--accent-glow)' : 'var(--bg-card)',
                                transform: mode === m.id ? 'translateY(-4px)' : 'none',
                                boxShadow: mode === m.id ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                            }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: mode === m.id ? 'var(--accent-secondary)' : 'inherit' }}>{m.label}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{m.desc}</div>
                        </button>
                    ))}
                </div>

                {/* Chat Area */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', background: 'var(--accent-primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🤖</span>
                            <strong>VU AI Assistant <span style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', marginLeft: '6px' }}>({modes.find(m => m.id === mode)?.label})</span></strong>
                        </div>
                        <button onClick={() => setMessages([messages[0]])} className="btn-outline" style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-sm)', minHeight: '32px' }}>Clear Chat</button>
                    </div>

                    <div style={{ minHeight: '400px', maxHeight: '500px', overflowY: 'auto', padding: '20px' }}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
                                <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-msg bot">
                                <div className="chat-bubble">Thinking... ✨</div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
                        <input className="form-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask me anything about your VU subjects..." disabled={loading} style={{ borderRadius: 'var(--radius-full)', border: '2px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }} />
                        <button className="btn btn-primary" onClick={sendMessage} disabled={loading} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', boxShadow: 'none' }}>Send ➤</button>
                    </div>
                </div>

                {/* Suggestion Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                    {[
                        'Explain OOP concepts for CS304',
                        'STA301 midterm important topics',
                        'Generate 5 MCQs on linked lists',
                        'How to solve NPV in FIN622?',
                        'CS402 important topics for exam',
                        'Explain database normalization',
                        'MTH101 calculus exam prep',
                        'What is OSI model? CS601',
                    ].map(s => (
                        <button key={s} className="quick-btn" onClick={() => { setInput(s); }}>{s}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}
