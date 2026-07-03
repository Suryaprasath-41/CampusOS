'use client';

import { useCampusStore } from '@/lib/store';
import {
  LayoutDashboard, TrendingUp, Target, BookOpen, GraduationCap,
  Home, Wallet, CalendarDays, Shield, ChevronLeft, ChevronRight,
  Bot, Sparkles, Workflow, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'attendance', label: 'Attendance', icon: TrendingUp },
  { id: 'placement', label: 'Placement', icon: Target },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'hostel', label: 'Hostel', icon: Home },
  { id: 'finance', label: 'Finance', icon: Wallet },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'workflow', label: 'Workflows', icon: Workflow },
  { id: 'faculty', label: 'Faculty AI', icon: Brain },
  { id: 'admin', label: 'Admin', icon: Shield },
];

export default function Sidebar() {
  const { activeSection, setActiveSection, sidebarOpen, setSidebarOpen } = useCampusStore();

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

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                isActive
                  ? "bg-purple-500/15 text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-purple-400")} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && sidebarOpen && (
                <Sparkles className="w-3 h-3 text-purple-400 ml-auto" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white/[0.08] border border-white/[0.1] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.15] transition-colors z-20"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {/* Bottom */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            S
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="text-xs font-medium text-white">Sam Kumar</div>
                <div className="text-[10px] text-gray-500">CS2022001</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
