'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiLightningBolt, HiBookOpen, HiQuestionMarkCircle, HiCollection, HiShieldCheck, HiUsers, HiSpeakerphone, HiTerminal } from 'react-icons/hi';
import { fuzzySearch } from '@/app/lib/utils/fuzzySearch';

interface PaletteItem {
    label: string;
    href: string;
    icon: any;
    keyword?: string;
    category?: string;
}

const paletteItems: PaletteItem[] = [
    { label: 'Subject Library', href: '/subjects', icon: HiBookOpen, keyword: 'library books courses' },
    { label: 'Study Hub', href: '/study-hub', icon: HiLightningBolt, keyword: 'hub study live' },
    { label: 'Admin Dashboard', href: '/admin', icon: HiShieldCheck, keyword: 'admin dashboard control nexus hex' },
    { label: 'User Management', href: '/admin/users', icon: HiUsers, keyword: 'admin users members participants' },
    { label: 'Announcements', href: '/admin/announcements', icon: HiSpeakerphone, keyword: 'admin announcements news broadcast' },
    { label: 'System Logs', href: '/admin/activity', icon: HiTerminal, keyword: 'admin logs activity history' },
    { label: 'Help Desk / Q&A', href: '/qna', icon: HiQuestionMarkCircle, keyword: 'qna help forum desk' },
    { label: 'My Study Vault', href: '/vault', icon: HiCollection, keyword: 'vault files downloads' },
];

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [dynamicResults, setDynamicResults] = useState<PaletteItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        
        const handleOpenEvent = () => setIsOpen(true);
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-command-palette', handleOpenEvent);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-command-palette', handleOpenEvent);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setDynamicResults([]);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setDynamicResults([]);
                return;
            }

            setIsLoading(true);
            try {
                // Search Users and Subjects concurrently
                const [usersRes, subjectsRes] = await Promise.all([
                    fetch(`/api/admin/users?search=${query}`).then(r => r.json()),
                    fetch(`/api/subjects?search=${query}`).then(r => r.json())
                ]);

                const searchResults: PaletteItem[] = [];

                if (Array.isArray(usersRes)) {
                    usersRes.slice(0, 3).forEach((u: any) => {
                        searchResults.push({
                            label: `User: ${u.username || u.email}`,
                            href: `/admin/users?search=${u.id}`,
                            icon: HiUsers,
                            category: 'User'
                        });
                    });
                }

                if (Array.isArray(subjectsRes)) {
                    subjectsRes.slice(0, 3).forEach((s: any) => {
                        searchResults.push({
                            label: `Subject: ${s.code} - ${s.name}`,
                            href: `/subjects/${s.code.toLowerCase()}`,
                            icon: HiBookOpen,
                            category: 'Subject'
                        });
                    });
                }

                setDynamicResults(searchResults);
            } catch (err) {
                console.error('Palette search error:', err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    const staticFiltered = query 
        ? fuzzySearch(paletteItems, query, ['label', 'keyword'])
        : paletteItems;

    const filtered = [...staticFiltered, ...dynamicResults];

    const handleSelect = (href: string) => {
        router.push(href);
        setIsOpen(false);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            setSelectedIndex(prev => (prev + 1) % filtered.length);
        } else if (e.key === 'ArrowUp') {
            setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        } else if (e.key === 'Enter') {
            if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex].href);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="command-palette-overlay" onClick={() => setIsOpen(false)}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="command-palette-card"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="palette-search">
                            <HiSearch className="search-icon" />
                            <input 
                                ref={inputRef}
                                type="text" 
                                placeholder="Power Search... (Try 'CS101', 'Admin', or 'John')" 
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={onKeyDown}
                            />
                            <div className="palette-esc" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                {isLoading ? '⏳ Searching...' : 'ESC to close'}
                            </div>
                        </div>

                        <div className="palette-results">
                            {filtered.length > 0 ? (
                                filtered.map((item, i) => (
                                    <div 
                                        key={item.href + i}
                                        className={`palette-item ${i === selectedIndex ? 'selected' : ''}`}
                                        onClick={() => handleSelect(item.href)}
                                        onMouseEnter={() => setSelectedIndex(i)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                            <item.icon className="item-icon" />
                                            <span>{item.label}</span>
                                        </div>
                                        {item.category && (
                                            <span style={{ 
                                                fontSize: '0.65rem', 
                                                padding: '2px 8px', 
                                                borderRadius: '10px', 
                                                background: 'rgba(102, 126, 234, 0.1)', 
                                                color: 'var(--primary)',
                                                fontWeight: 'bold'
                                            }}>
                                                {item.category.toUpperCase()}
                                            </span>
                                        )}
                                        <div className="item-hint">
                                            {item.category === 'User' ? 'Manage User' : item.category === 'Subject' ? 'View Subject' : 'Jump to'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="palette-empty">No results for "{query}"</div>
                            )}
                        </div>

                        <div className="palette-footer">
                            <div className="footer-tip"><span>↵</span> to select</div>
                            <div className="footer-tip"><span>↑↓</span> to navigate</div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
