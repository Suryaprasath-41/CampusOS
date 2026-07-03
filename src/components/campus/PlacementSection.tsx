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
    return <div className="p-6"><div className="h-64 bg-white/[0.03] rounded-2xl animate-pulse" /></div>;
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
      <SectionTitle>Placement Agent</SectionTitle>

      {/* Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Score */}
        <GlassCard className="flex flex-col items-center py-8">
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
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
              <span className="text-4xl font-bold text-white">{readiness.total}</span>
              <span className="text-xs text-gray-400">/ 100</span>
            </div>
          </div>
          <h3 className="text-white font-semibold mb-1">Placement Readiness</h3>
          <p className="text-xs text-gray-500">Based on CGPA, Skills, Projects & Communication</p>
        </GlassCard>

        {/* Radar Chart */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">Skill Profile</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 30]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Skill Gaps */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-orange-400" />
            <h3 className="text-white font-semibold">Skill Gaps</h3>
          </div>
          <div className="space-y-2">
            {skillGaps.map((gap: string) => (
              <div key={gap} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/10">
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <span className="text-sm text-gray-300">{gap}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400 font-medium">Current Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill: string) => (
                <span key={skill} className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-[10px] font-medium">
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
          <Briefcase className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Active Applications</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {applications.map((app: any) => (
            <motion.div
              key={app.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold">{app.company}</h4>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-sm text-gray-400 mb-1">{app.role}</p>
              {app.package && <p className="text-xs text-cyan-400">₹{app.package.toLocaleString()}/mo</p>}
              {app.interviewDate && (
                <p className="text-xs text-yellow-400 mt-1">
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
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">Recommended for You</h3>
        </div>
        <div className="space-y-3">
          {companies.map((c: any) => (
            <div key={c.name} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div>
                <div className="text-white font-medium">{c.name}</div>
                <div className="text-sm text-gray-400">{c.role}</div>
                <div className="flex gap-1.5 mt-1.5">
                  {c.skills.map((s: string) => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[10px] text-gray-400">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">{c.match}%</div>
                <div className="text-[10px] text-gray-500">match</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Action Items */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">Recommended Actions</h3>
        </div>
        <div className="space-y-2">
          {actions.map((a: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                a.priority === 'high' ? 'bg-red-400' :
                a.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
              }`} />
              <span className="text-sm text-gray-300 flex-1">{a.action}</span>
              <span className="text-[10px] text-gray-500 uppercase">{a.category}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
