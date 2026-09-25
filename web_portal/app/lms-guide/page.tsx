'use client';
import { useState } from 'react';
import { lmsGuides } from '@/data/lmsGuides';

export default function LMSGuidePage() {
    const [activeGuide, setActiveGuide] = useState<number | null>(null);

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>🗂 LMS Guide</h1>
                    <p>Step-by-step tutorials for using Learning Management Systems</p>
                </div>
                <div className="card-grid-2" style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                    {lmsGuides.map(guide => (
                        <div key={guide.id} className="guide-card">
                            <div className="guide-icon">{guide.icon}</div>
                            <h3>{guide.title}</h3>
                            <button className="btn btn-outline btn-sm" style={{ marginTop: '12px' }} onClick={() => setActiveGuide(activeGuide === guide.id ? null : guide.id)}>
                                {activeGuide === guide.id ? 'Hide Steps' : 'View Steps'} →
                            </button>
                            {activeGuide === guide.id && (
                                <>
                                    <ol className="guide-steps">
                                        {guide.steps.map((step, i) => <li key={i}>{step}</li>)}
                                    </ol>
                                    <div className="guide-tips">
                                        <h4>💡 Tips:</h4>
                                        <ul>{guide.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
