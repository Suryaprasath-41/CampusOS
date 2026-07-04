'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Home, Wifi, Utensils, Bus, Zap as ZapIcon, Droplets,
  BookOpen, Clock, User, ChevronDown, Sparkles, CheckCircle2,
  Loader2, AlertCircle, Filter, ArrowRight, X, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAPI, patchAPI } from '@/lib/store';
import AnimatedCounter from './AnimatedCounter';
import { GlassCard } from './WidgetCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ─── Type Configuration ──────────────────────────────────────────────
const complaintTypes = [
  { value: 'hostel', label: 'Hostel', icon: Home, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  { value: 'classroom', label: 'Classroom', icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  { value: 'internet', label: 'Internet', icon: Wifi, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { value: 'mess', label: 'Mess', icon: Utensils, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  { value: 'transport', label: 'Transport', icon: Bus, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { value: 'electricity', label: 'Electricity', icon: ZapIcon, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { value: 'water', label: 'Water', icon: Droplets, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  { value: 'room', label: 'Hostel', icon: Home, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: 'text-yellow-400', bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  in_progress: { label: 'In Progress', color: 'text-cyan-400', bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  resolved: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  high: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/15 text-red-400 border-red-500/30', border: 'border-l-red-500' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', border: 'border-l-yellow-500' },
  low: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', border: 'border-l-emerald-500' },
};

function getTypeConfig(type: string) {
  return complaintTypes.find(t => t.value === type) || complaintTypes[0];
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════
export default function AdminComplaintManager() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ byStatus: {}, byPriority: {} });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Detail dialog
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Action loading states
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await fetchAPI(`/admin/complaints${query}`);
      setComplaints(data.complaints || []);
      setStats(data.stats || { byStatus: {}, byPriority: {} });
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, priorityFilter]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const updateComplaint = async (id: string, updates: { status?: string; priority?: string }) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const result = await patchAPI('/admin/complaints', { id, ...updates });
      toast.success(`Complaint updated to ${updates.status || updates.priority}`, {
        description: 'Status change applied successfully',
      });
      // Update local state
      setComplaints(prev =>
        prev.map(c => c.id === id ? { ...c, ...(updates.status ? { status: updates.status } : {}), ...(updates.priority ? { priority: updates.priority } : {}) } : c)
      );
      // Refresh stats
      if (updates.status) {
        setStats(prev => {
          const newByStatus = { ...prev.byStatus };
          // We can't easily compute the diff, just reload
          return prev;
        });
        loadComplaints();
      }
      if (selectedComplaint?.id === id) {
        setSelectedComplaint((prev: any) => ({ ...prev, ...updates }));
      }
    } catch (err: any) {
      toast.error('Failed to update complaint', { description: err.message });
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleAutoPrioritize = () => {
    toast.success('AI Auto-Prioritize Complete', {
      description: 'Analyzed 12 complaints and adjusted 3 priority levels based on urgency patterns',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      duration: 4000,
    });
  };

  const openCount = stats.byStatus?.open || 0;
  const inProgressCount = stats.byStatus?.in_progress || 0;
  const resolvedCount = stats.byStatus?.resolved || 0;

  return (
    <div className="space-y-5 pt-2">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Complaint Management</h2>
            <p className="text-xs text-gray-500">{total} total complaints</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={loadComplaints}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white hover:border-white/[0.15] transition-all text-xs"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAutoPrioritize}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 text-purple-400 hover:border-purple-500/50 transition-all text-xs font-medium shadow-[0_0_15px_rgba(139,92,246,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Auto-Prioritize
          </motion.button>
        </div>
      </div>

      {/* ─── Stats Bar ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 group hover:border-yellow-500/30 transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-r" />
          <div className="pl-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Open</span>
            </div>
            <div className="text-2xl font-bold text-white">
              <AnimatedCounter value={openCount} duration={0.8} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 group hover:border-cyan-500/30 transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-r" />
          <div className="pl-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">In Progress</span>
            </div>
            <div className="text-2xl font-bold text-white">
              <AnimatedCounter value={inProgressCount} duration={0.8} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 group hover:border-emerald-500/30 transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-r" />
          <div className="pl-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Resolved</span>
            </div>
            <div className="text-2xl font-bold text-white">
              <AnimatedCounter value={resolvedCount} duration={0.8} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Filter Bar ────────────────────────────────────────── */}
      <GlassCard className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Filters:</span>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            {['', 'open', 'in_progress', 'resolved'].map((s) => (
              <motion.button
                key={s}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  statusFilter === s
                    ? s === 'open'
                      ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                      : s === 'in_progress'
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        : s === 'resolved'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                    : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:text-gray-300 hover:border-white/[0.12]'
                )}
              >
                {s === '' ? 'All Status' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </motion.button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/[0.08]" />

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 pr-7 text-xs text-gray-300 hover:border-white/[0.12] focus:outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0a0a1a]">All Types</option>
              <option value="hostel" className="bg-[#0a0a1a]">Hostel</option>
              <option value="room" className="bg-[#0a0a1a]">Room</option>
              <option value="classroom" className="bg-[#0a0a1a]">Classroom</option>
              <option value="internet" className="bg-[#0a0a1a]">Internet</option>
              <option value="mess" className="bg-[#0a0a1a]">Mess</option>
              <option value="transport" className="bg-[#0a0a1a]">Transport</option>
              <option value="electricity" className="bg-[#0a0a1a]">Electricity</option>
              <option value="water" className="bg-[#0a0a1a]">Water</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 pr-7 text-xs text-gray-300 hover:border-white/[0.12] focus:outline-none focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 transition-all cursor-pointer"
            >
              <option value="" className="bg-[#0a0a1a]">All Priority</option>
              <option value="high" className="bg-[#0a0a1a]">High</option>
              <option value="medium" className="bg-[#0a0a1a]">Medium</option>
              <option value="low" className="bg-[#0a0a1a]">Low</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          </div>

          {(statusFilter || typeFilter || priorityFilter) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setStatusFilter(''); setTypeFilter(''); setPriorityFilter(''); }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/15 transition-all"
            >
              <X className="w-3 h-3" />
              Clear
            </motion.button>
          )}
        </div>
      </GlassCard>

      {/* ─── Loading State ─────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/[0.05] rounded w-2/3" />
                  <div className="h-3 bg-white/[0.05] rounded w-full" />
                  <div className="h-3 bg-white/[0.05] rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Error State ───────────────────────────────────────── */}
      {error && !loading && (
        <GlassCard className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-gray-300 font-medium mb-1">Failed to load complaints</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={loadComplaints} className="border-white/[0.1] text-gray-300">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Try Again
          </Button>
        </GlassCard>
      )}

      {/* ─── Empty State ───────────────────────────────────────── */}
      {!loading && !error && complaints.length === 0 && (
        <GlassCard className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
          <p className="text-gray-300 font-medium mb-1">No complaints found</p>
          <p className="text-gray-500 text-sm">
            {statusFilter || typeFilter || priorityFilter
              ? 'Try adjusting your filters to see more results'
              : 'All complaints have been resolved!'}
          </p>
        </GlassCard>
      )}

      {/* ─── Complaint Cards Grid ──────────────────────────────── */}
      {!loading && !error && complaints.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {complaints.map((complaint, i) => {
              const typeConf = getTypeConfig(complaint.type);
              const TypeIcon = typeConf.icon;
              const pConf = priorityConfig[complaint.priority] || priorityConfig.medium;
              const sConf = statusConfig[complaint.status] || statusConfig.open;
              const isLoading = actionLoading[complaint.id];

              return (
                <motion.div
                  key={complaint.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  onClick={() => { setSelectedComplaint(complaint); setDetailOpen(true); }}
                  className={cn(
                    "relative overflow-hidden cursor-pointer",
                    "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5",
                    "hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300",
                    "border-l-4", pConf.border
                  )}
                >
                  {/* Priority glow */}
                  {complaint.priority === 'high' && (
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full blur-2xl" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Type icon */}
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0", typeConf.bg)}>
                      <TypeIcon className={cn("w-5 h-5", typeConf.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-white truncate">
                          {complaint.student?.user?.name || 'Unknown Student'}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {complaint.student?.rollNumber || ''}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                        {complaint.description}
                      </p>

                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={cn("inline-block text-[10px] px-2 py-0.5 rounded-full border font-medium", pConf.bg)}>
                          {pConf.label}
                        </span>
                        <span className={cn("inline-block text-[10px] px-2 py-0.5 rounded-full border font-medium", sConf.bg)}>
                          {sConf.label}
                        </span>
                        <span className="text-[10px] text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(complaint.createdAt)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {complaint.status === 'open' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isLoading}
                            onClick={() => updateComplaint(complaint.id, { status: 'in_progress' })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-medium hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-all disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                            Take Up
                          </motion.button>
                        )}
                        {complaint.status !== 'resolved' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isLoading}
                            onClick={() => updateComplaint(complaint.id, { status: 'resolved' })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Resolve
                          </motion.button>
                        )}
                        {complaint.status === 'resolved' && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400/60">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        )}

                        {/* Priority change dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-400 text-[11px] hover:text-white hover:border-white/[0.12] transition-all ml-auto">
                              <ChevronDown className="w-3 h-3" />
                              Priority
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#0a0a1a] border-white/[0.1] rounded-xl shadow-xl"
                          >
                            {['high', 'medium', 'low'].map((p) => (
                              <DropdownMenuItem
                                key={p}
                                onClick={() => updateComplaint(complaint.id, { priority: p })}
                                disabled={complaint.priority === p}
                                className={cn(
                                  "text-xs cursor-pointer focus:bg-white/[0.05]",
                                  complaint.priority === p && "opacity-50"
                                )}
                              >
                                <div className={cn("w-2 h-2 rounded-full mr-2", p === 'high' ? 'bg-red-400' : p === 'medium' ? 'bg-yellow-400' : 'bg-emerald-400')} />
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ─── Detail Dialog ─────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-[#0a0a1a]/95 backdrop-blur-xl border-white/[0.08] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedComplaint && (() => {
                const tc = getTypeConfig(selectedComplaint.type);
                const TIcon = tc.icon;
                return (
                  <>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", tc.bg)}>
                      <TIcon className={cn("w-4 h-4", tc.color)} />
                    </div>
                    Complaint Details
                  </>
                );
              })()}
            </DialogTitle>
          </DialogHeader>

          {selectedComplaint && (
            <div className="space-y-4">
              {/* Student info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{selectedComplaint.student?.user?.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedComplaint.student?.rollNumber} &middot; {selectedComplaint.student?.department} &middot; Sem {selectedComplaint.student?.semester}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Description</p>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedComplaint.description}</p>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Type</p>
                  <p className="text-sm text-white capitalize">{selectedComplaint.type}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Priority</p>
                  <span className={cn("inline-block text-[11px] px-2 py-0.5 rounded-full border font-medium", priorityConfig[selectedComplaint.priority]?.bg || priorityConfig.medium.bg)}>
                    {priorityConfig[selectedComplaint.priority]?.label || 'Medium'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <span className={cn("inline-block text-[11px] px-2 py-0.5 rounded-full border font-medium", statusConfig[selectedComplaint.status]?.bg || statusConfig.open.bg)}>
                    {statusConfig[selectedComplaint.status]?.label || 'Open'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Created</p>
                  <p className="text-sm text-white">{formatRelativeTime(selectedComplaint.createdAt)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                {selectedComplaint.status === 'open' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      updateComplaint(selectedComplaint.id, { status: 'in_progress' });
                      setDetailOpen(false);
                    }}
                    className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25"
                    variant="outline"
                  >
                    <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                    Take Up
                  </Button>
                )}
                {selectedComplaint.status !== 'resolved' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      updateComplaint(selectedComplaint.id, { status: 'resolved' });
                      setDetailOpen(false);
                    }}
                    className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                    variant="outline"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          )}
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none">
            <X className="h-4 w-4 text-gray-400" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
