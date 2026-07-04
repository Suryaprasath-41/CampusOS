'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/store';
import { GlassCard, SectionTitle, StatusBadge } from './WidgetCard';
import { GraduationCap, BookOpen, Clock, Calendar, FileText, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AcademicSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/academic').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-6"><div className="h-64 bg-[var(--bg-card)] rounded-2xl animate-pulse" /></div>;
  }

  const { subjects, schedule, assignments } = data;

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <SectionTitle>Academic Planner</SectionTitle>
      </div>

      {/* Schedule */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-[var(--text-primary)] font-semibold">Weekly Schedule</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {schedule.map((s: any, i: number) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-primary)] font-medium">{s.subject}</span>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{s.code}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.time}</span>
                <span>{s.room}</span>
              </div>
              <div className="flex gap-1.5 mt-2">
                {s.days.map((day: string) => (
                  <span key={day} className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[10px] text-[var(--text-secondary)]">{day.slice(0, 3)}</span>
                ))}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-1.5">{s.faculty}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Internal Marks */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-[var(--text-primary)] font-semibold">Internal Marks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left text-xs text-[var(--text-muted)] font-medium py-3 px-3">Subject</th>
                <th className="text-center text-xs text-[var(--text-muted)] font-medium py-3 px-2">Test 1</th>
                <th className="text-center text-xs text-[var(--text-muted)] font-medium py-3 px-2">Test 2</th>
                <th className="text-center text-xs text-[var(--text-muted)] font-medium py-3 px-2">Assgn 1</th>
                <th className="text-center text-xs text-[var(--text-muted)] font-medium py-3 px-2">Assgn 2</th>
                <th className="text-center text-xs text-[var(--text-muted)] font-medium py-3 px-2">Total</th>
                <th className="text-center text-xs text-[var(--text-muted)] font-medium py-3 px-2">Max</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s: any) => (
                <tr key={s.code} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-card)] transition-colors">
                  <td className="py-3 px-3">
                    <div className="text-sm text-[var(--text-primary)]">{s.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{s.faculty}</div>
                  </td>
                  {s.marks ? (
                    <>
                      <td className="py-3 px-2 text-center text-sm text-[var(--text-secondary)]">{s.marks.test1?.toFixed(1) || '-'}</td>
                      <td className="py-3 px-2 text-center text-sm text-[var(--text-secondary)]">{s.marks.test2?.toFixed(1) || '-'}</td>
                      <td className="py-3 px-2 text-center text-sm text-[var(--text-secondary)]">{s.marks.assignment1?.toFixed(1) || '-'}</td>
                      <td className="py-3 px-2 text-center text-sm text-[var(--text-secondary)]">{s.marks.assignment2?.toFixed(1) || '-'}</td>
                      <td className="py-3 px-2 text-center text-sm text-[var(--text-primary)] font-bold">{s.marks.total?.toFixed(1) || '-'}</td>
                      <td className="py-3 px-2 text-center text-sm text-[var(--text-muted)]">{s.marks.maxMarks}</td>
                    </>
                  ) : (
                    <td colSpan={6} className="py-3 px-2 text-center text-xs text-[var(--text-muted)]">No marks yet</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="text-[var(--text-primary)] font-semibold">Pending Assignments</h3>
          </div>
          {assignments.pending.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm text-center py-8">All caught up! 🎉</p>
          ) : (
            <div className="space-y-3">
              {assignments.pending.map((a: any) => (
                <div key={a.id} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--text-primary)] font-medium">{a.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">{a.subject}</span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No date'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-[var(--text-primary)] font-semibold">Submitted</h3>
          </div>
          {assignments.submitted.length === 0 ? (
            <p className="text-[var(--text-muted)] text-sm text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-3">
              {assignments.submitted.map((a: any) => (
                <div key={a.id} className="p-3 rounded-xl bg-green-500/[0.03] border border-green-500/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--text-primary)] font-medium">{a.title}</span>
                    <StatusBadge status="submitted" />
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{a.subject}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
