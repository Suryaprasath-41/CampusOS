'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/store';
import { GlassCard, SectionTitle, PredictionBar, StatusBadge } from './WidgetCard';
import { TrendingUp, AlertTriangle, Shield, Clock, ChevronRight, CalendarDays, Flame, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttendanceSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/attendance').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-6"><div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" /></div>;
  }

  const { overall, subjects, prediction, recent } = data;
  const trend = data.trend || [];

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <SectionTitle>Attendance Intelligence</SectionTitle>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Attendance Circle */}
        <GlassCard className="flex flex-col items-center justify-center py-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08),transparent_70%)]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle
                  initial={{ strokeDasharray: '0 264' }}
                  animate={{ strokeDasharray: `${overall.percentage * 2.64} 264` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#attGrad)" strokeWidth="8"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="attGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-4xl font-bold text-white"
                >
                  {overall.percentage}%
                </motion.span>
                <span className="text-xs text-gray-400">Overall</span>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-lg font-bold text-green-400">{overall.present}</div>
                <div className="text-[10px] text-gray-500 uppercase">Present</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mb-1">
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-lg font-bold text-red-400">{overall.absent}</div>
                <div className="text-[10px] text-gray-500 uppercase">Absent</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-1">
                  <Timer className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-yellow-400">{overall.late}</div>
                <div className="text-[10px] text-gray-500 uppercase">Late</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Prediction Panel */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">AI Prediction</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02]">
              <span className="text-gray-400 text-sm">Current</span>
              <span className="text-white font-bold">{prediction.current}%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02]">
              <span className="text-gray-400 text-sm">Predicted End-Sem</span>
              <span className="text-white font-bold">{prediction.predicted}%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02]">
              <span className="text-gray-400 text-sm">Safe Leaves</span>
              <span className="text-white font-bold">{prediction.safeLeaves} classes</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02]">
              <span className="text-gray-400 text-sm">Risk Level</span>
              <StatusBadge status={prediction.risk} />
            </div>
          </div>
        </GlassCard>

        {/* Trend Chart */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">30-Day Trend</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend && trend.length > 0 ? trend : [{date: 'Mon', percentage: overall.percentage}, {date: 'Tue', percentage: overall.percentage - 2}, {date: 'Wed', percentage: overall.percentage + 1}, {date: 'Thu', percentage: overall.percentage - 1}, {date: 'Fri', percentage: overall.percentage}]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{ background: 'rgba(10,10,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="percentage" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Subject-wise Table */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <h3 className="text-white font-semibold">Subject-wise Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-xs text-gray-500 font-medium py-3 px-4">Subject</th>
                <th className="text-left text-xs text-gray-500 font-medium py-3 px-4">Code</th>
                <th className="text-center text-xs text-gray-500 font-medium py-3 px-4">Present</th>
                <th className="text-center text-xs text-gray-500 font-medium py-3 px-4">Total</th>
                <th className="text-center text-xs text-gray-500 font-medium py-3 px-4">Percentage</th>
                <th className="text-center text-xs text-gray-500 font-medium py-3 px-4">Risk</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s: any) => (
                <tr key={s.subjectId} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-sm text-white">{s.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-400 font-mono">{s.code}</td>
                  <td className="py-3 px-4 text-sm text-center text-green-400">{s.present}</td>
                  <td className="py-3 px-4 text-sm text-center text-gray-400">{s.total}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-20 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                          style={{ width: `${s.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-white font-medium">{s.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center"><StatusBadge status={s.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Recent Records */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">Recent Records</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {recent.slice(0, 8).map((r: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div>
                <div className="text-sm text-white">{r.subject}</div>
              </div>
              <StatusBadge status={r.status === 'late' ? 'MEDIUM' : r.status === 'present' ? 'LOW' : 'HIGH'} />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
