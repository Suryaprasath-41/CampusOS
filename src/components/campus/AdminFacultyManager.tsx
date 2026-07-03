'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Search, Plus, Pencil, Trash2, LayoutGrid, List,
  ChevronLeft, ChevronRight, X, AlertTriangle, Mail, Phone,
  MapPin, BookOpen, UserCircle, CheckCircle2, Briefcase, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAPI, postAPI, patchAPI, deleteAPI } from '@/lib/store';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────
interface FacultyUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  department: string;
}

interface FacultySubject {
  id: string;
  name: string;
  code: string;
  semester: number;
  credits: number;
}

interface Faculty {
  id: string;
  department: string;
  designation: string;
  cabinLocation: string | null;
  createdAt: string;
  user: FacultyUser;
  subjects: FacultySubject[];
  subjectCount: number;
}

interface FacultyResponse {
  faculty: Faculty[];
  total: number;
  page: number;
  limit: number;
}

// ─── Constants ────────────────────────────────────────────────────────────
const DEPARTMENTS = ['CS', 'IT', 'ECE', 'EEE', 'ME', 'CE'];
const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];
const PAGE_SIZES = [10, 20, 50];

const DEPT_COLORS: Record<string, string> = {
  CS: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  IT: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  ECE: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  EEE: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  ME: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  CE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const DESIGNATION_COLORS: Record<string, string> = {
  'Professor': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Associate Professor': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'Assistant Professor': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Lecturer': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

const SUBJECT_COLORS = [
  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'bg-pink-500/10 text-pink-400 border-pink-500/20',
];

// ─── Form State ───────────────────────────────────────────────────────────
interface FacultyForm {
  name: string;
  email: string;
  department: string;
  designation: string;
  phone: string;
  cabinLocation: string;
}

const emptyForm: FacultyForm = {
  name: '', email: '', department: 'CS',
  designation: 'Assistant Professor', phone: '', cabinLocation: '',
};

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════
export default function AdminFacultyManager() {
  // ─── State ────────────────────────────────────────────────────────────
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [form, setForm] = useState<FacultyForm>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [subjectsDialogId, setSubjectsDialogId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ─── Debounced search ─────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Fetch faculty ────────────────────────────────────────────────────
  const loadFaculty = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filterDept) params.set('department', filterDept);
      const data = await fetchAPI(`/admin/faculty?${params.toString()}`);
      setFaculty(data.faculty || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load faculty:', err);
      showToast('Failed to load faculty', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterDept]);

  useEffect(() => { loadFaculty(); }, [loadFaculty]);

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

  const openEdit = (f: Faculty) => {
    setForm({
      name: f.user.name,
      email: f.user.email,
      department: f.department,
      designation: f.designation,
      phone: f.user.phone || '',
      cabinLocation: f.cabinLocation || '',
    });
    setEditId(f.id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.department) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        department: form.department,
        designation: form.designation,
        phone: form.phone || null,
        cabinLocation: form.cabinLocation || null,
      };
      if (editId) {
        await patchAPI(`/admin/faculty/${editId}`, payload);
        showToast('Faculty updated successfully', 'success');
      } else {
        await postAPI('/admin/faculty', payload);
        showToast('Faculty added successfully', 'success');
      }
      setDialogOpen(false);
      loadFaculty();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAPI(`/admin/faculty/${deleteId}`);
      showToast('Faculty deleted', 'success');
      setDeleteId(null);
      loadFaculty();
    } catch (err: any) {
      const msg = err?.message || 'Delete failed';
      if (msg.includes('409')) {
        showToast('Cannot delete faculty with assigned subjects. Reassign first.', 'error');
      } else {
        showToast(msg, 'error');
      }
      setDeleteId(null);
    }
  };

  // ─── Pagination ───────────────────────────────────────────────────────
  const totalPages = Math.ceil(total / limit);
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + i;
  }).filter(p => p >= 1 && p <= totalPages);

  // ─── Avatar helpers ───────────────────────────────────────────────────
  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || '?';
  const avatarColors = [
    'from-purple-500 to-violet-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-pink-500 to-rose-600',
    'from-blue-500 to-indigo-600',
  ];
  const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  // Get the faculty member for the subjects dialog
  const selectedFaculty = faculty.find(f => f.id === subjectsDialogId);

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
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Faculty Management
              <Badge className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[10px] px-2">
                {total} total
              </Badge>
            </h2>
            <p className="text-xs text-gray-500">Manage faculty profiles, assignments & departments</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl bg-white/[0.03] border border-white/[0.08] p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                viewMode === 'table' ? "bg-white/[0.08] text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                viewMode === 'card' ? "bg-white/[0.08] text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Add Faculty
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or designation..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 cursor-pointer"
          >
            <option value="" className="bg-[#0a0a1a]">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#0a0a1a]">{d}</option>)}
          </select>
          <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rotate-90 pointer-events-none" />
        </div>
      </motion.div>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ delay: 0.15 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden"
          >
            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Name', 'Department', 'Designation', 'Subjects', 'Cabin', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/[0.04]">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-white/[0.04] rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : faculty.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <GraduationCap className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No faculty found</p>
                        <p className="text-gray-700 text-xs mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    faculty.map((f, idx) => (
                      <motion.tr
                        key={f.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.05] transition-colors duration-200 group"
                      >
                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br shrink-0",
                              getAvatarColor(f.user.name)
                            )}>
                              {getInitial(f.user.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{f.user.name}</p>
                              <p className="text-[11px] text-gray-600">{f.user.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Department */}
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium",
                            DEPT_COLORS[f.department] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                          )}>
                            {f.department}
                          </span>
                        </td>
                        {/* Designation */}
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium",
                            DESIGNATION_COLORS[f.designation] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                          )}>
                            {f.designation}
                          </span>
                        </td>
                        {/* Subjects */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSubjectsDialogId(f.id)}
                            className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-cyan-400 transition-colors group/btn"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-gray-500 group-hover/btn:text-cyan-400" />
                            <span className="font-medium">{f.subjectCount}</span>
                            <span className="text-gray-600 text-xs">subjects</span>
                          </button>
                        </td>
                        {/* Cabin */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-400">
                            <MapPin className="w-3 h-3 text-gray-600" />
                            {f.cabinLocation || '—'}
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openEdit(f)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDeleteId(f.id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
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

            {/* Pagination */}
            {!loading && total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}</span>
                  <span className="text-gray-700">|</span>
                  <div className="flex items-center gap-1">
                    <span>Per page:</span>
                    <select
                      value={limit}
                      onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                      className="appearance-none bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-0.5 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      {PAGE_SIZES.map(s => <option key={s} value={s} className="bg-[#0a0a1a]">{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {pageNumbers.map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={cn("w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200",
                        p === page ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-500 hover:text-white hover:bg-white/[0.05]"
                      )}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* ─── Card View ────────────────────────────────────────────── */
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ delay: 0.15 }}
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 animate-pulse">
                    <div className="h-20 bg-white/[0.04] rounded-xl mb-4" />
                    <div className="h-4 bg-white/[0.04] rounded mb-2" />
                    <div className="h-3 bg-white/[0.04] rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : faculty.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-12 text-center">
                <GraduationCap className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No faculty found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {faculty.map((f, idx) => (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300 group"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br shadow-lg",
                            getAvatarColor(f.user.name)
                          )} style={{ boxShadow: `0 0 15px ${f.user.name.charCodeAt(0) % 2 === 0 ? 'rgba(139,92,246,0.3)' : 'rgba(6,182,212,0.3)'}` }}>
                            {getInitial(f.user.name)}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white group-hover:text-gray-100">{f.user.name}</h4>
                            <span className={cn(
                              "inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-medium mt-0.5",
                              DESIGNATION_COLORS[f.designation] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                            )}>
                              {f.designation}
                            </span>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => openEdit(f)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(f.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Department Badge */}
                      <div className="mb-3">
                        <span className={cn(
                          "inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium",
                          DEPT_COLORS[f.department] || 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                        )}>
                          {f.department} Department
                        </span>
                      </div>

                      {/* Subjects */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] text-gray-500 font-medium">Subjects ({f.subjectCount})</span>
                          {f.subjectCount > 3 && (
                            <button
                              onClick={() => setSubjectsDialogId(f.id)}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              View all
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {f.subjects.length > 0 ? (
                            f.subjects.slice(0, 3).map((s, si) => (
                              <span key={s.id} className={cn(
                                "inline-flex items-center text-[10px] px-2 py-0.5 rounded-md border font-medium",
                                SUBJECT_COLORS[si % SUBJECT_COLORS.length]
                              )}>
                                {s.code}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-gray-600 italic">No subjects assigned</span>
                          )}
                          {f.subjectCount > 3 && (
                            <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-gray-500">
                              +{f.subjectCount - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cabin Location */}
                      {f.cabinLocation && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{f.cabinLocation}</span>
                        </div>
                      )}

                      {/* Contact row */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.06]">
                        <a href={`mailto:${f.user.email}`} className="text-gray-600 hover:text-cyan-400 transition-colors" title={f.user.email}>
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        {f.user.phone && (
                          <a href={`tel:${f.user.phone}`} className="text-gray-600 hover:text-cyan-400 transition-colors" title={f.user.phone}>
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Card View Pagination */}
                {total > limit && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Add/Edit Dialog ─────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0a0a1a]/95 backdrop-blur-xl border-white/[0.08] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {editId ? <Pencil className="w-4 h-4 text-cyan-400" /> : <Plus className="w-4 h-4 text-cyan-400" />}
              {editId ? 'Edit Faculty' : 'Add New Faculty'}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {editId ? 'Update faculty information' : 'Fill in the details to add a new faculty member'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs flex items-center gap-1"><UserCircle className="w-3 h-3" /> Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="Full name"
              />
            </div>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="email@university.edu"
              />
            </div>
            {/* Department */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs">Department *</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#0a0a1a]">{d}</option>)}
              </select>
            </div>
            {/* Designation */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs flex items-center gap-1"><Briefcase className="w-3 h-3" /> Designation</label>
              <select
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
              >
                {DESIGNATIONS.map(d => <option key={d} value={d} className="bg-[#0a0a1a]">{d}</option>)}
              </select>
            </div>
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="+91 9876543210"
              />
            </div>
            {/* Cabin Location */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Cabin Location</label>
              <input
                value={form.cabinLocation}
                onChange={(e) => setForm({ ...form, cabinLocation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                placeholder="Room 301, Block A"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {submitting ? 'Saving...' : editId ? 'Update Faculty' : 'Add Faculty'}
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ──────────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-[#0a0a1a]/95 backdrop-blur-xl border-white/[0.08] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone. The faculty record and associated user account will be permanently deleted. Faculty with assigned subjects cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDelete}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all duration-300"
            >
              Delete Faculty
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Subjects Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!subjectsDialogId} onOpenChange={() => setSubjectsDialogId(null)}>
        <DialogContent className="bg-[#0a0a1a]/95 backdrop-blur-xl border-white/[0.08] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Subjects — {selectedFaculty?.user.name}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {selectedFaculty?.subjectCount || 0} subject{selectedFaculty?.subjectCount !== 1 ? 's' : ''} currently assigned
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {selectedFaculty?.subjects && selectedFaculty.subjects.length > 0 ? (
              selectedFaculty.subjects.map((s, si) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: si * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border",
                      SUBJECT_COLORS[si % SUBJECT_COLORS.length]
                    )}>
                      {s.code.slice(0, 3)}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{s.name}</p>
                      <p className="text-[11px] text-gray-600">{s.code} · Sem {s.semester} · {s.credits} credits</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No subjects assigned</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setSubjectsDialogId(null)}
              className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
