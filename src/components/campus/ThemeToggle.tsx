'use client';

import { useTheme } from 'next-themes';
import { useCampusStore } from '@/lib/store';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function ThemeToggle() {
  const { theme, setTheme: setNextTheme } = useTheme();
  const { setTheme: setStoreTheme } = useCampusStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  if (!mounted) {
    // Return placeholder to avoid layout shift
    return (
      <div className="w-9 h-9 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]" />
    );
  }

  const isDark = theme === 'dark';

  const handleToggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setNextTheme(newTheme);
    setStoreTheme(newTheme as 'light' | 'dark');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      className={cn(
        "relative p-2.5 rounded-xl border transition-all duration-300 group",
        "bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "hover:bg-[var(--border-hover)] hover:border-purple-500/30",
        "hover:shadow-[0_0_16px_rgba(139,92,246,0.1)]"
      )}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Sun className="w-4 h-4 text-amber-400 group-hover:text-yellow-300 transition-colors" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <Moon className="w-4 h-4 text-slate-500 group-hover:text-purple-500 transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
