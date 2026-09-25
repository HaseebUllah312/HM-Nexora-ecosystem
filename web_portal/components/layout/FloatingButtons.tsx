'use client';
import { useState } from 'react';
import WhatsAppFab from './WhatsAppFab';

export default function FloatingButtons() {
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! 👋 I\'m your VU AI Assistant. How can I help you today? Ask me about any subject, concept, or exam preparation!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'Sorry, I could not process that. Please try again.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: 'I\'m having trouble connecting. Please check your internet and try again.' }]);
        }
        setLoading(false);
    };

    return (
        <>
            {/* WhatsApp Support Hub (Bot, Group, Admin) */}
            <WhatsAppFab />

            {/* YouTube Button */}
            <a href="https://youtube.com/@hmnexora?si=BP1iRNlzm3lr1lgJ" 
               className="float-btn-base youtube-float" 
               target="_blank" 
               rel="noopener noreferrer" 
               aria-label="Visit YouTube"
               style={{ background: '#ff0000', color: 'white' }}>
                🎬
                <span className="float-tooltip" style={{ background: '#ff0000', color: 'white' }}>Watch VU Guides on YouTube</span>
            </a>

            {/* AI Chat Toggle */}
            <button className="chat-toggle float-btn-base" onClick={() => setChatOpen(!chatOpen)} aria-label="AI Assistant">
                {chatOpen ? '✕' : '🤖'}
                {!chatOpen && <span className="float-tooltip">AI Study Assistant</span>}
            </button>

            {/* AI Chat Widget */}
            {chatOpen && (
                <div className="chat-widget">
                    <div className="chat-header">
                        <div>
                            <strong style={{ fontSize: '1rem' }}>🤖 AI Study Assistant</strong>
                            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>Academic Platform</div>
                        </div>
                        <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.role}`}>
                                <div className="chat-bubble">{msg.text}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-msg bot">
                                <div className="chat-bubble">Thinking... ✨</div>
                            </div>
                        )}
                    </div>
                    <div className="chat-input-area">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask anything about VU..."
                            disabled={loading}
                        />
                        <button className="chat-send" onClick={sendMessage} disabled={loading}>➤</button>
                    </div>
                </div>
            )}
        </>
    );
}
