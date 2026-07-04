'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import {
  LayoutDashboard, BookOpen, ClipboardCheck, FileText, FlaskConical,
  CalendarDays, Bot, Users, Clock, Sparkles, ChevronRight,
  TrendingUp, AlertTriangle, GraduationCap, Brain, Send,
  CheckCircle2, XCircle, Plus, Search, MessageSquare, Zap,
  Activity, Target, BarChart3, Filter, Calendar, Bell,
  ChevronDown, Eye, Edit3, Star, ExternalLink, Hash,
  ArrowUpRight, Lightbulb, FileQuestion, Mic, Bot as BotIcon,
  UserCheck, UserX, Save, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedCounter from './AnimatedCounter';
import WidgetCard, { GlassCard, SectionTitle, PredictionBar } from './WidgetCard';
import { useCampusStore } from '@/lib/store';

// ─── Tab Configuration ───────────────────────────────────────────────
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'classes', label: 'My Classes', icon: BookOpen },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  { id: 'assignments', label: 'Assignments', icon: FileText },
  { id: 'research', label: 'Research', icon: FlaskConical },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
] as const;

type TabId = (typeof tabs)[number]['id'];

// ─── Department Colors ────────────────────────────────────────────────
const deptColors: Record<string, { accent: string; bg: string; border: string; text: string; gradient: string }> = {
  CS: { accent: 'purple', bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', gradient: 'from-purple-500 to-violet-600' },
  IT: { accent: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', gradient: 'from-cyan-500 to-blue-600' },
  ECE: { accent: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', gradient: 'from-blue-500 to-indigo-600' },
  EEE: { accent: 'yellow', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', gradient: 'from-yellow-500 to-amber-600' },
  ME: { accent: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', gradient: 'from-orange-500 to-red-600' },
  CE: { accent: 'green', bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', gradient: 'from-green-500 to-emerald-600' },
};

// ─── Mock Data ────────────────────────────────────────────────────────
const facultyProfile = {
  name: 'Dr. Priya Sharma',
  designation: 'Associate Professor',
  department: 'CS',
  facultyId: 'FAC2018012',
  email: 'priya.sharma@campus.edu',
  specializations: ['Machine Learning', 'Deep Learning', 'Computer Vision'],
  semester: 'Even 2025',
  experience: 7,
};

const myClasses = [
  {
    id: 'CS601', name: 'Machine Learning', department: 'CS', semester: 6,
    students: 32, schedule: 'Mon/Wed 10:00-11:30', room: 'LH-201',
    avgAttendance: 87, avgPerformance: 76,
    studentsList: [
      { name: 'Aarav Patel', roll: 'CS2022030', attendance: 92, grade: 'A' },
      { name: 'Diya Sharma', roll: 'CS2022031', attendance: 88, grade: 'A-' },
      { name: 'Rohan Kumar', roll: 'CS2022032', attendance: 75, grade: 'B+' },
      { name: 'Ananya Singh', roll: 'CS2022033', attendance: 95, grade: 'A+' },
      { name: 'Vikram Reddy', roll: 'CS2022034', attendance: 68, grade: 'B' },
      { name: 'Priya Nair', roll: 'CS2022035', attendance: 82, grade: 'A-' },
      { name: 'Arjun Mehta', roll: 'CS2022036', attendance: 71, grade: 'B+' },
      { name: 'Kavya Iyer', roll: 'CS2022037', attendance: 90, grade: 'A' },
      { name: 'Rahul Verma', roll: 'CS2022038', attendance: 55, grade: 'C+' },
      { name: 'Sneha Das', roll: 'CS2022039', attendance: 85, grade: 'A-' },
      { name: 'Aditya Joshi', roll: 'CS2022040', attendance: 78, grade: 'B+' },
      { name: 'Meera Gupta', roll: 'CS2022041', attendance: 93, grade: 'A+' },
      { name: 'Karthik Rao', roll: 'CS2022042', attendance: 60, grade: 'C' },
      { name: 'Ishita Bansal', roll: 'CS2022043', attendance: 89, grade: 'A' },
      { name: 'Varun Pillai', roll: 'CS2022044', attendance: 73, grade: 'B' },
      { name: 'Neha Chauhan', roll: 'CS2022045', attendance: 86, grade: 'A-' },
    ],
  },
  {
    id: 'CS503', name: 'Probability & Statistics', department: 'CS', semester: 4,
    students: 28, schedule: 'Tue/Thu 09:00-10:30', room: 'LH-101',
    avgAttendance: 82, avgPerformance: 71,
    studentsList: [
      { name: 'Amit Tiwari', roll: 'CS2023010', attendance: 90, grade: 'A' },
      { name: 'Pooja Saxena', roll: 'CS2023011', attendance: 85, grade: 'B+' },
      { name: 'Siddharth Rao', roll: 'CS2023012', attendance: 78, grade: 'B' },
      { name: 'Ritu Sharma', roll: 'CS2023013', attendance: 92, grade: 'A+' },
      { name: 'Nikhil Jain', roll: 'CS2023014', attendance: 65, grade: 'C+' },
      { name: 'Tanvi Mishra', roll: 'CS2023015', attendance: 88, grade: 'A-' },
      { name: 'Deepak Yadav', roll: 'CS2023016', attendance: 70, grade: 'B' },
      { name: 'Shruti Pandey', roll: 'CS2023017', attendance: 94, grade: 'A+' },
      { name: 'Manish Kumar', roll: 'CS2023018', attendance: 58, grade: 'C' },
      { name: 'Anjali Dwivedi', roll: 'CS2023019', attendance: 83, grade: 'A-' },
      { name: 'Prateek Soni', roll: 'CS2023020', attendance: 76, grade: 'B+' },
      { name: 'Nisha Agarwal', roll: 'CS2023021', attendance: 87, grade: 'A' },
    ],
  },
  {
    id: 'CS702', name: 'Deep Learning', department: 'CS', semester: 8,
    students: 18, schedule: 'Wed/Fri 14:00-15:30', room: 'LH-301',
    avgAttendance: 91, avgPerformance: 79,
    studentsList: [
      { name: 'Harsh Vardhan', roll: 'CS2021005', attendance: 96, grade: 'A+' },
      { name: 'Swati Kumari', roll: 'CS2021006', attendance: 93, grade: 'A' },
      { name: 'Rajesh Singh', roll: 'CS2021007', attendance: 89, grade: 'A-' },
      { name: 'Pallavi Verma', roll: 'CS2021008', attendance: 91, grade: 'A' },
      { name: 'Suresh Reddy', roll: 'CS2021009', attendance: 85, grade: 'B+' },
      { name: 'Divya Sharma', roll: 'CS2021010', attendance: 88, grade: 'A-' },
      { name: 'Akhil Nair', roll: 'CS2021011', attendance: 94, grade: 'A+' },
      { name: 'Meghna Iyer', roll: 'CS2021012', attendance: 82, grade: 'B+' },
    ],
  },
];

const todaySchedule = [
  { time: '09:00 AM', subject: 'Probability & Statistics', room: 'LH-101', duration: '1.5 hrs', status: 'completed' },
  { time: '10:00 AM', subject: 'Machine Learning', room: 'LH-201', duration: '1.5 hrs', status: 'ongoing' },
  { time: '02:00 PM', subject: 'Deep Learning', room: 'LH-301', duration: '1.5 hrs', status: 'upcoming' },
  { time: '04:00 PM', subject: 'ML Lab Session', room: 'Lab-3', duration: '2 hrs', status: 'upcoming' },
];

const recentQueries = [
  { student: 'Aarav Patel', query: 'Can you explain the bias-variance tradeoff again?', time: '10 min ago', subject: 'ML' },
  { student: 'Diya Sharma', query: 'What is the difference between L1 and L2 regularization?', time: '25 min ago', subject: 'ML' },
  { student: 'Ritu Sharma', query: 'How to interpret confidence intervals?', time: '1 hr ago', subject: 'P&S' },
  { student: 'Harsh Vardhan', query: 'When should we use GANs vs VAEs?', time: '2 hrs ago', subject: 'DL' },
  { student: 'Sneha Das', query: 'Is the midterm covering Chapter 7?', time: '3 hrs ago', subject: 'ML' },
];

const researchPapers = [
  { id: 1, title: 'Adaptive Learning Rate Scheduling for Transformer Models', journal: 'IEEE Trans. on Neural Networks', status: 'published', year: 2024, citations: 47, coAuthors: ['Dr. Rajesh Kumar', 'Dr. Meena Iyer'], doi: '10.1109/TNN.2024.001' },
  { id: 2, title: 'Federated Learning in Resource-Constrained Edge Devices', journal: 'ACM Computing Surveys', status: 'under_review', year: 2025, citations: 0, coAuthors: ['Dr. Amit Das', 'Prof. Lisa Chen'], doi: 'pending' },
  { id: 3, title: 'Explainable AI for Medical Image Classification', journal: 'Nature Machine Intelligence', status: 'published', year: 2023, citations: 124, coAuthors: ['Dr. Sunita Reddy', 'Dr. James Park'], doi: '10.1038/s42256-023.012' },
  { id: 4, title: 'Neural Architecture Search Using Evolutionary Algorithms', journal: 'CVPR 2025', status: 'accepted', year: 2025, citations: 0, coAuthors: ['Dr. Vikram Singh'], doi: '10.1109/CVPR.2025.045' },
  { id: 5, title: 'Attention Mechanisms in Graph Neural Networks', journal: 'ICLR 2024', status: 'published', year: 2024, citations: 89, coAuthors: ['Dr. Priyanka Patel', 'Dr. Wei Zhang'], doi: '10.48550/arXiv.2401.123' },
];

const assignments = [
  {
    id: 1, title: 'Linear Regression Implementation', subject: 'Machine Learning', subjectCode: 'CS601',
    dueDate: '2025-03-15', maxMarks: 100, description: 'Implement linear regression from scratch using NumPy. Compare with scikit-learn implementation.',
    submissions: 28, totalStudents: 32, graded: 20,
    studentSubmissions: [
      { name: 'Aarav Patel', roll: 'CS2022030', submitted: true, date: '2025-03-14', score: 92, feedback: 'Excellent implementation and documentation.' },
      { name: 'Diya Sharma', roll: 'CS2022031', submitted: true, date: '2025-03-13', score: 88, feedback: 'Good work, minor issues with gradient calculation.' },
      { name: 'Rohan Kumar', roll: 'CS2022032', submitted: true, date: '2025-03-15', score: 75, feedback: 'Missing regularization implementation.' },
      { name: 'Ananya Singh', roll: 'CS2022033', submitted: true, date: '2025-03-12', score: 95, feedback: 'Outstanding! Extra credit for visualization.' },
      { name: 'Vikram Reddy', roll: 'CS2022034', submitted: true, date: '2025-03-15', score: 68, feedback: 'Basic implementation, needs better code structure.' },
      { name: 'Rahul Verma', roll: 'CS2022038', submitted: false, date: '-', score: 0, feedback: '' },
    ],
  },
  {
    id: 2, title: 'Bayesian Inference Problems', subject: 'Probability & Statistics', subjectCode: 'CS503',
    dueDate: '2025-03-20', maxMarks: 50, description: 'Solve 10 problems on Bayesian inference, posterior distributions, and conjugate priors.',
    submissions: 18, totalStudents: 28, graded: 10,
    studentSubmissions: [
      { name: 'Amit Tiwari', roll: 'CS2023010', submitted: true, date: '2025-03-18', score: 46, feedback: 'Very good understanding of conjugate priors.' },
      { name: 'Pooja Saxena', roll: 'CS2023011', submitted: true, date: '2025-03-19', score: 40, feedback: 'Good, review problem 7 solution.' },
      { name: 'Nikhil Jain', roll: 'CS2023014', submitted: false, date: '-', score: 0, feedback: '' },
    ],
  },
  {
    id: 3, title: 'CNN Architecture Comparison', subject: 'Deep Learning', subjectCode: 'CS702',
    dueDate: '2025-03-25', maxMarks: 100, description: 'Compare VGG, ResNet, and EfficientNet on CIFAR-10. Analyze performance and computational cost.',
    submissions: 8, totalStudents: 18, graded: 0,
    studentSubmissions: [
      { name: 'Harsh Vardhan', roll: 'CS2021005', submitted: true, date: '2025-03-22', score: 0, feedback: '' },
      { name: 'Swati Kumari', roll: 'CS2021006', submitted: true, date: '2025-03-23', score: 0, feedback: '' },
      { name: 'Akhil Nair', roll: 'CS2021011', submitted: true, date: '2025-03-24', score: 0, feedback: '' },
    ],
  },
];

const weeklySchedule: Record<string, { time: string; subject: string; room: string; dept: string }[]> = {
  Mon: [
    { time: '09:00-10:30', subject: 'Probability & Statistics', room: 'LH-101', dept: 'CS' },
    { time: '10:00-11:30', subject: 'Machine Learning', room: 'LH-201', dept: 'CS' },
    { time: '14:00-15:30', subject: 'Deep Learning', room: 'LH-301', dept: 'CS' },
  ],
  Tue: [
    { time: '09:00-10:30', subject: 'Probability & Statistics', room: 'LH-101', dept: 'CS' },
    { time: '11:00-12:30', subject: 'ML Lab', room: 'Lab-3', dept: 'CS' },
  ],
  Wed: [
    { time: '10:00-11:30', subject: 'Machine Learning', room: 'LH-201', dept: 'CS' },
    { time: '14:00-15:30', subject: 'Deep Learning', room: 'LH-301', dept: 'CS' },
    { time: '16:00-17:00', subject: 'Office Hours', room: 'Cabin-12', dept: 'CS' },
  ],
  Thu: [
    { time: '09:00-10:30', subject: 'Probability & Statistics', room: 'LH-101', dept: 'CS' },
    { time: '14:00-16:00', subject: 'Research Meeting', room: 'Conf Room', dept: 'CS' },
  ],
  Fri: [
    { time: '10:00-11:30', subject: 'Machine Learning', room: 'LH-201', dept: 'CS' },
    { time: '14:00-15:30', subject: 'Deep Learning', room: 'LH-301', dept: 'CS' },
  ],
  Sat: [],
};

const engagementData = [
  { week: 'W1', ml: 88, ps: 82, dl: 94 },
  { week: 'W2', ml: 85, ps: 79, dl: 91 },
  { week: 'W3', ml: 82, ps: 75, dl: 89 },
  { week: 'W4', ml: 86, ps: 80, dl: 92 },
  { week: 'W5', ml: 90, ps: 83, dl: 95 },
  { week: 'W6', ml: 87, ps: 81, dl: 93 },
  { week: 'W7', ml: 84, ps: 78, dl: 90 },
  { week: 'W8', ml: 89, ps: 85, dl: 96 },
];

const citationData = [
  { month: 'Jan', citations: 12 },
  { month: 'Feb', citations: 18 },
  { month: 'Mar', citations: 15 },
  { month: 'Apr', citations: 22 },
  { month: 'May', citations: 28 },
  { month: 'Jun', citations: 35 },
  { month: 'Jul', citations: 31 },
  { month: 'Aug', citations: 40 },
  { month: 'Sep', citations: 38 },
  { month: 'Oct', citations: 45 },
  { month: 'Nov', citations: 52 },
  { month: 'Dec', citations: 60 },
];

const aiAgents = [
  { id: 'teaching', name: 'Teaching Assistant', icon: GraduationCap, description: 'Help with lesson plans, quizzes, and content creation', active: true, tokens: 12450 },
  { id: 'grading', name: 'Grading Agent', icon: CheckCircle2, description: 'Auto-grade submissions and provide feedback', active: true, tokens: 8920 },
  { id: 'research', name: 'Research Assistant', icon: FlaskConical, description: 'Literature review, paper analysis, and citations', active: false, tokens: 3200 },
];

const suggestedPrompts = [
  'Generate quiz questions for Machine Learning midterm',
  'Summarize student performance this semester',
  'Create a lesson plan for Convolutional Neural Networks',
  'Suggest improvements for low-attendance students',
  'Draft a research proposal on attention mechanisms',
  'Analyze assignment grade distribution',
];

// ─── Custom Tooltip for Recharts ──────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/[0.1] rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────
// Map from store section IDs to FacultyPortal tab IDs
const sectionToTabMap: Record<string, TabId> = {
  dashboard: 'dashboard',
  'my-classes': 'classes',
  attendance: 'attendance',
  assignments: 'assignments',
  research: 'research',
  schedule: 'schedule',
  'ai-assistant': 'ai-assistant',
};

export default function FacultyPortal() {
  const { activeSection, setActiveSection } = useCampusStore();
  const [activeTab, setActiveTab] = useState<TabId>(sectionToTabMap[activeSection] || 'dashboard');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState(myClasses[0]);
  const [attendanceDate, setAttendanceDate] = useState('2025-03-04');
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>(
    () => Object.fromEntries(myClasses[0].studentsList.map(s => [s.roll, true]))
  );
  const [selectedAssignment, setSelectedAssignment] = useState<typeof assignments[0] | null>(null);
  const [showNewAssignment, setShowNewAssignment] = useState(false);
  const [showNewResearch, setShowNewResearch] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; agent?: string }[]>([
    { role: 'assistant', content: 'Hello Dr. Sharma! I\'m your faculty AI assistant. I can help with teaching materials, grading, research, and student analytics. How can I assist you today?', agent: 'Teaching Assistant' },
  ]);
  const [selectedAgent, setSelectedAgent] = useState('teaching');
  const { setChatOpen } = useCampusStore();

  // Sync tab with store's activeSection
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    // Update store section so sidebar highlights correctly
    const tabToSection: Record<string, string> = {
      dashboard: 'dashboard',
      classes: 'my-classes',
      attendance: 'attendance',
      assignments: 'assignments',
      research: 'research',
      schedule: 'schedule',
      'ai-assistant': 'ai-assistant',
    };
    setActiveSection(tabToSection[tab] || 'dashboard');
  };

  // Also sync when activeSection changes from sidebar
  const mappedTab = sectionToTabMap[activeSection];
  if (mappedTab && mappedTab !== activeTab) {
    setActiveTab(mappedTab);
  }

  // Attendance stats
  const presentCount = Object.values(attendanceData).filter(v => v).length;
  const absentCount = Object.values(attendanceData).filter(v => !v).length;
  const attendancePct = Math.round((presentCount / (presentCount + absentCount)) * 100);

  const toggleAllPresent = () => {
    const newData: Record<string, boolean> = {};
    selectedClass.studentsList.forEach(s => { newData[s.roll] = true; });
    setAttendanceData(newData);
  };

  const toggleAllAbsent = () => {
    const newData: Record<string, boolean> = {};
    selectedClass.studentsList.forEach(s => { newData[s.roll] = false; });
    setAttendanceData(newData);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const agent = aiAgents.find(a => a.id === selectedAgent);
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'll help you with "${chatInput}". Let me analyze the data and generate the content for you. Based on your class records, I can see several patterns that would be useful for this request. Would you like me to provide more detailed results?`,
        agent: agent?.name || 'Teaching Assistant',
      }]);
    }, 800);
    setChatInput('');
  };

  // ─── Dashboard Tab ──────────────────────────────────────────────────
  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600/10 via-violet-600/5 to-cyan-600/10 border border-white/[0.08] p-6"
      >
        <span className="absolute inset-0 overflow-hidden rounded-3xl">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_4s_ease-in-out_infinite]" style={{ transform: 'translateX(-100%)' }} />
        </span>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-300 uppercase tracking-wider">Faculty Portal</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Welcome, <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">{facultyProfile.name}</span> 👋
            </h2>
            <p className="text-sm text-gray-400">
              {facultyProfile.designation} • {facultyProfile.department} Department • {facultyProfile.semester} Semester
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTabChange('ai-assistant')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)] relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Brain className="w-4 h-4 relative z-10" />
              <span className="relative z-10">AI Assistant</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTabChange('attendance')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-sm font-medium hover:bg-white/[0.08] transition-colors"
            >
              <ClipboardCheck className="w-4 h-4 text-cyan-400" />
              Mark Attendance
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: 'My Classes', value: 3, icon: BookOpen, color: 'purple', suffix: '' },
          { title: 'Total Students', value: 78, icon: Users, color: 'cyan', suffix: '' },
          { title: "Today's Classes", value: 4, icon: Clock, color: 'green', suffix: '' },
          { title: 'Pending Reviews', value: 12, icon: AlertTriangle, color: 'yellow', suffix: '' },
          { title: 'Research Papers', value: 5, icon: FlaskConical, color: 'blue', suffix: '' },
          { title: 'AI Queries', value: 184, icon: Zap, color: 'orange', suffix: '' },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative group/card rounded-2xl p-[1px] bg-gradient-to-b from-transparent via-transparent to-transparent hover:from-purple-500/40 hover:via-cyan-500/20 hover:to-purple-500/40 transition-all duration-500"
          >
            <WidgetCard
              title={stat.title}
              value={<AnimatedCounter value={stat.value} suffix={stat.suffix} />}
              icon={<stat.icon className={cn('w-5 h-5', stat.color === 'purple' ? 'text-purple-400' : stat.color === 'cyan' ? 'text-cyan-400' : stat.color === 'green' ? 'text-green-400' : stat.color === 'yellow' ? 'text-yellow-400' : stat.color === 'blue' ? 'text-blue-400' : 'text-orange-400')} />}
            />
          </motion.div>
        ))}
      </div>

      {/* Live Activity Ticker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
      >
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-white/[0.08]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[10px] text-green-400 uppercase tracking-wider font-semibold">Live</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="flex gap-8 whitespace-nowrap text-xs text-gray-400"
          >
            <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-purple-400" /> 3 new ML assignment submissions received</span>
            <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-cyan-400" /> Deep Learning class attendance: 91%</span>
            <span className="flex items-center gap-1.5"><FlaskConical className="w-3 h-3 text-green-400" /> Paper cited 3 times today</span>
            <span className="flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 text-yellow-400" /> 2 students flagged for low attendance</span>
            <span className="flex items-center gap-1.5"><Brain className="w-3 h-3 text-blue-400" /> AI Grading Agent processed 15 submissions</span>
            <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-purple-400" /> 3 new ML assignment submissions received</span>
            <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-cyan-400" /> Deep Learning class attendance: 91%</span>
            <span className="flex items-center gap-1.5"><FlaskConical className="w-3 h-3 text-green-400" /> Paper cited 3 times today</span>
          </motion.div>
        </div>
      </motion.div>

      {/* AI Predictions */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                <Zap className="w-5 h-5 text-purple-400" />
              </motion.div>
              <h3 className="text-white font-semibold">AI Predictions</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">Live</span>
            </div>
            <span className="text-xs text-gray-500">Updated 2 min ago</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-400 text-sm">Class Engagement</span>
                <span className="text-white text-sm font-semibold"><AnimatedCounter value={86} suffix="%" /></span>
              </div>
              <div className="h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '86%' }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.4)]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-400 text-sm">Student Performance</span>
                <span className="text-white text-sm font-semibold"><AnimatedCounter value={78} suffix="%" /></span>
              </div>
              <div className="h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '78%' }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(34,211,238,0.4)]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-400 text-sm">Workload Balance</span>
                <span className="text-white text-sm font-semibold"><AnimatedCounter value={65} suffix="%" /></span>
              </div>
              <div className="h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ClipboardCheck, label: 'Mark Attendance', desc: 'Today\'s classes', color: 'purple', action: () => handleTabChange('attendance') },
          { icon: FileText, label: 'Grade Assignments', desc: '12 pending reviews', color: 'cyan', action: () => handleTabChange('assignments') },
          { icon: Bell, label: 'Send Notification', desc: 'To students', color: 'green', action: () => {} },
          { icon: Brain, label: 'AI Teaching Assistant', desc: 'Get AI help', color: 'blue', action: () => handleTabChange('ai-assistant') },
        ].map((qa, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={qa.action}
            className="text-left p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all group"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3',
              qa.color === 'purple' ? 'bg-purple-500/10 border border-purple-500/20' :
              qa.color === 'cyan' ? 'bg-cyan-500/10 border border-cyan-500/20' :
              qa.color === 'green' ? 'bg-green-500/10 border border-green-500/20' :
              'bg-blue-500/10 border border-blue-500/20'
            )}>
              <qa.icon className={cn('w-5 h-5',
                qa.color === 'purple' ? 'text-purple-400' :
                qa.color === 'cyan' ? 'text-cyan-400' :
                qa.color === 'green' ? 'text-green-400' : 'text-blue-400'
              )} />
            </div>
            <div className="text-sm text-white font-medium group-hover:text-purple-300 transition-colors">{qa.label}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              {qa.desc}
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Schedule & Queries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">Today&apos;s Schedule</h3>
            </div>
            <button onClick={() => handleTabChange('schedule')} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View week <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {todaySchedule.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-all"
              >
                <div className={cn('w-1 h-10 rounded-full shrink-0',
                  item.status === 'completed' ? 'bg-green-500/60' :
                  item.status === 'ongoing' ? 'bg-gradient-to-b from-purple-500 to-cyan-500' :
                  'bg-gray-600'
                )} />
                <div className="text-xs text-purple-400 font-mono w-20 shrink-0">{item.time}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{item.subject}</div>
                  <div className="text-xs text-gray-500">{item.room} • {item.duration}</div>
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0',
                  item.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  item.status === 'ongoing' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse' :
                  'bg-white/[0.04] text-gray-400 border-white/[0.08]'
                )}>
                  {item.status === 'completed' ? 'Done' : item.status === 'ongoing' ? 'Live' : 'Next'}
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Queries */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Recent Student Queries</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">5 new</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
            {recentQueries.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer border-l-2 border-l-purple-500/60"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                  {q.student[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">{q.student}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">{q.subject}</span>
                  </div>
                  <div className="text-xs text-gray-400 truncate">{q.query}</div>
                  <div className="text-[10px] text-gray-600 mt-0.5">{q.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Engagement Chart */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">Class Engagement Trend</h3>
          </div>
          <span className="text-xs text-gray-500">Last 8 weeks</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} domain={[60, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ml" name="Machine Learning" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} />
              <Line type="monotone" dataKey="ps" name="Probability & Stats" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} />
              <Line type="monotone" dataKey="dl" name="Deep Learning" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );

  // ─── My Classes Tab ─────────────────────────────────────────────────
  const ClassesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <SectionTitle>My Classes</SectionTitle>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myClasses.map((cls, i) => {
          const colors = deptColors[cls.department] || deptColors.CS;
          const isExpanded = expandedClass === cls.id;
          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] backdrop-blur-xl transition-all overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', colors.bg, colors.border, colors.text)}>
                        {cls.department}
                      </span>
                      <span className="text-[10px] text-gray-500">Sem {cls.semester}</span>
                    </div>
                    <h4 className="text-white font-semibold">{cls.name}</h4>
                    <p className="text-xs text-gray-500">{cls.id}</p>
                  </div>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors.bg, 'border', colors.border)}>
                    <BookOpen className={cn('w-5 h-5', colors.text)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] text-gray-500">Students</div>
                    <div className="text-lg font-bold text-white">{cls.students}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] text-gray-500">Avg Attendance</div>
                    <div className="text-lg font-bold text-white">{cls.avgAttendance}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Clock className="w-3 h-3" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Target className="w-3 h-3" />
                  <span>Room {cls.room}</span>
                </div>
              </div>

              {/* Expand Button */}
              <button
                onClick={() => setExpandedClass(isExpanded ? null : cls.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-white/[0.06] text-xs text-gray-400 hover:text-white hover:bg-white/[0.02] transition-colors"
              >
                {isExpanded ? 'Hide' : 'View'} Students
                <ChevronDown className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')} />
              </button>

              {/* Student List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-4 pt-0 space-y-2">
                      {cls.studentsList.map((student, si) => (
                        <motion.div
                          key={student.roll}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: si * 0.02 }}
                          className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-purple-300 shrink-0">
                            {student.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-white truncate">{student.name}</div>
                            <div className="text-[10px] text-gray-500">{student.roll}</div>
                          </div>
                          <div className="text-[10px] text-gray-500">Att: <span className={student.attendance < 70 ? 'text-red-400' : student.attendance < 80 ? 'text-yellow-400' : 'text-green-400'}>{student.attendance}%</span></div>
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium',
                            student.grade.startsWith('A') ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            student.grade.startsWith('B') ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          )}>
                            {student.grade}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  // ─── Attendance Tab ─────────────────────────────────────────────────
  const AttendanceTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <ClipboardCheck className="w-5 h-5 text-white" />
        </div>
        <SectionTitle>Mark Attendance</SectionTitle>
      </div>

      {/* Class & Date Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-400 mb-1.5 block">Select Class</label>
          <div className="flex gap-3">
            {myClasses.map(cls => (
              <motion.button
                key={cls.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedClass(cls);
                  setAttendanceData(Object.fromEntries(cls.studentsList.map(s => [s.roll, true])));
                }}
                className={cn(
                  'flex-1 p-3 rounded-xl border text-left transition-all',
                  selectedClass.id === cls.id
                    ? 'bg-purple-500/10 border-purple-500/30 text-white'
                    : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/[0.15]'
                )}
              >
                <div className="text-sm font-medium">{cls.name}</div>
                <div className="text-[10px] text-gray-500">{cls.students} students</div>
              </motion.button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Date</label>
          <div className="relative">
            <input
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="text-center">
          <div className="text-2xl font-bold text-green-400"><AnimatedCounter value={presentCount} /></div>
          <div className="text-xs text-gray-400 mt-1">Present</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-2xl font-bold text-red-400"><AnimatedCounter value={absentCount} /></div>
          <div className="text-xs text-gray-400 mt-1">Absent</div>
        </GlassCard>
        <GlassCard className="text-center">
          <div className="text-2xl font-bold text-cyan-400"><AnimatedCounter value={attendancePct} suffix="%" /></div>
          <div className="text-xs text-gray-400 mt-1">Percentage</div>
        </GlassCard>
      </div>

      {/* AI Anomaly Alert */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 px-4 py-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20"
      >
        <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-sm text-yellow-300 font-medium">AI Anomaly Alert</div>
          <div className="text-xs text-yellow-400/70">3 students marked present but were absent in previous class: Rahul Verma (CS2022038), Karthik Rao (CS2022042), Deepak Yadav (CS2023016)</div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleAllPresent}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors"
        >
          <UserCheck className="w-4 h-4" /> Mark All Present
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleAllAbsent}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          <UserX className="w-4 h-4" /> Mark All Absent
        </motion.button>
      </div>

      {/* Student List with Toggle */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">{selectedClass.name} - Attendance</h3>
          </div>
          <span className="text-xs text-gray-500">{selectedClass.studentsList.length} students</span>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {selectedClass.studentsList.map((student, i) => (
            <motion.div
              key={student.roll}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                {student.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white">{student.name}</div>
                <div className="text-[10px] text-gray-500">{student.roll}</div>
              </div>
              <div className="text-[10px] text-gray-500 mr-2">Prev: <span className={student.attendance < 75 ? 'text-red-400' : 'text-green-400'}>{student.attendance}%</span></div>
              {/* Toggle Switch */}
              <button
                onClick={() => setAttendanceData(prev => ({ ...prev, [student.roll]: !prev[student.roll] }))}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0',
                  attendanceData[student.roll] ? 'bg-green-500/40' : 'bg-red-500/40'
                )}
              >
                <motion.div
                  animate={{ x: attendanceData[student.roll] ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                />
                <span className={cn('absolute text-[8px] font-bold top-1 transition-opacity',
                  attendanceData[student.roll] ? 'left-1.5 text-green-900 opacity-100' : 'left-6 text-red-900 opacity-100'
                )}>
                  {attendanceData[student.roll] ? 'P' : 'A'}
                </span>
              </button>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Mock save - show toast-like feedback
            const btn = document.getElementById('save-attendance-btn');
            if (btn) {
              btn.textContent = '✓ Saved Successfully!';
              btn.classList.add('bg-green-500/20', 'border-green-500/30', 'text-green-400');
              setTimeout(() => {
                btn.innerHTML = '<span class="flex items-center gap-2"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save & Submit</span>';
                btn.classList.remove('bg-green-500/20', 'border-green-500/30', 'text-green-400');
              }, 2000);
            }
          }}
          id="save-attendance-btn"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-500/25 transition-colors"
        >
          <Save className="w-4 h-4" /> Save & Submit
        </motion.button>
      </div>
    </div>
  );

  // ─── Assignments Tab ────────────────────────────────────────────────
  const AssignmentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <SectionTitle>Assignments</SectionTitle>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewAssignment(!showNewAssignment)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-500/25 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Assignment
        </motion.button>
      </div>

      {/* New Assignment Form */}
      <AnimatePresence>
        {showNewAssignment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" /> Create New Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Title</label>
                  <input type="text" placeholder="Assignment title" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-gray-600" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Subject</label>
                  <select className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark]">
                    <option value="CS601">Machine Learning (CS601)</option>
                    <option value="CS503">Probability & Statistics (CS503)</option>
                    <option value="CS702">Deep Learning (CS702)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Due Date</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Max Marks</label>
                  <input type="number" placeholder="100" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-gray-600" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1.5 block">Description</label>
                  <textarea placeholder="Assignment description..." rows={3} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors resize-none placeholder:text-gray-600" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowNewAssignment(false)} className="px-4 py-2 rounded-xl text-gray-400 text-sm hover:text-white transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <Save className="w-4 h-4" /> Create Assignment
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignment List */}
      {selectedAssignment ? (
        /* Assignment Detail / Grading View */
        <div>
          <button onClick={() => setSelectedAssignment(null)} className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> Back to Assignments
          </button>
          <GlassCard>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">{selectedAssignment.title}</h3>
                <p className="text-xs text-gray-500">{selectedAssignment.subject} • Due: {selectedAssignment.dueDate} • Max: {selectedAssignment.maxMarks} marks</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-500/25 transition-colors"
              >
                <Sparkles className="w-3 h-3" /> AI Auto-Grade
              </motion.button>
            </div>
            <p className="text-sm text-gray-400 mb-4">{selectedAssignment.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <div className="text-lg font-bold text-white">{selectedAssignment.submissions}/{selectedAssignment.totalStudents}</div>
                <div className="text-[10px] text-gray-500">Submitted</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <div className="text-lg font-bold text-green-400">{selectedAssignment.graded}</div>
                <div className="text-[10px] text-gray-500">Graded</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center">
                <div className="text-lg font-bold text-yellow-400">{selectedAssignment.submissions - selectedAssignment.graded}</div>
                <div className="text-[10px] text-gray-500">Pending</div>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {selectedAssignment.studentSubmissions.map((sub, i) => (
                <motion.div
                  key={sub.roll}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn('flex items-center gap-3 p-3 rounded-xl border transition-colors',
                    sub.submitted ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-red-500/[0.03] border-red-500/10'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                    {sub.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">{sub.name}</div>
                    <div className="text-[10px] text-gray-500">{sub.roll} • Submitted: {sub.date}</div>
                  </div>
                  {sub.submitted ? (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={sub.score || ''}
                          placeholder="Score"
                          className="w-16 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-xs text-center focus:outline-none focus:border-purple-500/50"
                        />
                        <span className="text-[10px] text-gray-500">/{selectedAssignment.maxMarks}</span>
                      </div>
                      <input
                        type="text"
                        defaultValue={sub.feedback}
                        placeholder="Feedback"
                        className="w-40 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-purple-500/50 placeholder:text-gray-600"
                      />
                    </>
                  ) : (
                    <span className="text-xs text-red-400 font-medium">Not Submitted</span>
                  )}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : (
        /* Assignment Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((asgn, i) => (
            <motion.div
              key={asgn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedAssignment(asgn)}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] backdrop-blur-xl transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium text-sm group-hover:text-purple-300 transition-colors">{asgn.title}</h4>
                  <p className="text-[10px] text-gray-500">{asgn.subject} • {asgn.subjectCode}</p>
                </div>
                <FileText className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{asgn.description}</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-sm font-bold text-white">{asgn.submissions}/{asgn.totalStudents}</div>
                  <div className="text-[9px] text-gray-500">Submitted</div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-sm font-bold text-green-400">{asgn.graded}</div>
                  <div className="text-[9px] text-gray-500">Graded</div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <div className="text-sm font-bold text-cyan-400">{asgn.maxMarks}</div>
                  <div className="text-[9px] text-gray-500">Max Marks</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Due: {asgn.dueDate}</span>
                <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── Research Tab ───────────────────────────────────────────────────
  const ResearchTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <SectionTitle>Research</SectionTitle>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNewResearch(!showNewResearch)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-500/25 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Paper
        </motion.button>
      </div>

      {/* Research Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Papers', value: 5, icon: FileText, color: 'purple' },
          { label: 'Published', value: 3, icon: CheckCircle2, color: 'green' },
          { label: 'Total Citations', value: 260, icon: TrendingUp, color: 'cyan' },
          { label: 'H-Index', value: 4, icon: Star, color: 'yellow' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn('w-4 h-4',
                stat.color === 'purple' ? 'text-purple-400' :
                stat.color === 'green' ? 'text-green-400' :
                stat.color === 'cyan' ? 'text-cyan-400' : 'text-yellow-400'
              )} />
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white"><AnimatedCounter value={stat.value} /></div>
          </motion.div>
        ))}
      </div>

      {/* Citation Chart */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">Citation Tracker</h3>
          </div>
          <span className="text-xs text-gray-500">Last 12 months</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={citationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="citationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="citations" name="Citations" stroke="#06b6d4" fill="url(#citationGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* New Research Form */}
      <AnimatePresence>
        {showNewResearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" /> Add Research Paper
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1.5 block">Title</label>
                  <input type="text" placeholder="Paper title" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-gray-600" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Journal / Conference</label>
                  <input type="text" placeholder="Journal name" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-gray-600" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Status</label>
                  <select className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark]">
                    <option value="draft">Draft</option>
                    <option value="under_review">Under Review</option>
                    <option value="accepted">Accepted</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-400 mb-1.5 block">Co-Authors</label>
                  <input type="text" placeholder="Comma separated names" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-gray-600" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowNewResearch(false)} className="px-4 py-2 rounded-xl text-gray-400 text-sm hover:text-white transition-colors">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <Save className="w-4 h-4" /> Add Paper
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Papers List */}
      <div className="space-y-3">
        {researchPapers.map((paper, i) => (
          <motion.div
            key={paper.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] backdrop-blur-xl transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm">{paper.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{paper.journal} • {paper.year}</p>
              </div>
              <span className={cn('text-[10px] px-2.5 py-1 rounded-full border font-medium shrink-0 ml-3',
                paper.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                paper.status === 'accepted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                paper.status === 'under_review' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                'bg-gray-500/10 text-gray-400 border-gray-500/20'
              )}>
                {paper.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {paper.coAuthors.join(', ')}
              </span>
              {paper.citations > 0 && (
                <span className="flex items-center gap-1 text-cyan-400">
                  <Hash className="w-3 h-3" />
                  {paper.citations} citations
                </span>
              )}
              {paper.doi !== 'pending' && (
                <span className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  DOI: {paper.doi}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Research Assistant */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => { handleTabChange('ai-assistant'); setSelectedAgent('research'); }}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 border border-white/[0.08] hover:border-purple-500/30 transition-all group"
      >
        <FlaskConical className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
        <span className="text-sm text-white font-medium group-hover:text-purple-300 transition-colors">Chat with AI Research Assistant</span>
        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
      </motion.button>
    </div>
  );

  // ─── Schedule Tab ───────────────────────────────────────────────────
  const ScheduleTab = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

    const getClassForSlot = (day: string, time: string) => {
      const daySchedule = weeklySchedule[day] || [];
      return daySchedule.find(cls => {
        const [start] = cls.time.split('-');
        return start.trim() === time;
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <SectionTitle>Weekly Schedule</SectionTitle>
          </div>
          <span className="text-xs text-gray-500 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            Even Semester 2025
          </span>
        </div>

        {/* Weekly Grid */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            <div className="p-3 text-xs text-gray-500 font-medium text-center border-r border-white/[0.06]">Time</div>
            {days.map(day => (
              <div key={day} className={cn('p-3 text-xs font-medium text-center border-r border-white/[0.06] last:border-r-0',
                day === 'Wed' ? 'text-purple-400' : 'text-gray-400'
              )}>
                {day}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {timeSlots.map((time, ti) => (
            <div key={time} className={cn('grid grid-cols-7', ti < timeSlots.length - 1 && 'border-b border-white/[0.04]')}>
              <div className="p-2 text-[10px] text-gray-600 font-mono text-center border-r border-white/[0.06] flex items-center justify-center">
                {time}
              </div>
              {days.map(day => {
                const cls = getClassForSlot(day, time);
                const colors = cls ? (deptColors[cls.dept] || deptColors.CS) : null;
                return (
                  <div key={`${day}-${time}`} className={cn(
                    'p-1 border-r border-white/[0.06] last:border-r-0 min-h-[48px]',
                    !cls && 'bg-white/[0.01]'
                  )}>
                    {cls ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          'h-full p-1.5 rounded-lg border text-[10px] cursor-pointer transition-all',
                          colors?.bg, colors?.border
                        )}
                        title={`${cls.subject} - ${cls.room}`}
                      >
                        <div className={cn('font-medium truncate', colors?.text)}>{cls.subject}</div>
                        <div className="text-gray-500 truncate">{cls.room}</div>
                      </motion.div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-[8px] text-gray-700">Free</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Class Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries({
            'Machine Learning': 'CS',
            'Probability & Statistics': 'CS',
            'Deep Learning': 'CS',
            'ML Lab': 'CS',
            'Office Hours': 'CS',
            'Research Meeting': 'CS',
          }).map(([name, dept]) => {
            const colors = deptColors[dept];
            return (
              <div key={name} className="flex items-center gap-2 text-xs text-gray-400">
                <div className={cn('w-3 h-3 rounded', colors.bg, 'border', colors.border)} />
                <span>{name}</span>
              </div>
            );
          })}
        </div>

        {/* Next Week Preview */}
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Next Week Preview</h3>
            </div>
            <span className="text-xs text-gray-500">Mar 10 - Mar 15</span>
          </div>
          <div className="space-y-2">
            {[
              { day: 'Monday', events: '3 classes + 1 lab session', highlight: 'ML Mid-semester review' },
              { day: 'Tuesday', events: '2 classes', highlight: 'P&S Assignment due' },
              { day: 'Wednesday', events: '2 classes + Office Hours', highlight: 'DL Project presentation' },
              { day: 'Thursday', events: '1 class + Research Meeting', highlight: 'Paper review submission' },
              { day: 'Friday', events: '2 classes', highlight: 'ML Lab evaluation' },
            ].map((day, i) => (
              <div key={day.day} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-500 to-cyan-500 shrink-0" />
                <div className="w-20 shrink-0 text-xs text-purple-400 font-medium">{day.day}</div>
                <div className="flex-1 text-xs text-gray-400">{day.events}</div>
                <div className="text-[10px] text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {day.highlight}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  };

  // ─── AI Assistant Tab ───────────────────────────────────────────────
  const AIAssistantTab = () => {
    const currentAgent = aiAgents.find(a => a.id === selectedAgent);
    const totalTokens = aiAgents.reduce((sum, a) => sum + a.tokens, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <SectionTitle>AI Assistant</SectionTitle>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Agent Selector & Token Usage */}
          <div className="space-y-4">
            <GlassCard>
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <BotIcon className="w-4 h-4 text-purple-400" /> Select Agent
              </h3>
              <div className="space-y-2">
                {aiAgents.map(agent => (
                  <motion.button
                    key={agent.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedAgent(agent.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      selectedAgent === agent.id
                        ? 'bg-purple-500/10 border-purple-500/30'
                        : 'bg-white/[0.02] border-white/[0.04] hover:border-white/[0.1]'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center',
                      selectedAgent === agent.id ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-white/[0.04]'
                    )}>
                      <agent.icon className={cn('w-4 h-4', selectedAgent === agent.id ? 'text-purple-400' : 'text-gray-400')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn('text-sm font-medium', selectedAgent === agent.id ? 'text-purple-300' : 'text-white')}>{agent.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{agent.description}</div>
                    </div>
                    <div className={cn('w-2 h-2 rounded-full', agent.active ? 'bg-green-400' : 'bg-gray-600')} />
                  </motion.button>
                ))}
              </div>
            </GlassCard>

            {/* Token Usage */}
            <GlassCard>
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" /> Token Usage
              </h3>
              <div className="text-center mb-3">
                <div className="text-3xl font-bold text-white"><AnimatedCounter value={totalTokens} /></div>
                <div className="text-xs text-gray-500">tokens used today</div>
              </div>
              <div className="space-y-2">
                {aiAgents.map(agent => (
                  <div key={agent.id}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-400">{agent.name}</span>
                      <span className="text-gray-500">{agent.tokens.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                        style={{ width: `${(agent.tokens / totalTokens) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Chat Interface */}
          <div className="md:col-span-2 flex flex-col">
            <GlassCard className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  {currentAgent && <currentAgent.icon className="w-4 h-4 text-purple-400" />}
                </div>
                <div>
                  <div className="text-sm text-white font-medium">{currentAgent?.name}</div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Active
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 max-h-96 overflow-y-auto custom-scrollbar py-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3',
                      msg.role === 'user'
                        ? 'bg-purple-500/15 border border-purple-500/20 text-white'
                        : 'bg-white/[0.03] border border-white/[0.06] text-gray-300'
                    )}>
                      {msg.agent && (
                        <div className="text-[10px] text-purple-400 font-medium mb-1">{msg.agent}</div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Suggested Prompts */}
              <div className="py-2 border-t border-white/[0.06]">
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 mb-3">
                  {suggestedPrompts.map((prompt, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setChatInput(prompt); }}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 hover:text-white hover:border-purple-500/20 transition-colors whitespace-nowrap"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex gap-3 pt-3 border-t border-white/[0.06]">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask your AI assistant..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-gray-600"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendChat}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  };

  // ─── Tab Content Renderer ───────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'classes': return <ClassesTab />;
      case 'attendance': return <AttendanceTab />;
      case 'assignments': return <AssignmentsTab />;
      case 'research': return <ResearchTab />;
      case 'schedule': return <ScheduleTab />;
      case 'ai-assistant': return <AIAssistantTab />;
      default: return <DashboardTab />;
    }
  };

  // ─── Main Render ────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col"
    >
      {/* Tab Navigation */}
      <div className="px-6 pt-4 pb-0">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-x-auto">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-purple-500/15 text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/[0.03]'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
