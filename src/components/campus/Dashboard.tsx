'use client';

import { useEffect, useState } from 'react';
import { useCampusStore, fetchAPI } from '@/lib/store';
import WidgetCard, { PredictionBar, GlassCard, SectionTitle } from './WidgetCard';
import { TrendingUp, BookOpen, AlertTriangle, Calendar, Library, Trophy, ArrowRight, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { dashboardData, setDashboardData, setActiveSection } = useCampusStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/dashboard').then(setDashboardData).finally(() => setLoading(false));
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-10 w-64 bg-white/[0.03] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-white/[0.03] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const d = dashboardData;
  const att = d.attendance;

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <WidgetCard
          title="Attendance"
          value={`${att.percentage}%`}
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
          risk={att.risk}
          onClick={() => setActiveSection('attendance')}
        />
        <WidgetCard
          title="CGPA"
          value={d.student.cgpa}
          icon={<BookOpen className="w-5 h-5 text-cyan-400" />}
          trend="up"
        />
        <WidgetCard
          title="Assignments"
          value={d.assignments.pending}
          icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
          subtitle="pending"
          onClick={() => setActiveSection('academic')}
        />
        <WidgetCard
          title="Upcoming"
          value={d.events.upcoming}
          icon={<Calendar className="w-5 h-5 text-blue-400" />}
          subtitle="events"
          onClick={() => setActiveSection('events')}
        />
        <WidgetCard
          title="Library Due"
          value={d.library.overdue}
          icon={<Library className="w-5 h-5 text-orange-400" />}
          subtitle="overdue"
          onClick={() => setActiveSection('library')}
        />
        <WidgetCard
          title="Placement"
          value={`${d.readiness}%`}
          icon={<Trophy className="w-5 h-5 text-green-400" />}
          subtitle="readiness"
          onClick={() => setActiveSection('placement')}
        />
      </div>

      {/* AI Predictions */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">AI Predictions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PredictionBar label="Attendance Prediction" value={att.predicted} color="purple" />
          <PredictionBar label="Placement Readiness" value={d.readiness} color="cyan" />
          <PredictionBar label="Stress Level" value={d.stressLevel} color={d.stressLevel > 60 ? 'red' : d.stressLevel > 40 ? 'yellow' : 'green'} />
        </div>
      </GlassCard>

      {/* Quick Actions & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Schedule */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Today&apos;s Schedule</h3>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { time: '09:00 AM', subject: 'Probability & Statistics', room: 'LH-101' },
              { time: '10:00 AM', subject: 'Machine Learning', room: 'LH-201' },
              { time: '02:00 PM', subject: 'Computer Networks', room: 'LH-102' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="text-xs text-purple-400 font-mono w-20 shrink-0">{item.time}</div>
                <div className="flex-1">
                  <div className="text-sm text-white">{item.subject}</div>
                  <div className="text-xs text-gray-500">{item.room}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Recent Notifications</h3>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { title: 'Assignment Due Soon', desc: 'SVM Classifier due in 3 days', type: 'warning' },
              { title: 'Google Interview', desc: 'Scheduled for next week', type: 'success' },
              { title: 'Fee Due', desc: 'Exam fee ₹5,000 due in 7 days', type: 'warning' },
              { title: 'AC Complaint Update', desc: 'Assigned to maintenance', type: 'info' },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  n.type === 'warning' ? 'bg-yellow-400' :
                  n.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                }`} />
                <div>
                  <div className="text-sm text-white">{n.title}</div>
                  <div className="text-xs text-gray-500">{n.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Skill Tags */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">Your Skills</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {d.student.skills.map((skill: string) => (
            <span key={skill} className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
              {skill}
            </span>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
