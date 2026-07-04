'use client';

import { useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCampusStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  timestamp: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastConfig: Record<ToastType, { icon: React.ReactNode; color: string; borderColor: string; bg: string; progressColor: string }> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    color: 'text-green-400',
    borderColor: 'border-green-500/30',
    bg: 'from-green-500/10 to-green-500/5',
    progressColor: 'bg-green-500',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    bg: 'from-yellow-500/10 to-yellow-500/5',
    progressColor: 'bg-yellow-500',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-400" />,
    color: 'text-red-400',
    borderColor: 'border-red-500/30',
    bg: 'from-red-500/10 to-red-500/5',
    progressColor: 'bg-red-500',
  },
  info: {
    icon: <Info className="w-5 h-5 text-purple-400" />,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bg: 'from-purple-500/10 to-purple-500/5',
    progressColor: 'bg-purple-500',
  },
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const config = toastConfig[item.type];

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(item.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  const timeAgo = getTimeAgo(item.timestamp);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        "w-80 bg-[#0a0a14]/90 backdrop-blur-2xl border rounded-2xl overflow-hidden",
        "shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]",
        config.borderColor
      )}
    >
      <div className={cn("p-4 bg-gradient-to-br", config.bg)}>
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
              <button
                onClick={() => onDismiss(item.id)}
                className="shrink-0 p-0.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.message}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-gray-600">{timeAgo}</span>
              {item.action && (
                <button
                  onClick={item.action.onClick}
                  className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-lg transition-colors",
                    "hover:bg-white/10",
                    config.color
                  )}
                >
                  {item.action.label}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* CSS-driven progress bar for auto-dismiss */}
      <div className="h-0.5 bg-white/[0.03]">
        <div
          className={cn("h-full", config.progressColor, "animate-toast-progress")}
          style={{ opacity: 0.6 }}
        />
      </div>
    </motion.div>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 1000) return 'Just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

// Simulated notification messages
const simulatedNotifications: Omit<ToastItem, 'id' | 'timestamp'>[] = [
  { type: 'success', title: 'Assignment Submitted', message: 'Your Machine Learning assignment has been submitted successfully.', action: { label: 'View', onClick: () => {} } },
  { type: 'info', title: 'AI Insight Available', message: 'New AI prediction for your attendance pattern is ready.', action: { label: 'View', onClick: () => {} } },
  { type: 'warning', title: 'Low Attendance Alert', message: 'Your Probability & Statistics attendance dropped below 75%.', action: { label: 'Details', onClick: () => {} } },
  { type: 'success', title: 'Complaint Resolved', message: 'Your hostel WiFi complaint has been resolved by the admin.', action: { label: 'View', onClick: () => {} } },
  { type: 'info', title: 'New Event Posted', message: 'Tech Fest 2025 registration is now open. Don\'t miss out!', action: { label: 'Register', onClick: () => {} } },
  { type: 'error', title: 'Fee Payment Overdue', message: 'Your semester fee payment is overdue by 5 days. Please pay immediately.', action: { label: 'Pay Now', onClick: () => {} } },
  { type: 'success', title: 'Book Returned', message: 'Your library book "Data Structures" has been returned successfully.' },
  { type: 'info', title: 'Schedule Updated', message: 'Tomorrow\'s Deep Learning class has been moved to Room 204.', action: { label: 'View', onClick: () => {} } },
  { type: 'warning', title: 'Placement Deadline', message: 'Last date to register for TCS placement drive is tomorrow.', action: { label: 'Register', onClick: () => {} } },
  { type: 'success', title: 'Grade Published', message: 'Your Operating Systems midterm grades have been published.', action: { label: 'View', onClick: () => {} } },
  { type: 'info', title: 'AI Memory Updated', message: 'Your learning preferences have been updated based on recent activity.' },
  { type: 'warning', title: 'Library Book Due', message: '"Algorithm Design Manual" is due tomorrow. Please return or renew.', action: { label: 'Renew', onClick: () => {} } },
];

export default function NotificationToast() {
  const { toasts, addToast, removeToast } = useCampusStore();
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulated real-time notifications
  useEffect(() => {
    // Fire first notification after 5 seconds
    const initialTimeout = setTimeout(() => {
      const notif = simulatedNotifications[Math.floor(Math.random() * simulatedNotifications.length)];
      addToast({
        ...notif,
        id: `toast-${Date.now()}`,
        timestamp: Date.now(),
      });
    }, 5000);

    // Then fire periodically every 15-20 seconds
    const startInterval = () => {
      const delay = 15000 + Math.random() * 5000;
      intervalRef.current = setTimeout(() => {
        const notif = simulatedNotifications[Math.floor(Math.random() * simulatedNotifications.length)];
        addToast({
          ...notif,
          id: `toast-${Date.now()}`,
          timestamp: Date.now(),
        });
        startInterval(); // Schedule next with random delay
      }, delay);
    };
    startInterval();

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [addToast]);

  const handleDismiss = useCallback((id: string) => {
    removeToast(id);
  }, [removeToast]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastCard item={item} onDismiss={handleDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
