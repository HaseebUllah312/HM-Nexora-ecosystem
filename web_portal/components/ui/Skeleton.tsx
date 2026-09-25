import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    style?: React.CSSProperties;
}

export default function Skeleton({ width, height, borderRadius, className = '', style }: SkeletonProps) {
    const styles: React.CSSProperties = {
        width: width,
        height: height,
        borderRadius: borderRadius || 'var(--radius-md)',
        backgroundColor: 'var(--border-color)', // Fallback color
        ...style,
    };

    return (
        <div
            className={`skeleton ${className}`}
            style={styles}
        />
    );
}
