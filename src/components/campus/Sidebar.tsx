'use client';

import { useCampusStore } from '@/lib/store';
import {
  LayoutDashboard, TrendingUp, Target, BookOpen, GraduationCap,
  Home, Wallet, CalendarDays, Shield, ChevronLeft, ChevronRight,
  Bot, Sparkles, Workflow, Brain, User, FileText, Command, Settings, Database,
  ClipboardCheck, FlaskConical, Users, AlertTriangle, Bell, Search,
  BookMarked, Cpu, Layers
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

// ─── Student Navigation ──────────────────────────────────────────────
const studentNavGroups: NavGroup[] = [
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
      { id: 'faculty-portal', label: 'Faculty Portal', icon: GraduationCap, badge: 'NEW' },
      { id: 'admin', label: 'Admin', icon: Shield, badge: 'ADMIN' },
      { id: 'ai-memory', label: 'AI Memory', icon: Database },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

// ─── Faculty Navigation ──────────────────────────────────────────────
const facultyNavGroups: NavGroup[] = [
  {
    label: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'TEACHING',
    items: [
      { id: 'faculty-classes', label: 'My Classes', icon: BookMarked },
      { id: 'faculty-attendance', label: 'Attendance', icon: ClipboardCheck },
      { id: 'faculty-assignments', label: 'Assignments', icon: FileText },
    ],
  },
  {
    label: 'RESEARCH',
    items: [
      { id: 'faculty-research', label: 'Research', icon: FlaskConical },
      { id: 'faculty-schedule', label: 'Schedule', icon: CalendarDays },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'faculty-ai-assistant', label: 'AI Assistant', icon: Bot },
      { id: 'faculty-settings', label: 'Settings', icon: Settings },
      { id: 'profile', label: 'Profile', icon: User },
    ],
  },
];

// ─── Admin Navigation ────────────────────────────────────────────────
const adminNavGroups: NavGroup[] = [
  {
    label: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { id: 'admin-students', label: 'Students', icon: Users },
      { id: 'admin-faculty', label: 'Faculty', icon: GraduationCap },
      { id: 'admin-courses', label: 'Courses', icon: BookOpen },
      { id: 'admin-complaints', label: 'Complaints', icon: AlertTriangle },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { id: 'admin-notifications', label: 'Notifications', icon: Bell },
      { id: 'admin-ai-playground', label: 'AI Playground', icon: Cpu },
      { id: 'admin-search', label: 'Search', icon: Search },
      { id: 'admin-knowledge', label: 'Knowledge Base', icon: Database },
      { id: 'admin-automations', label: 'Automations', icon: Layers },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

// Profile item for student only
const profileItem = { id: 'profile', label: 'Profile', icon: User };

export default function Sidebar() {
  const { activeSection, setActiveSection, sidebarOpen, setSidebarOpen, setCommandPaletteOpen, activeRole } = useCampusStore();

  const navGroups = activeRole === 'admin' ? adminNavGroups : activeRole === 'faculty' ? facultyNavGroups : studentNavGroups;

  // For faculty/admin roles, the sidebar click should route to the appropriate portal section
  const handleNavClick = (itemId: string) => {
    if (activeRole === 'admin' && !['dashboard', 'settings'].includes(itemId)) {
      // Map admin nav items to the admin section with specific sub-routing
      setActiveSection('admin');
    } else if (activeRole === 'faculty' && !['dashboard', 'settings', 'profile'].includes(itemId)) {
      // Map faculty nav items to faculty portal
      setActiveSection('faculty-portal');
    } else {
      setActiveSection(itemId);
    }
  };

  // Determine which item should appear active
  const isActiveItem = (itemId: string): boolean => {
    if (activeRole === 'admin') {
      if (itemId === 'dashboard' && activeSection === 'dashboard') return true;
      if (itemId === 'settings' && activeSection === 'settings') return true;
      if (itemId.startsWith('admin-') && activeSection === 'admin') return true;
      return false;
    }
    if (activeRole === 'faculty') {
      if (itemId === 'dashboard' && activeSection === 'dashboard') return true;
      if (itemId === 'settings' && activeSection === 'settings') return true;
      if (itemId === 'profile' && activeSection === 'profile') return true;
      if (itemId.startsWith('faculty-') && activeSection === 'faculty-portal') return true;
      return false;
    }
    return activeSection === itemId;
  };

  // Accent color based on role
  const accentColor = activeRole === 'faculty' ? 'cyan' : activeRole === 'admin' ? 'amber' : 'purple';
  const accentBg = activeRole === 'faculty' ? 'bg-cyan-500/15 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : activeRole === 'admin' ? 'bg-amber-500/15 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-purple-500/15 text-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.2)]';
  const accentIcon = activeRole === 'faculty' ? 'text-cyan-400' : activeRole === 'admin' ? 'text-amber-400' : 'text-purple-400';
  const accentGlow = activeRole === 'faculty' ? 'shadow-[0_0_12px_rgba(6,182,212,0.6)] bg-cyan-400' : activeRole === 'admin' ? 'shadow-[0_0_12px_rgba(245,158,11,0.6)] bg-amber-400' : 'shadow-[0_0_12px_rgba(139,92,246,0.6)] bg-purple-400';

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 220 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-white/[0.02] backdrop-blur-xl border-r border-white/[0.06] flex flex-col relative z-10 shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06]">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          activeRole === 'faculty' ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]" :
          activeRole === 'admin' ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]" :
          "bg-gradient-to-br from-purple-500 to-cyan-500 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
        )}>
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
              <div className={cn(
                "text-[10px] -mt-0.5",
                activeRole === 'faculty' ? "text-cyan-400" : activeRole === 'admin' ? "text-amber-400" : "text-purple-400"
              )}>
                AI v2.0 • {activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}
              </div>
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
                const isActive = isActiveItem(item.id);
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative group/item",
                      isActive
                        ? accentBg
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
                    )}
                  >
                    {/* Hover trail effect */}
                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/[0.04] via-transparent to-transparent" />
                    <item.icon className={cn("w-5 h-5 shrink-0 relative z-10", isActive && accentIcon)} />
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
                    {/* Badge */}
                    {item.badge && sidebarOpen && (
                      <span className={cn(
                        "ml-auto relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                        activeRole === 'admin' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                        "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      )}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && sidebarOpen && !item.badge && (
                      <Sparkles className={cn("w-3 h-3 ml-auto relative z-10", accentIcon)} />
                    )}
                    {/* Active item glow indicator */}
                    {isActive && (
                      <span className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full", accentGlow)} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Profile item - only for student role */}
        {activeRole === 'student' && (
          <div className="mt-2">
            <div className="mx-3 mb-2 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <motion.button
              onClick={() => setActiveSection(profileItem.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative group/item",
                activeSection === profileItem.id
                  ? accentBg
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
              )}
            >
              <span className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/[0.04] via-transparent to-transparent" />
              <profileItem.icon className={cn("w-5 h-5 shrink-0 relative z-10", activeSection === profileItem.id && accentIcon)} />
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
                <span className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full", accentGlow)} />
              )}
            </motion.button>
          </div>
        )}
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
          <Command className={cn("w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors shrink-0", activeRole === 'faculty' && "group-hover:text-cyan-400", activeRole === 'admin' && "group-hover:text-amber-400")} />
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
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
              activeRole === 'faculty' ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_12px_rgba(6,182,212,0.4)]" :
              activeRole === 'admin' ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-[0_0_12px_rgba(245,158,11,0.4)]" :
              "bg-gradient-to-br from-purple-500 to-cyan-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
            )}>
              {activeRole === 'faculty' ? 'M' : activeRole === 'admin' ? 'A' : 'S'}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden whitespace-nowrap text-left"
                >
                  <div className="text-xs font-medium text-white">
                    {activeRole === 'faculty' ? 'Dr. Meera' : activeRole === 'admin' ? 'Admin' : 'Sam Kumar'}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {activeRole === 'faculty' ? 'CS Faculty' : activeRole === 'admin' ? 'Super Admin' : 'CS2022001'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
