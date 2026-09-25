'use client';
import { motion } from 'framer-motion';

interface ActivityItem {
    day: string;
    hours: number;
    active: boolean;
}

const studyData: ActivityItem[] = [
    { day: 'Mon', hours: 4, active: false },
    { day: 'Tue', hours: 6, active: true },
    { day: 'Wed', hours: 3, active: false },
    { day: 'Thu', hours: 8, active: true },
    { day: 'Fri', hours: 5, active: false },
    { day: 'Sat', hours: 2, active: false },
    { day: 'Sun', hours: 7, active: true },
];

export default function StudyActivityChart() {
    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '30px',
            height: '240px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '12px',
            position: 'relative'
        }}>
            {/* Y-Axis Label */}
            <div style={{ position: 'absolute', left: '15px', top: '20px', fontSize: '0.7rem', color: 'var(--text-muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', opacity: 0.6 }}>
                Learning Hours
            </div>
            
            {studyData.map((item, i) => (
                <div key={item.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: '100%' }}>
                    <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${(item.hours / 10) * 100}%` }}
                            transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                            style={{
                                width: '45px',
                                background: item.active ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                                borderRadius: '8px 8px 4px 4px',
                                boxShadow: item.active ? 'var(--shadow-glow)' : 'none',
                                position: 'relative'
                            }}
                        >
                            {item.active && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 + 0.5 }}
                                    style={{
                                        position: 'absolute',
                                        top: '-25px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        color: 'var(--accent-primary)'
                                    }}
                                >
                                    {item.hours}h
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: item.active ? '700' : '400' }}>{item.day}</span>
                </div>
            ))}
        </div>
    );
}
