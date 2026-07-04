'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, AlertTriangle,
  Bell, Bot, Search, Shield, Activity, Cpu, HardDrive, Zap,
  Database, Plus, Send, FileBarChart, Settings, Download,
  Clock, TrendingUp, TrendingDown, Brain, Sparkles, Server,
  CheckCircle2, XCircle, AlertCircle, Info, ChevronRight,
  Monitor, MemoryStick, Globe, HeartPulse, ArrowUpRight,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedCounter from './AnimatedCounter';
import WidgetCard, { GlassCard, SectionTitle, PredictionBar } from './WidgetCard';
import { fetchAPI, useCampusStore } from '@/lib/store';
import AdminAIPlayground from './AdminAIPlayground';
import AdminSmartSearch from './AdminSmartSearch';
import AdminComplaintManager from './AdminComplaintManager';
import AdminNotificationBroadcaster from './AdminNotificationBroadcaster';
import AdminStudentManager from './AdminStudentManager';
import AdminFacultyManager from './AdminFacultyManager';
import AdminCourseManager from './AdminCourseManager';
import AdminKnowledgeBase from './AdminKnowledgeBase';
import AdminAutomationBuilder from './AdminAutomationBuilder';
import AdminUserManager from './AdminUserManager';

// ─── Tab Configuration ───────────────────────────────────────────────
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'faculty', label: 'Faculty', icon: GraduationCap },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
  { id: 'users', label: 'User Accounts', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'ai-playground', label: 'AI Playground', icon: Bot },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: Database },
  { id: 'automations', label: 'Automations', icon: Layers },
] as const;

type TabId = (typeof tabs)[number]['id'];

// ─── Stat Card Data ──────────────────────────────────────────────────
const statCards = [
  { label: 'Students', value: 2451, icon: Users, color: 'purple', gradient: 'from-purple-500 to-violet-600', glow: 'rgba(139,92,246,0.3)', bg: 'bg-purple-500/10 border-purple-500/20', textColor: 'text-purple-400', tab: 'students' as TabId },
  { label: 'Faculty', value: 168, icon: GraduationCap, color: 'cyan', gradient: 'from-cyan-500 to-blue-600', glow: 'rgba(6,182,212,0.3)', bg: 'bg-cyan-500/10 border-cyan-500/20', textColor: 'text-cyan-400', tab: 'faculty' as TabId },
  { label: 'Departments', value: 11, icon: Shield, color: 'blue', gradient: 'from-blue-500 to-indigo-600', glow: 'rgba(59,130,246,0.3)', bg: 'bg-blue-500/10 border-blue-500/20', textColor: 'text-blue-400', tab: 'courses' as TabId },
  { label: 'Attendance Today', value: 91.2, decimals: 1, suffix: '%', icon: Activity, color: 'green', gradient: 'from-green-500 to-emerald-600', glow: 'rgba(34,197,94,0.3)', bg: 'bg-green-500/10 border-green-500/20', textColor: 'text-green-400', tab: 'dashboard' as TabId },
  { label: 'Library Books', value: 54120, icon: BookOpen, color: 'orange', gradient: 'from-orange-500 to-red-600', glow: 'rgba(249,115,22,0.3)', bg: 'bg-orange-500/10 border-orange-500/20', textColor: 'text-orange-400', tab: 'dashboard' as TabId },
  { label: 'Pending Complaints', value: 12, icon: AlertTriangle, color: 'red', gradient: 'from-red-500 to-rose-600', glow: 'rgba(239,68,68,0.3)', bg: 'bg-red-500/10 border-red-500/20', textColor: 'text-red-400', tab: 'complaints' as TabId },
  { label: 'Upcoming Events', value: 7, icon: Clock, color: 'yellow', gradient: 'from-yellow-500 to-amber-600', glow: 'rgba(234,179,8,0.3)', bg: 'bg-yellow-500/10 border-yellow-500/20', textColor: 'text-yellow-400', tab: 'dashboard' as TabId },
  { label: 'AI Requests Today', value: 18420, icon: Zap, color: 'violet', gradient: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.3)', bg: 'bg-violet-500/10 border-violet-500/20', textColor: 'text-violet-400', tab: 'ai-playground' as TabId },
  { label: 'System Health', value: 99.98, decimals: 2, suffix: '%', icon: HeartPulse, color: 'emerald', gradient: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.3)', bg: 'bg-emerald-500/10 border-emerald-500/20', textColor: 'text-emerald-400', tab: 'dashboard' as TabId },
];

