'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Plus, Search, Mail, Lock, User,
  GraduationCap, BookOpen, CheckCircle2, XCircle,
  Loader2, Trash2, Eye, EyeOff, Copy, Check, AlertTriangle
} from 'lucide-react';
import { GlassCard, SectionTitle } from './WidgetCard';
import { useCampusStore } from '@/lib/store';

interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
  createdAt: string;
}

export default function AdminUserManager() {
  const { addToast, currentUser } = useCampusStore();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Create form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('student');
  const [formDepartment, setFormDepartment] = useState('Computer Science');

  const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mathematics', 'Mechanical', 'Civil', 'Administration'];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (e) {
        console.error('Failed to load users:', e);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    }
    setLoading(false);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz234566789!@';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(pass);
    setGeneratedPassword(pass);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('campusos-token='))?.split('=')[1];
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formEmail,
          password: formPassword,
          name: formName,
          role: formRole,
          department: formDepartment,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addToast({
          id: `user-created-${Date.now()}`,
          type: 'success',
          title: 'User Created',
          message: `${formName} (${formEmail}) has been created successfully.`,
          timestamp: Date.now(),
        });
        // Reset form
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setGeneratedPassword('');
        setShowCreateForm(false);
        loadUsers();
      } else {
        addToast({
          id: `user-error-${Date.now()}`,
          type: 'error',
          title: 'Creation Failed',
          message: data.error || 'Failed to create user.',
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      addToast({
        id: `user-error-${Date.now()}`,
        type: 'error',
        title: 'Error',
        message: 'Network error. Please try again.',
        timestamp: Date.now(),
      });
    }

    setCreating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('campusos-token='))?.split('=')[1];
      const res = await fetch('/api/auth/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addToast({
          id: `user-deleted-${Date.now()}`,
          type: 'success',
          title: 'User Deleted',
          message: data.message || 'User has been deleted successfully.',
          timestamp: Date.now(),
        });
        setConfirmDeleteId(null);
        loadUsers();
      } else {
        addToast({
          id: `user-delete-error-${Date.now()}`,
          type: 'error',
          title: 'Deletion Failed',
          message: data.error || 'Failed to delete user.',
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      addToast({
        id: `user-delete-error-${Date.now()}`,
        type: 'error',
        title: 'Error',
        message: 'Network error. Please try again.',
        timestamp: Date.now(),
      });
    }
    setDeletingUserId(null);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleIcon = (role: string) => {
    if (role === 'admin') return <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    if (role === 'faculty') return <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
    return <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
  };

  const roleBadge = (role: string) => {
    if (role === 'admin') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    if (role === 'faculty') return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
  };

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <SectionTitle>User Account Management</SectionTitle>
            <p className="text-xs text-[var(--text-muted)]">Create and manage @JSE.com email accounts for students, faculty, and admins</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-medium shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-shadow"
        >
          <Plus className="w-4 h-4" />
          Create Account
        </motion.button>
      </div>

      {/* Create User Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-6 overflow-hidden">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Create New @JSE.com Account
              </h3>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. John Doe"
                        required
                        className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/40 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="username"
                        required
                        className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/40 transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">@JSE.com</span>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Password</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          placeholder="Enter or generate password"
                          required
                          className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/40 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="px-3 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--border-color)] text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 transition-colors whitespace-nowrap"
                      >
                        Auto Generate
                      </button>
                    </div>
                    {generatedPassword && (
                      <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <span className="text-xs text-amber-300 flex-1 font-mono">{generatedPassword}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(generatedPassword)}
                          className="p-1 rounded hover:bg-amber-500/10 transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" /> : <Copy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Role</label>
                    <div className="flex gap-2">
                      {(['student', 'faculty', 'admin'] as const).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormRole(role)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                            formRole === role
                              ? role === 'admin'
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                                : role === 'faculty'
                                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                                : 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400'
                              : 'bg-[var(--glass-bg)] border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card)]'
                          }`}
                        >
                          {roleIcon(role)}
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/40 transition-colors"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept} className="bg-[var(--bg-secondary)]">{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-300/80">
                    <strong>Note:</strong> Only administrators can create accounts. The email will be <span className="font-mono text-amber-300">{formEmail || 'username'}@JSE.com</span>. Share the credentials securely with the user.
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:bg-[var(--glass-bg)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-medium shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-shadow disabled:opacity-60"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name, email, or role..."
          className="w-full bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/40 transition-colors"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-[var(--text-primary)]' },
          { label: 'Students', value: users.filter(u => u.role === 'student').length, color: 'text-purple-600 dark:text-purple-400' },
          { label: 'Faculty', value: users.filter(u => u.role === 'faculty').length, color: 'text-cyan-600 dark:text-cyan-400' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-amber-600 dark:text-amber-400' },
        ].map((stat, i) => (
          <GlassCard key={stat.label} className="p-4">
            <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* Users List */}
      <GlassCard className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            All User Accounts
          </h3>
          <button
            onClick={loadUsers}
            className="text-xs text-[var(--text-muted)] hover:text-amber-600 dark:text-amber-400 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-[var(--text-muted)]">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-sm text-[var(--text-muted)]">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {filteredUsers.map((user, i) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--glass-bg)] transition-colors"
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-primary)] text-sm font-bold shrink-0 ${
                    user.role === 'admin' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                    user.role === 'faculty' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' :
                    'bg-gradient-to-br from-purple-500 to-violet-600'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">{user.name}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{user.email}</div>
                  </div>

                  {/* Department */}
                  <div className="hidden md:block text-xs text-[var(--text-muted)]">
                    {user.department || '—'}
                  </div>

                  {/* Role Badge */}
                  <span className={`text-[10px] px-2 py-1 rounded-full border flex items-center gap-1 ${roleBadge(user.role)}`}>
                    {roleIcon(user.role)}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>

                  {/* Created */}
                  <div className="hidden lg:block text-[10px] text-[var(--text-muted)]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>

                  {/* Delete Button */}
                  {user.id !== currentUser?.id && (
                    <div className="relative">
                      {confirmDeleteId === user.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deletingUserId === user.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-[10px] font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50"
                          >
                            {deletingUserId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-muted)] text-[10px] hover:bg-[var(--bg-card)] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(user.id)}
                          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
