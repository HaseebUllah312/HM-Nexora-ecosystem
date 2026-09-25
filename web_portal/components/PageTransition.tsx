'use client';

import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  duration?: number;
  type?: 'fade' | 'slideUp' | 'scaleUp' | 'blurIn';
}

export function PageTransition({
  children,
  duration = 0.5,
  type = 'fade'
}: PageTransitionProps) {
  const animationClass = `animation-${type}`;

  return (
    <div
      className={`page-transition ${animationClass}`}
      style={{
        animation: `${animationClass} ${duration}s ease-out`,
      }}
    >
      {children}
    </div>
  );
}

export function AnimatedSection({
  children,
  delay = 0,
  type = 'slideUp',
}: {
  children: ReactNode;
  delay?: number;
  type?: 'slideUp' | 'fadeIn' | 'scaleUp' | 'fadeInDown' | 'fadeInRight';
}) {
  return (
    <div
      className={`animation-${type} list-item-stagger`}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default PageTransition;
