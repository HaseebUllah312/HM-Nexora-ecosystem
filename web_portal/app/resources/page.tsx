'use client';
import Link from 'next/link';

const archives = [
    { title: 'Archive 1 (Mixed Subjects)', link: 'https://drive.google.com/drive/folders/1gn9vOlBosa4sco-W_NvgGWgCV432sLdu?usp=drive_link', color: 'var(--primary)' },
    { title: 'Archive 2 (Mixed Subjects)', link: 'https://drive.google.com/drive/folders/1yLr8EX3ehDdGdhsKI0YZna9Kk2JbtjZe?usp=drive_link', color: 'var(--secondary)' },
    { title: 'Archive 3 (Mixed Subjects)', link: 'https://drive.google.com/drive/folders/11iCga1LlWk5EvpcZykWNr_glURgUeNeo?usp=drive_link', color: 'var(--accent)' },
    { title: 'Archive 4 (Mixed Subjects)', link: 'https://drive.google.com/drive/folders/1zJW41VjmF7YZJU8OfE2TWMk3jXQ0okcD', color: 'var(--error)' },
    { title: 'Archive 5 (Mixed Subjects)', link: 'https://drive.google.com/drive/folders/1QI9_QgYZU88uulylWksI3mKXECYDkSHB', color: 'var(--info)' },
    { title: 'Archive 6 (Mixed Subjects)', link: 'https://drive.google.com/drive/folders/1i3v79NvfvB6-gCq1KgB-jwSLl3OoX9_O', color: '#eab308' },
];

export default function ResourcesPage() {
    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>📚 Comprehensive Study Resources</h1>
                    <p>Access our massive collection of past papers, handouts, and solved assignments via these archives.</p>
                </div>

                <div className="card" style={{ marginBottom: '40px', background: 'var(--card-bg-hover)', borderLeft: '4px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '8px' }}>🚀 How to use</h3>
                    <p>These archives contain files for <strong>all VU subjects</strong> mixed together. Click any archive to open the Google Drive folder and search for your subject code (e.g., &quot;CS101&quot;) to find relevant files.</p>
                </div>

                <div className="card-grid-2">
                    {archives.map((arch, i) => (
                        <div key={i} className="card resource-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', transition: 'transform 0.2s' }}>
                            <div style={{ fontSize: '3rem' }}>📂</div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginBottom: '8px' }}>{arch.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Contains Handouts, Past Papers, and Assignments.</p>
                                <a href={arch.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Open Archive ↗</a>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '60px', textAlign: 'center' }}>
                    <h2>More Resources</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                        <Link href="/subjects" className="btn btn-outline">Browse Subject Library</Link>
                        <Link href="/mcq-practice" className="btn btn-outline">MCQ Practice</Link>
                        <Link href="/upload" className="btn btn-outline">Upload New Files</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
