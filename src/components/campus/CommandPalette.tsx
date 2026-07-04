'use client';

import { useCampusStore, patchAPI } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, TrendingUp, Target, BookOpen, GraduationCap,
  Home, Wallet, CalendarDays, Workflow, Brain, Shield, User, FileText,
  Sparkles, Mic, Bell, CornerDownLeft, ArrowUp, ArrowDown, X,
  Settings, Database,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

type IconType = React.ComponentType<{ className?: string }>;

type Command = {
  id: string;
  type: 'navigation' | 'action';
  title: string;
  subtitle: string;
  icon: IconType;
  shortcut?: string;
  keywords?: string;
  run: () => void | Promise<void>;
};

export default function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveSection,
    openChatWithContext,
    setVoiceOpen,
    bumpNotifVersion,
  } = useCampusStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build the command list
  const commands: Command[] = useMemo(() => {
    const close = () => setCommandPaletteOpen(false);
    return [
      // ── Navigation ──────────────────────────────────────────────
      { id: 'nav-dashboard', type: 'navigation', title: 'Dashboard', subtitle: 'Navigation', icon: LayoutDashboard, keywords: 'home overview', run: () => { setActiveSection('dashboard'); close(); } },
      { id: 'nav-attendance', type: 'navigation', title: 'Attendance', subtitle: 'Navigation', icon: TrendingUp, keywords: 'trends present absent', run: () => { setActiveSection('attendance'); close(); } },
      { id: 'nav-placement', type: 'navigation', title: 'Placement', subtitle: 'Navigation', icon: Target, keywords: 'jobs career interview', run: () => { setActiveSection('placement'); close(); } },
      { id: 'nav-library', type: 'navigation', title: 'Library', subtitle: 'Navigation', icon: BookOpen, keywords: 'books search resources', run: () => { setActiveSection('library'); close(); } },
      { id: 'nav-academic', type: 'navigation', title: 'Academic', subtitle: 'Navigation', icon: GraduationCap, keywords: 'courses gpa grades', run: () => { setActiveSection('academic'); close(); } },
      { id: 'nav-hostel', type: 'navigation', title: 'Hostel', subtitle: 'Navigation', icon: Home, keywords: 'room dorm lodging', run: () => { setActiveSection('hostel'); close(); } },
      { id: 'nav-finance', type: 'navigation', title: 'Finance', subtitle: 'Navigation', icon: Wallet, keywords: 'fees payments dues', run: () => { setActiveSection('finance'); close(); } },
      { id: 'nav-events', type: 'navigation', title: 'Events', subtitle: 'Navigation', icon: CalendarDays, keywords: 'calendar activities', run: () => { setActiveSection('events'); close(); } },
      { id: 'nav-workflow', type: 'navigation', title: 'Workflows', subtitle: 'Navigation', icon: Workflow, keywords: 'automation agents', run: () => { setActiveSection('workflow'); close(); } },
      { id: 'nav-faculty', type: 'navigation', title: 'Faculty AI', subtitle: 'Navigation', icon: Brain, keywords: 'teacher professor tools', run: () => { setActiveSection('faculty'); close(); } },
      { id: 'nav-admin', type: 'navigation', title: 'Admin', subtitle: 'Navigation', icon: Shield, keywords: 'administration panel', run: () => { setActiveSection('admin'); close(); } },
      { id: 'nav-profile', type: 'navigation', title: 'Profile', subtitle: 'Navigation', icon: User, keywords: 'account me settings', run: () => { setActiveSection('profile'); close(); } },
      { id: 'nav-exams', type: 'navigation', title: 'Exams', subtitle: 'Navigation', icon: FileText, keywords: 'tests schedule results', run: () => { setActiveSection('exams'); close(); } },
      { id: 'nav-ai-memory', type: 'navigation', title: 'AI Memory', subtitle: 'Navigation', icon: Database, keywords: 'brain memory recall context', run: () => { setActiveSection('ai-memory'); close(); } },
      { id: 'nav-settings', type: 'navigation', title: 'Settings', subtitle: 'Navigation', icon: Settings, keywords: 'preferences config theme', run: () => { setActiveSection('settings'); close(); } },
      // ── Actions ─────────────────────────────────────────────────
      { id: 'act-ai', type: 'action', title: 'Ask AI Assistant', subtitle: 'Quick Action', icon: Sparkles, shortcut: '↵', keywords: 'chat bot help question', run: () => { openChatWithContext("I need help with something on CampusOS. What can you assist me with?"); close(); } },
      { id: 'act-voice', type: 'action', title: 'Open Voice Assistant', subtitle: 'Quick Action', icon: Mic, shortcut: '↵', keywords: 'speak mic speech', run: () => { setVoiceOpen(true); close(); } },
      {
        id: 'act-markread',
        type: 'action',
        title: 'Mark All Notifications Read',
        subtitle: 'Quick Action',
        icon: Bell,
        shortcut: '↵',
        keywords: 'notifications clear read',
        run: async () => {
          try {
            await patchAPI('/notifications', { markAllRead: true });
            bumpNotifVersion();
          } catch {
            /* ignore network errors — still close the palette */
          } finally {
            close();
          }
        },
      },
    ];
  }, [setActiveSection, openChatWithContext, setVoiceOpen, setCommandPaletteOpen, bumpNotifVersion]);

  // Filter commands based on query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => {
      const haystack = `${c.title} ${c.subtitle} ${c.id} ${c.keywords || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [commands, query]);

  // Group filtered commands into categories (preserving order)
  const groups = useMemo(() => {
    const nav = filtered.filter((c) => c.type === 'navigation');
    const act = filtered.filter((c) => c.type === 'action');
    return [
      { label: 'Navigation', items: nav },
      { label: 'Actions', items: act },
    ].filter((g) => g.items.length > 0);
  }, [filtered]);

  // Reset selection whenever the result set changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global keyboard listener — ALWAYS attached (even when closed) so Cmd+K / Ctrl+K toggles
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Reset query + focus input when palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Defer focus to next tick so the input is mounted
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [commandPaletteOpen]);

  // In-palette keyboard navigation (Escape / Arrows / Enter)
  useEffect(() => {
    if (!commandPaletteOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % Math.max(filtered.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filtered[selectedIndex];
        if (cmd) void cmd.run();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, filtered, selectedIndex, setCommandPaletteOpen]);

  // Keep the selected row scrolled into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-cmd-index="${selectedIndex}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Pre-compute a flat index lookup so we can highlight the active row inside grouped lists
  const flatIndexById = useMemo(() => {
    const map = new Map<string, number>();
    let running = 0;
    for (const g of groups) {
      for (const item of g.items) {
        map.set(item.id, running++);
      }
    }
    return map;
  }, [groups]);

  const hasResults = filtered.length > 0;

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] max-w-2xl mt-32 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl shadow-[0_25px_80px_-15px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border-color)]">
              <Search className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections and actions... or type a command"
                className="flex-1 bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                autoComplete="off"
                spellCheck={false}
                aria-label="Search commands"
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors"
                aria-label="Close command palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results list */}
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2 custom-scroll">
              {hasResults ? (
                groups.map((group) => (
                  <div key={group.label} className="mb-2 last:mb-0">
                    <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      {group.label}
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((cmd) => {
                        const flatIndex = flatIndexById.get(cmd.id) ?? 0;
                        const isSelected = flatIndex === selectedIndex;
                        const Icon = cmd.icon;
                        return (
                          <motion.button
                            key={cmd.id}
                            data-cmd-index={flatIndex}
                            onClick={() => void cmd.run()}
                            onMouseEnter={() => setSelectedIndex(flatIndex)}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.18, delay: Math.min(flatIndex * 0.025, 0.2) }}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group relative',
                              isSelected
                                ? 'bg-purple-500/10 border-l-2 border-purple-500 pl-[10px]'
                                : 'border-l-2 border-transparent hover:bg-[var(--bg-card)]'
                            )}
                          >
                            <span
                              className={cn(
                                'p-2 rounded-lg shrink-0 transition-colors',
                                isSelected
                                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300'
                                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div
                                className={cn(
                                  'text-sm font-medium truncate',
                                  isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                                )}
                              >
                                {cmd.title}
                              </div>
                              <div className="text-[11px] text-[var(--text-muted)] truncate">
                                {cmd.subtitle}
                              </div>
                            </div>
                            {cmd.shortcut && (
                              <span
                                className={cn(
                                  'shrink-0 inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-md border transition-colors',
                                  isSelected
                                    ? 'text-purple-600 dark:text-purple-300 border-purple-500/30 bg-purple-500/10'
                                    : 'text-[var(--text-muted)] border-[var(--border-color)] bg-[var(--bg-card)]'
                                )}
                              >
                                <CornerDownLeft className="w-3 h-3" />
                                {cmd.shortcut}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Search className="w-8 h-8 mx-auto mb-3 text-[var(--text-muted)]" />
                  <div className="text-sm text-[var(--text-muted)]">No commands found</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    Try searching for &ldquo;attendance&rdquo;, &ldquo;AI&rdquo;, or &ldquo;library&rdquo;
                  </div>
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 border-t border-[var(--border-color)] bg-[var(--bg-card)]">
              <Hint>
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
                <span>navigate</span>
              </Hint>
              <Hint>
                <CornerDownLeft className="w-3 h-3" />
                <span>select</span>
              </Hint>
              <Hint>
                <span className="text-[10px] font-semibold">esc</span>
                <span>close</span>
              </Hint>
              <div className="ml-auto flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <span className="px-1.5 py-0.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] font-semibold">
                  ⌘K
                </span>
                <span>to toggle</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]">
        {children}
      </span>
    </div>
  );
}
