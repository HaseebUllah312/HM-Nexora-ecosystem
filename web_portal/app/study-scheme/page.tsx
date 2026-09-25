'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
    LuSearch as Search, 
    LuGraduationCap as GraduationCap, 
    LuChevronDown as ChevronDown, 
    LuChevronRight as ChevronRight, 
    LuFileText as FileText, 
    LuMessageSquare as MessageSquare, 
    LuLibrary as Library,
    LuClock as Clock,
    LuLayers as Layers,
    LuBookOpen as BookOpen
} from 'react-icons/lu';
import { studySchemes, StudyScheme } from '@/data/studySchemes';
import './study-scheme.css';

export default function StudySchemePage() {
    const [selectedProgram, setSelectedProgram] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedSemester, setExpandedSemester] = useState<number | null>(1);
    const [subjectsMap, setSubjectsMap] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    // Fetch details of all subjects (e.g. ratings, difficulty, etc.)
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await fetch('/api/subjects');
                const data = await res.json();
                
                const map: Record<string, any> = {};
                if (Array.isArray(data)) {
                    data.forEach((s: any) => {
                        map[s.code.toUpperCase()] = s;
                    });
                }
                setSubjectsMap(map);
            } catch (err) {
                console.error("Failed to fetch subjects for study scheme", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    // Set first program in list as default
    useEffect(() => {
        if (studySchemes.length > 0) {
            // Find BS Computer Science or first available
            const defaultProg = studySchemes.find(s => s.id === 'computer-science') || studySchemes[0];
            setSelectedProgram(defaultProg.id);
        }
    }, []);

    // Group study schemes by their degree category
    const groupedSchemes = useMemo(() => {
        const groups: Record<string, StudyScheme[]> = {
            'BS Programs (4 Years)': [],
            'Associate Degree Programs (2 Years)': [],
            'BS Lateral Entry (2 Years)': [],
            'B.Ed Programs': [],
            'MS Programs': [],
            'Diplomas': []
        };

        studySchemes.forEach(scheme => {
            // Match search query if any
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                if (!scheme.title.toLowerCase().includes(q) && !scheme.id.toLowerCase().includes(q)) {
                    return; // Skip if not matching search
                }
            }

            if (scheme.degreeType === 'BS') {
                groups['BS Programs (4 Years)'].push(scheme);
            } else if (scheme.degreeType === 'Associate Degree Programs') {
                groups['Associate Degree Programs (2 Years)'].push(scheme);
            } else if (scheme.degreeType === 'BS-Lateral') {
                groups['BS Lateral Entry (2 Years)'].push(scheme);
            } else if (scheme.degreeType === 'B.Ed') {
                groups['B.Ed Programs'].push(scheme);
            } else if (scheme.degreeType === 'MS') {
                groups['MS Programs'].push(scheme);
            } else if (scheme.degreeType === 'Diploma') {
                groups['Diplomas'].push(scheme);
            } else {
                // Fallback group
                if (!groups['Other programs']) groups['Other programs'] = [];
                groups['Other programs'].push(scheme);
            }
        });

        // Filter out empty groups
        return Object.entries(groups).filter(([_, list]) => list.length > 0);
    }, [searchQuery]);

    // Active program selection
    const currentScheme = useMemo(() => {
        return studySchemes.find(s => s.id === selectedProgram) || studySchemes[0];
    }, [selectedProgram]);

    // Helper to calculate total subjects in a scheme
    const totalSubjectsCount = useMemo(() => {
        if (!currentScheme || !currentScheme.semesters) return 0;
        return currentScheme.semesters.reduce((acc, sem) => acc + sem.subjects.length, 0);
    }, [currentScheme]);

    return (
        <div className="scheme-page">
            <div className="scheme-container">
                
                {/* Header */}
                <div className="scheme-header">
                    <h1 className="scheme-title">VU Degree Study Schemes</h1>
                    <p className="scheme-subtitle">
                        Select any 4-year or 2-year program offered by Virtual University of Pakistan to view its exact semester-wise courses, handouts, past papers, reviews, and study files.
                    </p>
                </div>

                <div className="scheme-layout">
                    {/* Left Sidebar */}
                    <div className="sidebar-panel">
                        <h3 className="sidebar-title">
                            <GraduationCap size={22} />
                            VU Programs
                        </h3>
                        
                        {/* Search Bar */}
                        <div className="search-wrapper">
                            <Search className="search-icon" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search degree program..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* List of programs, grouped */}
                        <div className="program-groups">
                            {groupedSchemes.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '10px', textAlign: 'center' }}>
                                    No programs match your search.
                                </p>
                            ) : (
                                groupedSchemes.map(([groupTitle, list]) => (
                                    <div key={groupTitle} className="group-section">
                                        <h4 className="group-header">{groupTitle}</h4>
                                        {list.map(scheme => (
                                            <button
                                                key={scheme.id}
                                                onClick={() => {
                                                    setSelectedProgram(scheme.id);
                                                    setExpandedSemester(1);
                                                }}
                                                className={`program-item-btn ${selectedProgram === scheme.id ? 'active' : ''}`}
                                                title={scheme.title}
                                            >
                                                {scheme.title}
                                            </button>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="details-panel">
                        {currentScheme ? (
                            <>
                                {/* Program Information Banner */}
                                <div className="program-banner-card">
                                    <h2 className="program-banner-title">{currentScheme.title}</h2>
                                    <p className="program-banner-desc">{currentScheme.description}</p>
                                    
                                    <div className="program-stats">
                                        <span className="stat-badge">
                                            <Clock size={16} />
                                            {currentScheme.duration}
                                        </span>
                                        <span className="stat-badge">
                                            <Layers size={16} />
                                            {currentScheme.semesters.length} Semesters
                                        </span>
                                        <span className="stat-badge">
                                            <BookOpen size={16} />
                                            {totalSubjectsCount} Subjects
                                        </span>
                                    </div>
                                </div>

                                {/* Loading state for subject metadata */}
                                {loading ? (
                                    <div className="spinner-container">
                                        <div className="pulse-spinner"></div>
                                    </div>
                                ) : (
                                    <div className="semesters-container">
                                        {currentScheme.semesters.map((semester) => {
                                            const isExpanded = expandedSemester === semester.semesterNumber;
                                            
                                            return (
                                                <div 
                                                    key={semester.semesterNumber} 
                                                    className={`semester-panel ${isExpanded ? 'expanded' : ''}`}
                                                >
                                                    {/* Header Trigger */}
                                                    <button 
                                                        onClick={() => setExpandedSemester(isExpanded ? null : semester.semesterNumber)}
                                                        className="semester-header-btn"
                                                    >
                                                        <div className="semester-header-left">
                                                            <div className="semester-badge-num">
                                                                {semester.semesterNumber}
                                                            </div>
                                                            <div>
                                                                <h3 className="semester-panel-title">{semester.title}</h3>
                                                                <span className="semester-subject-count">
                                                                    {semester.subjects.length} Subjects
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="semester-arrow">
                                                            <ChevronDown size={22} />
                                                        </div>
                                                    </button>

                                                    {/* Expandable Grid */}
                                                    {isExpanded && (
                                                        <div className="subjects-cards-grid">
                                                            {semester.subjects.map((code) => {
                                                                const subjectData = subjectsMap[code.toUpperCase()];
                                                                const name = subjectData?.name || `${code} - Subject Details`;
                                                                const difficulty = subjectData?.difficulty || 'Medium';
                                                                const description = subjectData?.description || `Download handouts, solved papers, and materials for ${code}.`;
                                                                
                                                                return (
                                                                    <div key={code} className="subject-item-card">
                                                                        <div className="subject-card-top">
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                                                <span className="subject-code-tag">
                                                                                    {code}
                                                                                </span>
                                                                                <span className={`subject-difficulty-badge diff-${difficulty}`}>
                                                                                    {difficulty}
                                                                                </span>
                                                                            </div>
                                                                            <h4 className="subject-name-title" title={name}>
                                                                                {name}
                                                                            </h4>
                                                                            <p className="subject-desc-snippet">
                                                                                {description.length > 120 ? description.substring(0, 117) + '...' : description}
                                                                            </p>
                                                                        </div>
                                                                        
                                                                        <div className="subject-card-actions">
                                                                            <Link href={`/subjects/${code.toLowerCase()}?tab=materials`} className="action-link-btn">
                                                                                <Library size={13} /> Handouts
                                                                            </Link>
                                                                            <Link href={`/subjects/${code.toLowerCase()}?tab=papers`} className="action-link-btn">
                                                                                <FileText size={13} /> Papers
                                                                            </Link>
                                                                            <Link href={`/subjects/${code.toLowerCase()}?tab=reviews`} className="action-link-btn">
                                                                                <MessageSquare size={13} /> Reviews
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="program-banner-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <h3>No Program Selected</h3>
                                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Please choose a program from the left sidebar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
