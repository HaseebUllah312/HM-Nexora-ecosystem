'use client';

import './AnimatedBackground.css';

export function AnimatedBackground({
  variant = 'gradient',
  intensity = 'medium',
  showParticles = true
}: {
  variant?: 'gradient' | 'dots' | 'mesh' | 'simple';
  intensity?: 'light' | 'medium' | 'heavy';
  showParticles?: boolean;
}) {
  return (
    <>
      {variant === 'gradient' && (
        <div className={`animated-bg-gradient animated-bg-${intensity}`} />
      )}
      {variant === 'dots' && (
        <div className="animated-bg-dots" />
      )}
      {variant === 'mesh' && (
        <div className="animated-bg-mesh" />
      )}
      {variant === 'simple' && (
        <div className="animated-bg-simple" />
      )}
      
      {/* Floating Hexagon Particles */}
      {showParticles && (
        <>
          <div className="hexagon-float hex-1" />
          <div className="hexagon-float hex-2" />
          <div className="hexagon-float hex-3" />
          <div className="hexagon-float hex-4" />
          <div className="hexagon-float hex-5" />
        </>
      )}
    </>
  );
}

export default AnimatedBackground;
