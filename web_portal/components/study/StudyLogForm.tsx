'use client';
import { useState } from 'react';
import allSubjects from '@/data/subjects.json';

export default function StudyLogForm({ onLogSaved }: { onLogSaved: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject_code: '',
        duration: 30,
        topics: '',
        study_date: new Date().toISOString().split('T')[0]
    });
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/user/study-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setFormData({ ...formData, topics: '' });
                setMessage({ text: 'Study session logged successfully! 🎯', type: 'success' });
                onLogSaved();
                setTimeout(() => setMessage(null), 3000);
            } else {
                const data = await res.json();
                setMessage({ text: data.error || 'Failed to save log', type: 'error' });
            }
        } catch (err) {
            console.error('Error logging study:', err);
            setMessage({ text: 'Connection error. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Log Your Study Session</h3>
            
            {message && (
                <div style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    fontSize: '0.9rem',
                    background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
                }}>
                    {message.text}
                </div>
            )}

            <div className="calc-row" style={{ display: 'grid', gap: '15px' }}>
                <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select 
                        required
                        value={formData.subject_code}
                        onChange={e => setFormData({...formData, subject_code: e.target.value})}
                        className="form-control"
                        style={{ 
                            background: 'var(--bg-secondary)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                            padding: '12px',
                            color: 'var(--text-primary)',
                            width: '100%',
                            colorScheme: 'dark'
                        }}
                    >
                        <option value="" style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Select Subject</option>
                        {allSubjects.map(code => (
                            <option key={code} value={code} style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>
                                {code}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Duration (Minutes): {formData.duration}m</label>
                    <input 
                        type="range" 
                        min="5" 
                        max="300" 
                        step="5"
                        value={formData.duration}
                        onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                        style={{ width: '100%' }}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Topics Studied (Optional)</label>
                    <textarea 
                        placeholder="What did you learn today?"
                        value={formData.topics}
                        onChange={e => setFormData({...formData, topics: e.target.value})}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border-color)', 
                            background: 'var(--bg-secondary)', 
                            color: 'var(--text-primary)',
                            minHeight: '80px',
                            colorScheme: 'dark'
                        }}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Date</label>
                    <input 
                        type="date"
                        value={formData.study_date}
                        onChange={e => setFormData({...formData, study_date: e.target.value})}
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border-color)', 
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            colorScheme: 'dark'
                        }}
                    />
                </div>

                <button 
                    disabled={loading}
                    className="btn btn-primary btn-block" 
                    style={{ marginTop: '10px' }}
                >
                    {loading ? 'Saving...' : 'Save Study Entry 📝'}
                </button>
            </div>
        </form>
    );
}
