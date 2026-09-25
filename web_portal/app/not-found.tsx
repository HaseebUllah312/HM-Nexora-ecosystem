'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiHome, HiSearch } from 'react-icons/hi';

export default function NotFound() {
    return (
        <div className="page" style={{
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Animated Particles/Icons */}
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ 
                        x: Math.random() * 100 - 50 + 'vw', 
                        y: Math.random() * 100 - 50 + 'vh',
                        opacity: 0 
                    }}
                    animate={{ 
                        x: [null, Math.random() * 100 - 50 + 'vw'],
                        y: [null, Math.random() * 100 - 50 + 'vh'],
                        opacity: [0, 0.3, 0],
                        rotate: 360
                    }}
                    transition={{ 
                        duration: 10 + Math.random() * 20, 
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        fontSize: Math.random() * 20 + 20 + 'px',
                        color: 'var(--accent-primary)',
                        filter: 'blur(1px)',
                        zIndex: 0
                    }}
                >
                    {['📚', '🎓', '🔬', '💡', '🧪', '🖊️'][i % 6]}
                </motion.div>
            ))}

            <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                >
                    <div style={{
                        fontSize: 'clamp(6rem, 15vw, 10rem)',
                        fontWeight: '900',
                        lineHeight: 1,
                        background: 'var(--accent-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '10px',
                        filter: 'drop-shadow(0 0 30px rgba(124, 58, 237, 0.3))'
                    }}>
                        404
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 style={{ marginBottom: '16px', fontSize: '2rem', color: 'var(--text-primary)' }}>
                        Lost in the Study Space?
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)',
                        maxWidth: '520px',
                        margin: '0 auto 40px',
                        fontSize: '1.1rem',
                        lineHeight: 1.6
                    }}>
                        Even the best scholars lose their way sometimes. The page you're searching for has drifted out of orbit.
                    </p>
                </motion.div>

                <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.4 }}
                   style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
                >
                    <Link href="/" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HiHome /> Return to Base
                    </Link>
                    <Link href="/subjects" className="btn btn-outline btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <HiSearch /> Search Library
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
