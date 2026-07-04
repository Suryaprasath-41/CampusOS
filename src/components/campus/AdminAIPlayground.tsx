'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Brain, BookOpen, GraduationCap, Library, Shield, Zap,
  Send, Clock, Hash, ChevronRight, RotateCcw, Save, Sparkles,
  CheckCircle2, XCircle, ArrowRight, Loader2, MessageSquare,
  Cpu, Eye, ToggleLeft, ToggleRight, Lightbulb, TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { postAPI } from '@/lib/store';
import { toast } from 'sonner';

// ─── Agent Configuration ──────────────────────────────────────────────
const AGENTS = [
  {
    id: 'master',
    name: 'Master Agent',
    description: 'Orchestrates all agent responses',
    icon: Bot,
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    glow: 'rgba(139,92,246,0.3)',
    alwaysOn: true,
    prompt: `You are CampusOS AI, the Master Agent of an intelligent campus operating system. You help students with anything related to their college life - attendance, academics, placements, library, hostel, finance, and events. Be concise, helpful, and friendly. Use emojis sparingly. Provide specific data-driven answers when possible. If you don't know something, give general helpful advice.`,
  },
  {
    id: 'attendance',
    name: 'Attendance Agent',
    description: 'Attendance analysis & predictions',
    icon: Eye,
    gradient: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    glow: 'rgba(6,182,212,0.3)',
    prompt: `You are the Attendance Intelligence Agent of CampusOS AI. You specialize in attendance analysis, predictions, and advice. Tell students their attendance status, predict future attendance, calculate safe leaves, and suggest strategies to maintain minimum attendance. Always mention risk levels. Be data-driven and specific.`,
  },
  {
    id: 'placement',
    name: 'Placement Agent',
    description: 'Career & placement guidance',
    icon: TrendingUp,
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-600 dark:text-green-400',
    glow: 'rgba(34,197,94,0.3)',
    prompt: `You are the Placement Agent of CampusOS AI. You help students prepare for placements. Analyze their skills, suggest improvements, recommend companies, create study roadmaps, and provide interview tips. Be motivating but realistic. Focus on actionable advice.`,
  },
  {
    id: 'library',
    name: 'Library Agent',
    description: 'Book search & recommendations',
    icon: Library,
    gradient: 'from-orange-500 to-red-600',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    glow: 'rgba(249,115,22,0.3)',
    prompt: `You are the Library AI Agent of CampusOS AI. You help students find books, check availability, recommend reading materials, and manage their library account. Suggest books based on courses and interests. Be knowledgeable about academic resources.`,
  },
  {
    id: 'academic',
    name: 'Faculty Agent',
    description: 'Academic & faculty queries',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    glow: 'rgba(59,130,246,0.3)',
    prompt: `You are the Academic Planner Agent of CampusOS AI. You help students with schedules, assignments, exam preparation, study plans, and subject-related queries. Be organized and provide structured advice. Help prioritize tasks.`,
  },
  {
    id: 'knowledge',
    name: 'Knowledge Agent',
    description: 'Campus knowledge & FAQ',
    icon: BookOpen,
    gradient: 'from-yellow-500 to-amber-600',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    glow: 'rgba(234,179,8,0.3)',
    prompt: `You are the Knowledge Base Agent of CampusOS AI. You have access to the campus knowledge base including rules, regulations, important dates, and frequently asked questions. Provide accurate, well-sourced answers. Reference official documents when possible.`,
  },
];

// ─── Mock Execution Chain Data ────────────────────────────────────────
const MOCK_CHAIN = [
  { agentId: 'user', label: 'User Query', time: '0ms', tokens: 12, status: 'success' as const },
  { agentId: 'master', label: 'Master Agent', time: '45ms', tokens: 86, status: 'success' as const },
  { agentId: 'attendance', label: 'Attendance Agent', time: '230ms', tokens: 342, status: 'success' as const },
  { agentId: 'knowledge', label: 'Knowledge Base', time: '120ms', tokens: 158, status: 'success' as const },
  { agentId: 'response', label: 'Final Response', time: '89ms', tokens: 256, status: 'success' as const },
];

