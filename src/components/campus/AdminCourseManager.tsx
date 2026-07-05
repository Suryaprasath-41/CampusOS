'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Plus, Pencil, LayoutGrid, List,
  ChevronRight, X, AlertTriangle, Star, Clock, Users,
  CheckCircle2, GraduationCap, Calendar, User, Eye,
  BarChart3, BookMarked, Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAPI, postAPI } from '@/lib/store';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────
interface FacultyInfo {
  id: string;
  name: string;
  email: string;
  designation: string;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  credits: number;
  schedule: string | null;
  facultyId: string;
  faculty: FacultyInfo;
  enrollmentCount: number;
}

interface SubjectsResponse {
  subjects: Subject[];
  total: number;
  page: number;
  limit: number;
}

interface FacultyOption {
  id: string;
  department: string;
  designation: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  subjectCount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────
const DEPARTMENTS = ['CS', 'IT', 'ECE', 'EEE', 'ME', 'CE'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const CREDITS = [1, 2, 3, 4, 5];

const DEPT_COLORS: Record<string, string> = {
  CS: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  IT: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  ECE: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  EEE: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  ME: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  CE: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
};

const DEPT_ACCENT: Record<string, string> = {
  CS: 'border-t-purple-500',
  IT: 'border-t-cyan-500',
  ECE: 'border-t-blue-500',
  EEE: 'border-t-yellow-500',
  ME: 'border-t-orange-500',
  CE: 'border-t-emerald-500',
};

const DEPT_GLOW: Record<string, string> = {
  CS: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
  IT: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
  ECE: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
  EEE: 'hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]',
  ME: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]',
  CE: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
};

const DEPT_TOP_LINE: Record<string, string> = {
  CS: 'from-purple-500 to-violet-600',
  IT: 'from-cyan-500 to-blue-600',
  ECE: 'from-blue-500 to-indigo-600',
  EEE: 'from-yellow-500 to-amber-600',
  ME: 'from-orange-500 to-red-600',
  CE: 'from-emerald-500 to-teal-600',
};

// ─── Form State ───────────────────────────────────────────────────────────
interface SubjectForm {
  name: string;
  code: string;
  department: string;
  semester: number;
  credits: number;
  facultyId: string;
  schedule: string;
}

const emptyForm: SubjectForm = {
  name: '', code: '', department: 'CS',
  semester: 1, credits: 3, facultyId: '', schedule: '',
};

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════
export default function AdminCourseManager() {
  // ─── State ────────────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [form, setForm] = useState<SubjectForm>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailSubject, setDetailSubject] = useState<Subject | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);

  // ─── Debounced search ─────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Fetch subjects ────────────────────────────────────────────────────
  const loadSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filterDept) params.set('department', filterDept);
      if (filterSemester) params.set('semester', filterSemester);
      const data = await fetchAPI(`/admin/subjects?${params.toString()}`);
      setSubjects(data.subjects || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load subjects:', err);
      showToast('Failed to load subjects', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterDept, filterSemester]);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  // ─── Fetch faculty for dropdown ────────────────────────────────────────
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const data = await fetchAPI('/admin/faculty?limit=100');
        setFacultyList(data.faculty || []);
      } catch (err) {
        console.error('Failed to load faculty list:', err);
      }
    };
    loadFaculty();
  }, []);

  // ─── Toast ────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Form handlers ────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code || !form.department || !form.semester || !form.facultyId) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        code: form.code.toUpperCase(),
        department: form.department,
        semester: form.semester,
        credits: form.credits,
        facultyId: form.facultyId,
        schedule: form.schedule || null,
      };
      await postAPI('/admin/subjects', payload);
      showToast('Subject added successfully', 'success');
      setDialogOpen(false);
      loadSubjects();
    } catch (err: any) {
      const msg = err?.message || 'Operation failed';
      if (msg.includes('409')) {
        showToast('Subject code already exists', 'error');
      } else {
        showToast(msg, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Pagination ───────────────────────────────────────────────────────
  const totalPages = Math.ceil(total / limit);
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + i;
  }).filter(p => p >= 1 && p <= totalPages);

  // ─── Stats ────────────────────────────────────────────────────────────
  const departments = [...new Set(subjects.map(s => s.department))];
  const avgCredits = subjects.length > 0
    ? (subjects.reduce((sum, s) => sum + s.credits, 0) / subjects.length).toFixed(1)
    : '0';
  const totalEnrollments = subjects.reduce((sum, s) => sum + s.enrollmentCount, 0);

  // ─── Filtered faculty for selected department ──────────────────────────
  const filteredFaculty = form.department
    ? facultyList.filter(f => f.department === form.department || f.department === '')
    : facultyList;

  // ═════════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4 pt-2">
      {/* ─── Toast ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg",
              toast.type === 'success'
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span className="text-sm font-medium">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              Course & Subject Management
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] px-2">
                {total} total
              </Badge>
            </h2>
            <p className="text-xs text-[var(--text-muted)]">Manage courses, subjects, schedules & curriculum</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                viewMode === 'grid' ? "bg-[var(--bg-card)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                viewMode === 'table' ? "bg-[var(--bg-card)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </motion.button>
        </div>
      </motion.div>

      {/* ─── Stats Cards ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Total Subjects', value: total, icon: BookMarked, color: 'emerald', gradient: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.3)' },
          { label: 'Departments', value: departments.length, icon: BarChart3, color: 'purple', gradient: 'from-purple-500 to-violet-600', glow: 'rgba(168,85,247,0.3)' },
          { label: 'Avg Credits', value: avgCredits, icon: Star, color: 'yellow', gradient: 'from-yellow-500 to-amber-600', glow: 'rgba(234,179,8,0.3)' },
          { label: 'Total Enrollments', value: totalEnrollments, icon: Users, color: 'cyan', gradient: 'from-cyan-500 to-blue-600', glow: 'rgba(6,182,212,0.3)' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-4 group hover:border-[var(--border-color)] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl opacity-5 rounded-full -translate-y-6 translate-x-6 group-hover:opacity-10 transition-opacity" style={{ background: `radial-gradient(circle, ${stat.glow}, transparent)` }} />
            <div className="flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0", stat.gradient)} style={{ boxShadow: `0 0 15px ${stat.glow}` }}>
                <stat.icon className="w-4 h-4 text-[var(--text-primary)]" />
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ─── Search & Filters ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by name, code, or faculty..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 cursor-pointer"
          >
            <option value="" className="bg-[var(--bg-secondary)]">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[var(--bg-secondary)]">{d}</option>)}
          </select>
          <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] rotate-90 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filterSemester}
            onChange={(e) => { setFilterSemester(e.target.value); setPage(1); }}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 cursor-pointer"
          >
            <option value="" className="bg-[var(--bg-secondary)]">All Semesters</option>
            {SEMESTERS.map(s => <option key={s} value={String(s)} className="bg-[var(--bg-secondary)]">Sem {s}</option>)}
          </select>
          <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] rotate-90 pointer-events-none" />
        </div>
      </motion.div>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ delay: 0.15 }}
          >
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-5 animate-pulse">
                    <div className="h-3 bg-[var(--glass-bg)] rounded w-1/3 mb-3" />
                    <div className="h-5 bg-[var(--glass-bg)] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[var(--glass-bg)] rounded w-1/2 mb-4" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-[var(--glass-bg)] rounded-full w-14" />
                      <div className="h-6 bg-[var(--glass-bg)] rounded-full w-14" />
                    </div>
                  </div>
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <EmptyState onAdd={openAdd} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {subjects.map((subject, idx) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    index={idx}
                    onViewDetail={() => setDetailSubject(subject)}
                    onEdit={() => {
                      setForm({
                        name: subject.name,
                        code: subject.code,
                        department: subject.department,
                        semester: subject.semester,
                        credits: subject.credits,
                        facultyId: subject.facultyId,
                        schedule: subject.schedule || '',
                      });
                      setDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ delay: 0.15 }}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    {['Code', 'Name', 'Department', 'Semester', 'Credits', 'Faculty', 'Schedule', 'Enrollment', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/[0.04]">
                        {Array.from({ length: 9 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-[var(--glass-bg)] rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : subjects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center">
                        <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                        <p className="text-[var(--text-muted)] text-sm">No subjects found</p>
                        <p className="text-[var(--text-muted)] text-xs mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    subjects.map((subject, idx) => (
                      <motion.tr
                        key={subject.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-white/[0.04] hover:bg-[var(--glass-bg)] transition-colors duration-200 group"
                      >
                        {/* Code */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {subject.code}
                          </span>
                        </td>
                        {/* Name */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-[var(--text-primary)] max-w-[200px] truncate">{subject.name}</p>
                        </td>
                        {/* Department */}
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium",
                            DEPT_COLORS[subject.department] || 'bg-gray-500/15 text-[var(--text-secondary)] border-gray-500/30'
                          )}>
                            {subject.department}
                          </span>
                        </td>
                        {/* Semester */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border bg-[var(--glass-bg)] text-[var(--text-secondary)] border-[var(--border-color)]">
                            <Calendar className="w-3 h-3" />
                            Sem {subject.semester}
                          </span>
                        </td>
                        {/* Credits */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium text-[var(--text-primary)]">{subject.credits}</span>
                          </div>
                        </td>
                        {/* Faculty */}
                        <td className="px-4 py-3">
                          <p className="text-sm text-[var(--text-secondary)]">{subject.faculty.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{subject.faculty.designation}</p>
                        </td>
                        {/* Schedule */}
                        <td className="px-4 py-3">
                          <span className="text-xs text-[var(--text-secondary)]">
                            {subject.schedule || '—'}
                          </span>
                        </td>
                        {/* Enrollment */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                            <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                            {subject.enrollmentCount}
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDetailSubject(subject)}
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-emerald-600 dark:text-emerald-400 transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setForm({
                                  name: subject.name,
                                  code: subject.code,
                                  department: subject.department,
                                  semester: subject.semester,
                                  credits: subject.credits,
                                  facultyId: subject.facultyId,
                                  schedule: subject.schedule || '',
                                });
                                setDialogOpen(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-cyan-600 dark:text-cyan-400 transition-all duration-200"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-muted)]">
                  Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  {pageNumbers.map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200",
                        p === page ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Pagination */}
      {viewMode === 'grid' && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-1 pt-2"
        >
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          {pageNumbers.map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                "w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200",
                p === page ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]"
              )}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ─── Add Subject Dialog ──────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[var(--bg-primary)]/95 backdrop-blur-2xl border border-[var(--border-color)] text-[var(--text-primary)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Add New Subject
            </DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">
              Create a new subject entry for the curriculum.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Subject Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
              />
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Subject Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. CS301"
                className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 font-mono"
              />
            </div>

            {/* Department & Semester */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Department *</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm(f => ({ ...f, department: e.target.value, facultyId: '' }))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 transition-all duration-300 cursor-pointer appearance-none"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[var(--bg-secondary)]">{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Semester *</label>
                <select
                  value={form.semester}
                  onChange={(e) => setForm(f => ({ ...f, semester: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 transition-all duration-300 cursor-pointer appearance-none"
                >
                  {SEMESTERS.map(s => <option key={s} value={s} className="bg-[var(--bg-secondary)]">Semester {s}</option>)}
                </select>
              </div>
            </div>

            {/* Credits & Faculty */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Credits</label>
                <select
                  value={form.credits}
                  onChange={(e) => setForm(f => ({ ...f, credits: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 transition-all duration-300 cursor-pointer appearance-none"
                >
                  {CREDITS.map(c => (
                    <option key={c} value={c} className="bg-[var(--bg-secondary)]">
                      {c} {c === 1 ? 'Credit' : 'Credits'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Faculty *</label>
                <select
                  value={form.facultyId}
                  onChange={(e) => setForm(f => ({ ...f, facultyId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 transition-all duration-300 cursor-pointer appearance-none"
                >
                  <option value="" className="bg-[var(--bg-secondary)]">Select Faculty</option>
                  {filteredFaculty.map(f => (
                    <option key={f.id} value={f.id} className="bg-[var(--bg-secondary)]">
                      {f.user.name} ({f.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Schedule</label>
              <input
                type="text"
                value={form.schedule}
                onChange={(e) => setForm(f => ({ ...f, schedule: e.target.value }))}
                placeholder="e.g. Mon/Wed 10:00-11:30"
                className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <button
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-all duration-200"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Subject
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Subject Detail Dialog ────────────────────────────────────── */}
      <Dialog open={!!detailSubject} onOpenChange={() => setDetailSubject(null)}>
        <DialogContent className="bg-[var(--bg-primary)]/95 backdrop-blur-2xl border border-[var(--border-color)] text-[var(--text-primary)] max-w-2xl">
          {detailSubject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[var(--text-primary)] flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    DEPT_TOP_LINE[detailSubject.department] || 'from-gray-500 to-gray-600'
                  )}>
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span>{detailSubject.name}</span>
                    <p className="text-xs text-[var(--text-muted)] font-normal mt-0.5 font-mono">{detailSubject.code}</p>
                  </div>
                </DialogTitle>
                <DialogDescription className="text-[var(--text-muted)]">
                  Complete subject details and enrollment information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-2 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
                {/* Key Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <InfoCard
                    icon={Hash}
                    label="Code"
                    value={detailSubject.code}
                    mono
                  />
                  <InfoCard
                    icon={BarChart3}
                    label="Department"
                    value={detailSubject.department}
                    badge
                    badgeClass={DEPT_COLORS[detailSubject.department]}
                  />
                  <InfoCard
                    icon={Calendar}
                    label="Semester"
                    value={`Sem ${detailSubject.semester}`}
                  />
                  <InfoCard
                    icon={Star}
                    label="Credits"
                    value={String(detailSubject.credits)}
                    accent
                  />
                </div>

                {/* Faculty Details */}
                <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-4">
                  <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Faculty Details
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shrink-0",
                      DEPT_TOP_LINE[detailSubject.department] || 'from-gray-500 to-gray-600'
                    )}>
                      {detailSubject.faculty.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{detailSubject.faculty.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{detailSubject.faculty.designation} • {detailSubject.faculty.email}</p>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-4">
                  <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Schedule
                  </h4>
                  {detailSubject.schedule ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm text-[var(--text-secondary)]">{detailSubject.schedule}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] italic">No schedule assigned</p>
                  )}
                </div>

                {/* Enrollment Summary */}
                <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-4">
                  <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Enrollment Summary
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[var(--text-primary)]">{detailSubject.enrollmentCount}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">Students Enrolled</p>
                      </div>
                    </div>
                    <div className="flex-1 h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, detailSubject.enrollmentCount * 5)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-4">
                  <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Attendance Overview
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">89%</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Avg Attendance</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                      <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{detailSubject.enrollmentCount}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Active Students</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                      <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">24</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Sessions Held</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <button
                  onClick={() => setDetailSubject(null)}
                  className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-all duration-200"
                >
                  Close
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setForm({
                      name: detailSubject.name,
                      code: detailSubject.code,
                      department: detailSubject.department,
                      semester: detailSubject.semester,
                      credits: detailSubject.credits,
                      facultyId: detailSubject.facultyId,
                      schedule: detailSubject.schedule || '',
                    });
                    setDetailSubject(null);
                    setDialogOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all duration-300"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Subject
                </motion.button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════════════════

// ─── Subject Card (Grid View) ──────────────────────────────────────────
function SubjectCard({
  subject,
  index,
  onViewDetail,
  onEdit,
}: {
  subject: Subject;
  index: number;
  onViewDetail: () => void;
  onEdit: () => void;
}) {
  const topBorderClass = DEPT_ACCENT[subject.department] || 'border-t-gray-500';
  const glowClass = DEPT_GLOW[subject.department] || '';
  const topLineGradient = DEPT_TOP_LINE[subject.department] || 'from-gray-500 to-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className={cn(
        "relative overflow-hidden bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] border-t-2 rounded-2xl p-5 group hover:border-[var(--border-color)] transition-all duration-300",
        topBorderClass,
        glowClass
      )}
    >
      {/* Top accent line */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-60", topLineGradient)} />

      {/* Subject Code */}
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
          {subject.code}
        </span>
        <span className={cn(
          "text-[10px] px-2 py-0.5 rounded-full border font-medium",
          DEPT_COLORS[subject.department] || 'bg-gray-500/15 text-[var(--text-secondary)] border-gray-500/30'
        )}>
          {subject.department}
        </span>
      </div>

      {/* Subject Name */}
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 line-clamp-2 leading-snug">
        {subject.name}
      </h3>

      {/* Semester Pill */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border bg-[var(--glass-bg)] text-[var(--text-secondary)] border-[var(--border-color)]">
          <Calendar className="w-3 h-3" />
          Sem {subject.semester}
        </span>
      </div>

      {/* Credits with stars */}
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-3.5 h-3.5 transition-colors",
              i < subject.credits ? "text-yellow-500 fill-yellow-500" : "text-[var(--text-muted)]"
            )}
          />
        ))}
        <span className="text-xs text-[var(--text-muted)] ml-1">{subject.credits} credits</span>
      </div>

      {/* Faculty */}
      <div className="flex items-center gap-2 mb-3">
        <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span className="text-xs text-[var(--text-secondary)] truncate">{subject.faculty.name}</span>
      </div>

      {/* Schedule */}
      {subject.schedule && (
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)] truncate">{subject.schedule}</span>
        </div>
      )}

      {/* Enrollment Count */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span className="text-xs text-[var(--text-muted)]">{subject.enrollmentCount} enrolled</span>
        <div className="flex-1 h-1.5 bg-[var(--glass-bg)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500/50 to-teal-500/50 rounded-full"
            style={{ width: `${Math.min(100, subject.enrollmentCount * 5)}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)]">
        <button
          onClick={onViewDetail}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all duration-200"
        >
          <Eye className="w-3.5 h-3.5" />
          Details
        </button>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all duration-200"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
    </motion.div>
  );
}

// ─── Info Card (Detail Dialog) ─────────────────────────────────────────
function InfoCard({
  icon: Icon,
  label,
  value,
  mono,
  badge,
  badgeClass,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
  badge?: boolean;
  badgeClass?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl p-3 text-center">
      <Icon className={cn("w-4 h-4 mx-auto mb-1.5", accent ? "text-yellow-600 dark:text-yellow-400" : "text-[var(--text-muted)]")} />
      <p className="text-[10px] text-[var(--text-muted)] mb-1">{label}</p>
      {badge ? (
        <span className={cn(
          "inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border font-medium",
          badgeClass || 'bg-gray-500/15 text-[var(--text-secondary)] border-gray-500/30'
        )}>
          {value}
        </span>
      ) : (
        <p className={cn("text-sm font-semibold", mono ? "font-mono text-emerald-600 dark:text-emerald-400" : "text-[var(--text-primary)]", accent && "text-yellow-600 dark:text-yellow-400")}>
          {value}
        </p>
      )}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-emerald-500/50" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-secondary)] mb-1">No subjects found</h3>
      <p className="text-sm text-[var(--text-muted)] mb-6 text-center max-w-xs">
        Start building your curriculum by adding the first subject
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300"
      >
        <Plus className="w-4 h-4" />
        Add Your First Subject
      </motion.button>
    </motion.div>
  );
}
