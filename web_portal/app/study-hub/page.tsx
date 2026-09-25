'use client';
import { useState } from 'react';
import StudyLogForm from '@/components/study/StudyLogForm';
import StudyHistory from '@/components/study/StudyHistory';
import StudyScheduler from '@/components/study/StudyScheduler';
import RecentStudySummary from '@/components/study/RecentStudySummary';
import UserLinks from '@/components/study/UserLinks';
import { useAuth } from '@/context/AuthContext';

export default function StudyHubPage() {
    const { user, loading: authLoading } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    if (authLoading) return <div className="page"><div className="container">Loading...</div></div>;
    
    if (!user) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <h1>Academic Study Hub</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Please login to track your progress and set study alarms.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div className="page-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊 My Study Hub</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Track daily progress, manage schedules, and stay notified.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                    <div style={{ display: 'grid', gap: '30px' }}>
                        <RecentStudySummary refreshTrigger={refreshTrigger} />
                        <StudyLogForm onLogSaved={() => setRefreshTrigger(t => t + 1)} />
                        <StudyScheduler />
                    </div>
                    <div>
                        <UserLinks />
                        <div style={{ marginTop: '30px' }}>
                            <StudyHistory refreshTrigger={refreshTrigger} />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '40px', padding: '24px', background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--secondary-rgb), 0.1) 100%)', textAlign: 'center' }}>
                    <h3>⏰ Smart Alarms are Active</h3>
                    <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
                        The system will notify you automatically when it's time to study based on your schedule. 
                        Make sure to allow browser notifications!
                    </p>
                </div>
            </div>
        </div>
    );
}
