'use client';

import { useEffect, useState } from 'react';
import { useCampusStore, fetchAPI } from '@/lib/store';
import WidgetCard, { GlassCard } from './WidgetCard';
import AnimatedCounter from './AnimatedCounter';
import { TrendingUp, BookOpen, AlertTriangle, Calendar, Library, Trophy, Clock, Zap, Sparkles, Target, Flame, ChevronRight, Mic, Bot, ArrowUpRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { dashboardData, setDashboardData, setActiveSection, setVoiceOpen, openChatWithContext } = useCampusStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/dashboard').then(setDashboardData).finally(() => setLoading(false));
  }, []);

  if (loading || !dashboardData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 space-y-4"
      >
        <div className="h-28 w-full bg-white/[0.03] rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="h-32 bg-white/[0.03] rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />
          <div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" />
        </div>
      </motion.div>
    );
  }

  const d = dashboardData;
  const att = d.attendance;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto"
    >
      {/* Hero Banner with Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600/10 via-violet-600/5 to-cyan-600/10 border border-white/[0.08] p-6"
      >
        {/* Shimmer/shine animation */}
        <span className="absolute inset-0 overflow-hidden rounded-3xl">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_4s_ease-in-out_infinite]" style={{ transform: 'translateX(-100%)' }} />
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-orange-300 uppercase tracking-wider">5-day streak active</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">{d.student.name}</span> 👋
            </h2>
            <p className="text-sm text-gray-400">You have {d.assignments.pending} assignments pending and {d.events.upcoming} events this week.</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openChatWithContext("I need help with something on CampusOS. What can you assist me with?")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)] relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Bot className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Ask AI</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVoiceOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-sm font-medium hover:bg-white/[0.08] transition-colors"
            >
              <Mic className="w-4 h-4 text-cyan-400" />
              Voice
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative group/card rounded-2xl p-[1px] bg-gradient-to-b from-transparent via-transparent to-transparent hover:from-purple-500/40 hover:via-cyan-500/20 hover:to-purple-500/40 transition-all duration-500">
          <WidgetCard
            title="Attendance"
            value={`${att.percentage}%`}
            icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
            risk={att.risk}
            onClick={() => setActiveSection('attendance')}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative group/card rounded-2xl p-[1px] bg-gradient-to-b from-transparent via-transparent to-transparent hover:from-cyan-500/40 hover:via-purple-500/20 hover:to-cyan-500/40 transition-all duration-500">
          <WidgetCard
            title="CGPA"
            value={d.student.cgpa}
            icon={<BookOpen className="w-5 h-5 text-cyan-400" />}
            trend="up"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative group/card rounded-2xl p-[1px] bg-gradient-to-b from-transparent via-transparent to-transparent hover:from-yellow-500/40 hover:via-orange-500/20 hover:to-yellow-500/40 transition-all duration-500">
          <WidgetCard
            title="Assignments"
            value={d.assignments.pending}
            icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
            subtitle="pending"
            onClick={() => setActiveSection('academic')}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative group/card rounded-2xl p-[1px] bg-gradient-to-b from-transparent via-transparent to-transparent hover:from-blue-500/40 hover:via-purple-500/20 hover:to-blue-500/40 transition-all duration-500">
          <WidgetCard
            title="Upcoming"
            value={d.events.upcoming}
            icon={<Calendar className="w-5 h-5 text-blue-400" />}
            subtitle="events"
            onClick={() => setActiveSection('events')}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="relative group/card rounded-2xl p-[1px] bg-gradient-to-b from-transparent via-transparent to-transparent hover:from-orange-500/40 hover:via-yellow-500/20 hover:to-orange-500/40 transition-all duration-500">
          <WidgetCard
            title="Library Due"
            value={d.library.overdue}
            icon={<Library className="w-5 h-5 text-orange-400" />}
            subtitle="overdue"
            onClick={() => setActiveSection('library')}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative group/card rounded-2xl p-[1px] bg-gradient-to-b from-transparent via-transparent to-transparent hover:from-green-500/40 hover:via-emerald-500/20 hover:to-green-500/40 transition-all duration-500">
          <WidgetCard
            title="Placement"
            value={`${d.readiness}%`}
            icon={<Trophy className="w-5 h-5 text-green-400" />}
            subtitle="readiness"
            onClick={() => setActiveSection('placement')}
          />
        </motion.div>
      </div>

      {/* Live Activity Ticker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
      >
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-white/[0.08]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[10px] text-green-400 uppercase tracking-wider font-semibold">Live</span>
          {/* Pulse dot for live data */}
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-white/[0.08]">
          <span className="text-[10px] text-gray-600">Backend:</span>
          <span className="text-[10px] text-green-400 font-medium flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
            {d._backend === 'python-fastapi' ? '🐍 Python FastAPI' : '⚡ Next.js + Prisma'}
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="flex gap-8 whitespace-nowrap text-xs text-gray-400"
          >
            <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-purple-400" /> AI Agent processed 6 conversations today</span>
            <span className="flex items-center gap-1.5"><Trophy className="w-3 h-3 text-green-400" /> Google interview scheduled for next week</span>
            <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-cyan-400" /> 3 new books added to library</span>
            <span className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-yellow-400" /> SVM Classifier assignment due in 3 days</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-blue-400" /> Tech Fest registration opens Friday</span>
            <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-purple-400" /> AI Agent processed 6 conversations today</span>
            <span className="flex items-center gap-1.5"><Trophy className="w-3 h-3 text-green-400" /> Google interview scheduled for next week</span>
            <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-cyan-400" /> 3 new books added to library</span>
            <span className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-yellow-400" /> SVM Classifier assignment due in 3 days</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-blue-400" /> Tech Fest registration opens Friday</span>
          </motion.div>
        </div>
      </motion.div>

      {/* AI Predictions */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Zap className="w-5 h-5 text-purple-400" />
              </motion.div>
              <h3 className="text-white font-semibold">AI Predictions</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">Live</span>
            </div>
            <span className="text-xs text-gray-500">Updated 2 min ago</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-400 text-sm">Attendance Prediction</span>
                <span className="text-white text-sm font-semibold"><AnimatedCounter value={att.predicted} decimals={1} suffix="%" /></span>
              </div>
              <div className="h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, att.predicted)}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.4)]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-400 text-sm">Placement Readiness</span>
                <span className="text-white text-sm font-semibold"><AnimatedCounter value={d.readiness} suffix="%" /></span>
              </div>
              <div className="h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${d.readiness}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-400 text-sm">Stress Level</span>
                <span className="text-white text-sm font-semibold"><AnimatedCounter value={d.stressLevel} suffix="%" /></span>
              </div>
              <div className="h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${d.stressLevel}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full rounded-full bg-gradient-to-r shadow-[0_0_10px_rgba(239,68,68,0.4)] ${d.stressLevel > 60 ? 'from-red-500 to-rose-600' : d.stressLevel > 40 ? 'from-yellow-500 to-amber-600' : 'from-green-500 to-emerald-600'}`} />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Check Attendance', desc: 'View detailed stats', color: 'purple', action: () => openChatWithContext("Show me my detailed attendance statistics and trends") },
          { icon: BookOpen, label: 'Library Books', desc: 'Find & borrow', color: 'cyan', action: () => openChatWithContext("Help me find and borrow library books") },
          { icon: Calendar, label: 'Upcoming Events', desc: 'Register now', color: 'blue', action: () => openChatWithContext("What events are coming up that I can register for?") },
          { icon: Trophy, label: 'Placement Prep', desc: 'Get ready', color: 'green', action: () => openChatWithContext("How can I improve my placement readiness?") },
        ].map((qa, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={qa.action}
            className="text-left p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              qa.color === 'purple' ? 'bg-purple-500/10 border border-purple-500/20' :
              qa.color === 'cyan' ? 'bg-cyan-500/10 border border-cyan-500/20' :
              qa.color === 'blue' ? 'bg-blue-500/10 border border-blue-500/20' :
              'bg-green-500/10 border border-green-500/20'
            }`}>
              <qa.icon className={`w-5 h-5 ${
                qa.color === 'purple' ? 'text-purple-400' :
                qa.color === 'cyan' ? 'text-cyan-400' :
                qa.color === 'blue' ? 'text-blue-400' :
                'text-green-400'
              }`} />
            </div>
            <div className="text-sm text-white font-medium group-hover:text-purple-300 transition-colors">{qa.label}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              {qa.desc}
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Schedule & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Schedule */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Today&apos;s Schedule</h3>
            </div>
            <button onClick={() => setActiveSection('academic')} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { time: '09:00 AM', subject: 'Probability & Statistics', room: 'LH-101', status: 'upcoming' },
              { time: '10:00 AM', subject: 'Machine Learning', room: 'LH-201', status: 'upcoming' },
              { time: '02:00 PM', subject: 'Computer Networks', room: 'LH-102', status: 'upcoming' },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-all"
              >
                <div className="w-1 h-10 rounded-full bg-gradient-to-b from-purple-500 to-cyan-500 shrink-0" />
                <div className="text-xs text-purple-400 font-mono w-20 shrink-0">{item.time}</div>
                <div className="flex-1">
                  <div className="text-sm text-white">{item.subject}</div>
                  <div className="text-xs text-gray-500">{item.room}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Recent Notifications</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">{d.notifications.unread} new</span>
          </div>
          <div className="space-y-2">
            {[
              { title: 'Assignment Due Soon', desc: 'SVM Classifier due in 3 days', type: 'warning', icon: '⚠️' },
              { title: 'Google Interview', desc: 'Scheduled for next week', type: 'success', icon: '✅' },
              { title: 'Fee Due', desc: 'Exam fee ₹5,000 due in 7 days', type: 'warning', icon: '💰' },
              { title: 'AC Complaint Update', desc: 'Assigned to maintenance', type: 'info', icon: 'ℹ️' },
            ].map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer border-l-2 ${
                  n.type === 'warning' ? 'border-l-yellow-500/60' :
                  n.type === 'success' ? 'border-l-green-500/60' : 'border-l-blue-500/60'
                }`}
              >
                <span className="text-base shrink-0">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{n.title}</div>
                  <div className="text-xs text-gray-500 truncate">{n.desc}</div>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                  n.type === 'warning' ? 'bg-yellow-400' :
                  n.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                }`} />
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Skills + AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Your Skills</h3>
            </div>
            <span className="text-xs text-gray-500">{d.student.skills.length} skills</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {d.student.skills.map((skill: string, i: number) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium cursor-default hover:bg-purple-500/20 hover:border-purple-500/40 transition-colors"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold text-sm">AI Insight</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Based on your skills & CGPA, you&apos;re <span className="text-cyan-400 font-semibold">{d.readiness}% ready</span> for placements. Focus on System Design & DSA to reach 95%.
            </p>
            <button
              onClick={() => openChatWithContext("Create a personalized plan for my academic and placement improvement")}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              Get personalized plan <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
