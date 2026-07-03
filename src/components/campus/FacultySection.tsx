'use client';

import { GlassCard, SectionTitle, StatusBadge } from './WidgetCard';
import { Brain, FileQuestion, Lightbulb, Users, BarChart3, FileText, Sparkles, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCampusStore } from '@/lib/store';

const weakStudents = [
  { name: 'Rahul Verma', roll: 'CS2022042', attendance: 62, marks: 28, risk: 'HIGH', subject: 'Machine Learning' },
  { name: 'Priya Sharma', roll: 'CS2022051', attendance: 71, marks: 32, risk: 'MEDIUM', subject: 'DBMS' },
  { name: 'Arjun Nair', roll: 'CS2022033', attendance: 58, marks: 25, risk: 'HIGH', subject: 'Computer Networks' },
];

const classInsights = [
  { metric: 'Average Score', value: '76%', trend: '+3%', positive: true },
  { metric: 'Above 75% Threshold', value: '42/60', trend: '+5', positive: true },
  { metric: 'At-Risk Students', value: '8', trend: '-2', positive: true },
  { metric: 'Top Performers', value: '12', trend: '+1', positive: true },
];

export default function FacultySection() {
  const { setChatOpen } = useCampusStore();

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <SectionTitle>Faculty AI</SectionTitle>

      {/* AI Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: FileQuestion, title: 'Generate Question Paper', desc: 'AI creates balanced exam papers from syllabus', color: 'purple' },
          { icon: FileText, title: 'Create Lesson Plan', desc: 'Auto-generate weekly lesson plans', color: 'cyan' },
          { icon: BarChart3, title: 'Attendance Insights', desc: 'Identify patterns and at-risk students', color: 'green' },
          { icon: Lightbulb, title: 'Generate Rubrics', desc: 'Create detailed evaluation rubrics', color: 'orange' },
          { icon: Users, title: 'Weak Student Analysis', desc: 'AI identifies students needing support', color: 'pink' },
          { icon: GraduationCap, title: 'Assignment Evaluation', desc: 'Auto-grade assignments with feedback', color: 'blue' },
        ].map((tool, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => setChatOpen(true)}
            className="text-left p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all group"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
              tool.color === 'purple' ? 'bg-purple-500/10 border border-purple-500/20' :
              tool.color === 'cyan' ? 'bg-cyan-500/10 border border-cyan-500/20' :
              tool.color === 'green' ? 'bg-green-500/10 border border-green-500/20' :
              tool.color === 'orange' ? 'bg-orange-500/10 border border-orange-500/20' :
              tool.color === 'pink' ? 'bg-pink-500/10 border border-pink-500/20' :
              'bg-blue-500/10 border border-blue-500/20'
            }`}>
              <tool.icon className={`w-5 h-5 ${
                tool.color === 'purple' ? 'text-purple-400' :
                tool.color === 'cyan' ? 'text-cyan-400' :
                tool.color === 'green' ? 'text-green-400' :
                tool.color === 'orange' ? 'text-orange-400' :
                tool.color === 'pink' ? 'text-pink-400' :
                'text-blue-400'
              }`} />
            </div>
            <h4 className="text-white font-medium text-sm mb-1 group-hover:text-purple-300 transition-colors">{tool.title}</h4>
            <p className="text-xs text-gray-500">{tool.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Class Insights */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">Class Insights - Machine Learning (CS601)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {classInsights.map((insight, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-xs text-gray-500 mb-1">{insight.metric}</div>
              <div className="text-2xl font-bold text-white">{insight.value}</div>
              <div className={`text-xs mt-1 ${insight.positive ? 'text-green-400' : 'text-red-400'}`}>
                {insight.trend} vs last month
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Weak Students */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            <h3 className="text-white font-semibold">At-Risk Students</h3>
          </div>
          <span className="text-xs text-gray-500">AI-detected based on attendance & marks</span>
        </div>
        <div className="space-y-3">
          {weakStudents.map((s, i) => (
            <motion.div
              key={s.roll}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-bold text-orange-300 shrink-0">
                {s.name[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">{s.roll} • {s.subject}</div>
              </div>
              <div className="text-center px-3">
                <div className="text-xs text-gray-500">Attendance</div>
                <div className={`text-sm font-bold ${s.attendance < 65 ? 'text-red-400' : 'text-yellow-400'}`}>{s.attendance}%</div>
              </div>
              <div className="text-center px-3">
                <div className="text-xs text-gray-500">Marks</div>
                <div className="text-sm font-bold text-orange-400">{s.marks}/50</div>
              </div>
              <StatusBadge status={s.risk} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setChatOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-500/25 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> AI Action
              </motion.button>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* AI Recommendations */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">AI Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { title: 'Schedule Remedial Class', desc: '8 students need help with Neural Networks topic', priority: 'high' },
              { title: 'Update Question Bank', desc: 'Last 3 exams had low average in DBMS normalization', priority: 'medium' },
              { title: 'Send Progress Reports', desc: 'Mid-semester reports due in 5 days', priority: 'medium' },
              { title: 'Project Mentorship', desc: '3 students eligible for advanced research projects', priority: 'low' },
            ].map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className={`w-1 h-full rounded-full shrink-0 ${rec.priority === 'high' ? 'bg-red-400' : rec.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{rec.title}</div>
                  <div className="text-xs text-gray-500">{rec.desc}</div>
                </div>
                <button className="text-xs text-purple-400 hover:text-purple-300 shrink-0">View</button>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
