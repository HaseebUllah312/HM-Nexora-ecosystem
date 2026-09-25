'use client';
import { useState, useEffect } from 'react';
import allSubjects from '@/data/subjects.json';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StudyScheduler() {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        subject_code: '',
        day_of_week: 'Monday',
        start_time: '10:00',
        end_time: '12:00',
        is_alarm_enabled: true
    });

    const fetchSchedules = async () => {
        try {
            const res = await fetch('/api/user/study-schedules');
            if (res.ok) setSchedules(await res.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/user/study-schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchSchedules();
                setFormData({ ...formData, subject_code: '' });
            }
        } catch (err) {
            console.error('Error saving schedule:', err);
        }
    };

    const deleteSchedule = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/user/study-schedules?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchSchedules();
        } catch (err) {
            console.error('Error deleting schedule:', err);
        }
    };

    if (loading) return <div>Loading scheduler...</div>;

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <form onSubmit={handleSubmit} className="card" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>Setup Study Alarm (Reminder)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                    <div className="form-group">
                        <label className="form-label">Subject</label>
                        <select 
                            required
                            value={formData.subject_code}
                            onChange={e => setFormData({...formData, subject_code: e.target.value})}
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-color)', 
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                colorScheme: 'dark'
                            }}
                        >
                            <option value="" style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>Select</option>
                            {allSubjects.map(code => (
                                <option key={code} value={code} style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>
                                    {code}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Day</label>
                        <select 
                            value={formData.day_of_week}
                            onChange={e => setFormData({...formData, day_of_week: e.target.value})}
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-color)', 
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                colorScheme: 'dark'
                            }}
                        >
                            {DAYS.map(d => (
                                <option key={d} value={d} style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Start Time</label>
                        <input 
                            type="time" 
                            required
                            value={formData.start_time}
                            onChange={e => setFormData({...formData, start_time: e.target.value})}
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-color)', 
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                colorScheme: 'dark'
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">End Time</label>
                        <input 
                            type="time" 
                            required
                            value={formData.end_time}
                            onChange={e => setFormData({...formData, end_time: e.target.value})}
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-color)', 
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                colorScheme: 'dark'
                            }}
                        />
                    </div>
                </div>
                <button className="btn btn-primary btn-block" style={{ marginTop: '20px' }}>Set Study Reminder ⏰</button>
            </form>

            <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ marginBottom: '20px' }}>Your Schedule</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                    {schedules.map(sch => (
                        <div key={sch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>{sch.day_of_week}</span>
                                <span style={{ margin: '0 10px', color: 'var(--primary-color)' }}>{sch.subject_code}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {sch.start_time} - {sch.end_time}
                                </span>
                            </div>
                            <button onClick={() => deleteSchedule(sch.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                    ))}
                    {schedules.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No reminders set yet.</p>}
                </div>
            </div>
        </div>
    );
}
