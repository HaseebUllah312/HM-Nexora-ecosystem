'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function QuizMakerPage() {
    const [inputText, setInputText] = useState('');
    const [jsonResult, setJsonResult] = useState('');
    const [subjectCode, setSubjectCode] = useState('MGT101');
    const [term, setTerm] = useState('Midterm');
    const [topicId, setTopicId] = useState('topic_1');
    const [topicName, setTopicName] = useState('General Topic');

    const [isprocessing, setIsprocessing] = useState(false);

    // PDF Text Extraction Logic
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a valid PDF file.');
            return;
        }

        setIsprocessing(true);
        try {
            // We need to dynamically import pdfjs-dist
            // Note: This requires the worker to be set up correctly. 
            // For a simple implementation without complex worker setup in Next.js, 
            // we can use a public CDN for the worker.

            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n\n';
            }

            setInputText(fullText);
            alert('PDF Text Extracted! Now click "Convert to JSON".');
        } catch (error) {
            console.error('PDF Extraction Error:', error);
            alert('Failed to extract text from PDF. It might be scanned (image-based).');
        } finally {
            setIsprocessing(false);
        }
    };

    const parseText = () => {
        // Basic parser logic for format:
        // 1. Question text...
        // a) Option 1
        // b) Option 2 ...
        // Correct: b
        // Explanation: ...

        const lines = inputText.split('\n').map(l => l.trim()).filter(l => l);
        const questions = [];
        let currentQ: any = null;

        lines.forEach(line => {
            // New Question detection (starts with digit and dot)
            if (/^\d+\./.test(line)) {
                if (currentQ) questions.push(currentQ);
                currentQ = {
                    id: Date.now() + questions.length,
                    difficulty: 'Medium',
                    question: line.replace(/^\d+\.\s*/, ''),
                    options: [],
                    correct: 0,
                    explanation: 'Explanation pending...'
                };
            }
            // Option detection (starts with a), b), or A., B.)
            else if (/^[a-dA-D][).]\s*/.test(line) && currentQ) {
                currentQ.options.push(line.replace(/^[a-dA-D][).]\s*/, ''));
            }
            // Correct Answer detection
            else if (/^Correct:/.test(line) && currentQ) {
                const ans = line.split(':')[1].trim().toLowerCase();
                const map: { [key: string]: number } = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
                if (map[ans] !== undefined) currentQ.correct = map[ans];
            }
            // Explanation detection
            else if (/^Explanation:/.test(line) && currentQ) {
                currentQ.explanation = line.replace(/^Explanation:\s*/, '');
            }
            // Append to question text if no other match (multiline question)
            else if (currentQ && currentQ.options.length === 0) {
                currentQ.question += ' ' + line;
            }
        });
        if (currentQ) questions.push(currentQ);

        // Construct final JSON
        const output = {
            subject: subjectCode,
            topics: [
                {
                    id: topicId,
                    name: topicName,
                    term: term,
                    questions: questions
                }
            ]
        };

        setJsonResult(JSON.stringify(output, null, 2));
    };

    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div className="page-header">
                    <h1>🛠️ Quiz JSON Generator</h1>
                    <p>Paste text from PDF/Word and convert it to valid JSON for the app.</p>
                    <Link href="/admin" className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }}>&larr; Back to Admin</Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                    {/* INPUT SIDE */}
                    <div className="card">
                        <h3>1. Settings & Input</h3>
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input className="form-input" placeholder="Subject Code (e.g. CS101)" value={subjectCode} onChange={e => setSubjectCode(e.target.value)} />
                                <select className="form-select" value={term} onChange={e => setTerm(e.target.value)}>
                                    <option>Midterm</option>
                                    <option>Final</option>
                                </select>
                            </div>
                            <input className="form-input" placeholder="Topic ID (e.g. loops)" value={topicId} onChange={e => setTopicId(e.target.value)} style={{ marginBottom: '10px' }} />
                            <input className="form-input" placeholder="Topic Name (e.g. Loop Structures)" value={topicName} onChange={e => setTopicName(e.target.value)} style={{ marginBottom: '20px' }} />

                            <label className="form-label">Upload Past Paper (PDF) - Optional:</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="form-input"
                                onChange={handleFileUpload}
                                style={{ marginBottom: '20px' }}
                            />
                            {isprocessing && <p style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>⏳ Extracting text from PDF...</p>}

                            <label className="form-label">Or Paste Raw Text Here:</label>
                            <textarea
                                className="form-textarea"
                                style={{ height: '400px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                                placeholder={`1. What is CPU?\na) Ram\nb) Processor\nc) HDD\nd) Mouse\nCorrect: b\nExplanation: It handles instructions.`}
                            />
                        </div>
                        <button className="btn btn-primary btn-block" onClick={parseText}>Convert to JSON ➡️</button>
                    </div>

                    {/* OUTPUT SIDE */}
                    <div className="card">
                        <h3>2. JSON Output</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Copy this into `data/quizzes/{subjectCode}.json`</p>
                        <textarea
                            className="form-textarea"
                            style={{ height: '520px', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-primary)' }}
                            value={jsonResult}
                            readOnly
                        />
                        <button className="btn btn-secondary btn-block" style={{ marginTop: '16px' }} onClick={() => navigator.clipboard.writeText(jsonResult)}>Copy to Clipboard 📋</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
