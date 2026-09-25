'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HiHome, 
    HiBookOpen, 
    HiSparkles, 
    HiLockClosed, 
    HiUser 
} from 'react-icons/hi2';

const navItems = [
    { href: '/', label: 'Home', icon: <HiHome /> },
    { href: '/subjects', label: 'Library', icon: <HiBookOpen /> },
    { href: '/ai-assistant', label: 'AI Mentor', icon: <HiSparkles /> },
    { href: '/vault', label: 'Vault', icon: <HiLockClosed /> },
    { href: '/profile', label: 'Profile', icon: <HiUser /> },
];

export default function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="mobile-bottom-nav">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                
                return (
                    <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                        <motion.span 
                            className="nav-icon"
                            animate={{ 
                                scale: isActive ? 1.2 : 1,
                                y: isActive ? -5 : 0
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {item.icon}
                        </motion.span>
                        <span className="nav-label">{item.label}</span>
                        
                        <AnimatePresence>
                            {isActive && (
                                <motion.div 
                                    layoutId="active-indicator"
                                    className="active-indicator"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </AnimatePresence>
                    </Link>
                );
            })}
        </nav>
    );
}
