'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/store';
import { GlassCard, SectionTitle } from './WidgetCard';
import { Shield, Users, TrendingUp, Wallet, GraduationCap, Activity, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/admin').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-6"><div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" /></div>;
  }

  const { stats, departments, placements, recentActivity } = data;

  const feeData = [
    { name: 'Paid', value: stats.paidFees, color: '#22c55e' },
    { name: 'Pending', value: stats.pendingFees, color: '#ef4444' },
  ];

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center shadow-[0_0_20px_rgba(107,114,128,0.3)]">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <SectionTitle>Admin Dashboard</SectionTitle>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Students</div>
            <div className="text-xl font-bold text-white">{stats.totalStudents}</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Avg CGPA</div>
            <div className="text-xl font-bold text-white">{stats.avgCGPA}</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Avg Attendance</div>
            <div className="text-xl font-bold text-white">{stats.avgAttendance}%</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500">Placed</div>
            <div className="text-xl font-bold text-white">{(placements.interview || 0) + (placements.applied || 0) + (placements.placed || 0)}</div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Chart */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Department Distribution</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="department" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                <Tooltip
                  contentStyle={{ background: 'rgba(10,10,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" fillOpacity={0.7} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Fee Collection */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-semibold">Fee Collection</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={feeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                  {feeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'rgba(10,10,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-xs text-gray-400">Paid (₹{stats.paidFees.toLocaleString()})</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-gray-400">Pending (₹{stats.pendingFees.toLocaleString()})</span></div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {recentActivity.map((a: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                a.type === 'enrollment' ? 'bg-purple-400' :
                a.type === 'fee' ? 'bg-green-400' :
                a.type === 'placement' ? 'bg-cyan-400' :
                a.type === 'event' ? 'bg-blue-400' : 'bg-yellow-400'
              }`} />
              <span className="text-sm text-gray-300 flex-1">{a.message}</span>
              <span className="text-[10px] text-gray-600 shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
