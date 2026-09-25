"use client";
import Link from 'next/link';
import { subjects } from '@/data/subjects';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { semesterWiseSubjects } from '@/data/semesters';
import { supabase } from '@/app/lib/supabase';
import { useRecentlyViewed } from '@/app/lib/hooks/useRecentlyViewed';
import Skeleton from '@/components/ui/Skeleton';
import { fuzzySearch } from '@/app/lib/utils/fuzzySearch';
import LivePulse from '@/components/LivePulse';

// We define the interface to match our DB schema
interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  important: boolean;
}

const quickLinks = [
  { href: '/subjects', label: 'Library', color: 'var(--accent-primary)' },
  { href: '/mcq-practice', label: 'Exam Hub', color: 'var(--accent-secondary)' },
  { href: '/share-paper', label: 'Share Paper', color: 'var(--accent-secondary)' },
  { href: '/tools', label: 'Tools', color: 'var(--accent-primary)' },
  { href: '/semester-planner', label: 'Planner', color: 'var(--accent-secondary)' },
  { href: '/services', label: 'Services', color: 'var(--accent-primary)' },
  { href: '/resources', label: 'Study Vault', color: 'var(--accent-secondary)' },
  { href: '/upload', label: 'Contribute', color: 'var(--accent-primary)' },
  { href: '/qna', label: 'Help Desk', color: 'var(--accent-primary)' }
];

const topSubjects = [...subjects].sort((a, b) => b.rating - a.rating).slice(0, 6);
const topDownloaded = [...subjects].sort((a, b) => b.downloads - a.downloads).slice(0, 6);

const leaderboard = [
  { name: 'Muhammad Ahmed', points: 2450, uploads: 89, badge: '🏆' },
  { name: 'Fatima Zahra', points: 2180, uploads: 76, badge: '🥈' },
  { name: 'Ali Hassan', points: 1920, uploads: 65, badge: '🥉' },
  { name: 'Ayesha Khan', points: 1750, uploads: 58, badge: '⭐' },
  { name: 'Usman Tariq', points: 1580, uploads: 52, badge: '⭐' },
];

