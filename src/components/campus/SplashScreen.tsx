'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useTheme } from 'next-themes';

interface SplashScreenProps {
  onComplete: () => void;
}

// Floating particles for the background
function SplashParticles({ isDark }: { isDark: boolean }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: isDark
              ? p.id % 3 === 0
                ? 'rgba(139, 92, 246, 0.3)'
                : p.id % 3 === 1
                ? 'rgba(6, 182, 212, 0.3)'
                : 'rgba(255, 255, 255, 0.15)'
              : p.id % 3 === 0
              ? 'rgba(124, 58, 237, 0.2)'
              : p.id % 3 === 1
              ? 'rgba(6, 182, 212, 0.2)'
              : 'rgba(124, 58, 237, 0.1)',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    // Animate progress bar over 3 seconds
    const startTime = Date.now();
    const duration = 3000;

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed < duration) {
        requestAnimationFrame(animateProgress);
      }
    };

    requestAnimationFrame(animateProgress);

    // Start fade out at 3.5 seconds
    const fadeOutTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3500);

    // Complete at 4 seconds (0.5s fade out)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: isDark
              ? '#050510'
              : 'linear-gradient(135deg, #f8fafc, #eef2ff, #f0fdfa, #faf5ff)',
          }}
        >
          {/* Subtle particles */}
          <SplashParticles isDark={isDark} />

          {/* Center content */}
          <div className="relative flex flex-col items-center z-10">
            {/* Logo - animated with spring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="relative mb-6"
            >
              {/* Outer glow ring */}
              <motion.div
                animate={{
                  boxShadow: isDark
                    ? [
                        '0 0 30px rgba(139,92,246,0.2), 0 0 60px rgba(6,182,212,0.1)',
                        '0 0 50px rgba(139,92,246,0.4), 0 0 80px rgba(6,182,212,0.2)',
                        '0 0 30px rgba(139,92,246,0.2), 0 0 60px rgba(6,182,212,0.1)',
                      ]
                    : [
                        '0 0 30px rgba(124,58,237,0.15), 0 0 60px rgba(6,182,212,0.08)',
                        '0 0 50px rgba(124,58,237,0.25), 0 0 80px rgba(6,182,212,0.15)',
                        '0 0 30px rgba(124,58,237,0.15), 0 0 60px rgba(6,182,212,0.08)',
                      ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center"
              >
                <Bot className="w-12 h-12 text-white" />
              </motion.div>

              {/* Decorative ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-3xl border border-purple-500/20"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-5 rounded-3xl border border-cyan-500/10"
              />
            </motion.div>

            {/* App Name - fade in after logo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <h1
                className={isDark
                  ? 'text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-white to-cyan-400'
                  : 'text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-[var(--text-primary)] to-cyan-600'
                }
                style={{ lineHeight: 1.2 }}
              >
                CampusOS
              </h1>
            </motion.div>

            {/* Version tag */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <span className={isDark
                ? 'text-purple-400 text-lg font-medium tracking-wider'
                : 'text-purple-600 text-lg font-medium tracking-wider'
              }>
                AI v2.0
              </span>
            </motion.div>

            {/* Separator */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="my-4 w-32 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"
            />

            {/* Credits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="text-center"
            >
              <p className="text-[var(--text-muted)] text-sm font-light tracking-wide">
                Made by <span className="text-[var(--text-secondary)] font-medium">Jai Samyukth Enterprises</span>
              </p>
            </motion.div>
          </div>

          {/* Progress bar at bottom */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="h-1 rounded-full bg-[var(--bg-card)] overflow-hidden"
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-center text-[10px] text-[var(--text-muted)] mt-2 tracking-widest uppercase"
            >
              Loading CampusOS
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
