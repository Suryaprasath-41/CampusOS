'use client';

import { useState, useEffect } from 'react';
import { fetchAPI, deleteAPI } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trash2, RefreshCw, MessageSquare, Clock, Tag, ChevronDown, ChevronUp, AlertCircle, Database } from 'lucide-react';
import { GlassCard, SectionTitle } from './WidgetCard';
import AnimatedCounter from './AnimatedCounter';

interface Memory {
  id: string;
  category: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  role: string;
  agentType: string | null;
  content: string;
  createdAt: string;
}

export default function AiMemorySection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMem, setExpandedMem] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchAPI('/ai-memory');
        if (active) setData(res);
      } catch (e: any) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteAPI(`/ai-memory?id=${id}`);
      setData((prev: any) => ({
        ...prev,
        memories: prev.memories.filter((m: Memory) => m.id !== id),
        totalMemories: prev.totalMemories - 1,
        memoriesByCategory: {
          ...prev.memoriesByCategory,
          [prev.memories.find((m: Memory) => m.id === id)?.category]:
            (prev.memoriesByCategory[prev.memories.find((m: Memory) => m.id === id)?.category] || 1) - 1,
        },
      }));
    } catch { /* ignore */ }
    setDeleting(null);
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all AI memories? This cannot be undone.')) return;
    try {
      await deleteAPI('/ai-memory');
      setData((prev: any) => ({ ...prev, memories: [], totalMemories: 0, memoriesByCategory: {} }));
    } catch { /* ignore */ }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/ai-memory');
      setData(res);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 h-full overflow-y-auto">
        <div className="h-8 w-48 bg-[var(--bg-card)] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[var(--bg-card)] rounded-2xl animate-pulse" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-[var(--bg-card)] rounded-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <GlassCard className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-3" />
          <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-purple-600 rounded-xl text-sm text-white hover:bg-purple-700 transition-colors">
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  const categories = Object.keys(data?.memoriesByCategory || {});
  const filteredMemories = filterCat === 'all'
    ? data?.memories || []
    : (data?.memories || []).filter((m: Memory) => m.category === filterCat);

  const catColors: Record<string, string> = {
    goal: 'from-purple-500 to-violet-600',
    learning_style: 'from-cyan-500 to-blue-600',
    preference: 'from-green-500 to-emerald-600',
    weak_subject: 'from-red-500 to-rose-600',
    strength: 'from-yellow-500 to-amber-600',
    personality: 'from-pink-500 to-rose-600',
    schedule: 'from-orange-500 to-red-600',
  };

  const catBgColors: Record<string, string> = {
    goal: 'bg-purple-500/10 border-purple-500/20',
    learning_style: 'bg-cyan-500/10 border-cyan-500/20',
    preference: 'bg-green-500/10 border-green-500/20',
    weak_subject: 'bg-red-500/10 border-red-500/20',
    strength: 'bg-yellow-500/10 border-yellow-500/20',
    personality: 'bg-pink-500/10 border-pink-500/20',
    schedule: 'bg-orange-500/10 border-orange-500/20',
  };

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <SectionTitle>AI Memory Center</SectionTitle>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--glass-bg)] transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <button onClick={handleClearAll} className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-[var(--text-muted)]">Total Memories</span>
          </div>
          <AnimatedCounter value={data?.totalMemories || 0} className="text-2xl font-bold text-[var(--text-primary)]" />
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs text-[var(--text-muted)]">Categories</span>
          </div>
          <AnimatedCounter value={categories.length} className="text-2xl font-bold text-[var(--text-primary)]" />
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-[var(--text-muted)]">Conversations</span>
          </div>
          <AnimatedCounter value={data?.totalConversations || 0} className="text-2xl font-bold text-[var(--text-primary)]" />
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs text-[var(--text-muted)]">Memory Density</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {data?.totalConversations ? ((data.totalMemories / data.totalConversations) * 100).toFixed(0) : 0}%
          </div>
        </GlassCard>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            filterCat === 'all'
              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:bg-[var(--glass-bg)]'
          }`}
        >
          All ({data?.memories?.length || 0})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              filterCat === cat
                ? `${catBgColors[cat] || 'bg-purple-500/10 border-purple-500/20'} text-[var(--text-primary)]`
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:bg-[var(--glass-bg)]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${catColors[cat] || 'from-gray-500 to-gray-600'}`} />
            {cat.replace('_', ' ')} ({data.memoriesByCategory[cat]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Memory Cards */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Stored Memories</h3>
          <AnimatePresence>
            {filteredMemories.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Brain className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-[var(--text-muted)] text-sm">No memories found</p>
                <p className="text-[var(--text-muted)] text-xs mt-1">Chat with the AI to generate memories</p>
              </motion.div>
            ) : (
              filteredMemories.map((mem: Memory, i: number) => (
                <motion.div
                  key={mem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.04 }}
                  className="group"
                >
                  <GlassCard className="p-4 hover:border-purple-500/20">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${catColors[mem.category] || 'from-gray-500 to-gray-600'} flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-lg`}>
                        {mem.category[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${catBgColors[mem.category] || 'bg-[var(--bg-card)] border-[var(--border-color)]'} border font-medium capitalize`}>
                            {mem.category.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(mem.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-sm text-[var(--text-secondary)] ${expandedMem !== mem.id ? 'line-clamp-2' : ''}`}>
                          {mem.content}
                        </p>
                        {mem.content.length > 100 && (
                          <button
                            onClick={() => setExpandedMem(expandedMem === mem.id ? null : mem.id)}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 mt-1 flex items-center gap-1"
                          >
                            {expandedMem === mem.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {expandedMem === mem.id ? 'Less' : 'More'}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(mem.id)}
                        disabled={deleting === mem.id}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      >
                        <Trash2 className={`w-3.5 h-3.5 ${deleting === mem.id ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Recent Conversations Sidebar */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Recent Conversations</h3>
          {(data?.recentConversations || []).map((conv: Conversation, i: number) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-3">
                <div className="flex items-start gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] ${
                    conv.role === 'user'
                      ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                      : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                  }`}>
                    {conv.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{conv.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {conv.agentType && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] capitalize">
                          {conv.agentType}
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}

          {/* Memory Categories Visualization */}
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-6 mb-3">Category Distribution</h3>
          {categories.map((cat, i) => {
            const count = data.memoriesByCategory[cat];
            const pct = data.totalMemories > 0 ? (count / data.totalMemories) * 100 : 0;
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <GlassCard className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${catColors[cat] || 'from-gray-500 to-gray-600'}`} />
                      <span className="text-xs text-[var(--text-secondary)] capitalize">{cat.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">{count}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${catColors[cat] || 'from-gray-500 to-gray-600'}`}
                    />
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
