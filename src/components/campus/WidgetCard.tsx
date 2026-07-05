'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface WidgetCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  subtitle?: string;
  risk?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export default function WidgetCard({ title, value, icon, subtitle, risk, trend, className, children, onClick }: WidgetCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  // Use key-based re-render for value pulse animation instead of setState in effect
  const valueKey = `${value}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        "relative bg-[var(--glass-bg)] backdrop-blur-xl border rounded-2xl p-5",
        "transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        borderColor: isHovered ? 'var(--accent-purple)' : 'var(--glass-border)',
        background: isHovered ? 'var(--border-hover)' : 'var(--glass-bg)',
        boxShadow: isHovered
          ? 'var(--shadow-lg), 0 0 0 1px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
          : 'var(--shadow-sm)',
      }}
    >
      {/* Gradient border on hover - top edge */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          exit={{ opacity: 0, scaleX: 0 }}
          className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
        />
      )}

      <div className="flex justify-between items-start mb-3">
        <span className="text-[var(--text-secondary)] text-sm font-medium">{title}</span>
        <div className={cn(
          "p-2 rounded-xl bg-[var(--bg-card)] transition-all duration-300",
          isHovered && "bg-purple-500/10 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
        )}>{icon}</div>
      </div>
      <motion.div
        key={valueKey}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-3xl font-bold text-[var(--text-primary)] mb-1"
      >
        {value}
      </motion.div>
      {subtitle && <p className="text-[var(--text-muted)] text-xs">{subtitle}</p>}
      {risk && (
        <div className={cn(
          "inline-block text-xs px-2 py-0.5 rounded-full mt-2 font-medium",
          risk === 'HIGH' && "bg-red-500/20 text-red-600 dark:text-red-400",
          risk === 'MEDIUM' && "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
          risk === 'LOW' && "bg-green-500/20 text-green-600 dark:text-green-400",
        )}>
          Risk: {risk}
        </div>
      )}
      {trend && (
        <span className={cn(
          "text-xs ml-2",
          trend === 'up' && "text-green-600 dark:text-green-400",
          trend === 'down' && "text-red-600 dark:text-red-400",
          trend === 'neutral' && "text-[var(--text-muted)]",
        )}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
        </span>
      )}
      {children}
    </motion.div>
  );
}

interface PredictionBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  className?: string;
}

export function PredictionBar({ label, value, max = 100, color = 'purple', className }: PredictionBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  const colorMap: Record<string, string> = {
    purple: 'from-purple-500 to-violet-600',
    cyan: 'from-cyan-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    red: 'from-red-500 to-rose-600',
    yellow: 'from-yellow-500 to-amber-600',
    orange: 'from-orange-500 to-red-600',
  };

  return (
    <div className={cn("mb-4", className)}>
      <div className="flex justify-between mb-1.5">
        <span className="text-[var(--text-secondary)] text-sm">{label}</span>
        <span className="text-[var(--text-primary)] text-sm font-semibold">{value}%</span>
      </div>
      <div className="h-2.5 bg-[var(--glass-bg)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            colorMap[color] || colorMap.purple,
            "shadow-[0_0_10px_rgba(139,92,246,0.4)]"
          )}
        />
      </div>
    </div>
  );
}

export function GlassCard({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative bg-[var(--glass-bg)] backdrop-blur-xl border rounded-2xl p-6",
        "transition-all duration-300 card-lift glass-hover",
        isHovered ? "border-purple-500/20" : "border-[var(--glass-border)]",
        className
      )}
      style={{
        boxShadow: isHovered
          ? 'var(--shadow-lg), 0 0 0 1px rgba(139, 92, 246, 0.08)'
          : 'var(--shadow-sm)',
      }}
      {...props}
    >
      {/* Gradient top-edge highlight on hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"
        />
      )}
      {children}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-6"
    >
      <h2
        className={cn(
          "text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] via-purple-500/80 to-[var(--text-muted)]",
          className
        )}
      >
        {children}
      </h2>
      {/* Decorative underline accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        className="h-0.5 mt-2 bg-gradient-to-r from-purple-500/50 via-cyan-500/30 to-transparent rounded-full origin-left"
        style={{ maxWidth: '120px' }}
      />
    </motion.div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    HIGH: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    LOW: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    submitted: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
    approved: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
    applied: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    interview: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
    open: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    in_progress: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    closed: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
    borrowed: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30',
    eligible: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
    not_eligible: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
    seeking: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    placed: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
  };

  return (
    <span className={`badge-shimmer inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${map[status] || 'bg-gray-500/20 text-[var(--text-muted)] border-gray-500/30'}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
}
