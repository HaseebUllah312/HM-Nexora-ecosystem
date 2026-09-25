import { useState, useEffect, useRef } from 'react';
import { HiChatBubbleLeftRight, HiUserGroup, HiMiniCpuChip, HiUser } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '@/app/lib/hooks/useClickOutside';

export default function WhatsAppFab() {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useClickOutside(containerRef, () => setIsOpen(false));

    const menuItems = [
        {
            icon: <HiMiniCpuChip />,
            label: 'Get Study Files (Bot)',
            sub: 'Instant CS101, MTH. type !help',
            link: 'https://wa.me/923037180123?text=!help',
            color: '#25D366'
        },
        {
            icon: <HiUserGroup />,
            label: 'Join VU Community',
            sub: 'Group for discussions & help',
            link: 'https://chat.whatsapp.com/IKRvekWIc2e4IDvzSDPHaz',
            color: '#128C7E'
        },
        {
            icon: <HiUser />,
            label: "Support (𝕴𝖙'𝖘 𝕸𝖚𝖌𝖍𝖆𝖑)",
            sub: 'For payments or personal issues',
            link: 'https://wa.me/923177180123',
            color: '#075E54'
        }
    ];

    return (
        <div className="whatsapp-hub-container" ref={containerRef}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="whatsapp-hub-menu"
                    >
                        <div className="hub-header">
                            <strong>WhatsApp Support Hub</strong>
                            <p>How can we help you today?</p>
                        </div>
                        <div className="hub-options">
                            {menuItems.map((item, i) => (
                                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="hub-option">
                                    <div className="hub-option-icon" style={{ background: item.color }}>
                                        {item.icon}
                                    </div>
                                    <div className="hub-option-text">
                                        <div className="hub-option-label">{item.label}</div>
                                        <div className="hub-option-sub">{item.sub}</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                className={`whatsapp-hub-toggle float-btn-base ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="WhatsApp Hub"
                style={{ position: 'relative', bottom: 'auto', right: 'auto' }}
            >
                <div className="toggle-icon">
                    {isOpen ? '✕' : <HiChatBubbleLeftRight />}
                </div>
                {!isOpen && <span className="float-tooltip">WhatsApp Support Hub</span>}
            </button>
        </div>
    );
}
