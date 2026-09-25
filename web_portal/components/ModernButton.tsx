'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import './ModernButton.css';

interface ModernButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  icon?: ReactNode;
}

export function ModernButton({
  children,
  variant = 'primary',
  size = 'md',
  animated = true,
  icon,
  className = '',
  ...props
}: ModernButtonProps) {
  const baseClass = `modern-button modern-button-${variant} modern-button-${size}`;
  const animationClass = animated ? 'button-gradient-hover button-press' : '';

  return (
    <button
      className={`${baseClass} ${animationClass} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="button-icon">{icon}</span>}
      <span className="button-text">{children}</span>
    </button>
  );
}

export default ModernButton;
