'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/store';
import { GlassCard, SectionTitle, StatusBadge } from './WidgetCard';
import { Wallet, TrendingUp, Calendar, CheckCircle, AlertTriangle, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function FinanceSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/finance').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-6"><div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" /></div>;
  }

  const { summary, fees, scholarships } = data;
  const pieData = [
    { name: 'Paid', value: summary.totalPaid, color: '#22c55e' },
    { name: 'Pending', value: summary.totalPending, color: '#ef4444' },
  ];

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <SectionTitle>Finance Agent</SectionTitle>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
            <CheckCircle className="w-7 h-7 text-green-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Total Paid</div>
            <div className="text-2xl font-bold text-green-400">₹{summary.totalPaid.toLocaleString()}</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Total Pending</div>
            <div className="text-2xl font-bold text-red-400">₹{summary.totalPending.toLocaleString()}</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Wallet className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Total Fees</div>
            <div className="text-2xl font-bold text-white">₹{summary.totalFees.toLocaleString()}</div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fee Breakdown */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">Fee Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs text-gray-500 font-medium py-2 px-3">Type</th>
                  <th className="text-right text-xs text-gray-500 font-medium py-2 px-3">Amount</th>
                  <th className="text-center text-xs text-gray-500 font-medium py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f: any) => (
                  <tr key={f.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-3 px-3">
                      <div className="text-sm text-white capitalize">{f.type}</div>
                      <div className="text-[10px] text-gray-600">Sem {f.semester}</div>
                    </td>
                    <td className="py-3 px-3 text-right text-sm text-gray-300">₹{f.amount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center">
                      {f.paid ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-400">
                          <Calendar className="w-3 h-3" /> Due
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Chart & Scholarships */}
        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Payment Status</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => (
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
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-xs text-gray-400">Paid ({Math.round(summary.totalPaid / summary.totalFees * 100)}%)</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-xs text-gray-400">Pending ({Math.round(summary.totalPending / summary.totalFees * 100)}%)</span></div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white font-semibold">Scholarships</h3>
            </div>
            <div className="space-y-3">
              {scholarships.map((s: any) => (
                <div key={s.name} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{s.name}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₹{s.amount.toLocaleString()}</span>
                    <span>Deadline: {s.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
