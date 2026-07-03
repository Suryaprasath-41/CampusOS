'use client';

import { useEffect } from 'react';

export default function AnimatedBackground() {
  useEffect(() => {
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const orbs = [
      { x: 0.2, y: 0.3, r: 300, color: 'rgba(139, 92, 246, 0.08)' },
      { x: 0.7, y: 0.6, r: 350, color: 'rgba(6, 182, 212, 0.06)' },
      { x: 0.5, y: 0.8, r: 280, color: 'rgba(168, 85, 247, 0.05)' },
      { x: 0.8, y: 0.2, r: 250, color: 'rgba(59, 130, 246, 0.04)' },
    ];

    const animate = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb, i) => {
        const x = (orb.x + Math.sin(time + i * 1.5) * 0.1) * canvas.width;
        const y = (orb.y + Math.cos(time + i * 2) * 0.08) * canvas.height;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      id="bg-canvas"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