export default function Home() {
  const router = useRouter();
  const { items: recentItems } = useRecentlyViewed();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  
  // AI Assistant States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiSubject, setAiSubject] = useState<{ code: string; name: string } | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [stats, setStats] = useState({ 
    subjects: 0, 
    files: 0, 
    downloads: 0, 
    students: 0,
    topSubjects: [] as any[],
    topDownloaded: [] as any[],
    leaderboard: [] as any[]
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubjectSelection, setShowSubjectSelection] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [activeSemesterTab, setActiveSemesterTab] = useState(semesterWiseSubjects[0].semester);
  const [showVideo, setShowVideo] = useState(false);
  
  // Master Academic Hub State
  const [allSubjectsData, setAllSubjectsData] = useState<any[]>([]);
  const [hubLoading, setHubLoading] = useState(true);
  const [hubSearch, setHubSearch] = useState('');
  const [hubFilter, setHubFilter] = useState<'all' | 'midterm' | 'final' | 'handouts'>('all');

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "HM nexora",
    "url": "https://hmnexora.tech",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://hmnexora.tech/subjects?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user?.followed_subjects?.length > 0) {
          setSelectedSubjects(data.user.followed_subjects);
          return; // Already has subjects
        }
      }
      
      // Fallback to localStorage if not logged in or no subjects in DB
      const saved = localStorage.getItem('followed_subjects');
      if (saved) {
        setSelectedSubjects(JSON.parse(saved));
      } else {
        setShowSubjectSelection(true);
      }
    };
    fetchUserData();
  }, []);

  const handleSubjectClick = (code: string) => {
    router.push(`/subjects/${code.toLowerCase()}`);
  };

  const handleAskAI = async (e: React.MouseEvent, s: any) => {
    e.preventDefault();
    e.stopPropagation();
    setAiSubject({ code: s.code, name: s.name });
    setAiResponse(null);
    setAiQuery('');
  };

  const submitAIQuery = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subjectCode: aiSubject?.code, 
          subjectName: aiSubject?.name, 
          query: aiQuery 
        })
      });
      const data = await res.json();
      setAiResponse(data.answer || data.error);
    } catch (err) {
      setAiResponse('AI Assistant had a hiccup. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleSubject = (code: string) => {
    if (selectedSubjects.includes(code)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== code));
    } else if (selectedSubjects.length < 10) {
      setSelectedSubjects([...selectedSubjects, code]);
    }
  };

  const handleSaveSelections = async () => {
    if (selectedSubjects.length === 0) return;

    // Save to localStorage
    localStorage.setItem('followed_subjects', JSON.stringify(selectedSubjects));
    
    // Attempt to sync with DB if logged in
    try {
      await fetch('/api/user/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: selectedSubjects })
      });
    } catch (e) {
      console.warn("Could not sync subjects to cloud (Offline/Guest)");
    }
    
    setShowSubjectSelection(false);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/public-stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch platform stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/system/announcements');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setAnnouncements(data.slice(0, 4));
          }
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const fetchAllSubjects = async () => {
      try {
        const res = await fetch('/api/subjects');
        if (res.ok) {
          const data = await res.json();
          setAllSubjectsData(data);
        }
      } catch (err) {
        console.error("Failed to fetch all subjects for hub:", err);
      } finally {
        setHubLoading(false);
      }
    };
    fetchAllSubjects();
  }, []);

  const filteredHubSubjects = allSubjectsData.filter(s => {
    if (hubFilter === 'midterm') return (s.midtermCount || 0) > 0;
    if (hubFilter === 'final') return (s.finalCount || 0) > 0;
    if (hubFilter === 'handouts') return (s.handoutsCount || 0) > 0;
    // Show all subjects for 'all' filter to improve SEO and discovery
    return true;
  });

  const searchedHubSubjects = hubSearch 
    ? fuzzySearch(filteredHubSubjects, hubSearch, ['code', 'name'])
    : filteredHubSubjects;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/subjects?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <AnimatePresence>
        {showSubjectSelection && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="subject-selection-overlay"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="subject-selection-card"
              style={{ maxWidth: '650px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div className="selection-header">
                <h2>📚 <span className="gradient-text">Personalize Your Vault</span></h2>
                <p>Select up to 10 subjects to automatically download resources and receive updates.</p>
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '15px' }} className="no-scrollbar">
                {semesterWiseSubjects.map(group => (
                  <button
                    key={group.semester}
                    onClick={() => setActiveSemesterTab(group.semester)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      whiteSpace: 'nowrap',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      background: activeSemesterTab === group.semester ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: activeSemesterTab === group.semester ? 'white' : 'var(--text-secondary)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    {group.semester}
                  </button>
                ))}
              </div>

              <div className="selection-search" style={{ marginBottom: '15px' }}>
                <input 
                  type="text" 
                  placeholder="Search subject code (e.g. CS101)..." 
                  style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                />
              </div>

              <div className="selection-grid" style={{ flex: 1, overflowY: 'auto', maxHeight: '350px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px', padding: '5px' }}>
                {(searchQuery 
                  ? semesterWiseSubjects.flatMap(g => g.subjects).filter(s => s.includes(searchQuery))
                  : semesterWiseSubjects.find(g => g.semester === activeSemesterTab)?.subjects || []
                ).map(code => (
                  <button 
                    key={code} 
                    onClick={() => toggleSubject(code)}
                    className="selection-btn"
                    style={{
                      position: 'relative',
                      background: selectedSubjects.includes(code) ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: selectedSubjects.includes(code) ? 'white' : 'var(--text-primary)',
                      borderColor: selectedSubjects.includes(code) ? 'transparent' : 'var(--border-color)',
                    }}
                  >
                    {code}
                    {selectedSubjects.includes(code) && (
                      <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'white', color: 'var(--accent-primary)', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="selection-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <strong>{selectedSubjects.length}</strong> / 10 subjects
                  </span>
                  {selectedSubjects.length > 0 && (
                    <button onClick={() => setSelectedSubjects([])} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.8rem', cursor: 'pointer' }}>Clear All</button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setShowSubjectSelection(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Skip
                  </button>
                  <button 
                    onClick={handleSaveSelections}
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    disabled={selectedSubjects.length === 0}
                  >
                    Confirm & Sync
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="solution-bg-text">Solution for VU Students</div>
      
      {/* CONTINUE STUDYING */}
      {recentItems.length > 0 && (
        <section className="section" style={{ paddingTop: '0', paddingBottom: '20px' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>🕒 Continue Studying</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' }}>
              {recentItems.map(item => (
                <Link key={item.id} href={item.type === 'subject' ? `/subjects/${item.code.toLowerCase()}` : `/subjects/${item.code.toLowerCase()}/materials`} 
                      className="card hover-bg" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontSize: '1.8rem' }}>{item.type === 'subject' ? '📚' : '📄'}</div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>{item.code}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <LivePulse />
          <div className="hero-badge animate-in">🎓 Virtual University of Pakistan</div>
          <h1 className="animate-in stagger-1" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '900', letterSpacing: '-0.03em' }}>
            All-in-One <span style={{ 
              color: 'var(--accent-secondary)', 
              textShadow: '0 0 30px rgba(34, 211, 238, 0.5)',
              display: 'inline-block'
            }}>Academic Solution</span> for VU Students
          </h1>
          <p className="animate-in stagger-2">
            Access past papers, solved assignments, MCQ practice, AI-powered study assistance, and everything you need to excel at VU — completely free.
          </p>

          <div className="search-container animate-in stagger-3">
            <form onSubmit={handleSearch} className="search-box glow-border-cyan">
              <span className="desktop-only" style={{ fontSize: '1.4rem', color: 'var(--accent-secondary)', opacity: 0.8 }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search by subject code, teacher name, or topic..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>

          <div className="quick-access animate-in stagger-4" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
            {quickLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="quick-btn"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '10px 24px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  border: link.label.includes('Exam Hub') ? '2px solid var(--accent-secondary)' : '1px solid var(--border-color)',
                  background: link.label.includes('Exam Hub') ? 'var(--accent-glow)' : 'var(--bg-card)',
                  boxShadow: link.label.includes('Exam Hub') ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {link.label === 'Library' ? '📚' : link.label === 'Exam Hub' ? '🧠' : link.label === 'Tools' ? '🛠️' : link.label === 'Planner' ? '📅' : link.label === 'Services' ? '💼' : '📂'} {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section">
        <div className="container">
          <div className="stat-grid">
            {[
              { label: 'Subjects Covered', key: 'subjects', icon: '📚' },
              { label: 'Study Files', key: 'files', icon: '📂' },
              { label: 'Total Downloads', key: 'downloads', icon: '📥' },
              { label: 'Active Students', key: 'students', icon: '👥' }
            ].map((stat, i) => (
              <div key={stat.key} className="stat-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-number">
                  {loadingStats ? (
                    <Skeleton width="80px" height="36px" />
                  ) : (
                    stat.key === 'files' && stats.files >= 1000 
                      ? `${(stats.files / 1000).toFixed(1)}K+`
                      : `${(stats as any)[stat.key]?.toLocaleString()}+`
                  )}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAM & RESOURCE HUB (MASTER ACADEMIC HUB) */}
      <section className="section" id="resources" style={{ paddingTop: '0' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="gradient-text text-center">🎓 Master Academic Hub</h2>
            <p className="text-center">Instantly find handouts, midterm, and final term papers for all 370+ subjects.</p>
          </div>
          
          <div className="responsive-grid" style={{ marginBottom: '40px' }}>
            {/* Midterm Preparation Card */}
            <div 
              onClick={() => setHubFilter('midterm')}
              className={`glass-card-navy animate-in ${hubFilter === 'midterm' ? 'active-filter-card' : ''}`} 
              style={{ cursor: 'pointer', textDecoration: 'none', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', borderColor: hubFilter === 'midterm' ? 'var(--accent-secondary)' : '' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📝</div>
              <h3 style={{ color: 'var(--accent-secondary)', fontSize: '1.25rem', fontWeight: '800' }}>Midterm Papers</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Quickly filter verified <strong>Solved Midterm Past Papers</strong> and study files.
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', fontWeight: '700', fontSize: '0.9rem' }}>
                {hubFilter === 'midterm' ? 'Filter Active ✓' : 'Filter Subjects →'}
              </div>
            </div>

            {/* Final Term Preparation Card */}
            <div 
              onClick={() => setHubFilter('final')}
              className={`glass-card-navy animate-in ${hubFilter === 'final' ? 'active-filter-card' : ''}`} 
              style={{ cursor: 'pointer', textDecoration: 'none', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', animationDelay: '0.1s', borderColor: hubFilter === 'final' ? 'var(--accent-secondary)' : '' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📜</div>
              <h3 style={{ color: 'var(--accent-secondary)', fontSize: '1.25rem', fontWeight: '800' }}>Final Term Quest</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Excel in your finals with <strong>Solved Final Term Papers</strong> and topic summaries.
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', fontWeight: '700', fontSize: '0.9rem' }}>
                {hubFilter === 'final' ? 'Filter Active ✓' : 'Filter Subjects →'}
              </div>
            </div>

            {/* Official Handouts Card */}
            <div 
              onClick={() => setHubFilter('handouts')}
              className={`glass-card-navy animate-in ${hubFilter === 'handouts' ? 'active-filter-card' : ''}`} 
              style={{ cursor: 'pointer', textDecoration: 'none', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', animationDelay: '0.2s', borderColor: hubFilter === 'handouts' ? 'var(--accent-secondary)' : '' }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📚</div>
              <h3 style={{ color: 'var(--accent-secondary)', fontSize: '1.25rem', fontWeight: '800' }}>VU Handouts</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Complete archive of <strong>Latest VU Course Books</strong> in high-quality PDF.
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)', fontWeight: '700', fontSize: '0.9rem' }}>
                {hubFilter === 'handouts' ? 'Filter Active ✓' : 'Filter Subjects →'}
              </div>
            </div>
          </div>

          {/* THE MASTER GRID BOX */}
          <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15, 23, 42, 0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>📂 Subjects Library</h3>
                <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                  {searchedHubSubjects.length} Found
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', flex: '1', maxWidth: '500px', width: '100%' }}>
                 <div style={{ position: 'relative', flex: 1 }}>
                    <input 
                      type="text" 
                      placeholder="Search subject code or name..." 
                      className="form-input"
                      value={hubSearch}
                      onChange={(e) => setHubSearch(e.target.value)}
                      style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.2)' }}
                    />
                    <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                 </div>
                 {hubFilter !== 'all' && (
                    <button onClick={() => setHubFilter('all')} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>Reset Filter</button>
                 )}
              </div>
            </div>

            <div className="no-scrollbar" style={{ maxHeight: '500px', overflowY: 'auto', padding: '4px' }}>
              {hubLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  {[...Array(12)].map((_, i) => <div key={i} className="card skeleton-pulse" style={{ height: '80px' }} />)}
                </div>
              ) : filteredHubSubjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                  <p style={{ color: 'var(--text-secondary)' }}>No subjects found matching "{hubSearch}" with the current filter.</p>
                  <button onClick={() => { setHubSearch(''); setHubFilter('all'); }} className="btn btn-primary" style={{ marginTop: '16px' }}>Clear All Filters</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {searchedHubSubjects.map((s, i) => (
                    <Link 
                      key={s.code} 
                      href={`/subjects/${s.code.toLowerCase()}/materials`} 
                      className="hub-subject-card neural-entrance"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="hub-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <span className="hub-code">{s.code}</span>
                           {(s.difficulty === 'Hard' || s.difficulty === 'Very Hard') && (
                             <span className="tooltip-container" data-tooltip={`Difficulty: ${s.difficulty}`} style={{ fontSize: '0.8rem' }}>🔥</span>
                           )}
                        </div>
                        <div className="hub-indicators">
                          <span className={`hub-dot tooltip-container ${s.midtermCount > 0 ? 'active' : ''}`} data-tooltip={`${s.midtermCount || 0} Midterm Papers`}>M</span>
                          <span className={`hub-dot tooltip-container ${s.finalCount > 0 ? 'active' : ''}`} data-tooltip={`${s.finalCount || 0} Final Term Papers`}>F</span>
                          <span className={`hub-dot tooltip-container ${s.handoutsCount > 0 ? 'active' : ''}`} data-tooltip={`${s.handoutsCount || 0} Handouts`}>H</span>
                          <span className={`hub-dot tooltip-container ${s.quizzesCount > 0 ? 'active' : ''}`} data-tooltip={`${s.quizzesCount || 0} Quiz Files`}>Q</span>
                        </div>
                      </div>
                      <div className="hub-name" title={s.name}>{s.name}</div>
                      <button 
                        onClick={(e) => handleAskAI(e, s)}
                        className="btn btn-sm" 
                        style={{ 
                          marginTop: 'auto', 
                          padding: '4px 8px', 
                          fontSize: '0.7rem', 
                          border: '1px solid rgba(34, 211, 238, 0.2)',
                          background: 'rgba(34, 211, 238, 0.05)',
                          color: 'var(--accent-secondary)'
                        }}
                      >
                        🧠 Ask AI Assist
                      </button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span className="hub-dot active">M</span> Midterm Papers
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span className="hub-dot active">F</span> Final Term Quest
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span className="hub-dot active">H</span> Official Handouts
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span className="hub-dot active">Q</span> Quiz Files
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHARE PAPER CTA */}
      <section className="section" style={{ padding: '0 0 60px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            borderRadius: '24px',
            padding: '40px',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '30px',
            boxShadow: '0 10px 40px rgba(34, 211, 238, 0.05)'
          }}>
            <div style={{ flex: '1 1 400px' }}>
              <div className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent-secondary)', border: '1px solid var(--accent-secondary)', marginBottom: '16px', padding: '6px 12px', fontSize: '0.9rem' }}>
                🌟 New Feature
              </div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '16px', fontWeight: '800' }}>
                Share Your Exam Experience
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                Just took an exam? Help your fellow students by sharing the questions you remember! Post your paper and discuss with the community. Let's conquer exams together.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/share-paper" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem', borderRadius: '12px', background: 'var(--accent-secondary)', color: '#000', border: 'none', boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}>
                  ✍️ Share Paper Now
                </Link>
                <a href="https://wa.me/923177180123?text=Hi! I want to share a review/paper for my exam." target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '14px 24px', fontSize: '1.1rem', borderRadius: '12px', background: '#25D366', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg> WhatsApp Directly
                </a>
              </div>
            </div>
            <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ fontSize: '8rem', filter: 'drop-shadow(0 0 30px rgba(34, 211, 238, 0.4))' }}>
                📝
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>📢 Latest Announcements</h2>
            <p>Stay updated with important VU news and notifications</p>
          </div>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {loadingAnnouncements ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                Loading latest announcements...
              </div>
            ) : announcements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                No recent announcements.
              </div>
            ) : (
              announcements.map(a => (
                <div key={a.id} className={`announcement-card ${a.important ? 'important' : ''}`}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={`badge ${a.important ? 'badge-primary' : 'badge-info'}`}>
                        {a.category === 'datesheet' ? '📅' : a.category === 'result' ? '📊' : a.category === 'admission' ? '🎓' : '📢'} {a.category}
                      </span>
                      {a.important && <span className="badge badge-warning">Important</span>}
                    </div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>{a.title}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{a.description}</p>
                    <div className="announcement-date">{a.date ? new Date(a.date).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              ))
            )}

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link href="/announcements" className="btn btn-outline">View All Announcements →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TOP RATED SUBJECTS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>⭐ Academic Library</h2>
            <p>Direct access to top-rated VU courses and study materials</p>
          </div>
          <div className="card-grid">
            {loadingStats ? (
              [...Array(6)].map((_, i) => <div key={i} className="card skeleton-pulse" style={{ height: '180px' }} />)
            ) : Array.isArray(stats.topSubjects) ? stats.topSubjects.map((s, i) => (
              <Link 
                key={s.code} 
                href={`/subjects/${(s.code || '').toLowerCase()}`} 
                className="card subject-card neural-entrance" 
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="subject-code">{s.code}</div>
                <h3>{s.name}</h3>
                <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3em' }}>{s.description}</p>
                <div className="subject-meta">
                  <span className="tooltip-container" data-tooltip="User Rating">⭐ {(s.rating || 0).toFixed(1)}</span>
                  <span className="tooltip-container" data-tooltip="Total Downloads">📥 {s.downloads?.toLocaleString() || '0'}</span>
                  <span className="tooltip-container" data-tooltip="Available Resources">📄 {s.totalFiles || 0}</span>
                  <span className={`diff-${(s.difficulty || '').toLowerCase().replace(' ', '')}`}>{s.difficulty}</span>
                </div>
                <button 
                  onClick={(e) => handleAskAI(e, s)}
                  className="btn btn-outline btn-sm" 
                  style={{ marginTop: '15px', width: '100%', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  🧠 Subject Intelligence Assist
                </button>
              </Link>
            )) : null}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/subjects" className="btn btn-primary btn-lg">Browse All Subjects →</Link>
          </div>
        </div>
      </section>

      {/* MOST DOWNLOADED */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>📥 Most Downloaded</h2>
            <p>Popular study materials among VU students</p>
          </div>
          <div className="card-grid">
            {loadingStats ? (
              [...Array(6)].map((_, i) => <div key={i} className="card skeleton-pulse" style={{ height: '160px' }} />)
            ) : Array.isArray(stats.topDownloaded) ? stats.topDownloaded.map((s, i) => (
              <Link key={s.code} href={`/subjects/${(s.code || '').toLowerCase()}`} className="card subject-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="card-badge">🔥 Popular</div>
                <div className="subject-code">{s.code}</div>
                <h3>{s.name}</h3>
                <div className="subject-meta">
                  <span>📥 {s.downloads?.toLocaleString() || '0'} downloads</span>
                  <span>⭐ {(s.rating || 0).toFixed(1)}</span>
                  <span>📄 {s.totalFiles || 0} files</span>
                </div>
              </Link>
            )) : null}
          </div>
        </div>
      </section>

      {/* TOP CONTRIBUTORS */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>🏆 Our Achievers</h2>
            <p>Community heroes driving academic excellence at VU</p>
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {loadingStats ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading community heroes...</div>
            ) : Array.isArray(stats.leaderboard) ? stats.leaderboard.map((s, i) => (
              <div key={i} className="leaderboard-item animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`leaderboard-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}
                </div>
                <div className="leaderboard-info">
                  <div className="leaderboard-name">{s.username}</div>
                  <div className="leaderboard-stats">{s.uploads || 0} uploads</div>
                </div>
                <div className="leaderboard-points">{(s.points || 0).toLocaleString()} pts</div>
              </div>
            )) : <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Become the first hero!</div>}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link href="/leaderboard" className="btn btn-outline">View Full Leaderboard →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* YOUTUBE SECTION */}
      <section className="section section-alt">
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
            borderRadius: '32px',
            padding: '40px',
            border: '1px solid rgba(255, 0, 0, 0.1)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '40px'
          }}>
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div className="badge badge-warning" style={{ background: '#ff0000', color: 'white', border: 'none', marginBottom: '16px' }}>🎥 New Channel</div>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '16px' }}>Master VU with <span style={{ color: '#ff0000' }}>Video Guides</span></h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.7' }}>
                We've launched our YouTube channel! Subscribe to get step-by-step guides on LMS handling, midterm/final term preparation strategies, and complex subject tutorials.
              </p>
              <a 
                href="https://youtube.com/@hmnexora?si=BP1iRNlzm3lr1lgJ" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
                style={{ background: '#ff0000', borderColor: '#ff0000', padding: '14px 32px', fontSize: '1.1rem' }}
              >
                Subscribe to HM nexora →
              </a>
            </div>
            <div style={{ flex: '1', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
              {!showVideo ? (
                <div 
                  onClick={() => setShowVideo(true)}
                  style={{ 
                    position: 'relative', 
                    width: '100%', 
                    maxWidth: '480px', 
                    aspectRatio: '16/9', 
                    borderRadius: '24px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.1)',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  className="youtube-preview-container"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 35px 60px -12px rgba(255, 0, 0, 0.2), 0 0 0 1px rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.1)';
                  }}
                >
                  {/* Background Thumbnail (Blurred) */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'url("https://img.youtube.com/vi/QFq1Cx9Du4M/maxresdefault.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.4) blur(2px)',
                    zIndex: 0
                  }} />

                  {/* Pulsing Live Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    zIndex: 2
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#ff0000',
                      borderRadius: '50%',
                      animation: 'pulseLive 2s infinite'
                    }} />
                    <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>LIVE</span>
                  </div>

                  {/* 4K Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                    color: 'black',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '900',
                    zIndex: 2,
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                  }}>
                    4K ULTRA HD
                  </div>

                  {/* Glassmorphism Play Button */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    zIndex: 2,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 0 30px rgba(0,0,0,0.5)'
                  }} className="play-btn">
                    <div style={{ 
                      width: '0', 
                      height: '0', 
                      borderTop: '15px solid transparent', 
                      borderBottom: '15px solid transparent', 
                      borderLeft: '25px solid white',
                      marginLeft: '8px'
                    }} />
                  </div>

                  {/* Bottom Info Bar */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                  }}>
                    <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>VU Mid-Term Preparation Guide 2026</div>
                    <div style={{ 
                      width: '100px', 
                      height: '4px', 
                      background: 'rgba(255,255,255,0.2)', 
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ width: '45%', height: '100%', background: '#ff0000' }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  maxWidth: '480px', 
                  aspectRatio: '16/9', 
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.1)',
                }}>
                   <iframe
                      src="https://www.youtube.com/embed/QFq1Cx9Du4M?autoplay=1&si=xb3fuGQnf8DXzLcw"
                      title="Master VU with Video Guides — HM nexora"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                      }}
                   />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP BOT SECTION */}
      <section className="section" id="whatsapp-section">
        <div className="container">
          <div className="home-whatsapp-container">
            <div style={{ flex: '1', minWidth: '280px', display: 'flex', justifyContent: 'center' }}>
                <div className="wa-bot-simulate">
                    <div className="wa-bubble-user">
                        User: .sticker [image]
                    </div>
                    <div className="wa-bubble-bot">
                        Bot: 🎨 Sticker Created! 🌟
                    </div>
                    <div className="wa-bubble-user">
                        User: .insta [reel_url]
                    </div>
                    <div className="wa-bubble-bot">
                        Bot: 📥 Downloading HD Media...
                    </div>
                    <div className="wa-bot-avatar">🤖</div>
                </div>
            </div>
            <div style={{ flex: '1.5', minWidth: '300px' }}>
              <div className="badge" style={{ background: '#25D366', color: 'white', marginBottom: '16px' }}>💬 Next-Gen WhatsApp Bot</div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '16px' }}>The Ultimate <span style={{ color: '#25D366' }}>Social & Academic</span> Assistant</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.7' }}>
                Our upgraded WhatsApp bot is more than just an academic tool. It's your personal media command center—download files, convert stickers, and save social media content instantly.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366' }}>📥</div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Social Media Downloader</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366' }}>🎨</div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Image to Sticker</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366' }}>📄</div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Automated Study Files</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366' }}>🎧</div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>Media Playback & More</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a 
                  href="https://chat.whatsapp.com/KM2WXl3s8zw9wj3SBM8GY0" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                  style={{ background: '#25D366', borderColor: '#25D366', padding: '14px 28px' }}
                >
                  Join Official Communities →
                </a>
                <a 
                  href="https://wa.me/923037180123?text=.help" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline"
                  style={{ borderColor: '#25D366', color: '#25D366', padding: '14px 28px' }}
                >
                  Message Bot Directly →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Ready to <span className="gradient-text">Ace Your Exams</span>?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 32px' }}>
            Join thousands of students who trust HM nexora for their academic success.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/subjects" className="btn btn-primary btn-lg">Explore Subjects</Link>
            <Link href="/services" className="btn btn-secondary btn-lg">Our Services</Link>
          </div>
        </div>
      </section>
      {/* AI ASSISTANT MODAL */}
      {aiSubject && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.9)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card neural-entrance" style={{ 
            maxWidth: '550px', 
            width: '100%', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--accent-secondary)',
            boxShadow: '0 0 50px rgba(34, 211, 238, 0.2)',
            padding: '35px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent-secondary)', marginBottom: '8px', border: 'none' }}>🤖 NEURAL ASSIST</span>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{aiSubject.code} Intel</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{aiSubject.name}</p>
              </div>
              <button 
                onClick={() => setAiSubject(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '36px', height: '36px', minWidth: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {!aiResponse ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  Ask our AI Assistant about <strong>{aiSubject.code}</strong>. Get core concepts, study strategies, or exam tips instantly.
                </p>
                <textarea 
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Example: What are the core concepts? or Give me exam tips for this subject..."
                  className="form-input"
                  style={{ minHeight: '120px', background: 'rgba(0,0,0,0.3)', resize: 'none' }}
                />
                <button 
                   onClick={submitAIQuery}
                   disabled={aiLoading || !aiQuery.trim()}
                   className="btn btn-primary"
                   style={{ width: '100%', padding: '14px' }}
                >
                  {aiLoading ? '✨ Neural Processing...' : '✨ Generate Insights'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '24px', 
                  borderRadius: '16px', 
                  fontSize: '0.92rem', 
                  maxHeight: '350px', 
                  overflowY: 'auto',
                  border: '1px solid rgba(255,255,255,0.05)',
                  lineHeight: '1.7',
                  color: 'var(--text-primary)'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setAiResponse(null)} className="btn btn-secondary" style={{ flex: 1 }}>Ask Another</button>
                  <button onClick={() => setAiSubject(null)} className="btn btn-primary" style={{ flex: 1 }}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
