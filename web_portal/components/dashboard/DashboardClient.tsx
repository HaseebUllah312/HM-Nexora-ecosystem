'use client';

import { useState, useEffect } from 'react';
import SubjectSelection from './SubjectSelection';

interface DashboardClientProps {
    user: {
        id: string;
        username: string;
        followed_subjects?: string[];
    };
}

export default function DashboardClient({ user }: DashboardClientProps) {
    const [showSelection, setShowSelection] = useState(false);
    const subjects = user.followed_subjects || [];

    useEffect(() => {
        // Auto-show selection if user has no subjects and isn't admin
        if (subjects.length === 0) {
            setShowSelection(true);
        }
    }, [subjects]);

    return (
        <>
            {showSelection && (
                <SubjectSelection
                    onClose={() => setShowSelection(false)}
                    currentSubjects={subjects}
                />
            )}

            {/* Display Followed Subjects Section */}
            {subjects.length > 0 && (
                <section style={{ marginBottom: '50px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>📚 My Semester Subjects</h2>
                        <button
                            onClick={() => setShowSelection(true)}
                            style={{
                                background: 'rgba(124, 58, 237, 0.1)',
                                border: '1px solid rgba(124, 58, 237, 0.3)',
                                color: 'var(--primary)',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem'
                            }}
                        >
                            Edit Subjects
                        </button>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                        gap: '12px'
                    }}>
                        {subjects.map(code => (
                            <div key={code} style={{
                                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid rgba(124, 58, 237, 0.2)',
                                textAlign: 'center',
                                fontWeight: '700',
                                color: 'var(--primary)',
                                fontSize: '0.9rem'
                            }}>
                                {code}
                            </div>
                        ))}
                    </div>
                    <p style={{ marginTop: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        ✨ You'll receive email alerts for these subjects when new updates are posted.
                    </p>
                </section>
            )}
        </>
    );
}
