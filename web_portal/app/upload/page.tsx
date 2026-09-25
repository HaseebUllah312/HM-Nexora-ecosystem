'use client';
import { useState } from 'react';

interface UploadItem {
    id: string;
    file: File;
    code: string;
    category: string;
    title: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
}

const CATEGORIES = ['Midterm Files', 'Final Term Files', 'Solved Assignments', 'GDB Solutions', 'Quiz Files', 'Handouts', 'Past Papers', 'Short Notes'];

export default function UploadPage() {
    const [items, setItems] = useState<UploadItem[]>([]);
    const [uploading, setUploading] = useState(false);

    // AUTO DETECT CODE AND CATEGORY FROM FILENAME
    const detectDetails = (fileName: string) => {
        const lower = fileName.toLowerCase();
        let code = '';
        let category = 'Handouts';

        // Extract code (CS101, ACC311, etc)
        const match = fileName.match(/([A-Z]{2,4})[\s-_]?(\d{3})/i);
        if (match) code = (match[1] + match[2]).toUpperCase();

        // Detect category
        if (lower.includes('mid')) category = 'Midterm Files';
        else if (lower.includes('final')) category = 'Final Term Files';
        else if (lower.includes('assign')) category = 'Solved Assignments';
        else if (lower.includes('gdb')) category = 'GDB Solutions';
        else if (lower.includes('quiz')) category = 'Quiz Files';
        else if (lower.includes('paper')) category = 'Past Papers';
        else if (lower.includes('note')) category = 'Short Notes';

        return { code, category };
    };

    // HANDLE FILES SELECTED
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const newItems: UploadItem[] = Array.from(files).map(file => {
            const { code, category } = detectDetails(file.name);
            const title = file.name.replace(/\.[^.]+$/, '').replace(/_/g, ' ');

            return {
                id: Math.random().toString(36).substr(2, 9),
                file,
                code,
                category,
                title,
                status: 'pending',
                progress: 0
            };
        });

        setItems(prev => [...prev, ...newItems]);
    };

    // UPLOAD SINGLE FILE
    const uploadFile = async (item: UploadItem) => {
        if (!item.code || !item.category) {
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', error: 'Missing code or category' } : i));
            return;
        }

        const MAX_SIZE = 40 * 1024 * 1024; // 40MB limit
        if (item.file.size > MAX_SIZE) {
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', error: 'File size exceeds 40MB limit.' } : i));
            return;
        }

        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'uploading' } : i));

        try {
            const formData = new FormData();
            formData.append('file', item.file);
            formData.append('code', item.code);
            formData.append('title', item.title);
            formData.append('type', item.category);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to upload file');
            }

            setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'success', progress: 100 } : i));
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'error', error: msg } : i));
        }
    };

    // UPLOAD ALL FILES
    const uploadAll = async () => {
        setUploading(true);
        const pending = items.filter(i => i.status === 'pending');

        for (let i = 0; i < pending.length; i += 3) {
            const batch = pending.slice(i, i + 3);
            await Promise.all(batch.map(item => uploadFile(item)));
        }

        setUploading(false);
    };

    // UPDATE ITEM
    const updateItem = (id: string, updates: Partial<UploadItem>) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    };

    // REMOVE ITEM
    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    // CLEAR ALL
    const clearAll = () => {
        setItems([]);
    };

    const stats = {
        total: items.length,
        pending: items.filter(i => i.status === 'pending').length,
        uploading: items.filter(i => i.status === 'uploading').length,
        success: items.filter(i => i.status === 'success').length,
        error: items.filter(i => i.status === 'error').length
    };

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>📤 Upload Files</h1>
                    <p>Select files and we'll auto-detect course codes and categories</p>
                </div>

                {items.length === 0 ? (
                    <div
                        className="upload-dropzone"
                        onClick={() => document.getElementById('fileInput')?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                            e.preventDefault();
                            handleFileSelect(e.dataTransfer.files);
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📤</div>
                        <h2 className="gradient-text">Drag & Drop Study Files</h2>
                        <p>PDFs, Solved Papers, and Assignments are welcome!</p>
                        <input
                            id="fileInput"
                            type="file"
                            multiple
                            hidden
                            onChange={e => handleFileSelect(e.target.files)}
                        />
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={uploadAll}
                                disabled={uploading || stats.pending === 0}
                                className="btn btn-primary"
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 'bold',
                                    background: uploading ? 'var(--bg-tertiary)' : 'var(--accent-secondary)',
                                    color: uploading ? 'var(--text-muted)' : '#0f172a'
                                }}
                            >
                                {uploading ? '⏳ Uploading...' : `🚀 Start Uploading ${stats.pending} Files`}
                            </button>
                            <button
                                onClick={clearAll}
                                style={{
                                    padding: '10px 20px',
                                    background: '#ff6b6b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                🗑️ Clear
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            {items.map(item => (
                                <div
                                    key={item.id}
                                    className="upload-item-card"
                                    style={{
                                        borderLeft: `4px solid ${item.status === 'success' ? 'var(--success)' : item.status === 'error' ? 'var(--error)' : 'var(--accent-secondary)'}`,
                                        opacity: item.status === 'success' ? 0.8 : 1
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{item.file.name}</p>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.9em' }}>
                                                <input
                                                    type="text"
                                                    value={item.code}
                                                    onChange={e => updateItem(item.id, { code: e.target.value.toUpperCase() })}
                                                    placeholder="CS101"
                                                    style={{ width: '80px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                                                    disabled={item.status !== 'pending'}
                                                />
                                                <select
                                                    value={item.category}
                                                    onChange={e => updateItem(item.id, { category: e.target.value })}
                                                    style={{ flex: 1, padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                                                    disabled={item.status !== 'pending'}
                                                >
                                                    {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                                                </select>
                                                <span style={{ padding: '4px 8px', background: '#f0f0f0', borderRadius: '4px' }}>
                                                    {(item.file.size / 1024 / 1024).toFixed(2)}MB
                                                </span>
                                            </div>

                                            {item.status === 'uploading' && (
                                                <div style={{ background: 'var(--bg-tertiary)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginTop: '12px' }}>
                                                    <div style={{ background: 'var(--accent-secondary)', height: '100%', width: '50%', boxShadow: '0 0 10px var(--accent-secondary)' }} />
                                                </div>
                                            )}

                                            {item.status === 'success' && <p style={{ color: '#4caf50', margin: '4px 0 0 0' }}>✅ Uploaded successfully</p>}
                                            {item.status === 'error' && <p style={{ color: '#f44336', margin: '4px 0 0 0' }}>❌ {item.error}</p>}
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '18px'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center', fontSize: '0.9em' }}>
                            Total: {stats.total} | Pending: {stats.pending} | Uploading: {stats.uploading} | Success: {stats.success} | Error: {stats.error}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
