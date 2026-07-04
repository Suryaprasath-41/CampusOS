'use client';

import { useCampusStore, fetchAPI, patchAPI } from '@/lib/store';
import { GlassCard, SectionTitle, StatusBadge } from './WidgetCard';
import AnimatedCounter from './AnimatedCounter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Phone, Home, Users, GraduationCap, CheckCircle2, Trophy,
  Sparkles, Calendar, BookOpen, Star, Target, Bot, Wallet, Lock,
  Edit3, Save, X, Plus, Shield, Award, TrendingUp, MessageSquare,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Icon map for achievements
const achievementIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  graduation: GraduationCap,
  check: CheckCircle2,
  trophy: Trophy,
  sparkles: Sparkles,
  calendar: Calendar,
  book: BookOpen,
  star: Star,
  target: Target,
};

// Color map for unlocked achievements
const achievementColors: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'shadow-[0_0_25px_rgba(139,92,246,0.25)]' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'shadow-[0_0_25px_rgba(6,182,212,0.25)]' },
  green: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', glow: 'shadow-[0_0_25px_rgba(34,197,94,0.25)]' },
  yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: 'shadow-[0_0_25px_rgba(234,179,8,0.25)]' },
  blue: { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', glow: 'shadow-[0_0_25px_rgba(14,165,233,0.25)]' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'shadow-[0_0_25px_rgba(249,115,22,0.25)]' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'shadow-[0_0_25px_rgba(244,63,94,0.25)]' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', glow: 'shadow-[0_0_25px_rgba(139,92,246,0.25)]' },
};

// Icon map for timeline
const timelineIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  bot: Bot,
  target: Target,
  wallet: Wallet,
  calendar: Calendar,
  book: BookOpen,
};

