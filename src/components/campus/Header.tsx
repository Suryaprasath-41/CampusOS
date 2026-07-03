'use client';

import { Bell, Search, Sparkles } from 'lucide-react';
import { useCampusStore, fetchAPI } from '@/lib/store';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  const { dashboardData, setChatOpen } = useCampusStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const unread = dashboardData?.notifications?.unread || 0;

  return (
    <header className="h-16 border-b border-white/[0.06] bg-white/[0.01] backdrop-blur-xl flex items-center justify-between px-6 relative z-10">
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
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
          <Bell className="w-4 h-4 text-gray-400" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </button>

        {/* AI Chat Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-shadow"
        >
          <Sparkles className="w-4 h-4" />
          Ask AI
        </motion.button>
      </div>
    </header>
  );
}
