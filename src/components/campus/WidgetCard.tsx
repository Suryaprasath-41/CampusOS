'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WidgetCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  risk?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export default function WidgetCard({ title, value, icon, subtitle, risk, trend, className, children, onClick }: WidgetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5",
        "hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300",
        "shadow-[0_0_30px_rgba(139,92,246,0.05)]",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className="p-2 rounded-xl bg-white/[0.05]">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
      {risk && (
        <div className={cn(
          "inline-block text-xs px-2 py-0.5 rounded-full mt-2 font-medium",
          risk === 'HIGH' && "bg-red-500/20 text-red-400",
          risk === 'MEDIUM' && "bg-yellow-500/20 text-yellow-400",
          risk === 'LOW' && "bg-green-500/20 text-green-400",
        )}>
          Risk: {risk}
        </div>
      )}
      {trend && (
        <span className={cn(
          "text-xs ml-2",
          trend === 'up' && "text-green-400",
          trend === 'down' && "text-red-400",
          trend === 'neutral' && "text-gray-400",
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
        <span className="text-gray-400 text-sm">{label}</span>
        <span className="text-white text-sm font-semibold">{value}%</span>
      </div>
      <div className="h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
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
  return (
    <div
      className={cn(
        "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6",
        "hover:border-white/[0.12] transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.h2
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-6", className)}
    >
      {children}
    </motion.h2>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    submitted: 'bg-green-500/20 text-green-400 border-green-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    applied: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    interview: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    open: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    closed: 'bg-green-500/20 text-green-400 border-green-500/30',
    borrowed: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    eligible: 'bg-green-500/20 text-green-400 border-green-500/30',
    not_eligible: 'bg-red-500/20 text-red-400 border-red-500/30',
    seeking: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    placed: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${map[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
}