// ─── System Health Data ──────────────────────────────────────────────
const systemMetrics = [
  { label: 'CPU Usage', value: 67, color: 'purple' },
  { label: 'Memory Usage', value: 54, color: 'cyan' },
  { label: 'API Response Time', value: 45, max: 200, unit: 'ms', displayValue: '45ms', color: 'green' },
  { label: 'Database Health', value: 99.9, decimals: 1, color: 'emerald' },
];

// ─── Quick Actions ───────────────────────────────────────────────────
const quickActions = [
  { label: 'Add Student', icon: Plus, gradient: 'from-purple-500 to-violet-600', glow: 'rgba(139,92,246,0.2)', tab: 'students' as TabId },
  { label: 'Add Faculty', icon: GraduationCap, gradient: 'from-cyan-500 to-blue-600', glow: 'rgba(6,182,212,0.2)', tab: 'faculty' as TabId },
  { label: 'Create Account', icon: Shield, gradient: 'from-amber-500 to-orange-600', glow: 'rgba(245,158,11,0.2)', tab: 'users' as TabId },
  { label: 'Send Notification', icon: Send, gradient: 'from-blue-500 to-indigo-600', glow: 'rgba(59,130,246,0.2)', tab: 'notifications' as TabId },
  { label: 'AI Settings', icon: Settings, gradient: 'from-orange-500 to-amber-600', glow: 'rgba(249,115,22,0.2)', tab: 'ai-playground' as TabId },
  { label: 'Export Data', icon: Download, gradient: 'from-pink-500 to-rose-600', glow: 'rgba(236,72,153,0.2)', tab: 'search' as TabId },
];

// ─── Recent Activity Data ────────────────────────────────────────────
const recentActivity = [
  { message: 'New student enrollment: Aarav Sharma (CS2024045)', type: 'enrollment', time: '2 min ago' },
  { message: 'Complaint #128 resolved by Admin', type: 'complaint', time: '15 min ago' },
  { message: 'Faculty Dr. Meera posted CS301 grades', type: 'academic', time: '32 min ago' },
  { message: 'System backup completed successfully', type: 'system', time: '1 hr ago' },
  { message: 'Event "Tech Fest 2025" registration opened', type: 'event', time: '2 hrs ago' },
  { message: 'AI Agent processed 1,240 chat requests', type: 'ai', time: '3 hrs ago' },
  { message: 'Fee payment received: ₹45,000 (Rahul K.)', type: 'fee', time: '4 hrs ago' },
  { message: 'Library: 23 books overdue — reminders sent', type: 'library', time: '5 hrs ago' },
];

// ─── AI Insights ─────────────────────────────────────────────────────
const aiInsights = [
  { text: 'CS department attendance dropped 12% this week — likely due to severe weather warnings in the region', severity: 'warning', icon: TrendingDown },
  { text: 'Library book returns improved 8% after automated reminder system deployment', severity: 'success', icon: TrendingUp },
  { text: 'Peak AI chat usage detected between 9-11 AM — consider scaling resources during morning hours', severity: 'info', icon: Brain },
  { text: '3 faculty members haven\'t posted grades for mid-semester exams yet', severity: 'warning', icon: AlertCircle },
];

// ═══════════════════════════════════════════════════════════════════════
// AdminPortal section-to-tab sync map
const adminSectionToTabMap: Record<string, TabId> = {
  dashboard: 'dashboard',
  admin: 'dashboard',
  students: 'students',
  faculty: 'faculty',
  courses: 'courses',
  complaints: 'complaints',
  'admin-users': 'users',
  'admin-students': 'students',
  'admin-faculty': 'faculty',
  'admin-courses': 'courses',
  'admin-complaints': 'complaints',
  'admin-notifications': 'notifications',
  'admin-ai-playground': 'ai-playground',
  'admin-search': 'search',
  'admin-knowledge': 'knowledge-base',
  'admin-automations': 'automations',
  notifications: 'notifications',
  'ai-playground': 'ai-playground',
  search: 'search',
  'knowledge-base': 'knowledge-base',
  automations: 'automations',
};

