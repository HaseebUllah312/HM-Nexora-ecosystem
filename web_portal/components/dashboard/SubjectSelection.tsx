import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiXMark, HiMagnifyingGlass } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

interface SubjectSelectionProps {
    onClose: () => void;
    currentSubjects?: string[];
}

export default function SubjectSelection({ onClose, currentSubjects = [] }: SubjectSelectionProps) {
    const [selected, setSelected] = useState<string[]>(currentSubjects);
    const [searchTerm, setSearchTerm] = useState('');
    const [saving, setSaving] = useState(false);
    const [dbSubjects, setDbSubjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await fetch('/api/subjects');
                if (res.ok) {
                    const data = await res.json();
                    setDbSubjects(data.map((s: any) => s.code));
                }
            } catch (err) {
                console.error("Failed to fetch subjects", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    const toggleSubject = (code: string) => {
        if (selected.includes(code)) {
            setSelected(selected.filter(s => s !== code));
        } else if (selected.length < 10) {
            setSelected([...selected, code]);
        }
    };

    const handleSave = async () => {
        if (selected.length === 0) return;
        setSaving(true);
        try {
            const res = await fetch('/api/user/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjects: selected })
            });
            if (res.ok) {
                router.refresh();
                onClose();
            } else {
                alert('Failed to save selections. Please try again.');
            }
        } catch (err) {
            alert('Connection error');
        } finally {
            setSaving(false);
        }
    };

    const filteredSubjects = dbSubjects.filter(s => 
        s.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort();

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.95)',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 3000,
            }}
        >
            {/* Improved Header with Save Button */}
            <div style={{
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                paddingTop: 'calc(20px + env(safe-area-inset-top))'
            }}>
                <button 
                    onClick={onClose}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
                >
                    Cancel
                </button>
                
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Subjects ({selected.length}/10)</h2>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving || selected.length === 0}
                    style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        opacity: (saving || selected.length === 0) ? 0.5 : 1,
                        cursor: 'pointer'
                    }}
                >
                    {saving ? '...' : 'Save'}
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="no-scrollbar">
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ position: 'relative' }}>
                            <HiMagnifyingGlass style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search by Subject Code (e.g. CS101)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 18px 14px 44px',
                                    borderRadius: '14px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="spinner" style={{ margin: '0 auto' }} />
                        </div>
                    ) : filteredSubjects.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No subjects found.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                            gap: '10px',
                            paddingBottom: '80px' // Space for scrolling
                        }}>
                            {filteredSubjects.map(code => (
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                key={code}
                                onClick={() => toggleSubject(code)}
                                style={{
                                    padding: '14px 10px',
                                    borderRadius: '14px',
                                    background: selected.includes(code) ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                                    border: '2px solid',
                                    borderColor: selected.includes(code) ? 'var(--accent-primary)' : 'transparent',
                                    color: selected.includes(code) ? 'var(--accent-primary)' : 'var(--text-primary)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '700',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '2px'
                                }}
                            >
                                {code}
                                {selected.includes(code) && (
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>SELECTED</span>
                                )}
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </motion.div>
    );
}
