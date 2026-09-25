'use client';

import { ReactNode, HTMLAttributes } from 'react';
import './ModernCard.css';

interface ModernCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  animated?: boolean;
}

export function ModernCard({
  children,
  variant = 'default',
  hoverEffect = 'lift',
  animated = true,
  className = '',
  ...props
}: ModernCardProps) {
  const baseClass = `modern-card modern-card-${variant}`;
  const hoverClass = hoverEffect !== 'none' ? `card-hover-${hoverEffect}` : '';
  const animationClass = animated ? 'list-item-stagger' : '';

  return (
    <div
      className={`${baseClass} ${hoverClass} ${animationClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export default ModernCard;
