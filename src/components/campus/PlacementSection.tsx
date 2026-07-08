'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/store';
import { GlassCard, SectionTitle, PredictionBar, StatusBadge } from './WidgetCard';
import { Target, TrendingUp, Briefcase, Code, Award, ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function PlacementSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/placement').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-6"><div className="h-64 bg-[var(--bg-card)] rounded-2xl animate-pulse" /></div>;
  }

  const { readiness, skills, applications, skillGaps, actions, companies } = data;

  const radarData = [
    { subject: 'CGPA', value: readiness.breakdown.cgpa, fullMark: 30 },
    { subject: 'Skills', value: readiness.breakdown.skills, fullMark: 30 },
    { subject: 'Projects', value: readiness.breakdown.projects, fullMark: 30 },
    { subject: 'Communication', value: readiness.breakdown.communication, fullMark: 30 },
  ];

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <Target className="w-5 h-5 text-white" />
        </div>
        <SectionTitle>Placement Agent</SectionTitle>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Score */}
        <GlassCard className="flex flex-col items-center py-8">
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-card)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#placementGrad)" strokeWidth="8"
                strokeDasharray={`${readiness.total * 2.64} 264`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="placementGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-[var(--text-primary)]">{readiness.total}</span>
              <span className="text-xs text-[var(--text-secondary)]">/ 100</span>
            </div>
          </div>
          <h3 className="text-[var(--text-primary)] font-semibold mb-1">Placement Readiness</h3>
          <p className="text-xs text-[var(--text-muted)]">Based on CGPA, Skills, Projects & Communication</p>
        </GlassCard>

        {/* Radar Chart */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-[var(--text-primary)] font-semibold">Skill Profile</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 30]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Skill Gaps */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-[var(--text-primary)] font-semibold">Skill Gaps</h3>
          </div>
          <div className="space-y-2">
            {skillGaps.map((gap: string) => (
              <div key={gap} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/10">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-sm text-[var(--text-secondary)]">{gap}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-[var(--text-secondary)] font-medium">Current Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill: string) => (
                <span key={skill} className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-300 text-[10px] font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Applications */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-[var(--text-primary)] font-semibold">Active Applications</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {applications.map((app: any) => (
            <motion.div
              key={app.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[var(--text-primary)] font-semibold">{app.company}</h4>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">{app.role}</p>
              {app.package && <p className="text-xs text-cyan-600 dark:text-cyan-400">₹{app.package.toLocaleString()}/mo</p>}
              {app.interviewDate && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Interview: {new Date(app.interviewDate).toLocaleDateString()}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Recommended Companies */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-[var(--text-primary)] font-semibold">Recommended for You</h3>
        </div>
        <div className="space-y-3">
          {companies.map((c: any) => (
            <div key={c.name} className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--glass-bg)] transition-colors">
              <div>
                <div className="text-[var(--text-primary)] font-medium">{c.name}</div>
                <div className="text-sm text-[var(--text-secondary)]">{c.role}</div>
                <div className="flex gap-1.5 mt-1.5">
                  {c.skills.map((s: string) => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[10px] text-[var(--text-secondary)]">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400">{c.match}%</div>
                <div className="text-[10px] text-[var(--text-muted)]">match</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Action Items */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-[var(--text-primary)] font-semibold">Recommended Actions</h3>
        </div>
        <div className="space-y-2">
          {actions.map((a: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)]">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                a.priority === 'high' ? 'bg-red-500' :
                a.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <span className="text-sm text-[var(--text-secondary)] flex-1">{a.action}</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase">{a.category}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
