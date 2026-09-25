'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { subjects, categories, autoCategorize } from '@/data/subjects';
// import { allSubjects } from '@/data/all_subjects';

import { Suspense } from 'react';

function SubjectsContent() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('code');
    const [allSubjects, setAllSubjects] = useState<any[]>([]);

    const searchParams = useSearchParams();
    const querySearch = searchParams.get('search');
    const queryCategory = searchParams.get('category');

    useEffect(() => {
        if (querySearch) setSearch(querySearch);
        if (queryCategory) setCategory(queryCategory);
        
        fetch('/api/subjects')
            .then(r => r.json())
            .then(data => {
                setAllSubjects(data || []);
            });
    }, [querySearch, queryCategory]);

    // Now allSubjects already contains full details from the database
    const mergedSubjects = Array.isArray(allSubjects) ? allSubjects : [];

    let filtered = mergedSubjects.filter(s => {
        const q = search.toLowerCase().trim();
        const subjectCode = (s.code || '').toLowerCase().replace(/\s+/g, '');
        const subjectName = (s.name || '').toLowerCase();
        const teachers = (s.teachers || []).map((t: string) => t.toLowerCase());

        // Basic search matching
        const matchesBasic = !q || 
            subjectCode.includes(q) || 
            subjectName.replace(/\s+/g, '').includes(q) || 
            teachers.some((t: string) => t.replace(/\s+/g, '').includes(q));

        // Special term-based filtering (Exam Hub Logic)
        const isExamFilter = q === 'midterm' || q === 'final' || q === 'handouts';
        let matchesExam = false;
        
        if (q === 'midterm') matchesExam = (s.midtermCount > 0);
        else if (q === 'final') matchesExam = (s.finalCount > 0);
        else if (q === 'handouts') matchesExam = (s.handoutsCount > 0);

        // If it's a special exam filter, only show if matched. 
        // Otherwise, use basic matching.
        const matchesSearch = isExamFilter ? matchesExam : matchesBasic;

        const subjectCat = s.category && s.category !== 'General' ? s.category : autoCategorize(s.code);
        const matchesCat = category === 'All' || subjectCat === category;
        return matchesSearch && matchesCat;
    });

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "HM nexora Subject Library",
        "description": "Comprehensive library of VU subjects with study materials and past papers.",
        "url": "https://hmnexora.tech/subjects",
        "hasPart": filtered.slice(0, 10).map(s => ({
            "@type": "Course",
            "courseCode": s.code,
            "name": s.name,
            "description": s.description,
            "provider": {
                "@type": "Organization",
                "name": "HM nexora",
                "sameAs": "https://hmnexora.tech"
            }
        }))
    };

    filtered.sort((a, b) => {
        if (sort === 'rating') return b.rating - a.rating;
        if (sort === 'downloads') return b.downloads - a.downloads;
        if (sort === 'name') return a.name.localeCompare(b.name);
        if (sort === 'code') return a.code.localeCompare(b.code);
        if (sort === 'category') {
            const catA = a.category && a.category !== 'General' ? a.category : autoCategorize(a.code);
            const catB = b.category && b.category !== 'General' ? b.category : autoCategorize(b.code);
            return catA.localeCompare(catB) || a.code.localeCompare(b.code);
        }
        return 0;
    });

    return (
        <div className="page">
            <div className="container">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <div className="page-header">
                    <h1>📚 Subject Library</h1>
                    <p>Browse all VU subjects with study materials, past papers, and more</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <input className="form-input" placeholder="🔍 Search by code, name, or teacher..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-select" style={{ width: 'auto', minWidth: '180px' }} value={category} onChange={e => setCategory(e.target.value)}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="form-select" style={{ width: 'auto', minWidth: '150px' }} value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="code">Sort by Code</option>
                        <option value="name">Sort by Name</option>
                        <option value="category">Sort by Category</option>
                        <option value="rating">Sort by Rating</option>
                        <option value="downloads">Sort by Downloads</option>
                    </select>
                </div>

                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.88rem' }}>Showing {filtered.length} subjects</p>

                <div className="card-grid">
                    {allSubjects.length === 0 ? (
                        Array(8).fill(0).map((_, i) => (
                            <div key={i} className="card skeleton" style={{ height: '220px' }}></div>
                        ))
                    ) : filtered.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                            <p>No subjects found for this search/category.</p>
                        </div>
                    ) : (
                        filtered.map(s => {
                            const isSolved = s.totalFiles > 0;
                            const diffClass = s.difficulty === 'Hard' ? 'tag-pending' : s.difficulty === 'Easy' ? 'tag-completed' : 'tag-solved';
                            
                            return (
                                <Link key={s.code} href={`/subjects/${(s.code || '').toLowerCase()}`} className="card subject-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div className="subject-code" style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--accent-secondary)' }}>{s.code}</div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {s.difficulty && <span className={`status-tag ${diffClass}`} style={{ fontSize: '0.65rem' }}>{s.difficulty}</span>}
                                            <span className={`status-tag ${isSolved ? 'tag-completed' : 'tag-pending'}`} style={{ fontSize: '0.65rem' }}>
                                                {isSolved ? '✓ Solved' : '⏳ Pending'}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '8px', lineHeight: '1.4' }}>{s.name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.5rem' }}>
                                        {s.description || 'Comprehensive VU subject study materials and past papers.'}
                                    </p>
                                    <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ opacity: 0.7 }}>👨‍🏫</span> {s.teachers && s.teachers.length > 0 ? s.teachers[0] : 'VU Faculty'}
                                    </div>
                                    <div className="subject-meta" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        <span title="Rating">⭐ {s.rating?.toFixed(1) || '0.0'}</span>
                                        <span title="Files">📄 {s.totalFiles || 0}</span>
                                        <span title="Downloads">📥 {((s.downloads || 0)/1000).toFixed(1)}k</span>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SubjectsPage() {
    return (
        <Suspense fallback={<div className="page"><div className="container"><p>Loading library...</p></div></div>}>
            <SubjectsContent />
        </Suspense>
    );
}
