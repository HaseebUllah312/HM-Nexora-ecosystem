'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';

export default function SubjectManager() {
    const [subjects, setSubjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSubject, setNewSubject] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetch('/api/subjects')
            .then(res => res.json())
            .then(data => {
                setSubjects(data);
                setLoading(false);
            });
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubject) return;

        setAdding(true);
        try {
            const res = await fetch('/api/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: newSubject })
            });
            const data = await res.json();

            if (res.ok) {
                setSubjects(data.subjects); // API returns updated list
                setNewSubject('');
                alert('Subject Added Successfully!');
            } else {
                alert(data.error || 'Failed to add');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setAdding(false);
        }
    };

    if (loading) return (
        <div className="page">
            <div className="container">
                <Skeleton height="50px" width="300px" style={{ marginBottom: '20px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} height="40px" />)}
                </div>
            </div>
        </div>
    );

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ marginBottom: '5px' }}>📚 Subject Manager</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Total Subjects: {subjects.length}</p>
                    </div>
                    <Link href="/admin" className="btn btn-secondary">&larr; Back to Dashboard</Link>
                </div>

                <div className="card" style={{ marginBottom: '40px' }}>
                    <h3>Add New Subject</h3>
                    <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <input
                            className="form-input"
                            placeholder="Ex: CYBER501"
                            value={newSubject}
                            onChange={e => setNewSubject(e.target.value.toUpperCase())}
                            style={{ flex: 1 }}
                        />
                        <button className="btn btn-success" disabled={adding}>
                            {adding ? 'Adding...' : '➕ Add Subject'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3>All Subjects</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: '10px',
                        marginTop: '20px',
                        maxHeight: '500px',
                        overflowY: 'auto'
                    }}>
                        {subjects.map(sub => (
                            <div key={sub} style={{
                                background: 'var(--bg-primary)',
                                padding: '10px',
                                borderRadius: '6px',
                                textAlign: 'center',
                                fontSize: '0.9rem',
                                border: '1px solid var(--border)'
                            }}>
                                {sub}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
