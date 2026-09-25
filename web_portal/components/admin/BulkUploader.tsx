'use client';
import { useState } from 'react';

export default function BulkUploader() {
    const [rawText, setRawText] = useState('');
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('');

    const parseText = () => {
        const lines = rawText.split('\n').filter(line => line.trim() !== '');
        const newData: any[] = [];

        lines.forEach(line => {
            // Expected format: "Subject Type Title - Link"
            // Example: "CS101 Midterm Past Papers by Moaaz - https://drive..."

            // 1. Extract Subject Code (First word, e.g., CS101)
            const parts = line.split(' ');
            const code = parts[0].toUpperCase();

            // 2. Extract Link (Last part starting with http)
            const linkIndex = parts.findIndex(p => p.startsWith('http'));
            let link = '';
            let titleParts = [];

            if (linkIndex !== -1) {
                link = parts.slice(linkIndex).join(' '); // In case link has spaces (rare)
                titleParts = parts.slice(1, linkIndex);
            } else {
                titleParts = parts.slice(1);
            }

            // 3. Clean Title
            let title = titleParts.join(' ').replace('-', '').trim();

            // 4. Infer Type from Title
            let type = 'Handouts'; // Default
            const titleLower = title.toLowerCase();
            if (titleLower.includes('midterm')) type = 'Midterm Files';
            else if (titleLower.includes('final')) type = 'Final Term Files';
            else if (titleLower.includes('assignment')) type = 'Solved Assignments';
            else if (titleLower.includes('gdb')) type = 'GDB Solutions';
            else if (titleLower.includes('quiz')) type = 'Quiz Files';

            newData.push({ code, title, type, link });
        });

        setParsedData(newData);
    };

    const handleUpload = async () => {
        setIsProcessing(true);
        setStatus('Uploading...');

        try {
            const res = await fetch('/api/admin/bulk-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uploads: parsedData })
            });

            const result = await res.json();
            if (result.success) {
                setStatus(`✅ Success! ${result.message}`);
                setRawText('');
                setParsedData([]);
            } else {
                setStatus(`❌ Error: ${result.error}`);
            }
        } catch (error) {
            setStatus('❌ Network Error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="card" style={{ marginTop: '20px' }}>
            <h3>🚀 Bulk Magic Uploader</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Paste lines in this format: <code>CS101 Midterm Papers by Moaaz - https://drive...</code>
            </p>

            <textarea
                className="form-textarea"
                rows={8}
                placeholder="Paste your list here..."
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="btn btn-secondary" onClick={parseText} disabled={!rawText}>
                    1. Preview & Parse
                </button>
                {parsedData.length > 0 && (
                    <button className="btn btn-primary" onClick={handleUpload} disabled={isProcessing}>
                        {isProcessing ? 'Uploading...' : '2. Upload All'}
                    </button>
                )}
            </div>

            {status && <div style={{ marginTop: '12px', fontWeight: 'bold' }}>{status}</div>}

            {parsedData.length > 0 && (
                <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--card-bg-hover)', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Code</th>
                                <th style={{ padding: '8px' }}>Type</th>
                                <th style={{ padding: '8px' }}>Title</th>
                                <th style={{ padding: '8px' }}>Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parsedData.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '8px' }}>{row.code}</td>
                                    <td style={{ padding: '8px' }}>
                                        <span className="badge badge-info">{row.type}</span>
                                    </td>
                                    <td style={{ padding: '8px' }}>{row.title}</td>
                                    <td style={{ padding: '8px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        <a href={row.link} target="_blank" rel="noreferrer">{row.link}</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
