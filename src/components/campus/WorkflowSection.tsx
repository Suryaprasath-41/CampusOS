'use client';

import { GlassCard, SectionTitle, StatusBadge } from './WidgetCard';
import { Workflow, Zap, CheckCircle2, Clock, ArrowRight, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCampusStore } from '@/lib/store';

const workflows = [
  {
    id: 'w1',
    title: 'Sick Leave Auto-Request',
    trigger: 'Student says "I have fever tomorrow"',
    description: 'AI checks timetable, attendance, faculty policy, and automatically creates a leave request',
    steps: [
      { agent: 'Master', action: 'Parse intent & extract dates', done: true },
      { agent: 'Academic', action: 'Check tomorrow\'s classes', done: true },
      { agent: 'Attendance', action: 'Verify attendance impact', done: true },
      { agent: 'Master', action: 'Check medical leave policy', done: true },
      { agent: 'Hostel', action: 'Create leave request', done: true },
      { agent: 'Master', action: 'Send notification to faculty', done: false },
      { agent: 'Attendance', action: 'Update attendance prediction', done: false },
    ],
    status: 'in_progress',
    lastRun: '2 hours ago',
  },
  {
    id: 'w2',
    title: 'Placement Drive Preparation',
    trigger: 'New company announces campus drive',
    description: 'AI analyzes student skills, identifies gaps, creates preparation roadmap',
    steps: [
      { agent: 'Placement', action: 'Fetch drive details', done: true },
      { agent: 'Placement', action: 'Analyze skill match', done: true },
      { agent: 'Academic', action: 'Check subject alignment', done: true },
      { agent: 'Placement', action: 'Generate preparation plan', done: true },
      { agent: 'Master', action: 'Notify eligible students', done: true },
      { agent: 'Library', action: 'Recommend prep books', done: false },
    ],
    status: 'completed',
    lastRun: '1 day ago',
  },
  {
    id: 'w3',
    title: 'Low Attendance Alert',
    trigger: 'Attendance drops below 75%',
    description: 'AI alerts student, suggests recovery plan, notifies guardian if critical',
    steps: [
      { agent: 'Attendance', action: 'Detect threshold breach', done: true },
      { agent: 'Attendance', action: 'Calculate recovery classes', done: true },
      { agent: 'Master', action: 'Send alert to student', done: true },
      { agent: 'Master', action: 'Notify guardian', done: false },
    ],
    status: 'in_progress',
    lastRun: '3 hours ago',
  },
  {
    id: 'w4',
    title: 'Smart Assignment Reminder',
    trigger: 'Assignment due in 24 hours',
    description: 'AI reminds student, provides hints, suggests resources from library',
    steps: [
      { agent: 'Academic', action: 'Identify due assignment', done: true },
      { agent: 'Master', action: 'Send reminder notification', done: true },
      { agent: 'Library', action: 'Find related books', done: true },
      { agent: 'Academic', action: 'Provide topic hints', done: false },
    ],
    status: 'in_progress',
    lastRun: '5 hours ago',
  },
];

const agentColors: Record<string, string> = {
  Master: 'from-purple-500 to-violet-600',
  Attendance: 'from-cyan-500 to-blue-600',
  Placement: 'from-green-500 to-emerald-600',
  Library: 'from-orange-500 to-red-600',
  Academic: 'from-pink-500 to-rose-600',
  Hostel: 'from-yellow-500 to-amber-600',
  Finance: 'from-teal-500 to-cyan-600',
};

export default function WorkflowSection() {
  const { openChatWithContext } = useCampusStore();

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          <SectionTitle>AI Workflow Automation</SectionTitle>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openChatWithContext("Help me create a new automated workflow for campus tasks. What workflows can I set up?")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        >
          <Sparkles className="w-4 h-4" /> Create Workflow
        </motion.button>
      </div>

      {/* Hero Banner */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10" />
        <div className="relative z-10 flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shrink-0"
          >
            <Workflow className="w-7 h-7 text-white" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-[var(--text-primary)] font-bold text-lg">Multi-Agent Orchestration</h3>
            <p className="text-sm text-[var(--text-secondary)]">AI agents collaborate automatically to handle complex campus workflows</p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400">4</div>
              <div className="text-[10px] text-[var(--text-muted)]">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">1</div>
              <div className="text-[10px] text-[var(--text-muted)]">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">3</div>
              <div className="text-[10px] text-[var(--text-muted)]">In Progress</div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((wf, idx) => (
          <motion.div
            key={wf.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard className="h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-[var(--text-primary)] font-semibold text-sm">{wf.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={wf.status} />
                      <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />{wf.lastRun}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[var(--text-muted)] mb-3">{wf.description}</p>

              {/* Trigger */}
              <div className="bg-purple-500/[0.05] border border-purple-500/15 rounded-xl p-3 mb-4">
                <div className="text-[10px] text-purple-600 dark:text-purple-400 uppercase mb-1">Trigger</div>
                <p className="text-xs text-[var(--text-secondary)] italic">&quot;{wf.trigger}&quot;</p>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                <div className="text-[10px] text-[var(--text-muted)] uppercase mb-1">Agent Pipeline</div>
                {wf.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${agentColors[step.agent] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-[9px] text-white font-bold shrink-0`}>
                        {step.agent[0]}
                      </div>
                      {i < wf.steps.length - 1 && (
                        <div className={`w-0.5 h-4 ${step.done ? 'bg-purple-500/30' : 'bg-[var(--border-color)]'}`} />
                      )}
                    </div>
                    <div className="flex-1 flex items-center justify-between py-1">
                      <div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-secondary)] mr-2">{step.agent}</span>
                        <span className={`text-xs ${step.done ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>{step.action}</span>
                      </div>
                      {step.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Available Templates */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-[var(--text-primary)] font-semibold">Workflow Templates</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'Fee Payment Reminder', desc: 'Auto-remind students before due dates', icon: '💰' },
            { name: 'Exam Prep Planner', desc: 'Generate study schedule from syllabus', icon: '📚' },
            { name: 'Event Registration', desc: 'Auto-register for eligible events', icon: '🎟️' },
            { name: 'Book Return Reminder', desc: 'Alert before due date with renewal option', icon: '📖' },
            { name: 'CGPA Predictor', desc: 'Predict semester CGPA from internal marks', icon: '🎯' },
            { name: 'Skill Recommender', desc: 'Suggest skills based on career goals', icon: '🚀' },
          ].map((tpl, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => openChatWithContext(`Help me set up the "${tpl.name}" workflow. ${tpl.desc}`)}
              className="text-left p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-purple-500/30 hover:bg-[var(--glass-bg)] transition-all group"
            >
              <div className="text-2xl mb-2">{tpl.icon}</div>
              <h4 className="text-sm text-[var(--text-primary)] font-medium mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">{tpl.name}</h4>
              <p className="text-xs text-[var(--text-muted)]">{tpl.desc}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Create <ArrowRight className="w-3 h-3" />
              </div>
            </motion.button>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