// Main Component
// ═══════════════════════════════════════════════════════════════════════
export default function AdminPortal() {
  const { activeSection, setActiveSection } = useCampusStore();
  const [activeTab, setActiveTab] = useState<TabId>(adminSectionToTabMap[activeSection] || 'dashboard');

  // Sync tab with store's activeSection for sidebar navigation
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setActiveSection(tab === 'dashboard' ? 'admin' : tab);
  };

  // Also sync when activeSection changes from sidebar
  const mappedTab = adminSectionToTabMap[activeSection];
  if (mappedTab && mappedTab !== activeTab) {
    setActiveTab(mappedTab);
  }

  return (
    <div className="h-full flex flex-col">
      {/* ─── Top Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">CampusOS Control Center</h1>
            <p className="text-[11px] text-gray-500">System Administration & AI Operations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">All Systems Operational</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white">
              A
            </div>
            <span className="text-xs text-gray-300 font-medium hidden sm:inline">Admin</span>
          </div>
        </div>
      </div>

      {/* ─── Tab Bar ─────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 shrink-0",
                  isActive
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                    : "bg-white/[0.02] text-gray-500 border border-white/[0.06] hover:text-gray-300 hover:bg-white/[0.04] hover:border-white/[0.1]"
                )}
              >
                <tab.icon className={cn("w-4 h-4", isActive && "text-purple-400")} />
                <span>{tab.label}</span>
                {isActive && <Sparkles className="w-3 h-3 text-purple-400" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ─── Content Area ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'dashboard' && <DashboardTab onNavigate={handleTabChange} />}
            {activeTab === 'students' && <AdminStudentManager />}
            {activeTab === 'faculty' && <AdminFacultyManager />}
            {activeTab === 'courses' && <AdminCourseManager />}
            {activeTab === 'complaints' && <AdminComplaintManager />}
            {activeTab === 'notifications' && <AdminNotificationBroadcaster />}
            {activeTab === 'ai-playground' && <AdminAIPlayground />}
            {activeTab === 'search' && <AdminSmartSearch />}
            {activeTab === 'knowledge-base' && <AdminKnowledgeBase />}
            {activeTab === 'automations' && <AdminAutomationBuilder />}
            {activeTab === 'users' && <AdminUserManager />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Dashboard Tab (Control Center) — The Hero Section
// ═══════════════════════════════════════════════════════════════════════
function DashboardTab({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/admin').then((data) => {
      setAdminData(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Merge API data with stat cards
  const liveStatCards = statCards.map(card => {
    if (!adminData?.stats) return card;
    const s = adminData.stats;
    const mapping: Record<string, number> = {
      'Students': s.totalStudents || 0,
      'Faculty': s.totalFaculty || 0,
      'Departments': s.totalDepartments || 0,
      'Attendance Today': s.avgAttendance || 0,
      'Library Books': s.totalBooks || 0,
      'Pending Complaints': s.pendingComplaints || 0,
      'Upcoming Events': s.upcomingEvents || 0,
    };
    if (mapping[card.label] !== undefined) {
      return { ...card, value: mapping[card.label] };
    }
    return card;
  });

  // Merge API recent activity
  const liveActivity = adminData?.recentActivity?.length > 0
    ? adminData.recentActivity.map((a: any) => ({
        message: a.message,
        type: a.type,
        time: a.time,
      }))
    : recentActivity;

  if (loading) {
    return (
      <div className="space-y-6 pt-2">
        <div className="h-40 bg-white/[0.03] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-28 bg-white/[0.03] rounded-2xl animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />
          <div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      {/* ─── Hero Banner ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-8"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050510]/80" />

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3), rgba(139,92,246,0.3))',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-[1px] rounded-2xl bg-[#050510]" />
        </motion.div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-2"
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium uppercase tracking-wider">AI-Powered Administration</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-400 mb-2"
            >
              CampusOS Control Center
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-sm max-w-lg"
            >
              Real-time campus monitoring, AI-driven insights, and complete administrative control at your fingertips.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">Last synced</p>
              <p className="text-sm text-gray-300 font-medium">Just now</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.2)]"
            >
              <Server className="w-5 h-5 text-purple-400" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Stat Cards Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
        {liveStatCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ scale: 1.03, y: -3 }}
            onClick={() => onNavigate(card.tab)}
            className={cn(
              "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4",
              "hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300 cursor-pointer",
              "group"
            )}
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3 border", card.bg)}>
              <card.icon className={cn("w-4.5 h-4.5", card.textColor)} />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">
              <AnimatedCounter
                value={card.value}
                decimals={card.decimals || 0}
                suffix={card.suffix || ''}
                duration={1.5}
              />
            </div>
            <p className="text-[11px] text-gray-500 truncate">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ─── System Health + Quick Actions Row ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Health Widget */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold">System Health</h3>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              HEALTHY
            </span>
          </div>

          <div className="space-y-4">
            {systemMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="flex justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {metric.label === 'CPU Usage' && <Cpu className="w-3.5 h-3.5 text-gray-500" />}
                    {metric.label === 'Memory Usage' && <HardDrive className="w-3.5 h-3.5 text-gray-500" />}
                    {metric.label === 'API Response Time' && <Zap className="w-3.5 h-3.5 text-gray-500" />}
                    {metric.label === 'Database Health' && <Database className="w-3.5 h-3.5 text-gray-500" />}
                    <span className="text-gray-400 text-xs">{metric.label}</span>
                  </div>
                  <span className="text-white text-xs font-semibold">
                    {metric.displayValue || `${metric.value}%`}
                  </span>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, metric.value / (metric.max || 100) * 100)}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 + i * 0.1 }}
                    className={cn(
                      "h-full rounded-full shadow-[0_0_8px_rgba(139,92,246,0.3)]",
                      metric.color === 'purple' && "bg-gradient-to-r from-purple-500 to-violet-600",
                      metric.color === 'cyan' && "bg-gradient-to-r from-cyan-500 to-blue-600",
                      metric.color === 'green' && "bg-gradient-to-r from-green-500 to-emerald-600",
                      metric.color === 'emerald' && "bg-gradient-to-r from-emerald-500 to-teal-600",
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mini server status indicators */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-gray-500" />
              <span className="text-[11px] text-gray-500">API</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-gray-500" />
              <span className="text-[11px] text-gray-500">DB</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <Bot className="w-3 h-3 text-gray-500" />
              <span className="text-[11px] text-gray-500">AI</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3 h-3 text-gray-500" />
              <span className="text-[11px] text-gray-500">CDN</span>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex flex-col items-center gap-2.5 p-4 rounded-xl",
                  "bg-white/[0.03] border border-white/[0.06]",
                  "hover:border-white/[0.12] hover:bg-white/[0.05]",
                  "transition-all duration-300 group"
                )}
                style={{ boxShadow: `0 0 0px ${action.glow}` }}
                onClick={() => onNavigate(action.tab)}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${action.glow}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 0px ${action.glow}`; }}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                  action.gradient,
                  "shadow-lg group-hover:scale-110 transition-transform duration-300"
                )}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-400 font-medium text-center group-hover:text-gray-200 transition-colors">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Recent Activity + AI Insights Row ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold">Recent Activity</h3>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              LIVE
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {liveActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  activity.type === 'enrollment' && 'bg-purple-500/10',
                  activity.type === 'complaint' && 'bg-red-500/10',
                  activity.type === 'academic' && 'bg-cyan-500/10',
                  activity.type === 'system' && 'bg-gray-500/10',
                  activity.type === 'event' && 'bg-blue-500/10',
                  activity.type === 'ai' && 'bg-violet-500/10',
                  activity.type === 'fee' && 'bg-green-500/10',
                  activity.type === 'library' && 'bg-orange-500/10',
                )}>
                  {activity.type === 'enrollment' && <Users className="w-3.5 h-3.5 text-purple-400" />}
                  {activity.type === 'complaint' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                  {activity.type === 'academic' && <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />}
                  {activity.type === 'system' && <Server className="w-3.5 h-3.5 text-gray-400" />}
                  {activity.type === 'event' && <Clock className="w-3.5 h-3.5 text-blue-400" />}
                  {activity.type === 'ai' && <Bot className="w-3.5 h-3.5 text-violet-400" />}
                  {activity.type === 'fee' && <Activity className="w-3.5 h-3.5 text-green-400" />}
                  {activity.type === 'library' && <BookOpen className="w-3.5 h-3.5 text-orange-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 group-hover:text-gray-100 transition-colors leading-snug">
                    {activity.message}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{activity.time}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-500 shrink-0 mt-1 transition-colors" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-violet-400" />
              </div>
              <h3 className="text-white font-semibold">AI Insights</h3>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium animate-pulse">
              THINKING
            </span>
          </div>

          <div className="space-y-3">
            {aiInsights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border transition-all duration-300",
                  insight.severity === 'warning' && "bg-yellow-500/[0.04] border-yellow-500/10 hover:border-yellow-500/20",
                  insight.severity === 'success' && "bg-green-500/[0.04] border-green-500/10 hover:border-green-500/20",
                  insight.severity === 'info' && "bg-blue-500/[0.04] border-blue-500/10 hover:border-blue-500/20",
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  insight.severity === 'warning' && "bg-yellow-500/10",
                  insight.severity === 'success' && "bg-green-500/10",
                  insight.severity === 'info' && "bg-blue-500/10",
                )}>
                  <insight.icon className={cn(
                    "w-3.5 h-3.5",
                    insight.severity === 'warning' && "text-yellow-400",
                    insight.severity === 'success' && "text-green-400",
                    insight.severity === 'info' && "text-blue-400",
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 leading-snug">{insight.text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      insight.severity === 'warning' && "bg-yellow-500/10 text-yellow-400",
                      insight.severity === 'success' && "bg-green-500/10 text-green-400",
                      insight.severity === 'info' && "bg-blue-500/10 text-blue-400",
                    )}>
                      {insight.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-600">AI-generated</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Confidence */}
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">AI Confidence Score</span>
              <span className="text-xs text-purple-400 font-semibold">94.7%</span>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '94.7%' }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-[0_0_8px_rgba(139,92,246,0.4)]"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Campus Analytics Section ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <FileBarChart className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">Campus Analytics</h3>
          <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium ml-2">
            INSIGHTS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Attendance Heatmap */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium text-sm">Attendance Heatmap</h4>
              <span className="text-[10px] text-gray-500">By Day & Time Slot</span>
            </div>
            <AttendanceHeatmap />
          </motion.div>

          {/* Department Performance Bar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium text-sm">Department Performance</h4>
              <span className="text-[10px] text-gray-500">Avg CGPA by Dept</span>
            </div>
            <DepartmentPerformanceChart adminData={adminData} />
          </motion.div>

          {/* Placement Trend Line Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium text-sm">Placement Trend</h4>
              <span className="text-[10px] text-gray-500">Monthly Placements</span>
            </div>
            <PlacementTrendChart />
          </motion.div>

          {/* Fee Collection Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium text-sm">Fee Collection</h4>
              <span className="text-[10px] text-gray-500">Payment Status</span>
            </div>
            <FeeCollectionChart adminData={adminData} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Attendance Heatmap Component ────────────────────────────────────
function AttendanceHeatmap() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const slots = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '2 PM', '3 PM', '4 PM'];

  // Generate realistic heatmap data
  const heatmapData = useMemo(() => {
    const data: number[][] = [];
    for (let d = 0; d < 7; d++) {
      const row: number[] = [];
      for (let s = 0; s < 8; s++) {
        if (d >= 5) { // Weekend
          row.push(Math.random() * 15);
        } else if (s >= 4 && s <= 5) { // Afternoon peak
          row.push(70 + Math.random() * 30);
        } else if (s >= 1 && s <= 3) { // Morning peak
          row.push(80 + Math.random() * 20);
        } else { // Early/late
          row.push(30 + Math.random() * 40);
        }
      }
      data.push(row);
    }
    return data;
  }, []);

  const getColor = (value: number) => {
    if (value < 20) return 'rgba(139, 92, 246, 0.08)';
    if (value < 40) return 'rgba(139, 92, 246, 0.2)';
    if (value < 60) return 'rgba(139, 92, 246, 0.35)';
    if (value < 80) return 'rgba(139, 92, 246, 0.55)';
    return 'rgba(139, 92, 246, 0.8)';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[320px]">
        {/* Time slot headers */}
        <div className="flex items-center gap-1 mb-2 pl-10">
          {slots.map((slot) => (
            <div key={slot} className="flex-1 text-center text-[9px] text-gray-500 font-medium">
              {slot}
            </div>
          ))}
        </div>
        {/* Day rows */}
        {days.map((day, dIdx) => (
          <div key={day} className="flex items-center gap-1 mb-1">
            <div className="w-9 text-right text-[10px] text-gray-400 font-medium pr-1">{day}</div>
            {heatmapData[dIdx].map((value, sIdx) => (
              <motion.div
                key={`${dIdx}-${sIdx}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 + dIdx * 0.05 + sIdx * 0.02, duration: 0.3 }}
                className="flex-1 aspect-square rounded-md cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: getColor(value), minHeight: '24px' }}
                title={`${day} ${slots[sIdx]}: ${Math.round(value)}% attendance`}
              />
            ))}
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-[9px] text-gray-500">Low</span>
          <div className="flex gap-0.5">
            {[0.08, 0.2, 0.35, 0.55, 0.8].map((opacity, i) => (
              <div
                key={i}
                className="w-4 h-3 rounded-sm"
                style={{ backgroundColor: `rgba(139, 92, 246, ${opacity})` }}
              />
            ))}
          </div>
          <span className="text-[9px] text-gray-500">High</span>
        </div>
      </div>
    </div>
  );
}

