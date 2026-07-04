'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Users, GraduationCap, BookOpen, ArrowRight,
  MapPin, Star, Clock, ChevronDown, ChevronUp, Sparkles,
  Loader2, Filter, TrendingUp, Hash, Mail, Building2,
  Award, Calendar, CreditCard, UserCheck, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAPI } from '@/lib/store';

// ─── Types ────────────────────────────────────────────────────────────
interface StudentResult {
  id: string;
  type: 'student';
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  semester: number;
  cgpa: number;
  placementStatus: string;
  avatar?: string;
}

interface FacultyResult {
  id: string;
  type: 'faculty';
  name: string;
  email: string;
  department: string;
  designation: string;
  cabinLocation?: string;
  avatar?: string;
}

interface SubjectResult {
  id: string;
  type: 'subject';
  name: string;
  code: string;
  department: string;
  semester: number;
  credits: number;
  facultyName: string;
}

interface SearchResult {
  students: StudentResult[];
  faculty: FacultyResult[];
  subjects: SubjectResult[];
}

// ─── Quick Search Suggestions ─────────────────────────────────────────
const QUICK_SUGGESTIONS = [
  { label: 'Find Arjun', query: 'Arjun', icon: Users, color: 'purple' },
  { label: 'CS Department', query: 'Computer Science', icon: Building2, color: 'cyan' },
  { label: 'Machine Learning', query: 'Machine Learning', icon: BookOpen, color: 'orange' },
  { label: 'Faculty on leave', query: 'Professor', icon: GraduationCap, color: 'blue' },
];

// ─── Recent Searches ──────────────────────────────────────────────────
const RECENT_SEARCHES = ['Sam Kumar', 'CS301', 'Dr. Meera', 'Data Structures'];

// ─── Category Config ──────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  students: {
    label: 'Students',
    icon: Users,
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    glow: 'rgba(139,92,246,0.2)',
    badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25',
  },
  faculty: {
    label: 'Faculty',
    icon: GraduationCap,
    gradient: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    glow: 'rgba(6,182,212,0.2)',
    badge: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
  },
  subjects: {
    label: 'Subjects',
    icon: BookOpen,
    gradient: 'from-orange-500 to-red-600',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
    glow: 'rgba(249,115,22,0.2)',
    badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/25',
  },
} as const;

type CategoryKey = keyof typeof CATEGORY_CONFIG;

// ─── Skeleton Card ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--glass-bg)]" />
        <div className="flex-1">
          <div className="h-3.5 w-32 bg-[var(--glass-bg)] rounded mb-2" />
          <div className="h-2.5 w-20 bg-[var(--glass-bg)] rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-full bg-[var(--glass-bg)] rounded" />
        <div className="h-2.5 w-3/4 bg-[var(--glass-bg)] rounded" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Student Card
