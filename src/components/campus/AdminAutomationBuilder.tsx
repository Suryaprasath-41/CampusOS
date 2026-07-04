'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Play, Pause, Trash2, Plus, ChevronRight, ArrowDown,
  AlertTriangle, BookOpen, GraduationCap, Wallet, Shield,
  Clock, CheckCircle2, XCircle, Settings, Sparkles,
  ArrowUpRight, MoreVertical, Eye, RefreshCw, Loader2,
  Layers, GitBranch, ToggleLeft, ToggleRight, Send, Bell,
  FileText, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedCounter from './AnimatedCounter';
import WidgetCard, { GlassCard, SectionTitle, PredictionBar } from './WidgetCard';

// ─── Types ───────────────────────────────────────────────────────────
interface WorkflowBlock {
  id: string;
  type: 'trigger' | 'action' | 'chain';
  label: string;
  config: {
    source?: string;
    operator?: string;
    value?: string;
    actionType?: string;
    target?: string;
    message?: string;
  };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  runCount: number;
  lastRun: string;
  blocks: WorkflowBlock[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// ─── Mock Workflows ──────────────────────────────────────────────────
const initialWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Auto-notify on low attendance',
    description: 'IF attendance < 75%, THEN send notification',
    enabled: true,
    runCount: 234,
    lastRun: '2 hrs ago',
    icon: AlertTriangle,
    color: 'purple',
    blocks: [
      { id: 't1', type: 'trigger', label: 'IF', config: { source: 'Student Attendance', operator: '<', value: '75%' } },
      { id: 'a1', type: 'action', label: 'THEN', config: { actionType: 'Send Notification', target: 'Student + HOD', message: 'Attendance below threshold' } },
    ],
  },
  {
    id: '2',
    name: 'Flag overdue books',
    description: 'IF book overdue > 7 days, THEN flag + notify',
    enabled: true,
    runCount: 89,
    lastRun: '1 hr ago',
    icon: BookOpen,
    color: 'cyan',
    blocks: [
      { id: 't2', type: 'trigger', label: 'IF', config: { source: 'Library Overdue', operator: '>', value: '7 days' } },
      { id: 'a2', type: 'action', label: 'THEN', config: { actionType: 'Flag Record', target: 'Student Record', message: 'Book overdue - flag added' } },
      { id: 'c2', type: 'chain', label: 'AND', config: { actionType: 'Send Notification', target: 'Student', message: 'Return book immediately' } },
    ],
  },
  {
    id: '3',
    name: 'Auto-prioritize complaints',
    description: 'IF complaint type = infrastructure, THEN set priority = high',
    enabled: true,
    runCount: 156,
    lastRun: '30 min ago',
    icon: Shield,
    color: 'green',
    blocks: [
      { id: 't3', type: 'trigger', label: 'IF', config: { source: 'New Complaint', operator: '=', value: 'Infrastructure' } },
      { id: 'a3', type: 'action', label: 'THEN', config: { actionType: 'Set Priority', target: 'Complaint', message: 'Priority set to HIGH' } },
    ],
  },
  {
    id: '4',
    name: 'Placement readiness alert',
    description: 'IF CGPA > 8 AND skills match > 3, THEN add to placement pool',
    enabled: false,
    runCount: 45,
    lastRun: '1 day ago',
    icon: GraduationCap,
    color: 'orange',
    blocks: [
      { id: 't4', type: 'trigger', label: 'IF', config: { source: 'Student Profile', operator: '>', value: 'CGPA 8.0' } },
      { id: 'a4', type: 'action', label: 'THEN', config: { actionType: 'Add to Pool', target: 'Placement Pool', message: 'Student eligible for placement' } },
      { id: 'c4', type: 'chain', label: 'AND', config: { actionType: 'Send Email', target: 'Student', message: 'You are now in the placement pool!' } },
    ],
  },
  {
    id: '5',
    name: 'Fee reminder',
    description: 'IF fee due < 3 days, THEN send email + notification',
    enabled: true,
    runCount: 312,
    lastRun: '4 hrs ago',
    icon: Wallet,
    color: 'red',
    blocks: [
      { id: 't5', type: 'trigger', label: 'IF', config: { source: 'Fee Due Date', operator: '<', value: '3 days' } },
      { id: 'a5', type: 'action', label: 'THEN', config: { actionType: 'Send Email', target: 'Student + Parents', message: 'Fee payment due soon' } },
      { id: 'c5', type: 'chain', label: 'AND', config: { actionType: 'Send Notification', target: 'Student Portal', message: 'Fee reminder notification' } },
    ],
  },
  {
    id: '6',
    name: 'Grade submission reminder',
    description: 'IF grading deadline < 2 days AND grades not posted, THEN notify faculty',
    enabled: true,
    runCount: 67,
    lastRun: '6 hrs ago',
    icon: FileText,
    color: 'violet',
    blocks: [
      { id: 't6', type: 'trigger', label: 'IF', config: { source: 'Grading Deadline', operator: '<', value: '2 days' } },
      { id: 'a6', type: 'action', label: 'THEN', config: { actionType: 'Send Notification', target: 'Faculty', message: 'Please submit grades before deadline' } },
    ],
  },
];