// ─── Department Performance Chart ────────────────────────────────────
function DepartmentPerformanceChart({ adminData }: { adminData: any }) {
  const data = useMemo(() => {
    if (adminData?.attendanceByDepartment?.length > 0) {
      return adminData.attendanceByDepartment.map((d: any) => ({
        department: d.department?.replace('Computer Science', 'CS')?.replace('Information Technology', 'IT')?.replace('Electronics & Communication', 'ECE')?.replace('Electrical Engineering', 'EEE')?.replace('Mechanical Engineering', 'ME')?.replace('Civil Engineering', 'CE') || d.department,
        cgpa: d.avgCgpa || d.cgpa || 0,
      }));
    }
    return [
      { department: 'CS', cgpa: 8.08 },
      { department: 'IT', cgpa: 8.03 },
      { department: 'ECE', cgpa: 7.55 },
      { department: 'EEE', cgpa: 7.50 },
      { department: 'ME', cgpa: 7.50 },
      { department: 'CE', cgpa: 7.88 },
    ];
  }, [adminData]);

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="department"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 30, 0.95)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              color: '#e5e7eb',
              fontSize: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
            formatter={(value: number) => [value.toFixed(2), 'Avg CGPA']}
            cursor={{ fill: 'rgba(139, 92, 246, 0.08)' }}
          />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <Bar dataKey="cgpa" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Placement Trend Chart ───────────────────────────────────────────
