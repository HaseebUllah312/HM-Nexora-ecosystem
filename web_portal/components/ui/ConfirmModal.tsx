'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'info' | 'warning';
}

export default function ConfirmModal({ 
    isOpen, 
    title, 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel', 
    onConfirm, 
    onCancel,
    type = 'info'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const accentColor = type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6366f1';

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 5000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)'
                    }}
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="glass"
                    style={{
                        width: '100%',
                        maxWidth: '450px',
                        background: 'var(--bg-card)',
                        borderRadius: '24px',
                        padding: '32px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        position: 'relative',
                        zIndex: 1,
                        border: `1px solid ${accentColor}33`
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: `${accentColor}11`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            color: accentColor
                        }}>
                            {type === 'danger' ? '⚠️' : type === 'warning' ? '🔔' : 'ℹ️'}
                        </div>
                        <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: '800', color: 'var(--text-primary)' }}>{title}</h2>
                    </div>
                    
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px', fontSize: '1.05rem' }}>
                        {message}
                    </p>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={onCancel}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '14px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm}
                            style={{
                                flex: 2,
                                padding: '14px',
                                borderRadius: '14px',
                                background: accentColor,
                                border: 'none',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: `0 10px 20px -5px ${accentColor}44`,
                                transition: 'all 0.2s'
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
