'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Eye, EyeOff, Loader2, Sparkles, Shield, GraduationCap, BookOpen } from 'lucide-react';
import { useCampusStore } from '@/lib/store';

function LoginBackground({ isDark }: { isDark: boolean }) {
  useEffect(() => {
    if (!isDark) return;

    const canvas = document.getElementById('login-canvas') as HTMLCanvasElement;
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
      { x: 0.3, y: 0.4, r: 400, color: [139, 92, 246], baseAlpha: 0.12, speed: 0.8, pulseSpeed: 0.5 },
      { x: 0.7, y: 0.5, r: 350, color: [6, 182, 212], baseAlpha: 0.10, speed: 0.6, pulseSpeed: 0.7 },
      { x: 0.5, y: 0.7, r: 300, color: [168, 85, 247], baseAlpha: 0.08, speed: 1.0, pulseSpeed: 0.4 },
      { x: 0.2, y: 0.8, r: 250, color: [236, 72, 153], baseAlpha: 0.07, speed: 0.9, pulseSpeed: 0.6 },
      { x: 0.8, y: 0.3, r: 280, color: [6, 182, 212], baseAlpha: 0.09, speed: 0.7, pulseSpeed: 0.8 },
    ];

    interface Particle {
      x: number; y: number; r: number; speed: number; drift: number;
      alpha: number; color: [number, number, number]; twinkleSpeed: number; twinklePhase: number;
    }

    const particleColors: [number, number, number][] = [
      [255, 255, 255], [139, 92, 246], [6, 182, 212], [168, 85, 247],
    ];

    const particles: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 2 + 0.3,
        speed: Math.random() * 0.0004 + 0.0001,
        drift: Math.random() * 0.0005 - 0.00025,
        alpha: Math.random() * 0.5 + 0.05,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        twinkleSpeed: Math.random() * 2 + 1,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bg.addColorStop(0, '#050510');
      bg.addColorStop(0.5, '#0a0a1a');
      bg.addColorStop(1, '#050510');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw orbs
      orbs.forEach((orb, i) => {
        const x = (orb.x + Math.sin(time * orb.speed + i * 1.5) * 0.1) * canvas.width;
        const y = (orb.y + Math.cos(time * orb.speed + i * 2) * 0.08) * canvas.height;
        const pulseAlpha = orb.baseAlpha + Math.sin(time * orb.pulseSpeed + i) * 0.03;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.r);
        gradient.addColorStop(0, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, ${pulseAlpha})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Draw particles
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift + Math.sin(time * 2 + p.x * 10) * 0.0001;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;

        const twinkle = 0.5 + 0.5 * Math.sin(time * p.twinkleSpeed + p.twinklePhase);
        const currentAlpha = p.alpha * twinkle;
        const px = p.x * canvas.width;
        const py = p.y * canvas.height;

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${currentAlpha})`;
        ctx.fill();

        if (p.r > 1.2) {
          const glow = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
          glow.addColorStop(0, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${currentAlpha * 0.3})`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.fillRect(px - p.r * 4, py - p.r * 4, p.r * 8, p.r * 8);
        }
      });

      // Connecting lines
      const CONNECTION_DIST = 150;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = (particles[i].x - particles[j].x) * canvas.width;
          const dy = (particles[i].y - particles[j].y) * canvas.height;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.08;
            ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`;
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x * canvas.width, particles[i].y * canvas.height);
            ctx.lineTo(particles[j].x * canvas.width, particles[j].y * canvas.height);
            ctx.stroke();
          }
        }
      }

      // Vignette
      const vignetteGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.2,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.9
      );
      vignetteGradient.addColorStop(0, 'transparent');
      vignetteGradient.addColorStop(1, 'rgba(5, 5, 16, 0.7)');
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isDark]);

  if (!isDark) {
    // Light mode: use a clean CSS gradient background instead of canvas
    return (
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 30%, #f0fdfa 60%, #faf5ff 100%)',
        }}
      />
    );
  }

  return (
    <canvas
      id="login-canvas"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { setIsAuthenticated, setCurrentUser, setActiveRole } = useCampusStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }

      // Store token in cookie for session persistence
      document.cookie = `campusos-token=${data.token}; path=/; max-age=86400; samesite=lax`;

      // Set user info in store
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
        });
        setActiveRole(data.user.role as 'student' | 'faculty' | 'admin');
      }

      setIsAuthenticated(true);
      router.push('/');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      <LoginBackground isDark={isDark} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Main Card */}
        <div className="relative">
          {/* Outer glow */}
          <div className={`absolute -inset-1 rounded-3xl blur-xl ${
            isDark
              ? 'bg-gradient-to-r from-purple-600/20 via-cyan-600/20 to-purple-600/20'
              : 'bg-gradient-to-r from-purple-400/15 via-cyan-400/15 to-purple-400/15'
          }`} />

          {/* Card */}
          <div className={`relative backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl ${
            isDark
              ? 'bg-white/[0.03] border border-white/[0.08]'
              : 'bg-white/80 border border-[var(--border-color)]'
          }`}>
            {/* Animated gradient border effect - dark mode only */}
            {isDark && (
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent, rgba(139,92,246,0.15), transparent, rgba(6,182,212,0.15), transparent)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-[1px] rounded-3xl bg-[#0a0a1a]/95" />
              </div>
            )}

            {/* Light mode: subtle inner gradient border */}
            {!isDark && (
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent, rgba(124,58,237,0.08), transparent, rgba(6,182,212,0.08), transparent)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-[1px] rounded-3xl bg-white/95" />
              </div>
            )}

            <div className="relative z-10">
              {/* Logo Section */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center mb-8"
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl border mb-4 relative ${
                    isDark
                      ? 'bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border-purple-500/20'
                      : 'bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-purple-400/20'
                  }`}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(139,92,246,0.3)',
                        '0 0 40px rgba(6,182,212,0.3)',
                        '0 0 20px rgba(139,92,246,0.3)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl"
                  />
                  <Bot className={`w-10 h-10 relative z-10 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </motion.div>

                <motion.h1
                  className="text-3xl font-bold mb-1"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  style={{
                    background: 'linear-gradient(135deg, #a78bfa, #06b6d4, #a78bfa)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  CampusOS AI
                </motion.h1>
                <p className="text-[var(--text-muted)] text-sm">The AI-Native Campus Operating System</p>
                <p className="text-[var(--text-muted)] text-xs mt-1">Made by Jai Samyukth Enterprises</p>
              </motion.div>

              {/* Role badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-3 mb-8"
              >
                {[
                  { icon: GraduationCap, label: 'Student', color: 'purple' },
                  { icon: BookOpen, label: 'Faculty', color: 'cyan' },
                  { icon: Shield, label: 'Admin', color: 'amber' },
                ].map((role, i) => (
                  <motion.div
                    key={role.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${
                      role.color === 'purple'
                        ? isDark
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                          : 'bg-purple-50 border-purple-200 text-purple-600'
                        : role.color === 'cyan'
                          ? isDark
                            ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                            : 'bg-cyan-50 border-cyan-200 text-cyan-600'
                          : isDark
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-amber-50 border-amber-200 text-amber-600'
                    }`}
                  >
                    <role.icon className="w-3 h-3" />
                    {role.label}
                  </motion.div>
                ))}
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
                        isDark
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                          : 'bg-red-50 border border-red-200 text-red-600'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className={`block text-xs font-medium mb-2 uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-[var(--text-secondary)]'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@JSE.com"
                      required
                      className={`relative w-full rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-purple-500/40 transition-all duration-300 ${
                        isDark
                          ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:bg-white/[0.06]'
                          : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:bg-white focus:border-purple-400/50'
                      }`}
                    />
                  </div>
                </motion.div>

                {/* Password Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className={`block text-xs font-medium mb-2 uppercase tracking-wider ${
                    isDark ? 'text-gray-400' : 'text-[var(--text-secondary)]'
                  }`}>
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className={`relative w-full rounded-xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-purple-500/40 transition-all duration-300 ${
                        isDark
                          ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:bg-white/[0.06]'
                          : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:bg-white focus:border-purple-400/50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors z-10 ${
                        isDark
                          ? 'text-gray-500 hover:text-gray-300'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full py-3.5 rounded-xl font-semibold text-white text-sm overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-600 transition-all duration-300" />

                    {/* Hover shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                    {/* Pulse glow */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(139,92,246,0.3)',
                          '0 0 40px rgba(6,182,212,0.3)',
                          '0 0 20px rgba(139,92,246,0.3)',
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />

                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Sign In to CampusOS
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              </form>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="mt-8 pt-6 border-t border-[var(--border-color)] text-center"
              >
                <p className="text-[var(--text-muted)] text-xs">
                  Secure authentication powered by CampusOS AI v2.0
                </p>
                <p className="text-[var(--text-muted)] text-[10px] mt-1">
                  &copy; 2025 Jai Samyukth Enterprises. All rights reserved.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