function PlacementTrendChart() {
  const data = useMemo(() => [
    { month: 'Jul', placements: 12 },
    { month: 'Aug', placements: 28 },
    { month: 'Sep', placements: 45 },
    { month: 'Oct', placements: 62 },
    { month: 'Nov', placements: 54 },
    { month: 'Dec', placements: 38 },
    { month: 'Jan', placements: 72 },
    { month: 'Feb', placements: 85 },
  ], []);

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 10, 30, 0.95)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '12px',
              color: '#e5e7eb',
              fontSize: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
            formatter={(value: number) => [value, 'Placements']}
          />
          <Area
            type="monotone"
            dataKey="placements"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fill="url(#cyanGradient)"
            dot={{ fill: '#06b6d4', r: 4, strokeWidth: 2, stroke: '#0a0a1e' }}
            activeDot={{ fill: '#06b6d4', r: 6, strokeWidth: 2, stroke: '#0a0a1e' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Fee Collection Chart ────────────────────────────────────────────
function FeeCollectionChart({ adminData }: { adminData: any }) {
  const data = useMemo(() => {
    if (adminData?.stats) {
      const s = adminData.stats;
      return [
        { name: 'Paid', value: s.feesPaid || 45, color: '#22c55e' },
        { name: 'Pending', value: s.feesPending || 28, color: '#eab308' },
        { name: 'Overdue', value: s.feesOverdue || 12, color: '#ef4444' },
      ];
    }
    return [
      { name: 'Paid', value: 45, color: '#22c55e' },
      { name: 'Pending', value: 28, color: '#eab308' },
      { name: 'Overdue', value: 12, color: '#ef4444' },
    ];
  }, [adminData]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-56 flex items-center">
      <div className="w-1/2">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 30, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#e5e7eb',
                fontSize: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
              formatter={(value: number, name: string) => [`₹${value}L`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-1/2 space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{item.name}</span>
                <span className="text-xs text-white font-semibold">
                  {Math.round((item.value / total) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / total) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 1.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          </div>
        ))}
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Total Collection</span>
            <span className="text-sm text-white font-bold">₹{total}L</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Placeholder Tab — Beautiful placeholder for each sub-section
// ═══════════════════════════════════════════════════════════════════════
interface PlaceholderTabProps {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  accentColor: string;
  stats: { l: string; v: string }[];
}

function PlaceholderTab({ id, label, description, icon: Icon, gradient, accentColor, stats }: PlaceholderTabProps) {
  const accentMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'rgba(139,92,246,0.3)' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'rgba(6,182,212,0.3)' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'rgba(59,130,246,0.3)' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', glow: 'rgba(239,68,68,0.3)' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', glow: 'rgba(234,179,8,0.3)' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'rgba(139,92,246,0.3)' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'rgba(16,185,129,0.3)' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', glow: 'rgba(249,115,22,0.3)' },
  };

  const accent = accentMap[accentColor] || accentMap.purple;

  return (
    <div className="space-y-6 pt-2">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent" />
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(90deg, ${accent.glow}, transparent, ${accent.glow})`,
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-[1px] rounded-2xl bg-[#050510]" />
        </motion.div>

        <div className="relative z-10 flex items-start gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br",
              gradient,
              "shadow-lg"
            )}
            style={{ boxShadow: `0 0 25px ${accent.glow}` }}
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
            >
              {label}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 text-sm mt-1 max-w-lg"
            >
              {description}
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.l}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.12] transition-all duration-300"
          >
            <p className="text-[11px] text-gray-500 mb-1">{stat.l}</p>
            <p className={cn("text-xl font-bold", accent.text)}>{stat.v}</p>
          </motion.div>
        ))}
      </div>

      {/* Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-12 hover:border-white/[0.12] transition-all duration-300"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br mb-6",
              gradient
            )}
            style={{ boxShadow: `0 0 30px ${accent.glow}` }}
          >
            <Icon className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            This section is being built with AI-powered features. Stay tuned for an enhanced administrative experience.
          </p>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <Sparkles className={cn("w-4 h-4", accent.text)} />
            <span className="text-xs text-gray-400">AI-powered features in development</span>
          </div>
        </div>
      </motion.div>

      {/* Feature Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { title: 'Smart Search', desc: 'AI-powered semantic search across all records' },
          { title: 'Bulk Operations', desc: 'Perform actions on multiple records simultaneously' },
          { title: 'Analytics', desc: 'Deep insights with interactive visualizations' },
        ].map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className={cn(
              "bg-white/[0.02] border border-white/[0.06] rounded-xl p-4",
              "hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300",
              "group cursor-pointer"
            )}
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", accent.bg, accent.border, "border")}>
              <ArrowUpRight className={cn("w-4 h-4", accent.text)} />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-gray-200">{feature.title}</h4>
            <p className="text-xs text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
