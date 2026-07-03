'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Send, Info, AlertTriangle, Siren, Users, GraduationCap,
  BookOpen, Clock, Eye, CheckCircle2, X, Smartphone, Sparkles,
  Radio, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { postAPI } from '@/lib/store';
import { GlassCard } from './WidgetCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────
const typeOptions = [
  { value: 'info', label: 'Info', icon: Info, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', dot: 'bg-cyan-400' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-400' },
  { value: 'urgent', label: 'Urgent', icon: Siren, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
];

const departments = [
  'Computer Science',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Information Technology',
  'Chemical Engineering',
  'Biotechnology',
  'Aerospace Engineering',
  'Artificial Intelligence',
  'Data Science',
];

const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

// ─── Recent Broadcasts (mock) ────────────────────────────────────────
const recentBroadcasts = [
  { id: 1, title: 'Semester Exam Schedule Update', type: 'info', target: 'All Users', reach: 2451, sentAt: '2 hours ago' },
  { id: 2, title: 'Campus WiFi Maintenance Notice', type: 'warning', target: 'Computer Science, Sem 5-6', reach: 312, sentAt: '5 hours ago' },
  { id: 3, title: 'Emergency: Water Supply Disruption', type: 'urgent', target: 'All Users', reach: 2451, sentAt: '1 day ago' },
  { id: 4, title: 'Placement Drive Registration Open', type: 'info', target: 'All Semesters', reach: 1890, sentAt: '2 days ago' },
  { id: 5, title: 'Library Hours Extended', type: 'info', target: 'All Users', reach: 2451, sentAt: '3 days ago' },
];

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════
export default function AdminNotificationBroadcaster() {
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [targetMode, setTargetMode] = useState<'all' | 'department' | 'semester' | 'both'>('all');
  const [targetDepartment, setTargetDepartment] = useState('');
  const [targetSemester, setTargetSemester] = useState('');
  const [sending, setSending] = useState(false);

  const typeConf = typeOptions.find(t => t.value === type) || typeOptions[0];
  const TypeIcon = typeConf.icon;

  const isFormValid = title.trim() && message.trim();

  // Estimated reach (mock calculation)
  const estimatedReach = useMemo(() => {
    if (targetMode === 'all') return 2451;
    if (targetMode === 'department') return targetDepartment ? Math.floor(180 + Math.random() * 60) : 0;
    if (targetMode === 'semester') return targetSemester ? Math.floor(280 + Math.random() * 40) : 0;
    if (targetMode === 'both') return (targetDepartment && targetSemester) ? Math.floor(25 + Math.random() * 15) : 0;
    return 0;
  }, [targetMode, targetDepartment, targetSemester]);

  const handleSend = async () => {
    if (!isFormValid) return;
    setSending(true);
    try {
      const payload: any = {
        title: title.trim(),
        message: message.trim(),
        type,
        targetAll: targetMode === 'all',
      };
      if (targetMode === 'department' || targetMode === 'both') {
        payload.targetDepartment = targetDepartment;
      }
      if (targetMode === 'semester' || targetMode === 'both') {
        payload.targetSemester = parseInt(targetSemester);
      }

      const result = await postAPI('/admin/notifications/broadcast', payload);

      toast.success('Notification Sent Successfully!', {
        description: `Reached ${result.notificationsCreated || result.targetUserCount || estimatedReach} users`,
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        duration: 4000,
      });

      // Reset form
      setTitle('');
      setMessage('');
      setType('info');
      setTargetMode('all');
      setTargetDepartment('');
      setTargetSemester('');
    } catch (err: any) {
      toast.error('Failed to send notification', {
        description: err.message || 'Something went wrong',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5 pt-2">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Notification Broadcaster</h2>
          <p className="text-xs text-gray-500">Send targeted notifications to campus users</p>
        </div>
      </div>

      {/* ─── Compose + Preview Layout ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Compose Panel (3/5) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-3"
        >
          <GlassCard className="relative overflow-hidden">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-50" />

            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">Compose Notification</h3>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title..."
                  className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl h-10"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Message</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your notification message..."
                  rows={4}
                  className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl resize-none"
                />
              </div>

              {/* Type Selector */}
              <div>
                <label className="text-xs text-gray-400 font-medium mb-2 block">Notification Type</label>
                <div className="flex gap-2">
                  {typeOptions.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setType(opt.value)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 border",
                        type === opt.value
                          ? `${opt.bg} ${opt.color} border-current/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]`
                          : 'bg-white/[0.02] text-gray-500 border-white/[0.06] hover:text-gray-300 hover:border-white/[0.1]'
                      )}
                    >
                      <opt.icon className="w-3.5 h-3.5" />
                      {opt.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Target Selection */}
              <div>
                <label className="text-xs text-gray-400 font-medium mb-2 block">Target Audience</label>
                <div className="space-y-3">
                  {/* Radio options */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'all' as const, label: 'All Users', icon: Users },
                      { value: 'department' as const, label: 'Department', icon: GraduationCap },
                      { value: 'semester' as const, label: 'Semester', icon: BookOpen },
                      { value: 'both' as const, label: 'Dept + Sem', icon: Sparkles },
                    ].map((opt) => (
                      <motion.button
                        key={opt.value}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setTargetMode(opt.value)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border",
                          targetMode === opt.value
                            ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                            : 'bg-white/[0.02] text-gray-500 border-white/[0.06] hover:text-gray-300 hover:border-white/[0.1]'
                        )}
                      >
                        <opt.icon className="w-3.5 h-3.5" />
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Conditional dropdowns */}
                  <AnimatePresence mode="wait">
                    {(targetMode === 'department' || targetMode === 'both') && (
                      <motion.div
                        key="dept"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative">
                          <select
                            value={targetDepartment}
                            onChange={(e) => setTargetDepartment(e.target.value)}
                            className="w-full appearance-none bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 pr-8 text-sm text-gray-300 hover:border-white/[0.12] focus:outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 transition-all cursor-pointer"
                          >
                            <option value="" className="bg-[#0a0a1a]">Select Department</option>
                            {departments.map((d) => (
                              <option key={d} value={d} className="bg-[#0a0a1a]">{d}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {(targetMode === 'semester' || targetMode === 'both') && (
                      <motion.div
                        key="sem"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative">
                          <select
                            value={targetSemester}
                            onChange={(e) => setTargetSemester(e.target.value)}
                            className="w-full appearance-none bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 pr-8 text-sm text-gray-300 hover:border-white/[0.12] focus:outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 transition-all cursor-pointer"
                          >
                            <option value="" className="bg-[#0a0a1a]">Select Semester</option>
                            {semesters.map((s) => (
                              <option key={s} value={s.toString()} className="bg-[#0a0a1a]">Semester {s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Estimated Reach */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Estimated Reach</span>
                </div>
                <span className="text-sm font-bold text-white">~{estimatedReach.toLocaleString()} users</span>
              </div>

              {/* Send Button */}
              <motion.button
                whileHover={isFormValid ? { scale: 1.02 } : {}}
                whileTap={isFormValid ? { scale: 0.98 } : {}}
                disabled={!isFormValid || sending}
                onClick={handleSend}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden",
                  isFormValid && !sending
                    ? "bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]"
                    : "bg-white/[0.04] text-gray-600 cursor-not-allowed"
                )}
              >
                {/* Shine animation */}
                {isFormValid && !sending && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                  />
                )}
                {sending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Send className="w-4 h-4" />
                    </motion.div>
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Broadcast Notification
                  </>
                )}
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Preview Panel (2/5) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-2"
        >
          <GlassCard className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 font-medium">Live Preview</span>
            </div>

            {/* Phone Mockup */}
            <div className="relative mx-auto w-full max-w-[280px]">
              {/* Phone frame */}
              <div className="relative bg-[#0d0d1a] rounded-[2rem] border-2 border-white/[0.08] p-2 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0d0d1a] rounded-b-2xl z-10" />
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/[0.08] rounded-full z-20" />

                {/* Screen */}
                <div className="bg-[#080816] rounded-[1.5rem] p-4 pt-8 min-h-[380px]">
                  {/* Time bar */}
                  <div className="flex items-center justify-between mb-6 px-1">
                    <span className="text-[10px] text-gray-500 font-medium">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-1.5 rounded-sm border border-gray-600 relative">
                        <div className="absolute inset-[1px] right-[2px] bg-emerald-400 rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* Notification card preview */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${title}-${message}-${type}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border shrink-0", typeConf.bg)}>
                          <TypeIcon className={cn("w-4 h-4", typeConf.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-semibold text-white truncate">
                              {title || 'Notification Title'}
                            </p>
                            <div className={cn("w-2 h-2 rounded-full shrink-0", typeConf.dot)} />
                          </div>
                          <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-4">
                            {message || 'Your notification message will appear here...'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-2.5 h-2.5 text-gray-600" />
                            <span className="text-[9px] text-gray-600">Just now</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Mock older notification */}
                  <div className="mt-3 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 opacity-50">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                        <Info className="w-3 h-3 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-gray-400">Previous notification</p>
                        <p className="text-[9px] text-gray-600">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ─── Recent Broadcasts ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-white">Recent Broadcasts</h3>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/[0.04] text-gray-500 border border-white/[0.06]">
              Last 7 days
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {recentBroadcasts.map((broadcast, i) => {
              const bType = typeOptions.find(t => t.value === broadcast.type) || typeOptions[0];
              const BIcon = bType.icon;

              return (
                <motion.div
                  key={broadcast.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all duration-200"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border shrink-0", bType.bg)}>
                    <BIcon className={cn("w-4 h-4", bType.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{broadcast.title}</p>
                    <p className="text-[10px] text-gray-500">{broadcast.target} &middot; {broadcast.sentAt}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-white">{broadcast.reach.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-600">users</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
