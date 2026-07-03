'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/store';
import { GlassCard, SectionTitle, StatusBadge } from './WidgetCard';
import { CalendarDays, MapPin, Users, Clock, CheckCircle, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EventsSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAPI('/events').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-6"><div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" /></div>;
  }

  const filtered = filter === 'all' ? data.events : data.events.filter((e: any) => e.type === filter);

  const typeColors: Record<string, string> = {
    hackathon: 'from-purple-500 to-violet-600',
    workshop: 'from-cyan-500 to-blue-600',
    seminar: 'from-green-500 to-emerald-600',
    cultural: 'from-orange-500 to-red-600',
  };

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <SectionTitle>Event Manager</SectionTitle>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === 'all' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/[0.03] text-gray-500 border border-white/[0.06]'
          }`}
        >
          All Events
        </button>
        {data.categories.map((cat: string) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === cat ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/[0.03] text-gray-500 border border-white/[0.06]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((event: any) => {
          const gradient = typeColors[event.type] || 'from-gray-500 to-gray-600';
          return (
            <motion.div
              key={event.id}
              whileHover={{ scale: 1.01, y: -2 }}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.15] transition-all"
            >
              {/* Color bar */}
              <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold mb-1">{event.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400 capitalize">{event.type}</span>
                  </div>
                  {event.registered && (
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Registered</span>
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{event.description}</p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.startDate ? new Date(event.startDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'TBA'}
                  </span>
                  {event.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.venue}
                    </span>
                  )}
                  {event.maxParticipants && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.currentParticipants}/{event.maxParticipants}
                    </span>
                  )}
                </div>

                {event.registrationOpen && !event.registered && (
                  <button className="mt-3 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-medium hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-shadow">
                    Register Now
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* My Registrations */}
      {data.registered.length > 0 && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-semibold">My Registrations</h3>
          </div>
          <div className="space-y-2">
            {data.registered.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                <div>
                  <div className="text-sm text-white">{e.title}</div>
                  <div className="text-xs text-gray-500">{e.venue} • {e.startDate ? new Date(e.startDate).toLocaleDateString() : ''}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Registered</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