// ─── Block Color Config ──────────────────────────────────────────────
const blockStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  trigger: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.2)]',
  },
  action: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]',
  },
  chain: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.2)]',
  },
};

// ─── Main Component ──────────────────────────────────────────────────
export default function AdminAutomationBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(initialWorkflows[0]);
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showAddWorkflow, setShowAddWorkflow] = useState(false);

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow(prev => prev ? { ...prev, enabled: !prev.enabled } : null);
    }
  };

  const runTest = () => {
    setTestRunning(true);
    setTestResult(null);
    setTimeout(() => {
      setTestRunning(false);
      setTestResult(
        `✅ Workflow "${selectedWorkflow?.name}" test completed successfully!\n\n` +
        `Trigger: ${selectedWorkflow?.blocks[0]?.config.source} ${selectedWorkflow?.blocks[0]?.config.operator} ${selectedWorkflow?.blocks[0]?.config.value}\n` +
        `Matched: 12 records found\n` +
        `Actions executed: ${selectedWorkflow?.blocks.filter(b => b.type !== 'trigger').length}\n` +
        `Notifications sent: 12\n` +
        `Execution time: 0.34s\n` +
        `Status: SUCCESS`
      );
    }, 2000);
  };

  const addNewWorkflow = () => {
    const newWf: Workflow = {
      id: String(Date.now()),
      name: 'New Custom Workflow',
      description: 'Custom IF/THEN automation',
      enabled: false,
      runCount: 0,
      lastRun: 'Never',
      icon: Zap,
      color: 'purple',
      blocks: [
        { id: 'tn', type: 'trigger', label: 'IF', config: { source: 'Select source', operator: '=', value: '' } },
        { id: 'an', type: 'action', label: 'THEN', config: { actionType: 'Select action', target: '', message: '' } },
      ],
    };
    setWorkflows(prev => [newWf, ...prev]);
    setSelectedWorkflow(newWf);
    setShowAddWorkflow(false);
  };

  return (
    <div className="flex h-full min-h-0 mt-4 gap-4">
      {/* ─── Left Panel: Workflow List ─────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" /> Workflows
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addNewWorkflow}
            className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(100vh-260px)]">
          {workflows.map((wf, i) => (
            <motion.div
              key={wf.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedWorkflow(wf)}
              className={cn(
                "p-3 rounded-xl border cursor-pointer transition-all",
                selectedWorkflow?.id === wf.id
                  ? "bg-purple-500/10 border-purple-500/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                  : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <wf.icon className={cn(
                    "w-4 h-4 shrink-0",
                    wf.color === 'purple' ? 'text-purple-400' :
                    wf.color === 'cyan' ? 'text-cyan-400' :
                    wf.color === 'green' ? 'text-green-400' :
                    wf.color === 'orange' ? 'text-orange-400' :
                    wf.color === 'red' ? 'text-red-400' :
                    'text-violet-400'
                  )} />
                  <span className="text-sm text-white font-medium line-clamp-1">{wf.name}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWorkflow(wf.id); }}
                  className="shrink-0"
                >
                  {wf.enabled ? (
                    <ToggleRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{wf.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] text-gray-600 flex items-center gap-1">
                  <Play className="w-2.5 h-2.5" /> {wf.runCount} runs
                </span>
                <span className="text-[10px] text-gray-600 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {wf.lastRun}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Right Panel: Workflow Editor ──────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedWorkflow ? (
          <>
            {/* Workflow Header */}
            <GlassCard className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    selectedWorkflow.color === 'purple' ? 'bg-purple-500/10 border border-purple-500/20' :
                    selectedWorkflow.color === 'cyan' ? 'bg-cyan-500/10 border border-cyan-500/20' :
                    selectedWorkflow.color === 'green' ? 'bg-green-500/10 border border-green-500/20' :
                    selectedWorkflow.color === 'orange' ? 'bg-orange-500/10 border border-orange-500/20' :
                    selectedWorkflow.color === 'red' ? 'bg-red-500/10 border border-red-500/20' :
                    'bg-violet-500/10 border border-violet-500/20'
                  )}>
                    <selectedWorkflow.icon className={cn(
                      "w-5 h-5",
                      selectedWorkflow.color === 'purple' ? 'text-purple-400' :
                      selectedWorkflow.color === 'cyan' ? 'text-cyan-400' :
                      selectedWorkflow.color === 'green' ? 'text-green-400' :
                      selectedWorkflow.color === 'orange' ? 'text-orange-400' :
                      selectedWorkflow.color === 'red' ? 'text-red-400' :
                      'text-violet-400'
                    )} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedWorkflow.name}</h2>
                    <p className="text-xs text-gray-500">{selectedWorkflow.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Status:</span>
                    <button
                      onClick={() => toggleWorkflow(selectedWorkflow.id)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium border",
                        selectedWorkflow.enabled
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                      )}
                    >
                      {selectedWorkflow.enabled ? 'Active' : 'Paused'}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="text-white font-semibold">{selectedWorkflow.runCount}</span> runs
                  </div>
                  <div className="text-xs text-gray-500">
                    Last: {selectedWorkflow.lastRun}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Visual Block Editor */}
            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="flex flex-col items-center gap-0">
                {selectedWorkflow.blocks.map((block, i) => {
                  const style = blockStyles[block.type];
                  return (
                    <div key={block.id} className="w-full max-w-2xl">
                      {/* Connector Arrow */}
                      {i > 0 && (
                        <div className="flex flex-col items-center">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 24 }}
                            className="w-px bg-gradient-to-b from-white/20 to-white/5 relative"
                          >
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <ArrowDown className="w-4 h-4 text-gray-600 absolute -bottom-2 left-1/2 -translate-x-1/2" />
                            </motion.div>
                          </motion.div>
                          <span className="text-[10px] text-gray-600 font-medium mt-1">
                            {block.label}
                          </span>
                        </div>
                      )}

                      {/* Block Card */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className={cn(
                          "p-4 rounded-2xl border transition-all",
                          style.bg,
                          style.border,
                          style.glow
                        )}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold",
                            block.type === 'trigger' ? 'bg-purple-500/20 text-purple-300' :
                            block.type === 'action' ? 'bg-cyan-500/20 text-cyan-300' :
                            'bg-green-500/20 text-green-300'
                          )}>
                            {block.label}
                          </div>
                          <span className="text-xs text-gray-500 uppercase tracking-wider">
                            {block.type === 'trigger' ? 'TRIGGER' : block.type === 'action' ? 'ACTION' : 'CHAIN ACTION'}
                          </span>
                        </div>

                        {block.type === 'trigger' ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              defaultValue={block.config.source}
                              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/40"
                            >
                              <option>Student Attendance</option>
                              <option>Library Overdue</option>
                              <option>New Complaint</option>
                              <option>Student Profile</option>
                              <option>Fee Due Date</option>
                              <option>Grading Deadline</option>
                            </select>
                            <select
                              defaultValue={block.config.operator}
                              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/40"
                            >
                              <option>{'<'}</option>
                              <option>{'>'}</option>
                              <option>=</option>
                              <option>{'!='}</option>
                              <option>{'<='}</option>
                              <option>{'>='}</option>
                            </select>
                            <input
                              type="text"
                              defaultValue={block.config.value}
                              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/40 w-28"
                              placeholder="Value..."
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              defaultValue={block.config.actionType}
                              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                            >
                              <option>Send Notification</option>
                              <option>Send Email</option>
                              <option>Flag Record</option>
                              <option>Set Priority</option>
                              <option>Add to Pool</option>
                              <option>Update Database</option>
                            </select>
                            <select
                              defaultValue={block.config.target}
                              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/40"
                            >
                              <option>Student</option>
                              <option>Student + HOD</option>
                              <option>Student + Parents</option>
                              <option>Faculty</option>
                              <option>Admin</option>
                              <option>Student Record</option>
                              <option>Complaint</option>
                              <option>Placement Pool</option>
                            </select>
                            <input
                              type="text"
                              defaultValue={block.config.message}
                              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/40 flex-1 min-w-[120px]"
                              placeholder="Message..."
                            />
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}

                {/* Add Block Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!selectedWorkflow) return;
                    const newBlock: WorkflowBlock = {
                      id: `c${Date.now()}`,
                      type: 'chain',
                      label: 'AND',
                      config: { actionType: 'Send Notification', target: 'Student', message: '' },
                    };
                    const updated = { ...selectedWorkflow, blocks: [...selectedWorkflow.blocks, newBlock] };
                    setSelectedWorkflow(updated);
                    setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
                  }}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.1] text-xs text-gray-500 hover:text-green-400 hover:border-green-500/30 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Chain Action
                </motion.button>
              </div>

              {/* Test Panel */}
              <GlassCard className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Play className="w-4 h-4 text-green-400" /> Test Panel
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={runTest}
                    disabled={testRunning}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                      testRunning
                        ? "bg-white/[0.03] text-gray-600 cursor-not-allowed"
                        : "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
                    )}
                  >
                    {testRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Run Test
                      </>
                    )}
                  </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  {testRunning ? (
                    <motion.div
                      key="running"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center py-8"
                    >
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-green-400 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Testing workflow...</p>
                        <p className="text-xs text-gray-600 mt-1">Simulating trigger and actions</p>
                      </div>
                    </motion.div>
                  ) : testResult ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-4 rounded-xl bg-green-500/5 border border-green-500/20"
                    >
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                        {testResult}
                      </pre>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center py-6 text-center"
                    >
                      <Sparkles className="w-8 h-8 text-gray-700 mb-2" />
                      <p className="text-xs text-gray-500">Click &quot;Run Test&quot; to simulate this workflow</p>
                      <p className="text-[10px] text-gray-700 mt-1">No real data will be affected</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <GitBranch className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">Select a workflow to edit</p>
              <p className="text-xs text-gray-700 mt-1">Or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
