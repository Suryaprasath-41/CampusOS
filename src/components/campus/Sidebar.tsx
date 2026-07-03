'use client';

import { useCampusStore } from '@/lib/store';
import {
  LayoutDashboard, TrendingUp, Target, BookOpen, GraduationCap,
  Home, Wallet, CalendarDays, Shield, ChevronLeft, ChevronRight,
  Bot, Sparkles, Workflow, Brain, User, FileText, Command, Settings, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'ACADEMIC',
    items: [
      { id: 'attendance', label: 'Attendance', icon: TrendingUp },
      { id: 'placement', label: 'Placement', icon: Target },
      { id: 'library', label: 'Library', icon: BookOpen },
      { id: 'academic', label: 'Academic', icon: GraduationCap },
      { id: 'exams', label: 'Exams', icon: FileText },
    ],
  },
  {
    label: 'CAMPUS',
    items: [
      { id: 'hostel', label: 'Hostel', icon: Home },
      { id: 'finance', label: 'Finance', icon: Wallet },
      { id: 'events', label: 'Events', icon: CalendarDays },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'workflow', label: 'Workflows', icon: Workflow },
      { id: 'faculty', label: 'Faculty AI', icon: Brain },
      { id: 'admin', label: 'Admin', icon: Shield, badge: 'ADMIN' },
      { id: 'ai-memory', label: 'AI Memory', icon: Database },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

// Keep profile out of groups, it's at the bottom
const profileItem = { id: 'profile', label: 'Profile', icon: User };

export default function Sidebar() {
  const { activeSection, setActiveSection, sidebarOpen, setSidebarOpen, setCommandPaletteOpen } = useCampusStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 220 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-white/[0.02] backdrop-blur-xl border-r border-white/[0.06] flex flex-col relative z-10 shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="text-sm font-bold text-white">CampusOS</div>
              <div className="text-[10px] text-purple-400 -mt-0.5">AI v2.0</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation with Groups */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && "mt-2")}>
            {/* Gradient Divider between groups */}
            {gi > 0 && (
              <div className="mx-3 mb-2 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            )}
            {/* Group Label */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-1"
                >
                  <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.15em]">
                    {group.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Group Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative group/item",
                      isActive
                        ? "bg-purple-500/15 text-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
                    )}
                  >
                    {/* Hover trail effect */}
                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/[0.04] via-transparent to-transparent" />
                    <item.icon className={cn("w-5 h-5 shrink-0 relative z-10", isActive && "text-purple-400")} />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="whitespace-nowrap overflow-hidden relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {/* ADMIN badge */}
                    {item.badge && sidebarOpen && (
                      <span className="ml-auto relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                    {isActive && sidebarOpen && !item.badge && (
                      <Sparkles className="w-3 h-3 text-purple-400 ml-auto relative z-10" />
                    )}
                    {/* Active item glow indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-purple-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Profile item - standalone */}
        <div className="mt-2">
          <div className="mx-3 mb-2 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          <motion.button
            onClick={() => setActiveSection(profileItem.id)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative group/item",
              activeSection === profileItem.id
                ? "bg-purple-500/15 text-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
            )}
          >
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/[0.04] via-transparent to-transparent" />
            <profileItem.icon className={cn("w-5 h-5 shrink-0 relative z-10", activeSection === profileItem.id && "text-purple-400")} />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap overflow-hidden relative z-10"
                >
                  {profileItem.label}
                </motion.span>
              )}
            </AnimatePresence>
            {activeSection === profileItem.id && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-purple-400 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
            )}
          </motion.button>
        </div>
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white/[0.08] border border-white/[0.1] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.15] transition-colors z-20"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {/* Bottom */}
      <div className="p-3 border-t border-white/[0.06] space-y-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-colors group"
        >
          <Command className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap"
              >
                <span className="text-xs text-gray-500 group-hover:text-gray-300">Quick Search</span>
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-gray-400 font-mono">⌘K</kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <div className="flex items-center gap-2 px-2">
          <button
            onClick={() => setActiveSection('profile')}
            className="flex items-center gap-2 w-full hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.4)]">
              S
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden whitespace-nowrap text-left"
                >
                  <div className="text-xs font-medium text-white">Sam Kumar</div>
                  <div className="text-[10px] text-gray-500">CS2022001</div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
