'use client';

import { Bell, Search, Sparkles, Mic, X, CheckCircle2, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { useCampusStore, fetchAPI, patchAPI } from '@/lib/store';
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { dashboardData, setChatOpen, setVoiceOpen, setDashboardData, bumpNotifVersion } = useCampusStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const unread = dashboardData?.notifications?.unread || 0;

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

  return (
    <header className="h-16 border-b border-white/[0.06] bg-white/[0.01] backdrop-blur-xl flex items-center justify-between px-6 relative z-30">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">
            {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">{dashboardData?.student?.name || 'Student'}</span>
          </h1>
          <p className="text-xs text-gray-500">
            {dashboardData?.student?.department} • Semester {dashboardData?.student?.semester}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className={`relative transition-all duration-300 ${searchFocused ? 'w-72' : 'w-48'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search CampusOS..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.06] transition-all"
          />
          {searchFocused && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-[#0a0a14]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl p-2 shadow-2xl">
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
          className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors group"
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
            className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
          >
            <Bell className={`w-4 h-4 transition-colors ${notifOpen ? 'text-purple-400' : 'text-gray-400'}`} />
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
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
                        <div key={i} className="h-14 bg-white/[0.03] rounded-xl animate-pulse" />
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-shadow relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Sparkles className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Ask AI</span>
        </motion.button>
      </div>
    </header>
  );
}
