'use client';
import { useState, useEffect } from 'react';

export default function UserLinks() {
    const [links, setLinks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', url: '' });
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const fetchLinks = async () => {
        try {
            const res = await fetch('/api/user/links');
            if (res.ok) setLinks(await res.json());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.url) return;

        try {
            const res = await fetch('/api/user/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchLinks();
                setFormData({ title: '', url: '' });
                setMessage({ text: 'Link added! 🔗', type: 'success' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                const data = await res.json();
                setMessage({ text: data.error || 'Failed to add link', type: 'error' });
            }
        } catch (err) {
            console.error('Error saving link:', err);
            setMessage({ text: 'Error connecting to database', type: 'error' });
        }
    };

    const deleteLink = async (id: string) => {
        try {
            const res = await fetch('/api/user/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            if (res.ok) fetchLinks();
        } catch (err) {
            console.error('Error deleting link:', err);
            setMessage({ text: 'Failed to delete link', type: 'error' });
        }
    };

    if (loading) return <div>Loading links...</div>;

    return (
        <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>🔗 My Quick Links</h3>
            
            {message && (
                <div style={{ 
                    padding: '10px', 
                    borderRadius: '8px', 
                    marginBottom: '15px',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
                }}>
                    {message.text}
                </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Link Title (e.g. Maths Drive)" 
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        style={{ 
                            flex: 1, 
                            padding: '10px', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border-color)', 
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    />
                    <input 
                        type="url" 
                        placeholder="URL (https://...)" 
                        value={formData.url}
                        onChange={e => setFormData({...formData, url: e.target.value})}
                        style={{ 
                            flex: 2, 
                            padding: '10px', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border-color)', 
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>
                <button className="btn btn-secondary btn-sm" style={{ padding: '10px' }}>+ Add Link</button>
            </form>

            <div style={{ display: 'grid', gap: '10px' }}>
                {links.map(link => (
                    <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(var(--primary-rgb), 0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ fontWeight: '500', color: 'var(--primary-color)', textDecoration: 'none' }}
                        >
                            🔗 {link.title}
                        </a>
                        <button onClick={() => deleteLink(link.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>✕</button>
                    </div>
                ))}
                {links.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        No quick links saved. Add your GDrive folders or YouTube links here!
                    </p>
                )}
            </div>
        </div>
    );
}
