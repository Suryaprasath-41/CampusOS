'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, Pencil, Trash2, Upload, ChevronLeft,
  ChevronRight, Filter, X, AlertTriangle, GraduationCap,
  Phone, Mail, BookOpen, UserCircle, FileSpreadsheet, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAPI, postAPI, patchAPI, deleteAPI } from '@/lib/store';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────
interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  department: string;
}

interface Student {
  id: string;
  rollNumber: string;
  department: string;
  semester: number;
  section: string;
  cgpa: number;
  placementStatus: string;
  hostelRoom: string | null;
  skills: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  createdAt: string;
  user: StudentUser;
}

interface StudentsResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
}

// ─── Constants ────────────────────────────────────────────────────────────
const DEPARTMENTS = ['CS', 'IT', 'ECE', 'EEE', 'ME', 'CE'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS = ['A', 'B', 'C'];
const PLACEMENT_STATUSES = ['seeking', 'interview', 'placed'];
const PAGE_SIZES = [10, 20, 50];

const DEPT_COLORS: Record<string, string> = {
  CS: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  IT: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  ECE: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  EEE: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  ME: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  CE: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
};

const PLACEMENT_COLORS: Record<string, string> = {
  seeking: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  interview: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  placed: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
};

// ─── Form State ───────────────────────────────────────────────────────────
interface StudentForm {
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  semester: string;
  section: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  skills: string;
}

const emptyForm: StudentForm = {
  name: '', email: '', rollNumber: '', department: 'CS',
  semester: '1', section: 'A', phone: '', guardianName: '',
  guardianPhone: '', skills: '',
};

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════
export default function AdminStudentManager() {
  // ─── State ────────────────────────────────────────────────────────────
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ─── Debounced search ─────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Fetch students ───────────────────────────────────────────────────
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filterDept) params.set('department', filterDept);
      if (filterSem) params.set('semester', filterSem);
      const data = await fetchAPI(`/admin/students?${params.toString()}`);
      setStudents(data.students || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load students:', err);
      showToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterDept, filterSem]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // ─── Toast ────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Form handlers ────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (s: Student) => {
    setForm({
      name: s.user.name,
      email: s.user.email,
      rollNumber: s.rollNumber,
      department: s.department,
      semester: String(s.semester),
      section: s.section,
      phone: s.user.phone || '',
      guardianName: s.guardianName || '',
      guardianPhone: s.guardianPhone || '',
      skills: s.skills || '',
    });
    setEditId(s.id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.rollNumber || !form.department) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        rollNumber: form.rollNumber,
        department: form.department,
        semester: parseInt(form.semester),
        section: form.section,
        phone: form.phone || null,
        guardianName: form.guardianName || null,
        guardianPhone: form.guardianPhone || null,
        skills: form.skills || null,
      };
      if (editId) {
        await patchAPI(`/admin/students/${editId}`, payload);
        showToast('Student updated successfully', 'success');
      } else {
        await postAPI('/admin/students', payload);
        showToast('Student added successfully', 'success');
      }
      setDialogOpen(false);
      loadStudents();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAPI(`/admin/students/${deleteId}`);
      showToast('Student deleted', 'success');
      setDeleteId(null);
      loadStudents();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  // ─── Pagination helpers ───────────────────────────────────────────────
  const totalPages = Math.ceil(total / limit);
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + i;
  }).filter(p => p >= 1 && p <= totalPages);

  // ─── CGPA color ───────────────────────────────────────────────────────
  const cgpaColor = (cgpa: number) => {
    if (cgpa >= 8) return 'text-emerald-600 dark:text-emerald-400';
    if (cgpa >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const cgpaBg = (cgpa: number) => {
    if (cgpa >= 8) return 'bg-emerald-500/10';
    if (cgpa >= 6) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  // ─── Avatar initial ───────────────────────────────────────────────────
  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || '?';
  const avatarColors = [
    'from-purple-500 to-violet-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-pink-500 to-rose-600',
  ];
  const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              Student Management
              <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[10px] px-2">
                {total} total
              </Badge>
            </h2>
            <p className="text-xs text-[var(--text-muted)]">Manage student records, enrollment & progress</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCsvDialogOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)] hover:bg-[var(--glass-bg)] transition-all duration-300"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">CSV Import</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-600 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </motion.button>
        </div>
      </motion.div>

      {/* ─── Search & Filters ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Department Filter */}
        <div className="relative">
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 cursor-pointer"
          >
            <option value="" className="bg-[var(--bg-secondary)]">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[var(--bg-secondary)]">{d}</option>)}
          </select>
          <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] rotate-90 pointer-events-none" />
        </div>

        {/* Semester Filter */}
        <div className="relative">
          <select
            value={filterSem}
            onChange={(e) => { setFilterSem(e.target.value); setPage(1); }}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 cursor-pointer"
          >
            <option value="" className="bg-[var(--bg-secondary)]">All Semesters</option>
            {SEMESTERS.map(s => <option key={s} value={String(s)} className="bg-[var(--bg-secondary)]">Sem {s}</option>)}
          </select>
          <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] rotate-90 pointer-events-none" />
        </div>
      </motion.div>

      {/* ─── Data Table ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl overflow-hidden"
      >
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                {['Roll No.', 'Name', 'Department', 'Sem', 'CGPA', 'Placement', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-[var(--glass-bg)] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                    <p className="text-[var(--text-muted)] text-sm">No students found</p>
                    <p className="text-[var(--text-muted)] text-xs mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                students.map((s, idx) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/[0.04] hover:bg-[var(--glass-bg)] transition-colors duration-200 group"
                  >
                    {/* Roll No */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-[var(--text-secondary)]">{s.rollNumber}</span>
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br shrink-0",
                          getAvatarColor(s.user.name)
                        )}>
                          {getInitial(s.user.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{s.user.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">{s.user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Department */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium",
                        DEPT_COLORS[s.department] || 'bg-gray-500/15 text-[var(--text-secondary)] border-gray-500/30'
                      )}>
                        {s.department}
                      </span>
                    </td>
                    {/* Semester */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-[var(--text-secondary)]">Sem {s.semester}</span>
                    </td>
                    {/* CGPA */}
                    <td className="px-4 py-3">
                      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg", cgpaBg(s.cgpa))}>
                        <span className={cn("text-sm font-bold", cgpaColor(s.cgpa))}>
                          {s.cgpa?.toFixed(2) || '0.00'}
                        </span>
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          s.cgpa >= 8 ? 'bg-emerald-400' : s.cgpa >= 6 ? 'bg-yellow-400' : 'bg-red-400'
                        )} />
                      </div>
                    </td>
                    {/* Placement */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium capitalize",
                        PLACEMENT_COLORS[s.placementStatus] || 'bg-gray-500/15 text-[var(--text-secondary)] border-gray-500/30'
                      )}>
                        {s.placementStatus || 'N/A'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-all duration-200"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDeleteId(s.id)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ────────────────────────────────────────────── */}
        {!loading && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}</span>
              <span className="text-[var(--text-muted)]">|</span>
              <div className="flex items-center gap-1">
                <span>Per page:</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="appearance-none bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-md px-2 py-0.5 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  {PAGE_SIZES.map(s => <option key={s} value={s} className="bg-[var(--bg-secondary)]">{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {pageNumbers.map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200",
                    p === page
                      ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── Add/Edit Dialog ─────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-[var(--border-color)] text-[var(--text-primary)] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)] flex items-center gap-2">
              {editId ? <Pencil className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
              {editId ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>
            <DialogDescription className="text-[var(--text-muted)]">
              {editId ? 'Update student information' : 'Fill in the details to add a new student'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-[var(--text-secondary)] text-xs flex items-center gap-1"><UserCircle className="w-3 h-3" /> Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-purple-500/50 focus:ring-purple-500/20"
                placeholder="Full name"
              />
            </div>
            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-[var(--text-secondary)] text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-purple-500/50 focus:ring-purple-500/20"
                placeholder="email@university.edu"
              />
            </div>
            {/* Roll Number */}
            <div className="space-y-1.5">
              <Label className="text-[var(--text-secondary)] text-xs flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Roll Number *</Label>
              <Input
                value={form.rollNumber}
                onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                className="bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-purple-500/50 focus:ring-purple-500/20"
                placeholder="CS2024001"
              />
            </div>
            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-[var(--text-secondary)] text-xs flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-purple-500/50 focus:ring-purple-500/20"
                placeholder="+91 9876543210"
              />
            </div>
            {/* Department */}
            <div className="space-y-1.5">
              <Label className="text-[var(--text-secondary)] text-xs">Department *</Label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[var(--bg-secondary)]">{d}</option>)}
              </select>
            </div>
            {/* Semester */}
            <div className="space-y-1.5">
              <Label className="text-[var(--text-secondary)] text-xs">Semester</Label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
              >
                {SEMESTERS.map(s => <option key={s} value={String(s)} className="bg-[var(--bg-secondary)]">Semester {s}</option>)}
              </select>
            </div>
            {/* Section */}
            <div className="space-y-1.5">
              <Label className="text-[var(--text-secondary)] text-xs">Section</Label>
              <select
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
              >
                {SECTIONS.map(s => <option key={s} value={s} className="bg-[var(--bg-secondary)]">Section {s}</option>)}
              </select>
            </div>
            {/* Guardian Name */}
            <div className="space-y-1.5">
              <Label className="text-[var(--text-secondary)] text-xs">Guardian Name</Label>
              <Input
                value={form.guardianName}
                onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                className="bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-purple-500/50 focus:ring-purple-500/20"
                placeholder="Guardian full name"
              />
            </div>
            {/* Guardian Phone */}
            <div className="space-y-1.5">
              <Label className="text-[var(--text-secondary)] text-xs">Guardian Phone</Label>
              <Input
                value={form.guardianPhone}
                onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
                className="bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-purple-500/50 focus:ring-purple-500/20"
                placeholder="+91 9876543210"
              />
            </div>
            {/* Skills */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[var(--text-secondary)] text-xs flex items-center gap-1"><BookOpen className="w-3 h-3" /> Skills (comma-separated)</Label>
              <Input
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                className="bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-purple-500/50 focus:ring-purple-500/20"
                placeholder="Python, ML, Web Development"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--glass-bg)] border border-[var(--border-color)] hover:border-[var(--border-color)] transition-all duration-300"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-600 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {submitting ? 'Saving...' : editId ? 'Update Student' : 'Add Student'}
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ──────────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-[var(--border-color)] text-[var(--text-primary)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              This action cannot be undone. The student record and all associated data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--glass-bg)] border border-[var(--border-color)] hover:border-[var(--border-color)] transition-all duration-300"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDelete}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all duration-300"
            >
              Delete Student
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── CSV Import Dialog ───────────────────────────────────────── */}
      <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
        <DialogContent className="bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-[var(--border-color)] text-[var(--text-primary)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Import Students
            </DialogTitle>
            <DialogDescription className="text-[var(--text-secondary)]">
              Upload a CSV or Excel file to bulk import student records
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="border-2 border-dashed border-[var(--border-color)] rounded-2xl p-8 text-center hover:border-purple-500/30 hover:bg-purple-500/[0.02] transition-all duration-300 cursor-pointer group">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Upload className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 group-hover:text-purple-600 dark:text-purple-400 transition-colors" />
              </motion.div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                <span className="text-purple-600 dark:text-purple-400 font-medium">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-[var(--text-muted)]">Upload students.xlsx or students.csv</p>
              <div className="flex items-center justify-center gap-3 mt-4">
                {['.xlsx', '.xls', '.csv'].map(ext => (
                  <span key={ext} className="px-2 py-0.5 rounded-md bg-[var(--glass-bg)] border border-[var(--border-color)] text-[10px] text-[var(--text-muted)]">
                    {ext}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-yellow-500 font-medium">Required Columns</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">name, email, rollNumber, department, semester</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setCsvDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--glass-bg)] border border-[var(--border-color)] hover:border-[var(--border-color)] transition-all duration-300"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                showToast('CSV import feature coming soon!', 'success');
                setCsvDialogOpen(false);
              }}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
