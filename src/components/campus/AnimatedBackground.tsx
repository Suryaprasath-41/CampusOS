'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export default function AnimatedBackground() {
  const { resolvedTheme } = useTheme();

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

    // Expanded orbs with pulsing brightness
    const orbs = [
      { x: 0.2, y: 0.3, r: 300, color: [139, 92, 246], baseAlpha: 0.08, speed: 1.0, pulseSpeed: 0.5 },
      { x: 0.7, y: 0.6, r: 350, color: [6, 182, 212], baseAlpha: 0.06, speed: 0.8, pulseSpeed: 0.7 },
      { x: 0.5, y: 0.8, r: 280, color: [168, 85, 247], baseAlpha: 0.05, speed: 1.2, pulseSpeed: 0.4 },
      { x: 0.8, y: 0.2, r: 250, color: [59, 130, 246], baseAlpha: 0.04, speed: 0.6, pulseSpeed: 0.6 },
      { x: 0.15, y: 0.7, r: 220, color: [34, 197, 94], baseAlpha: 0.05, speed: 0.9, pulseSpeed: 0.8 },
      { x: 0.6, y: 0.15, r: 270, color: [236, 72, 153], baseAlpha: 0.05, speed: 1.1, pulseSpeed: 0.3 },
      { x: 0.9, y: 0.5, r: 200, color: [6, 182, 212], baseAlpha: 0.07, speed: 0.7, pulseSpeed: 0.9 },
      { x: 0.35, y: 0.45, r: 240, color: [139, 92, 246], baseAlpha: 0.04, speed: 1.3, pulseSpeed: 0.55 },
      { x: 0.5, y: 0.9, r: 180, color: [34, 197, 94], baseAlpha: 0.04, speed: 0.5, pulseSpeed: 0.65 },
      { x: 0.75, y: 0.85, r: 260, color: [236, 72, 153], baseAlpha: 0.04, speed: 0.85, pulseSpeed: 0.45 },
    ];

    // Floating particle dots with more variety
    interface Particle {
      x: number;
      y: number;
      r: number;
      speed: number;
      drift: number;
      alpha: number;
      color: [number, number, number];
      twinkleSpeed: number;
      twinklePhase: number;
    }

    const darkParticleColors: [number, number, number][] = [
      [255, 255, 255],
      [139, 92, 246],
      [6, 182, 212],
      [168, 85, 247],
      [34, 197, 94],
    ];

    const lightParticleColors: [number, number, number][] = [
      [100, 100, 120],
      [124, 58, 237],
      [6, 156, 184],
      [100, 60, 180],
      [30, 150, 70],
    ];

    const particles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      const isLight = document.documentElement.classList.contains('light');
      const particleColors = isLight ? lightParticleColors : darkParticleColors;
      particles.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 2 + 0.3,
        speed: Math.random() * 0.0003 + 0.0001,
        drift: Math.random() * 0.0005 - 0.00025,
        alpha: Math.random() * 0.4 + 0.05,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        twinkleSpeed: Math.random() * 2 + 1,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Geometric constellation points for hex/constellation overlay
    const constellationPoints: { x: number; y: number }[] = [];
    for (let i = 0; i < 30; i++) {
      constellationPoints.push({
        x: Math.random(),
        y: Math.random(),
      });
    }

    // Connection line distance threshold
    const CONNECTION_DIST = 150;

    const animate = () => {
      const isLight = document.documentElement.classList.contains('light');
      const alphaMultiplier = isLight ? 0.12 : 1.0; // Dramatically reduce orb opacity in light mode
      const gridAlphaMultiplier = isLight ? 0.15 : 1.0; // Almost invisible grid in light mode
      const particleAlphaMultiplier = isLight ? 0.25 : 1.0; // Much more subtle particles in light mode
      const connectionAlphaMultiplier = isLight ? 0.1 : 1.0; // Almost no connection lines in light mode

      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw orbs with pulsing brightness
      orbs.forEach((orb, i) => {
        const sp = orb.speed;
        const x = (orb.x + Math.sin(time * sp + i * 1.5) * 0.1 + Math.sin(time * sp * 0.7 + i * 0.5) * 0.03) * canvas.width;
        const y = (orb.y + Math.cos(time * sp + i * 2) * 0.08 + Math.cos(time * sp * 0.6 + i * 0.8) * 0.025) * canvas.height;

        // Pulsing alpha
        const pulseAlpha = (orb.baseAlpha + Math.sin(time * orb.pulseSpeed + i) * 0.02) * alphaMultiplier;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
        gradient.addColorStop(0, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, ${pulseAlpha})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Draw subtle grid pattern with color-shifting effect
      const gridHueShift = Math.sin(time * 0.2) * 0.005;
      const gridAlpha = (0.015 + gridHueShift) * gridAlphaMultiplier;
      ctx.strokeStyle = `rgba(139, 92, 246, ${Math.max(0.003, gridAlpha)})`;
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      // Horizontal lines with cyan tint
      ctx.strokeStyle = `rgba(6, 182, 212, ${Math.max(0.003, gridAlpha * 0.7)})`;
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw slow-rotating geometric constellation overlay
      const rotation = time * 0.05;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotation);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Constellation connecting lines
      const screenPoints = constellationPoints.map(p => ({
        sx: p.x * canvas.width,
        sy: p.y * canvas.height,
      }));

      // Draw lines between nearby constellation points
      for (let i = 0; i < screenPoints.length; i++) {
        for (let j = i + 1; j < screenPoints.length; j++) {
          const dx = screenPoints[i].sx - screenPoints[j].sx;
          const dy = screenPoints[i].sy - screenPoints[j].sy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST * 2.5) {
            const lineAlpha = Math.max(0, (0.03 - (dist / (CONNECTION_DIST * 4))) * gridAlphaMultiplier * connectionAlphaMultiplier);
            ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(screenPoints[i].sx, screenPoints[i].sy);
            ctx.lineTo(screenPoints[j].sx, screenPoints[j].sy);
            ctx.stroke();
          }
        }
      }

      // Draw small dots at constellation points
      const dotAlpha = isLight ? 0.015 : 0.08;
      screenPoints.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${dotAlpha})`;
        ctx.fill();
      });

      ctx.restore();

      // Draw floating particle dots with variety
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(time * 2 + p.x * 10) * 0.0001;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;

        // Update color based on current theme
        const particleColors = isLight ? lightParticleColors : darkParticleColors;
        const colorIndex = particles.indexOf(p) % particleColors.length;
        p.color = particleColors[colorIndex];

        // Twinkle effect
        const twinkle = 0.5 + 0.5 * Math.sin(time * p.twinkleSpeed + p.twinklePhase);
        const currentAlpha = p.alpha * twinkle * (isLight ? particleAlphaMultiplier : 1.0);

        const px = p.x * canvas.width;
        const py = p.y * canvas.height;

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${currentAlpha})`;
        ctx.fill();

        // Small glow for larger particles
        if (p.r > 1.2) {
          const glow = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
          glow.addColorStop(0, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${currentAlpha * 0.3})`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.fillRect(px - p.r * 4, py - p.r * 4, p.r * 8, p.r * 8);
        }
      });

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = (particles[i].x - particles[j].x) * canvas.width;
          const dy = (particles[i].y - particles[j].y) * canvas.height;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.06 * gridAlphaMultiplier * connectionAlphaMultiplier;
            ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`;
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x * canvas.width, particles[i].y * canvas.height);
            ctx.lineTo(particles[j].x * canvas.width, particles[j].y * canvas.height);
            ctx.stroke();
          }
        }
      }

      // Vignette effect at edges - much softer in light mode
      const vignetteGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.9
      );
      vignetteGradient.addColorStop(0, 'transparent');
      vignetteGradient.addColorStop(1, isLight ? 'rgba(248, 250, 252, 0.6)' : 'rgba(5, 5, 16, 0.6)');
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      id="bg-canvas"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
