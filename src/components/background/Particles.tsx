'use client';

import { useEffect, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  glowDelay: string;
}

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      'rgba(147, 51, 234, 0.5)',  // Violett
      'rgba(59, 130, 246, 0.5)',  // Blau
      'rgba(236, 72, 153, 0.5)',  // Pink
      'rgba(16, 185, 129, 0.5)',  // Grün
    ];

    const newParticles: Particle[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      glowDelay: `${Math.random() * 15}s`
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle, index) => (
        <div
          key={index}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDelay: `${-Math.random() * 20}s`,
            '--glow-delay': particle.glowDelay
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
} 