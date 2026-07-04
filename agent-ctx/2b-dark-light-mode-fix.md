# Task 2b: Fix ChatPanel and VoiceAssistant for Light/Dark Mode

## Summary
Fixed all hardcoded dark-mode-only colors in ChatPanel.tsx and VoiceAssistant.tsx to use CSS custom properties (`var(--*)`) for full light/dark mode legibility.

## ChatPanel.tsx Changes (22+ replacements)
- Panel bg: `bg-[#0a0a14]/95` → `bg-[var(--bg-secondary)]/95`
- Agent dropdown bg: `bg-[#12121e]/95` → `bg-[var(--bg-secondary)]/95`
- Header/input footer bg: `bg-white/[0.02]` → `bg-[var(--bg-card)]`
- All `text-white` → `text-[var(--text-primary)]` (except gradient icon overlays)
- All `text-gray-500` → `text-[var(--text-muted)]`
- All `text-gray-300` → `text-[var(--text-secondary)]`
- All `text-gray-400` → `text-[var(--text-muted)]`
- All `bg-white/[0.04]` → `bg-[var(--glass-bg)]`
- All `bg-white/[0.05]` → `bg-[var(--glass-bg)]`
- All `border-white/[0.08]` and `border-white/[0.06]` → `border-[var(--border-color)]`
- User bubble: `bg-purple-600/30` → `bg-purple-500/20 dark:bg-purple-600/30`
- Assistant bubble: `bg-white/[0.04] text-gray-300` → `bg-[var(--glass-bg)] text-[var(--text-secondary)]`
- Prose: `prose-invert` → `dark:prose-invert`
- Accent colors: `text-purple-400` → `text-purple-600 dark:text-purple-400`
- Green badge: `text-green-400` → `text-green-600 dark:text-green-400`
- Loading dots: `bg-purple-400` → `bg-purple-600 dark:bg-purple-400`
- Placeholder: `placeholder-gray-600` → `placeholder:text-[var(--text-muted)]`
- Hover states: `hover:bg-white/[0.05]` → `hover:bg-[var(--glass-bg)]`, `hover:text-white` → `hover:text-[var(--text-primary)]`

## VoiceAssistant.tsx Changes (12+ replacements)
- Modal bg: `bg-[#0a0a14]/95` → `bg-[var(--bg-secondary)]/95`
- All `text-white` → `text-[var(--text-primary)]`
- All `text-gray-500` → `text-[var(--text-muted)]`
- All `text-gray-400` → `text-[var(--text-muted)]`
- Transcript box: `bg-white/[0.04]` → `bg-[var(--glass-bg)]`
- All `border-white/[0.08]` → `border-[var(--border-color)]`
- Transcript label: `text-purple-400` → `text-purple-600 dark:text-purple-400`
- Sending dots: `bg-cyan-400` → `bg-cyan-600 dark:bg-cyan-400`
- Quick suggestions: full variable replacement
- Close button hover states fixed
- Preserved: overlay `bg-black/60`, mic button gradient, icon `text-white` on gradients

## Verification
- `bun run lint` — no errors
- Dev server compiles successfully