const timelineColors: Record<string, string> = {
  bot: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  target: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  wallet: 'text-green-400 bg-green-500/10 border-green-500/30',
  calendar: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  book: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (sec < 60) return 'just now';
  if (min < 60) return `${min} minute${min !== 1 ? 's' : ''} ago`;
  if (hr < 24) return `${hr} hour${hr !== 1 ? 's' : ''} ago`;
  if (day < 30) return `${day} day${day !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProfileSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const { openChatWithContext } = useCampusStore();

  const loadProfile = () => {
    setLoading(true);
    setError(null);
    fetchAPI('/profile')
      .then((d) => {
        setData(d);
        setSkills(d.student?.skills || []);
      })
      .catch((e) => setError(e.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    fetchAPI('/profile')
      .then((d) => {
        if (!active) return;
        setData(d);
        setSkills(d.student?.skills || []);
        setError(null);
      })
      .catch((e) => { if (active) setError(e.message || 'Failed to load profile'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSaveSkills = async () => {
    setSaving(true);
    try {
      await patchAPI('/profile', { skills });
      setEditMode(false);
      setData((prev: any) => ({ ...prev, student: { ...prev.student, skills } }));
    } catch (e: any) {
      setError(e.message || 'Failed to save skills');
    } finally {
      setSaving(false);
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter((sk) => sk !== s));
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="h-8 w-64 bg-white/[0.03] rounded-xl animate-pulse" />
        <div className="h-48 bg-white/[0.03] rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-36 bg-white/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (error && !data) {
    return (
      <div className="p-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <GlassCard className="text-center py-12">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <X className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Unable to load profile</h3>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-500/30 transition-colors"
          >
            Try again
          </button>
        </GlassCard>
      </div>
    );
  }

  if (!data) return null;

  const { student, achievements, timeline, stats } = data;
  const unlockedCount = achievements.filter((a: any) => a.unlocked).length;
  const memberSince = new Date(student.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const initials = student.name ? student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'S';

  const statCards = [
    { label: 'Total Classes', value: stats.totalClasses, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10', suffix: '' },
    { label: 'Attendance', value: stats.attendancePct, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10', suffix: '%' },
    { label: 'Events Attended', value: stats.eventsAttended, icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-500/10', suffix: '' },
    { label: 'Conversations', value: stats.conversationsHad, icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10', suffix: '' },
  ];

  const contactInfo = [
    { label: 'Email', value: student.email, icon: Mail, color: 'text-purple-400' },
    { label: 'Phone', value: student.phone || 'N/A', icon: Phone, color: 'text-cyan-400' },
    { label: 'Hostel Room', value: student.hostelRoom || 'Day Scholar', icon: Home, color: 'text-yellow-400' },
    { label: 'Guardian', value: `${student.guardianName || 'N/A'} • ${student.guardianPhone || ''}`, icon: Users, color: 'text-green-400' },
  ];

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <SectionTitle>Student Profile</SectionTitle>

      {/* ============ PROFILE HERO CARD ============ */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.08] via-transparent to-cyan-500/[0.05] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="shrink-0 relative"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-cyan-500 p-[2px] shadow-[0_0_40px_rgba(139,92,246,0.4)]">
              <div className="w-full h-full rounded-full bg-[#0a0a14] flex items-center justify-center overflow-hidden">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold bg-gradient-to-br from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {initials}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500/20 border-2 border-[#0a0a14] flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
          </motion.div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{student.name}</h2>
              <StatusBadge status={student.placementStatus} />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-3">
              <span className="font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                {student.rollNumber}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {student.department}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                Sem {student.semester} • Sec {student.section}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">CGPA</span>
                <span className="text-white font-bold">{student.cgpa?.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">Member since</span>
                <span className="text-white font-medium">{memberSince}</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setEditMode(!editMode)}
            className={cn(
              'shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
              editMode
                ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                : 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
            )}
          >
            <Edit3 className="w-4 h-4" />
            {editMode ? 'Editing Skills' : 'Edit Skills'}
          </motion.button>
        </div>
      </GlassCard>

      {/* ============ CONTACT INFO GRID ============ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contactInfo.map((info, i) => (
          <motion.div
            key={info.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
          >
            <GlassCard className="p-4 h-full">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('p-1.5 rounded-lg bg-white/[0.04]', info.color)}>
                  <info.icon className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{info.label}</span>
              </div>
              <p className="text-sm text-white font-medium truncate" title={info.value}>
                {info.value}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ============ STATS OVERVIEW ============ */}
      <div>
        <SectionTitle className="text-xl mb-4">Quick Stats</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, type: 'spring' }}
              whileHover={{ y: -3, scale: 1.02 }}
            >
              <GlassCard className="p-5 h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('p-2 rounded-xl', stat.bg)}>
                    <stat.icon className={cn('w-5 h-5', stat.color)} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.suffix === '%' ? 1 : 0} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ============ ACHIEVEMENTS SECTION ============ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle className="text-xl mb-0">Achievements</SectionTitle>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Trophy className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">
              {unlockedCount}/{achievements.length} unlocked
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map((ach: any, i: number) => {
            const Icon = achievementIcons[ach.icon] || Award;
            const colors = achievementColors[ach.color] || achievementColors.purple;
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 20, rotateX: -30 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                whileHover={{ y: -4, scale: 1.03 }}
                className={cn(
                  'relative rounded-2xl p-4 border backdrop-blur-xl transition-all overflow-hidden',
                  ach.unlocked
                    ? cn(colors.bg, colors.border, colors.glow)
                    : 'bg-white/[0.02] border-white/[0.05] opacity-60'
                )}
              >
                {ach.unlocked && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/[0.05] to-transparent rounded-bl-full pointer-events-none" />
                )}
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn('p-2 rounded-xl', ach.unlocked ? colors.bg : 'bg-white/[0.03]')}>
                      <Icon className={cn('w-5 h-5', ach.unlocked ? colors.text : 'text-gray-500')} />
                    </div>
                    {!ach.unlocked && (
                      <div className="p-1.5 rounded-lg bg-white/[0.04]">
                        <Lock className="w-3 h-3 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <h4 className={cn('text-sm font-semibold mb-1', ach.unlocked ? 'text-white' : 'text-gray-400')}>
                    {ach.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{ach.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ============ SKILLS SECTION ============ */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Skills</h3>
            <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-white/[0.04]">
              {skills.length} skills
            </span>
          </div>
          {editMode && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleSaveSkills}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save'}
            </motion.button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {skills.map((skill) => (
              <motion.div
                key={skill}
                layout
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
                  'bg-purple-500/10 border-purple-500/25 text-purple-300'
                )}
              >
                <span>{skill}</span>
                {editMode && (
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:bg-purple-500/30 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {editMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5"
            >
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); }}
                placeholder="Add skill..."
                className="bg-white/[0.04] border border-white/[0.1] rounded-full px-3 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 w-32"
              />
              <button
                onClick={addSkill}
                className="p-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors"
                aria-label="Add skill"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {!editMode && skills.length === 0 && (
            <p className="text-sm text-gray-500 italic">No skills added yet. Click Edit to add some.</p>
          )}
        </div>
      </GlassCard>

      {/* ============ ACTIVITY TIMELINE ============ */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">Recent Activity</h3>
        </div>

        {timeline.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-6">No recent activity to show.</p>
        ) : (
          <div className="relative pl-8">
            {/* Vertical gradient line */}
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gradient-to-b from-purple-500 via-cyan-500 to-transparent" />

            <div className="space-y-5">
              {timeline.map((item: any, i: number) => {
                const Icon = timelineIcons[item.icon] || Calendar;
                const iconColors = timelineColors[item.icon] || timelineColors.calendar;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="relative"
                  >
                    {/* Dot */}
                    <div
                      className={cn(
                        'absolute -left-[26px] top-1 w-5 h-5 rounded-full border flex items-center justify-center',
                        iconColors
                      )}
                    >
                      <Icon className="w-2.5 h-2.5" />
                    </div>
                    <div className="group p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all">
                      <p className="text-sm text-gray-200 mb-1">{item.title}</p>
                      <p className="text-xs text-gray-500">{formatRelativeTime(item.date)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </GlassCard>

      {/* ============ ASK AI CTA ============ */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => openChatWithContext("Tell me about my profile, achievements, and skill roadmap. How can I improve my profile for better placements?")}
        className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-cyan-500/10 border border-white/[0.08] hover:border-purple-500/30 transition-all flex items-center justify-center gap-2 text-sm text-gray-300"
      >
        <Bot className="w-4 h-4 text-purple-400" />
        Ask AI about my profile, achievements or skill roadmap
      </motion.button>
    </div>
  );
}
