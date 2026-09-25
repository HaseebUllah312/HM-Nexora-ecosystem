'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LivePulse() {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Base students online (simulated based on time of day)
        const hour = new Date().getHours();
        const base = (hour > 8 && hour < 23) ? 140 : 40;
        setCount(base + Math.floor(Math.random() * 20));
        
        const timer = setTimeout(() => setIsVisible(true), 1500);

        const interval = setInterval(() => {
            setCount(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                const newCount = prev + change;
                return newCount > 10 ? newCount : 10;
            });
        }, 5000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        background: 'rgba(var(--accent-primary-rgb), 0.1)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        width: 'fit-content',
                        margin: '0 auto 20px',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <span style={{ 
                        position: 'relative', 
                        display: 'flex', 
                        height: '8px', 
                        width: '8px' 
                    }}>
                        <span style={{
                            position: 'absolute',
                            display: 'inline-flex',
                            height: '100%',
                            width: '100%',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            opacity: 0.75,
                            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }} />
                        <span style={{
                            position: 'relative',
                            display: 'inline-flex',
                            borderRadius: '50%',
                            height: '8px',
                            width: '8px',
                            backgroundColor: '#10b981'
                        }} />
                    </span>
                    <style>{`
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 1; }
                            70%, 100% { transform: scale(2.5); opacity: 0; }
                        }
                    `}</style>
                    <span style={{ letterSpacing: '0.5px' }}>{count.toLocaleString()} STUDENTS STUDYING NOW</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