const MOCK_TOP_QUESTIONS = [
  { question: 'What is my attendance?', count: 342, pct: 100 },
  { question: 'Am I eligible for placement?', count: 287, pct: 84 },
  { question: 'When is the next exam?', count: 234, pct: 68 },
  { question: 'What books are available?', count: 198, pct: 58 },
  { question: 'What are my pending fees?', count: 156, pct: 46 },
];

// ─── Message Interface ────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentType: string;
  timestamp: Date;
  responseTime?: number;
  tokens?: number;
  chainAgents?: string[];
}

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════
export default function AdminAIPlayground() {
  const [activeAgents, setActiveAgents] = useState<Record<string, boolean>>({
    master: true,
    attendance: true,
    placement: true,
    library: true,
    academic: true,
    knowledge: true,
  });
  const [selectedPromptAgent, setSelectedPromptAgent] = useState('master');
  const [promptTexts, setPromptTexts] = useState<Record<string, string>>(
    Object.fromEntries(AGENTS.map(a => [a.id, a.prompt]))
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'user',
      content: 'What is the attendance trend for CS department this semester?',
      agentType: 'user',
      timestamp: new Date(Date.now() - 120000),
      responseTime: 0,
    },
    {
      id: '2',
      role: 'assistant',
      content: 'The CS department shows an average attendance of 87.3% this semester, which is a 2.1% increase from last semester. The Attendance Agent identified that Tuesdays and Thursdays have the lowest attendance (82.1%), primarily due to the 8:30 AM Machine Learning lab. 23 students are currently below the 75% threshold, with 8 at critical risk levels.',
      agentType: 'master',
      timestamp: new Date(Date.now() - 118000),
      responseTime: 1240,
      tokens: 156,
      chainAgents: ['master', 'attendance', 'knowledge'],
    },
    {
      id: '3',
      role: 'user',
      content: 'Which students need immediate attention?',
      agentType: 'user',
      timestamp: new Date(Date.now() - 60000),
      responseTime: 0,
    },
    {
      id: '4',
      role: 'assistant',
      content: 'Based on the Attendance Agent analysis, here are the 8 students at critical risk (< 65% attendance):\n\n1. Arjun Mehta (CS2024008) - 58.2% - 5 subjects affected\n2. Priya Sharma (CS2024023) - 61.4% - 3 subjects affected\n3. Rahul Kumar (CS2024041) - 63.1% - 4 subjects affected\n\nThe Knowledge Agent suggests sending automated notifications to these students and their guardians. Would you like me to draft the notification?',
      agentType: 'master',
      timestamp: new Date(Date.now() - 57000),
      responseTime: 2100,
      tokens: 234,
      chainAgents: ['master', 'attendance', 'knowledge'],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executionChain, setExecutionChain] = useState(MOCK_CHAIN);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [totalTokens, setTotalTokens] = useState(18420);
  const [avgTokens, setAvgTokens] = useState(287);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleAgent = useCallback((agentId: string) => {
    if (agentId === 'master') return;
    setActiveAgents(prev => ({ ...prev, [agentId]: !prev[agentId] }));
  }, []);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      agentType: 'user',
      timestamp: new Date(),
      responseTime: 0,
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Build execution chain based on active agents
    const activeAgentIds = Object.entries(activeAgents).filter(([, on]) => on).map(([id]) => id);
    const chainAgents = activeAgentIds.filter(id => id !== 'master').slice(0, 2);
    const startTime = Date.now();

    try {
      const data = await postAPI('/chat', {
        message: userMsg.content,
        studentId: 'admin',
        agentType: 'master',
      });

      const responseTime = Date.now() - startTime;
      const mockTokens = Math.floor(Math.random() * 200) + 100;

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I couldn\'t process that request.',
        agentType: data.agentType || 'master',
        timestamp: new Date(),
        responseTime,
        tokens: mockTokens,
        chainAgents: ['master', ...chainAgents],
      };
      setMessages(prev => [...prev, assistantMsg]);
      setTotalTokens(prev => prev + mockTokens);
      setAvgTokens(prev => Math.round((prev + mockTokens) / 2));

      // Update execution chain
      setExecutionChain([
        { agentId: 'user', label: 'User Query', time: '0ms', tokens: userMsg.content.split(' ').length, status: 'success' },
        { agentId: 'master', label: 'Master Agent', time: `${Math.floor(responseTime * 0.15)}ms`, tokens: Math.floor(mockTokens * 0.3), status: 'success' },
        ...chainAgents.map(id => {
          const agent = AGENTS.find(a => a.id === id);
          return {
            agentId: id,
            label: agent?.name || id,
            time: `${Math.floor(Math.random() * 300 + 50)}ms`,
            tokens: Math.floor(Math.random() * 200 + 50),
            status: 'success' as const,
          };
        }),
        { agentId: 'response', label: 'Final Response', time: `${Math.floor(responseTime * 0.3)}ms`, tokens: Math.floor(mockTokens * 0.5), status: 'success' as const },
      ]);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Failed to get a response. Please try again.',
        agentType: 'master',
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
        tokens: 0,
        chainAgents: ['master'],
      };
      setMessages(prev => [...prev, errorMsg]);
    }
    setIsLoading(false);
  }, [inputValue, isLoading, activeAgents]);

  const getAgentInfo = (id: string) => AGENTS.find(a => a.id === id) || AGENTS[0];

  return (
    <div className="space-y-4 pt-2">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-purple-500/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050510]/80" />
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

        <div className="relative z-10 flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 0 25px rgba(139,92,246,0.3)' }}
          >
            <Bot className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              AI Playground
            </h2>
            <p className="text-[var(--text-muted)] text-xs mt-0.5">Test prompts, configure agent chains, and monitor AI performance</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">6 Agents Online</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* ─── Left Panel: Agent Configuration (30%) ────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Agents List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--border-color)] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Active Agents</h3>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {Object.values(activeAgents).filter(Boolean).length}/{AGENTS.length}
              </span>
            </div>

            <div className="space-y-2">
              {AGENTS.map((agent, i) => {
                const isActive = activeAgents[agent.id];
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                      isActive
                        ? "bg-[var(--glass-bg)] border-[var(--border-color)]"
                        : "bg-transparent border-white/[0.04] opacity-50"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border shrink-0", agent.bg, agent.border)}>
                      <agent.icon className={cn("w-4 h-4", agent.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[var(--text-primary)] truncate">{agent.name}</span>
                        {isActive ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">ACTIVE</span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-500/10 text-[var(--text-muted)] border border-gray-500/20 font-medium">OFF</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{agent.description}</p>
                    </div>
                    {agent.alwaysOn ? (
                      <div className="w-8 h-4 rounded-full bg-purple-500/30 flex items-center justify-end pr-0.5">
                        <div className="w-3 h-3 rounded-full bg-purple-400" />
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleAgent(agent.id)}
                        className={cn(
                          "w-8 h-4 rounded-full flex items-center transition-all duration-300",
                          isActive ? "bg-emerald-500/30 justify-end pr-0.5" : "bg-[var(--bg-card)] justify-start pl-0.5"
                        )}
                      >
                        <motion.div
                          layout
                          className={cn(
                            "w-3 h-3 rounded-full",
                            isActive ? "bg-emerald-400" : "bg-gray-600"
                          )}
                        />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Prompt Manager */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--border-color)] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Prompt Manager</h3>
            </div>

            {/* Agent Selector */}
            <div className="mb-3">
              <select
                value={selectedPromptAgent}
                onChange={(e) => setSelectedPromptAgent(e.target.value)}
                className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-purple-500/30 transition-colors appearance-none cursor-pointer"
              >
                {AGENTS.map(a => (
                  <option key={a.id} value={a.id} className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt Textarea */}
            <div className="relative mb-3">
              <textarea
                value={promptTexts[selectedPromptAgent] || ''}
                onChange={(e) => setPromptTexts(prev => ({ ...prev, [selectedPromptAgent]: e.target.value }))}
                className="w-full h-36 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-[11px] text-[var(--text-secondary)] leading-relaxed resize-none focus:outline-none focus:border-purple-500/30 transition-colors font-mono"
                placeholder="Enter system prompt..."
              />
              <div className="absolute bottom-2 right-2 text-[9px] text-[var(--text-muted)]">
                {(promptTexts[selectedPromptAgent] || '').length} chars
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toast.success('Prompt saved successfully!')}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-500/15 transition-colors"
              >
                <Save className="w-3 h-3" />
                Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const agent = AGENTS.find(a => a.id === selectedPromptAgent);
                  if (agent) {
                    setPromptTexts(prev => ({ ...prev, [selectedPromptAgent]: agent.prompt }));
                    toast.info('Prompt reset to default');
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* ─── Center Panel: Prompt Testing (40%) ───────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-4 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl flex flex-col hover:border-[var(--border-color)] transition-all duration-300"
          style={{ minHeight: '600px', maxHeight: 'calc(100vh - 14rem)' }}
        >
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Prompt Testing</h3>
              <p className="text-[10px] text-[var(--text-muted)]">Test prompts with the AI agent chain</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={cn(
                    "flex gap-3",
                    msg.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1",
                    msg.role === 'user'
                      ? "bg-blue-500/10 border border-blue-500/20"
                      : "bg-purple-500/10 border border-purple-500/20"
                  )}>
                    {msg.role === 'user' ? (
                      <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl p-3.5",
                    msg.role === 'user'
                      ? "bg-blue-500/10 border border-blue-500/15"
                      : "bg-[var(--glass-bg)] border border-[var(--border-color)]"
                  )}>
                    {/* Agent attribution for assistant */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.04]">
                        {(() => {
                          const agent = getAgentInfo(msg.agentType);
                          return (
                            <>
                              <agent.icon className={cn("w-3 h-3", agent.text)} />
                              <span className={cn("text-[10px] font-medium", agent.text)}>{agent.name}</span>
                            </>
                          );
                        })()}
                        {msg.responseTime && (
                          <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {msg.responseTime}ms
                          </span>
                        )}
                        {msg.tokens && (
                          <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-1">
                            <Hash className="w-2.5 h-2.5" />
                            {msg.tokens} tokens
                          </span>
                        )}
                      </div>
                    )}

                    {/* Chain indicator */}
                    {msg.role === 'assistant' && msg.chainAgents && (
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        {msg.chainAgents.map((agentId, j) => {
                          const agent = getAgentInfo(agentId);
                          return (
                            <span key={j} className="flex items-center gap-1">
                              {j > 0 && <ChevronRight className="w-2.5 h-2.5 text-[var(--text-muted)]" />}
                            <span className={cn(
                              "text-[8px] px-1.5 py-0.5 rounded-md border font-medium",
                              agent.bg, agent.border, agent.text
                            )}>
                              {agent.name.split(' ')[0]}
                            </span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{msg.content}</p>
                    <div className="text-[9px] text-[var(--text-muted)] mt-2">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-3.5">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-purple-600 dark:text-purple-400 animate-spin" />
                    <span className="text-xs text-[var(--text-muted)]">Processing through agent chain...</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {['Master', 'Attendance', 'Knowledge'].map((name, j) => (
                      <motion.span
                        key={name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: j * 0.3 }}
                        className="text-[8px] px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                      >
                        {name}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Test a prompt..."
                  className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-purple-500/30 transition-colors pr-10"
                  disabled={isLoading}
                />
                <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                  inputValue.trim() && !isLoading
                    ? "bg-gradient-to-br from-purple-500 to-violet-600 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                    : "bg-[var(--glass-bg)] border border-[var(--border-color)]"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-[var(--text-muted)] animate-spin" />
                ) : (
                  <Send className={cn("w-4 h-4", inputValue.trim() ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")} />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ─── Right Panel: Execution Chain (30%) ───────────── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Execution Chain Visualization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--border-color)] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Execution Chain</h3>
              <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-medium">
                LAST QUERY
              </span>
            </div>

            <div className="space-y-0">
              {executionChain.map((node, i) => {
                const agent = AGENTS.find(a => a.id === node.agentId);
                const isLast = i === executionChain.length - 1;
                const isUser = node.agentId === 'user';
                const isResponse = node.agentId === 'response';

                return (
                  <div key={i}>
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--glass-bg)] border border-white/[0.04] hover:border-[var(--border-color)] transition-all duration-300"
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center border shrink-0",
                        isUser ? "bg-blue-500/10 border-blue-500/20" :
                        isResponse ? "bg-emerald-500/10 border-emerald-500/20" :
                        agent ? `${agent.bg} ${agent.border}` :
                        "bg-gray-500/10 border-gray-500/20"
                      )}>
                        {isUser ? (
                          <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        ) : isResponse ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : agent ? (
                          <agent.icon className={cn("w-3.5 h-3.5", agent.text)} />
                        ) : (
                          <Cpu className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-[var(--text-primary)]">{node.label}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-0.5">
                            <Clock className="w-2 h-2" />
                            {node.time}
                          </span>
                          <span className="text-[9px] text-[var(--text-muted)] flex items-center gap-0.5">
                            <Hash className="w-2 h-2" />
                            {node.tokens} tok
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center",
                        node.status === 'success' ? "bg-emerald-500/20" : "bg-red-500/20"
                      )}>
                        {node.status === 'success' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </motion.div>

                    {/* Animated connector line */}
                    {!isLast && (
                      <div className="flex justify-center py-1">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 16, opacity: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="w-px bg-gradient-to-b from-purple-500/30 to-cyan-500/30 relative"
                        >
                          <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400"
                          />
                        </motion.div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Token Usage Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--border-color)] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Token Usage</h3>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[var(--glass-bg)] rounded-xl p-3 border border-white/[0.04]">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{totalTokens.toLocaleString()}</div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Total Today</div>
              </div>
              <div className="bg-[var(--glass-bg)] rounded-xl p-3 border border-white/[0.04]">
                <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{avgTokens}</div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Avg/Request</div>
              </div>
              <div className="bg-[var(--glass-bg)] rounded-xl p-3 border border-white/[0.04]">
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${(totalTokens * 0.00002).toFixed(2)}</div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Est. Cost</div>
              </div>
            </div>

            {/* Usage bar */}
            <div className="mb-1">
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-[var(--text-muted)]">Daily Quota Usage</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">{Math.round(totalTokens / 500)}%</span>
              </div>
              <div className="h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, totalTokens / 500)}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                />
              </div>
            </div>
          </motion.div>

          {/* Most Asked Questions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--border-color)] transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Questions</h3>
            </div>

            <div className="space-y-3">
              {MOCK_TOP_QUESTIONS.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[var(--text-secondary)] truncate max-w-[70%]">{q.question}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{q.count}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${q.pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.8 + i * 0.05 }}
                      className={cn(
                        "h-full rounded-full",
                        i === 0 ? "bg-gradient-to-r from-purple-500 to-violet-500" :
                        i === 1 ? "bg-gradient-to-r from-cyan-500 to-blue-500" :
                        i === 2 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                        i === 3 ? "bg-gradient-to-r from-orange-500 to-amber-500" :
                        "bg-gradient-to-r from-gray-500 to-slate-500"
                      )}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
