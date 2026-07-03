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

    // Expanded orbs with more colors: purple, cyan, green, pink, blue
    const orbs = [
      { x: 0.2, y: 0.3, r: 300, color: 'rgba(139, 92, 246, 0.08)', speed: 1.0 },
      { x: 0.7, y: 0.6, r: 350, color: 'rgba(6, 182, 212, 0.06)', speed: 0.8 },
      { x: 0.5, y: 0.8, r: 280, color: 'rgba(168, 85, 247, 0.05)', speed: 1.2 },
      { x: 0.8, y: 0.2, r: 250, color: 'rgba(59, 130, 246, 0.04)', speed: 0.6 },
      // New orbs
      { x: 0.15, y: 0.7, r: 220, color: 'rgba(34, 197, 94, 0.05)', speed: 0.9 },
      { x: 0.6, y: 0.15, r: 270, color: 'rgba(236, 72, 153, 0.05)', speed: 1.1 },
      { x: 0.9, y: 0.5, r: 200, color: 'rgba(6, 182, 212, 0.07)', speed: 0.7 },
      { x: 0.35, y: 0.45, r: 240, color: 'rgba(139, 92, 246, 0.04)', speed: 1.3 },
      { x: 0.5, y: 0.9, r: 180, color: 'rgba(34, 197, 94, 0.04)', speed: 0.5 },
      { x: 0.75, y: 0.85, r: 260, color: 'rgba(236, 72, 153, 0.04)', speed: 0.85 },
    ];

    // Floating particle dots
    const particles: { x: number; y: number; r: number; speed: number; drift: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.0003 + 0.0001,
        drift: Math.random() * 0.0005 - 0.00025,
        alpha: Math.random() * 0.3 + 0.05,
      });
    }

    const animate = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw orbs with more fluid movement (varying speeds)
      orbs.forEach((orb, i) => {
        const sp = orb.speed;
        const x = (orb.x + Math.sin(time * sp + i * 1.5) * 0.1 + Math.sin(time * sp * 0.7 + i * 0.5) * 0.03) * canvas.width;
        const y = (orb.y + Math.cos(time * sp + i * 2) * 0.08 + Math.cos(time * sp * 0.6 + i * 0.8) * 0.025) * canvas.height;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Draw subtle grid pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw floating particle dots
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(time * 2 + p.x * 10) * 0.0001;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;

        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      // Vignette effect at edges
      const vignetteGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.9
      );
      vignetteGradient.addColorStop(0, 'transparent');
      vignetteGradient.addColorStop(1, 'rgba(5, 5, 16, 0.6)');
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
