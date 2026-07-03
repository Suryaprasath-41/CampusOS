'use client';

import { useCampusStore, fetchAPI } from '@/lib/store';
import { GlassCard, SectionTitle, StatusBadge, PredictionBar } from './WidgetCard';
import AnimatedCounter from './AnimatedCounter';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Calendar, Clock, MapPin, Award, TrendingUp, AlertTriangle,
  CheckCircle2, Sparkles, Bot, ChevronDown, GraduationCap, Target,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Grade color map
const gradeColors: Record<string, string> = {
  'A+': 'text-green-400 bg-green-500/15 border-green-500/30',
  'A': 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
  'B+': 'text-sky-400 bg-sky-500/15 border-sky-500/30',
  'B': 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
  'C': 'text-red-400 bg-red-500/15 border-red-500/30',
  'N/A': 'text-gray-500 bg-gray-500/15 border-gray-500/30',
};

// Exam type chip color
const examTypeColors: Record<string, string> = {
  'Mid Semester': 'text-purple-400 bg-purple-500/10 border-purple-500/25',
  'End Semester': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
  'Quiz': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
  'Assignment': 'text-green-400 bg-green-500/10 border-green-500/25',
};

function getDaysLeft(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function daysLeftColor(days: number): string {
  if (days > 7) return 'text-green-400';
  if (days >= 3) return 'text-yellow-400';
  return 'text-red-400';
}

function prepBarColor(prep: number): string {
  if (prep < 40) return 'red';
  if (prep <= 70) return 'yellow';
  return 'green';
}

export default function ExamsSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { setChatOpen } = useCampusStore();

  const loadExams = () => {
    setLoading(true);
    setError(null);
    fetchAPI('/exams')
      .then(setData)
      .catch((e) => setError(e.message || 'Failed to load exams'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    fetchAPI('/exams')
      .then((d) => { if (active) { setData(d); setError(null); } })
      .catch((e) => { if (active) setError(e.message || 'Failed to load exams'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="h-8 w-64 bg-white/[0.03] rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-white/[0.03] rounded-2xl animate-pulse" />
        <div className="h-48 bg-white/[0.03] rounded-2xl animate-pulse" />
        <div className="h-72 bg-white/[0.03] rounded-2xl animate-pulse" />
      </div>
    );
  }

  // ---- Error state ----
  if (error && !data) {
    return (
      <div className="p-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
        <GlassCard className="text-center py-12">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Unable to load exam data</h3>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadExams}
            className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-500/30 transition-colors"
          >
            Try again
          </button>
        </GlassCard>
      </div>
    );
  }

  if (!data) return null;

  const { upcomingExams, pastResults, semesterPerformance, recommendations, summary } = data;

  const summaryChips = [
    { label: 'Upcoming Exams', value: summary.totalUpcoming, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', suffix: '' },
    { label: 'Avg Prep', value: summary.avgPreparation, icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10', suffix: '%' },
    { label: 'Best Subject', value: summary.bestSubject?.subjectName || 'N/A', icon: Award, color: 'text-green-400', bg: 'bg-green-500/10', isText: true },
    { label: 'Weakest Subject', value: summary.weakestSubject?.subjectName || 'N/A', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10', isText: true },
  ];

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      {/* ============ HEADER ROW ============ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <SectionTitle className="mb-0">Exams &amp; Results</SectionTitle>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryChips.map((chip, i) => (
          <motion.div
            key={chip.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
          >
            <GlassCard className="p-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide">{chip.label}</span>
                <div className={cn('p-1.5 rounded-lg', chip.bg)}>
                  <chip.icon className={cn('w-4 h-4', chip.color)} />
                </div>
              </div>
              {chip.isText ? (
                <p className="text-base font-bold text-white truncate" title={String(chip.value)}>
                  {chip.value}
                </p>
              ) : (
                <div className={cn('text-2xl font-bold', chip.color)}>
                  <AnimatedCounter
                    value={Number(chip.value) || 0}
                    suffix={chip.suffix}
                    decimals={chip.suffix === '%' ? 0 : 0}
                  />
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* ============ SEMESTER PERFORMANCE CHART ============ */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Performance Trend</h3>
          </div>
          <span className="text-xs text-gray-500">Avg % across semesters</span>
        </div>

        {semesterPerformance.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-12">No performance data available yet.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={semesterPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="perfStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="semester"
                  tickFormatter={(v) => `Sem ${v}`}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,10,20,0.95)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  labelFormatter={(v) => `Semester ${v}`}
                  formatter={(value: number, name: string) => {
                    if (name === 'avgPercentage') return [`${value}%`, 'Avg Score'];
                    return [value, name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="avgPercentage"
                  stroke="url(#perfStroke)"
                  strokeWidth={3}
                  fill="url(#perfGrad)"
                  dot={{ fill: '#a855f7', r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      {/* ============ UPCOMING EXAMS ============ */}
      <div>
        <SectionTitle className="text-xl mb-4">Upcoming Exams</SectionTitle>

        {upcomingExams.length === 0 ? (
          <GlassCard className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
            <p className="text-gray-300">No upcoming exams scheduled.</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {upcomingExams.map((exam: any, i: number) => {
              const days = getDaysLeft(exam.date);
              const isExpanded = expanded === exam.id;
              return (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard className="p-0 overflow-hidden">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : exam.id)}
                      className="w-full text-left p-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        {/* Subject code badge */}
                        <div className="shrink-0">
                          <div className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/25 text-center min-w-[80px]">
                            <div className="text-[10px] text-purple-400 uppercase tracking-wide">Code</div>
                            <div className="text-sm font-mono font-bold text-white">{exam.subjectCode}</div>
                          </div>
                        </div>

                        {/* Subject info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold truncate">{exam.subjectName}</h4>
                            <span className={cn(
                              'inline-block text-[10px] px-2 py-0.5 rounded-full border font-medium',
                              examTypeColors[exam.examType] || 'text-gray-400 bg-gray-500/10 border-gray-500/25'
                            )}>
                              {exam.examType}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {exam.time} • {exam.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {exam.venue}
                            </span>
                            <span className="text-gray-600">Faculty: {exam.faculty}</span>
                          </div>
                        </div>

                        {/* Countdown */}
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <div className={cn('text-2xl font-bold', daysLeftColor(days))}>
                            {days}d
                          </div>
                          <span className="text-[10px] text-gray-500 uppercase">left</span>
                        </div>

                        <ChevronDown
                          className={cn(
                            'w-5 h-5 text-gray-500 transition-transform shrink-0',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </div>

                      {/* Preparation bar */}
                      <div className="mt-3 pt-3 border-t border-white/[0.04]">
                        <PredictionBar
                          label="Preparation"
                          value={exam.preparation}
                          color={prepBarColor(exam.preparation)}
                        />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden border-t border-white/[0.06]"
                        >
                          <div className="p-4 bg-white/[0.02]">
                            <div className="flex items-start gap-2 mb-3">
                              <FileText className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                              <div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Syllabus</div>
                                <p className="text-sm text-gray-300">{exam.syllabus}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                              <span>Max Marks: <span className="text-white font-semibold">{exam.maxMarks}</span></span>
                              <button
                                onClick={() => setChatOpen(true)}
                                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-500/25 transition-colors"
                              >
                                <Bot className="w-3.5 h-3.5" />
                                Ask AI for prep plan
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ PAST RESULTS TABLE ============ */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">Past Results</h3>
          <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-white/[0.04]">
            {pastResults.length} records
          </span>
        </div>

        {pastResults.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center py-8">No past results yet.</p>
        ) : (
          <div className="rounded-xl overflow-hidden border border-white/[0.05]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-gray-500 text-xs uppercase tracking-wide">Code</TableHead>
                  <TableHead className="text-gray-500 text-xs uppercase tracking-wide">Subject</TableHead>
                  <TableHead className="text-gray-500 text-xs uppercase tracking-wide text-center">Sem</TableHead>
                  <TableHead className="text-gray-500 text-xs uppercase tracking-wide text-center">T1</TableHead>
                  <TableHead className="text-gray-500 text-xs uppercase tracking-wide text-center">T2</TableHead>
                  <TableHead className="text-gray-500 text-xs uppercase tracking-wide text-center">A1</TableHead>
                  <TableHead className="text-gray-500 text-xs uppercase tracking-wide text-center">A2</TableHead>
                  <TableHead className="text-gray-500 text-xs uppercase tracking-wide text-center">Total</TableHead>
                  <TableHead className="text-gray-500 text-xs uppercase tracking-wide text-center">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastResults.map((r: any) => (
                  <TableRow
                    key={r.id}
                    className="border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-purple-400">{r.subjectCode}</TableCell>
                    <TableCell>
                      <div className="text-sm text-white font-medium">{r.subjectName}</div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-400">{r.semester}</TableCell>
                    <TableCell className="text-center text-sm text-gray-300">{r.test1 ?? '-'}</TableCell>
                    <TableCell className="text-center text-sm text-gray-300">{r.test2 ?? '-'}</TableCell>
                    <TableCell className="text-center text-sm text-gray-300">{r.assignment1 ?? '-'}</TableCell>
                    <TableCell className="text-center text-sm text-gray-300">{r.assignment2 ?? '-'}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold text-white">{r.total ?? '-'}</span>
                      <span className="text-[10px] text-gray-600">/{r.maxMarks}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        'inline-block text-xs px-2 py-0.5 rounded-full border font-bold',
                        gradeColors[r.grade] || gradeColors['N/A']
                      )}>
                        {r.grade}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </GlassCard>

      {/* ============ AI PREP RECOMMENDATIONS ============ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle className="text-xl mb-0">AI Prep Recommendations</SectionTitle>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>

        {recommendations.length === 0 ? (
          <GlassCard className="text-center py-8">
            <p className="text-gray-400 text-sm">No recommendations available.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
              >
                <GlassCard className="p-5 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-white font-semibold truncate" title={rec.subject}>
                        {rec.subject}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                          daysLeftColor(rec.daysLeft) + ' bg-white/[0.04]'
                        )}>
                          <Calendar className="w-3 h-3" />
                          {rec.daysLeft} days left
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      <div className={cn(
                        'text-2xl font-bold',
                        rec.currentPrep < 40 ? 'text-red-400' :
                        rec.currentPrep <= 70 ? 'text-yellow-400' : 'text-green-400'
                      )}>
                        {rec.currentPrep}%
                      </div>
                      <div className="text-[10px] text-gray-500 text-right">prep</div>
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rec.currentPrep}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className={cn(
                        'h-full rounded-full',
                        rec.currentPrep < 40 ? 'bg-red-500' :
                        rec.currentPrep <= 70 ? 'bg-yellow-500' : 'bg-green-500'
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Recommended</div>
                    <ul className="space-y-2">
                      {rec.recommended.map((action: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setChatOpen(true)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500/15 to-cyan-500/15 border border-purple-500/25 text-purple-300 text-xs font-medium hover:from-purple-500/25 hover:to-cyan-500/25 transition-all"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    Ask AI for plan
                  </button>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
