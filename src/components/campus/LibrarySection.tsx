'use client';

import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/store';
import { GlassCard, SectionTitle, StatusBadge } from './WidgetCard';
import { BookOpen, Search, MapPin, CheckCircle, AlertTriangle, Library } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LibrarySection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAPI('/library').then(setData).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-6"><div className="h-64 bg-[var(--bg-card)] rounded-2xl animate-pulse" /></div>;
  }

  const filtered = data.books.filter((b: any) => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || b.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
          <Library className="w-5 h-5 text-white" />
        </div>
        <SectionTitle>AI Library</SectionTitle>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ask the Library AI... or search books"
          className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl pl-12 pr-4 py-4 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-purple-500/40 focus:bg-[var(--glass-bg)] transition-all text-sm"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filter === 'all' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-secondary)]'
          }`}
        >
          All ({data.totalBooks})
        </button>
        {Object.entries(data.categories).map(([cat, count]: [string, any]) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === cat ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {cat} ({count})
          </button>
        ))}
      </div>

      {/* Borrowed Books */}
      {data.borrowed.length > 0 && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-[var(--text-primary)] font-semibold">My Borrowed Books</h3>
          </div>
          <div className="space-y-3">
            {data.borrowed.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                <div>
                  <div className="text-sm text-[var(--text-primary)] font-medium">{b.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">{b.author}</div>
                </div>
                <div className="text-right">
                  {b.overdue ? (
                    <div>
                      <StatusBadge status="HIGH" />
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">Fine: ₹{b.fine}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--text-secondary)]">
                      Due in {b.daysUntilDue} days
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((book: any) => (
          <motion.div
            key={book.id}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-color)] rounded-2xl p-5 hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 font-medium">
                {book.category}
              </span>
              {book.availableCopies > 0 ? (
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
            </div>
            <h4 className="text-[var(--text-primary)] font-semibold text-sm mb-1 line-clamp-2">{book.title}</h4>
            <p className="text-xs text-[var(--text-muted)] mb-3">{book.author}</p>
            {book.description && (
              <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2">{book.description}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <MapPin className="w-3 h-3" />
                {book.shelfLocation}
              </div>
              <span className={`text-xs font-medium ${book.availableCopies > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {book.availableCopies}/{book.totalCopies} available
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
