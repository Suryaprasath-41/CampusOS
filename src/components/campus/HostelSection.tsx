'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/store';
import { GlassCard, SectionTitle, StatusBadge } from './WidgetCard';
import { Home, Wrench, CalendarDays, Utensils, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function HostelSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('en', { weekday: 'long' }));

  useEffect(() => {
    fetchAPI('/hostel').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-6"><div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" /></div>;
  }

  const days = Object.keys(data.messMenu);

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <SectionTitle>Hostel Assistant</SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Room Info */}
        <GlassCard className="flex flex-col items-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center mb-4">
            <Home className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-white font-bold text-lg">{data.room.number}</h3>
          <p className="text-gray-500 text-sm">Block {data.room.block}</p>
          <div className="flex items-center gap-2 mt-3">
            <StatusBadge status={data.room.status.toLowerCase()} />
            <span className="text-xs text-gray-500">{data.room.type}</span>
          </div>
        </GlassCard>

        {/* Complaints */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <h3 className="text-white font-semibold">Active Complaints</h3>
          </div>
          {data.complaints.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No active complaints</p>
          ) : (
            <div className="space-y-3">
              {data.complaints.map((c: any) => (
                <div key={c.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase">{c.type}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-sm text-gray-300">{c.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      c.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                      c.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>{c.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Leave Requests */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">Leave History</h3>
          </div>
          {data.leaves.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No leave requests</p>
          ) : (
            <div className="space-y-3">
              {data.leaves.map((l: any) => (
                <div key={l.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 uppercase">{l.type} leave</span>
                    <StatusBadge status={l.status} />
                  </div>
                  <p className="text-sm text-gray-300">{l.reason}</p>
                  {l.approvedBy && <p className="text-xs text-gray-500 mt-1">Approved by: {l.approvedBy}</p>}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Mess Menu */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">Mess Menu</h3>
        </div>
        {/* Day Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeDay === day
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:text-gray-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.messMenu[activeDay] && Object.entries(data.messMenu[activeDay]).map(([meal, items]: [string, any]) => (
            <div key={meal} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-xs text-purple-400 uppercase font-medium mb-2">{meal}</div>
              <div className="text-sm text-gray-300">{items}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