// ═══════════════════════════════════════════════════════════════════════
function StudentCard({ student, index }: { student: StudentResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = CATEGORY_CONFIG.students;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl overflow-hidden hover:border-purple-500/20 transition-all duration-300 group"
      style={{ boxShadow: `0 0 0px ${config.glow}` }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${config.glow}`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 0px ${config.glow}`; }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0", config.bg, config.border)}>
            <Users className={cn("w-5 h-5", config.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">{student.name}</h4>
              <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border font-medium", config.badge)}>
                STUDENT
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{student.rollNumber} • {student.department}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-7 h-7 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--bg-card)] transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpanded(!expanded)}
              className="w-7 h-7 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--bg-card)] transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3 text-[var(--text-muted)]" /> : <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />}
            </motion.button>
          </div>
        </div>

        {/* Quick info badges */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-[10px] px-2 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1">
            <Star className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
            CGPA: {student.cgpa}
          </span>
          <span className="text-[10px] px-2 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            Sem {student.semester}
          </span>
          <span className={cn(
            "text-[10px] px-2 py-1 rounded-lg border font-medium flex items-center gap-1",
            student.placementStatus === 'placed' ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" :
            student.placementStatus === 'seeking' ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" :
            "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
          )}>
            <Award className="w-2.5 h-2.5" />
            {student.placementStatus}
          </span>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-white/[0.04] mt-0">
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-[var(--glass-bg)] rounded-lg p-2.5 border border-white/[0.04]">
                  <div className="text-[9px] text-[var(--text-muted)] mb-0.5">Email</div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate flex items-center gap-1">
                    <Mail className="w-2.5 h-2.5 text-[var(--text-muted)] shrink-0" />
                    {student.email}
                  </div>
                </div>
                <div className="bg-[var(--glass-bg)] rounded-lg p-2.5 border border-white/[0.04]">
                  <div className="text-[9px] text-[var(--text-muted)] mb-0.5">Department</div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate flex items-center gap-1">
                    <Building2 className="w-2.5 h-2.5 text-[var(--text-muted)] shrink-0" />
                    {student.department}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-600 dark:text-purple-400 hover:bg-purple-500/15 transition-colors"
                >
                  <UserCheck className="w-3 h-3" />
                  View Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
                >
                  <CreditCard className="w-3 h-3" />
                  View Fees
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Faculty Card
// ═══════════════════════════════════════════════════════════════════════
function FacultyCard({ faculty, index }: { faculty: FacultyResult; index: number }) {
  const config = CATEGORY_CONFIG.faculty;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-4 hover:border-cyan-500/20 transition-all duration-300 group"
      style={{ boxShadow: `0 0 0px ${config.glow}` }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${config.glow}`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 0px ${config.glow}`; }}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0", config.bg, config.border)}>
          <GraduationCap className={cn("w-5 h-5", config.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">{faculty.name}</h4>
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border font-medium", config.badge)}>
              FACULTY
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{faculty.designation} • {faculty.department}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-7 h-7 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--bg-card)] transition-colors"
        >
          <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
        </motion.button>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[10px] px-2 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1">
          <Mail className="w-2.5 h-2.5" />
          {faculty.email}
        </span>
        {faculty.cabinLocation && (
          <span className="text-[10px] px-2 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5" />
            {faculty.cabinLocation}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Subject Card
// ═══════════════════════════════════════════════════════════════════════
function SubjectCard({ subject, index }: { subject: SubjectResult; index: number }) {
  const config = CATEGORY_CONFIG.subjects;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-4 hover:border-orange-500/20 transition-all duration-300 group"
      style={{ boxShadow: `0 0 0px ${config.glow}` }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${config.glow}`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 0px ${config.glow}`; }}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shrink-0", config.bg, config.border)}>
          <BookOpen className={cn("w-5 h-5", config.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">{subject.name}</h4>
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded-full border font-medium", config.badge)}>
              SUBJECT
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{subject.code} • {subject.department}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-7 h-7 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--bg-card)] transition-colors"
        >
          <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
        </motion.button>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[10px] px-2 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1">
          <Calendar className="w-2.5 h-2.5" />
          Semester {subject.semester}
        </span>
        <span className="text-[10px] px-2 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1">
          <Hash className="w-2.5 h-2.5" />
          {subject.credits} Credits
        </span>
        <span className="text-[10px] px-2 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] flex items-center gap-1">
          <GraduationCap className="w-2.5 h-2.5" />
          {subject.facultyName}
        </span>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════
export default function AdminSmartSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryKey>('students');
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults(null);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await fetchAPI(`/admin/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setResults(data);
    } catch {
      setResults({ students: [], faculty: [], subjects: [] });
    }
    setLoading(false);
  }, []);

  // Debounce input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  const totalStudents = results?.students?.length || 0;
  const totalFaculty = results?.faculty?.length || 0;
  const totalSubjects = results?.subjects?.length || 0;
  const totalResults = totalStudents + totalFaculty + totalSubjects;

  const tabs: { id: CategoryKey; label: string; count: number; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'students', label: 'Students', count: totalStudents, icon: Users },
    { id: 'faculty', label: 'Faculty', count: totalFaculty, icon: GraduationCap },
    { id: 'subjects', label: 'Subjects', count: totalSubjects, icon: BookOpen },
  ];

  return (
    <div className="space-y-4 pt-2">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050510]/80" />
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, rgba(16,185,129,0.3), rgba(6,182,212,0.3), rgba(16,185,129,0.3))',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-[1px] rounded-2xl bg-[#050510]" />
        </motion.div>

        <div className="relative z-10 flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 0 25px rgba(16,185,129,0.3)' }}
          >
            <Search className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Smart Search
            </h2>
            <p className="text-[var(--text-muted)] text-xs mt-0.5">Search across all campus data with AI-powered intelligent matching</p>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div
          className={cn(
            "relative rounded-2xl transition-all duration-500",
            searchFocused
              ? "shadow-[0_0_40px_rgba(16,185,129,0.15)]"
              : "shadow-[0_0_0px_rgba(0,0,0,0)]"
          )}
        >
          {/* Animated gradient border */}
          {searchFocused && (
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(90deg, rgba(16,185,129,0.4), rgba(6,182,212,0.4), rgba(139,92,246,0.4), rgba(16,185,129,0.4))',
                backgroundSize: '300% 100%',
              }}
              animate={{ backgroundPosition: ['0% 0%', '300% 0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-[1.5px] rounded-2xl bg-[#050510]" />
            </motion.div>
          )}

          <div className="relative z-10 flex items-center gap-3 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl px-5 py-4">
            <Search className={cn(
              "w-5 h-5 transition-colors duration-300",
              searchFocused ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-muted)]"
            )} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search students, faculty, courses, anything..."
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setQuery(''); setResults(null); setHasSearched(false); }}
                className="w-6 h-6 rounded-full bg-[var(--bg-card)] flex items-center justify-center hover:bg-[var(--bg-card)] transition-colors"
              >
                <X className="w-3 h-3 text-[var(--text-secondary)]" />
              </motion.button>
            )}
            {loading && (
              <Loader2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
            )}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)]">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[9px] text-[var(--text-muted)]">AI</span>
            </div>
          </div>
        </div>

        {/* Recent Searches Dropdown */}
        <AnimatePresence>
          {searchFocused && !query && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full left-0 right-0 mt-2 z-50"
            >
              <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">Recent Searches</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {RECENT_SEARCHES.map((term) => (
                    <motion.button
                      key={term}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setQuery(term)}
                      className="text-[11px] px-3 py-1.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-secondary)] transition-colors"
                    >
                      {term}
                    </motion.button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">Quick Search</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_SUGGESTIONS.map((suggestion) => {
                    const colorMap: Record<string, string> = {
                      purple: 'hover:border-purple-500/20 hover:bg-purple-500/[0.04]',
                      cyan: 'hover:border-cyan-500/20 hover:bg-cyan-500/[0.04]',
                      orange: 'hover:border-orange-500/20 hover:bg-orange-500/[0.04]',
                      blue: 'hover:border-blue-500/20 hover:bg-blue-500/[0.04]',
                    };
                    return (
                      <motion.button
                        key={suggestion.label}
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setQuery(suggestion.query)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-left transition-all",
                          colorMap[suggestion.color] || ''
                        )}
                      >
                        <suggestion.icon className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                        <span className="text-[11px] text-[var(--text-secondary)]">{suggestion.label}</span>
                        <ArrowRight className="w-3 h-3 text-[var(--text-muted)] ml-auto shrink-0" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Area */}
      {!hasSearched ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <Search className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Start typing to search</h3>
          <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto mb-6">
            Search across all campus data — students, faculty, courses, and more with AI-powered intelligent matching
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {QUICK_SUGGESTIONS.map((s) => (
              <motion.button
                key={s.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQuery(s.query)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-secondary)] transition-all"
              >
                <s.icon className="w-3 h-3" />
                {s.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      ) : (
        /* Search Results */
        <div className="space-y-4">
          {/* Results Count & Tabs */}
          <div className="flex items-center gap-4">
            <div className="text-xs text-[var(--text-muted)]">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600 dark:text-emerald-400" />
                  Searching...
                </span>
              ) : (
                <span>
                  Found <span className="text-[var(--text-primary)] font-semibold">{totalResults}</span> results
                  {query && <span> for &ldquo;<span className="text-emerald-600 dark:text-emerald-400">{query}</span>&rdquo;</span>}
                </span>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5">
            {tabs.map((tab) => {
              const config = CATEGORY_CONFIG[tab.id];
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300",
                    isActive
                      ? `${config.bg} ${config.text} border ${config.border} shadow-[0_0_15px_${config.glow}]`
                      : "bg-[var(--glass-bg)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-secondary)] hover:bg-[var(--glass-bg)]"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    isActive ? `${config.badge}` : "bg-[var(--glass-bg)] text-[var(--text-muted)]"
                  )}>
                    {tab.count}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Results Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : activeTab === 'students' ? (
                totalStudents > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results!.students.map((student, i) => (
                      <StudentCard key={student.id} student={student} index={i} />
                    ))}
                  </div>
                ) : (
                  <NoResults query={query} category="students" />
                )
              ) : activeTab === 'faculty' ? (
                totalFaculty > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results!.faculty.map((faculty, i) => (
                      <FacultyCard key={faculty.id} faculty={faculty} index={i} />
                    ))}
                  </div>
                ) : (
                  <NoResults query={query} category="faculty" />
                )
              ) : totalSubjects > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results!.subjects.map((subject, i) => (
                    <SubjectCard key={subject.id} subject={subject} index={i} />
                  ))}
                </div>
              ) : (
                <NoResults query={query} category="subjects" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── No Results Component ─────────────────────────────────────────────
function NoResults({ query, category }: { query: string; category: string }) {
  const config = CATEGORY_CONFIG[category as CategoryKey];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-8 text-center"
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border", config.bg, config.border)}>
        <Search className={cn("w-6 h-6", config.text)} />
      </div>
      <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">No {category} found</h4>
      <p className="text-xs text-[var(--text-muted)] mb-3">
        No results for &ldquo;<span className="text-[var(--text-secondary)]">{query}</span>&rdquo; in {category}
      </p>
      <p className="text-[11px] text-[var(--text-muted)]">Try searching with different keywords</p>
    </motion.div>
  );
}
