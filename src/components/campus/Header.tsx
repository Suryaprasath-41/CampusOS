'use client';

import { Bell, Search, Sparkles, Mic, X, CheckCircle2, AlertTriangle, Info, CheckCheck, GraduationCap, BookOpen, Shield } from 'lucide-react';
import { useCampusStore, fetchAPI, patchAPI } from '@/lib/store';
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Role = 'student' | 'faculty' | 'admin';

const roleConfig: Record<Role, { label: string; icon: React.ComponentType<{ className?: string }>; gradient: string; glow: string; color: string }> = {
  student: { label: 'Student', icon: GraduationCap, gradient: 'from-purple-500 to-violet-600', glow: 'rgba(139,92,246,0.4)', color: 'purple' },
  faculty: { label: 'Faculty', icon: BookOpen, gradient: 'from-cyan-500 to-blue-600', glow: 'rgba(6,182,212,0.4)', color: 'cyan' },
  admin: { label: 'Admin', icon: Shield, gradient: 'from-amber-500 to-orange-600', glow: 'rgba(245,158,11,0.4)', color: 'amber' },
};

function RoleSwitcher() {
  const { activeRole, setActiveRole } = useCampusStore();

  return (
    <div className="relative flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
      {/* Animated background indicator */}
      <motion.div
        layout
        layoutId="role-indicator"
        className={cn(
          "absolute top-1 bottom-1 rounded-lg",
          activeRole === 'student' && "bg-purple-500/20 border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]",
          activeRole === 'faculty' && "bg-cyan-500/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
          activeRole === 'admin' && "bg-amber-500/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
        )}
        style={{
          left: `${['student', 'faculty', 'admin'].indexOf(activeRole) * 33.33 + 4}%`,
          width: '29%',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
      {(['student', 'faculty', 'admin'] as Role[]).map((role) => {
        const config = roleConfig[role];
        const isActive = activeRole === role;
        return (
          <motion.button
            key={role}
            onClick={() => setActiveRole(role)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-300",
              isActive
                ? cn(
                    activeRole === 'student' && "text-purple-400",
                    activeRole === 'faculty' && "text-cyan-400",
                    activeRole === 'admin' && "text-amber-400",
                  )
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            <config.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{config.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export default function Header() {
  const { dashboardData, setChatOpen, setVoiceOpen, setDashboardData, bumpNotifVersion, activeRole } = useCampusStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(0);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const unread = dashboardData?.notifications?.unread || 0;

  // Track unread changes for badge bounce via key trick
  const badgeBounceKey = useMemo(() => {
    if (unread > 0 && unread !== prevUnreadRef.current) {
      prevUnreadRef.current = unread;
      return `badge-${unread}-${Date.now()}`;
    }
    return `badge-${unread}`;
  }, [unread]);

  const roleLabel = useMemo(() => {
    if (activeRole === 'faculty') return 'Dr. Meera';
    if (activeRole === 'admin') return 'Admin';
    return dashboardData?.student?.name || 'Student';
  }, [activeRole, dashboardData]);

  const roleSubtext = useMemo(() => {
    if (activeRole === 'faculty') return 'Computer Science • Associate Professor';
    if (activeRole === 'admin') return 'System Administrator';
    return `${dashboardData?.student?.department} • Semester ${dashboardData?.student?.semester}`;
  }, [activeRole, dashboardData]);

  const loadNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const data = await fetchAPI('/notifications');
      setNotifications(data.notifications || []);
    } catch (e) { /* ignore */ }
    setLoadingNotifs(false);
  };

  const markAllRead = async () => {
    setMarkingRead(true);
    try {
      await patchAPI('/notifications', { markAllRead: true });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          notifications: { unread: 0 },
        });
      }
      bumpNotifVersion();
    } catch (e) { /* ignore */ }
    setMarkingRead(false);
  };

  const markOneRead = async (id: string) => {
    try {
      await patchAPI('/notifications', { id });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      const newUnread = Math.max(0, (dashboardData?.notifications?.unread || 0) - 1);
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          notifications: { unread: newUnread },
        });
      }
      bumpNotifVersion();
    } catch (e) { /* ignore */ }
  };

  const handleNotifToggle = () => {
    const newState = !notifOpen;
    setNotifOpen(newState);
    if (newState && notifications.length === 0) {
      loadNotifications();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: string) => {
    if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    if (type === 'success') return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    return <Info className="w-4 h-4 text-blue-400" />;
  };

  const roleColorClass = activeRole === 'faculty' ? 'from-cyan-400 to-blue-400' : activeRole === 'admin' ? 'from-amber-400 to-orange-400' : 'from-purple-400 to-cyan-400';

  return (
    <header className="relative z-30">
      {/* Subtle bottom border gradient */}
      <div className="h-16 bg-white/[0.01] backdrop-blur-2xl flex items-center justify-between px-4 sm:px-6 relative">
        {/* Gradient bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        {/* Secondary glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-sm" />

        <div className="flex items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white">
              {greeting}, <span className={cn("bg-clip-text text-transparent bg-gradient-to-r", roleColorClass)}>{roleLabel}</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] sm:text-xs text-gray-500">{roleSubtext}</p>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1",
                activeRole === 'student' && "bg-purple-500/10 text-purple-400 border-purple-500/20",
                activeRole === 'faculty' && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                activeRole === 'admin' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
              )}>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full animate-pulse",
                  activeRole === 'student' && "bg-purple-500",
                  activeRole === 'faculty' && "bg-cyan-500",
                  activeRole === 'admin' && "bg-amber-500",
                )} />
                {roleConfig[activeRole].label} Portal
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Switcher */}
          <RoleSwitcher />

          {/* Search with pulsing gradient border on focus */}
          <div className={`relative transition-all duration-300 hidden sm:block ${searchFocused ? 'w-72' : 'w-48'}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
            {/* Pulsing gradient border wrapper */}
            <div className={cn(
              "absolute inset-0 rounded-xl transition-opacity duration-300",
              searchFocused ? "opacity-100" : "opacity-0",
              "bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-purple-500/30 animate-gradient blur-[1px]"
            )} />
            <input
              type="text"
              placeholder="Search CampusOS..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "relative w-full bg-white/[0.04] border rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-600 transition-all duration-300",
                searchFocused
                  ? "border-purple-500/40 bg-white/[0.06] shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                  : "border-white/[0.08]"
              )}
            />
            {searchFocused && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-[#0a0a14]/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl p-2 shadow-2xl z-50">
                <div className="text-[10px] text-gray-600 uppercase px-2 py-1">Quick Search</div>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-white/[0.05] rounded-lg flex items-center gap-2">
                  <Search className="w-3 h-3" /> My attendance this week
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-white/[0.05] rounded-lg flex items-center gap-2">
                  <Search className="w-3 h-3" /> Pending assignments
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-white/[0.05] rounded-lg flex items-center gap-2">
                  <Search className="w-3 h-3" /> Library books available
                </button>
              </div>
            )}
          </div>

          {/* Voice Assistant */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVoiceOpen(true)}
            className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-cyan-500/20 transition-all group"
            title="Voice Assistant"
          >
            <Mic className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            <span className="absolute inset-0 rounded-xl border border-cyan-500/0 group-hover:border-cyan-500/30 animate-pulse" />
          </motion.button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNotifToggle()}
              className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-purple-500/20 transition-all"
            >
              <Bell className={`w-4 h-4 transition-colors ${notifOpen ? 'text-purple-400' : 'text-gray-400'}`} />
              {unread > 0 && (
                <motion.span
                  key={badgeBounceKey}
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-purple-500 to-rose-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-[#0a0a14]"
                >
                  {unread}
                </motion.span>
              )}
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              )}
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-[#0a0a14]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between p-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      {unread > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">
                          {unread} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={markAllRead}
                      disabled={markingRead || unread === 0}
                      className="text-[10px] text-gray-500 hover:text-purple-400 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCheck className={`w-3 h-3 ${markingRead ? 'animate-pulse' : ''}`} /> {markingRead ? 'Marking...' : 'Mark all read'}
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifs ? (
                      <div className="p-4 space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-14 shimmer-loading rounded-xl" />
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n, i) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => !n.read && markOneRead(n.id)}
                          className={`flex items-start gap-3 p-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03] ${!n.read ? 'bg-purple-500/[0.02] cursor-pointer' : ''}`}
                        >
                          <div className="p-1.5 rounded-lg bg-white/[0.04] shrink-0 mt-0.5">
                            {getNotifIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium">{n.title}</div>
                            <div className="text-xs text-gray-500 line-clamp-2">{n.message}</div>
                            <div className="text-[10px] text-gray-600 mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0 animate-pulse" />}
                        </motion.div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-white/[0.06] bg-white/[0.02]">
                    <button className="w-full text-center text-xs text-purple-400 hover:text-purple-300 py-1.5">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AI Chat Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChatOpen(true)}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-shadow relative overflow-hidden group",
              activeRole === 'faculty'
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                : activeRole === 'admin'
                ? "bg-gradient-to-r from-amber-600 to-orange-600 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                : "bg-gradient-to-r from-purple-600 to-violet-600 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
            )}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Sparkles className="w-4 h-4 relative z-10" />
            <span className="relative z-10 hidden sm:inline">Ask AI</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
