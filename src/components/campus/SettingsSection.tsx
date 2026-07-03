'use client';

import { useState } from 'react';
import { useCampusStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  Settings, Palette, Bell, Bot, Shield, Globe, Moon, Sun,
  Monitor, Volume2, VolumeX, ToggleLeft, ToggleRight,
  ChevronRight, Check, Sparkles, Zap, Eye, Ear, MessageSquare,
  Clock, RefreshCw, Database, Trash2, Download, Upload
} from 'lucide-react';
import { GlassCard, SectionTitle } from './WidgetCard';

interface ToggleSettingProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleSetting({ label, description, icon, enabled, onToggle }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] rounded-xl transition-colors group">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors">
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
          enabled ? 'bg-purple-600 shadow-[0_0_12px_rgba(139,92,246,0.4)]' : 'bg-white/[0.1]'
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
        />
      </button>
    </div>
  );
}

export default function SettingsSection() {
  const { accentColor, setAccentColor } = useCampusStore();

  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    soundEffects: true,
    voiceAssistant: true,
    aiSuggestions: true,
    autoRefresh: true,
    predictiveAnalytics: true,
    memoryRetention: true,
    compactView: false,
    emailDigest: false,
  });

  const [selectedTheme, setSelectedTheme] = useState('midnight');
  const [selectedAccent, setSelectedAccent] = useState(accentColor);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const themes = [
    { id: 'midnight', label: 'Midnight', colors: ['#050510', '#0a0a1a', '#12121e'] },
    { id: 'ocean', label: 'Deep Ocean', colors: ['#041224', '#0a1e3c', '#0f2849'] },
    { id: 'forest', label: 'Dark Forest', colors: ['#041208', '#0a1e10', '#0f2816'] },
    { id: 'ember', label: 'Dark Ember', colors: ['#120808', '#1e0a0a', '#280f0f'] },
    { id: 'cosmic', label: 'Cosmic', colors: ['#0a0416', '#140828', '#1e0c3a'] },
  ];

  const accentColors = [
    { id: 'purple', label: 'Purple', color: '#8b5cf6', gradient: 'from-purple-500 to-violet-600' },
    { id: 'cyan', label: 'Cyan', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'green', label: 'Emerald', color: '#10b981', gradient: 'from-green-500 to-emerald-600' },
    { id: 'rose', label: 'Rose', color: '#f43f5e', gradient: 'from-rose-500 to-pink-600' },
    { id: 'amber', label: 'Amber', color: '#f59e0b', gradient: 'from-amber-500 to-orange-600' },
  ];

  const settingSections = [
    {
      title: 'AI & Intelligence',
      icon: <Bot className="w-5 h-5" />,
      items: [
        { key: 'aiSuggestions' as const, label: 'AI Suggestions', desc: 'Show AI-powered recommendations across sections', icon: <Sparkles className="w-4 h-4" /> },
        { key: 'predictiveAnalytics' as const, label: 'Predictive Analytics', desc: 'Show attendance predictions and risk analysis', icon: <Zap className="w-4 h-4" /> },
        { key: 'memoryRetention' as const, label: 'AI Memory', desc: 'Allow AI to remember your preferences and context', icon: <Database className="w-4 h-4" /> },
        { key: 'voiceAssistant' as const, label: 'Voice Assistant', desc: 'Enable voice input and AI speech output', icon: <Ear className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      items: [
        { key: 'notifications' as const, label: 'Push Notifications', desc: 'Receive alerts for important events', icon: <Bell className="w-4 h-4" /> },
        { key: 'soundEffects' as const, label: 'Sound Effects', desc: 'Play sounds for notifications and interactions', icon: <Volume2 className="w-4 h-4" /> },
        { key: 'emailDigest' as const, label: 'Email Digest', desc: 'Receive daily email summary of campus updates', icon: <MessageSquare className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Display',
      icon: <Eye className="w-5 h-5" />,
      items: [
        { key: 'darkMode' as const, label: 'Dark Mode', desc: 'Use dark theme throughout the application', icon: <Moon className="w-4 h-4" /> },
        { key: 'autoRefresh' as const, label: 'Auto Refresh', desc: 'Automatically refresh data every 30 seconds', icon: <RefreshCw className="w-4 h-4" /> },
        { key: 'compactView' as const, label: 'Compact View', desc: 'Reduce spacing and show more content', icon: <Monitor className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-[0_0_20px_rgba(107,114,128,0.3)]">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <SectionTitle>Settings & Preferences</SectionTitle>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme Selection */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              Theme
            </h3>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative p-3 rounded-xl border transition-all ${
                    selectedTheme === theme.id
                      ? 'border-purple-500/50 bg-purple-500/5'
                      : 'border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex gap-1 mb-2 justify-center">
                    {theme.colors.map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-white/[0.1]" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="text-[10px] text-gray-400 text-center">{theme.label}</div>
                  {selectedTheme === theme.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Accent Color
            </h3>
            <div className="flex gap-3">
              {accentColors.map(accent => (
                <button
                  key={accent.id}
                  onClick={() => { setSelectedAccent(accent.id); setAccentColor(accent.id); }}
                  className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                    selectedAccent === accent.id
                      ? 'bg-white/[0.05] border border-white/[0.15]'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${accent.gradient} shadow-lg ${
                    selectedAccent === accent.id ? 'ring-2 ring-offset-2 ring-offset-[#050510] ring-white/30' : ''
                  }`} />
                  <span className="text-[10px] text-gray-500">{accent.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Settings Groups */}
          {settingSections.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.1 }}
            >
              <GlassCard className="overflow-hidden">
                <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-2">
                  <div className="text-purple-400">{section.icon}</div>
                  <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {section.items.map((item) => (
                    <ToggleSetting
                      key={item.key}
                      label={item.label}
                      description={item.desc}
                      icon={item.icon}
                      enabled={settings[item.key]}
                      onToggle={() => toggleSetting(item.key)}
                    />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Quick Settings */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              Privacy & Data
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left group">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-sm text-gray-300">Export My Data</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left group">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                  <span className="text-sm text-gray-300">Clear AI Memory</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left group">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  <span className="text-sm text-gray-300">Privacy Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </GlassCard>

          {/* AI Agents Configuration */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              Agent Preferences
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Master AI', emoji: '🤖', desc: 'Main orchestrator' },
                { name: 'Attendance', emoji: '📊', desc: 'Attendance tracking' },
                { name: 'Placement', emoji: '🎯', desc: 'Career guidance' },
                { name: 'Library', emoji: '📚', desc: 'Book management' },
                { name: 'Finance', emoji: '💰', desc: 'Fee tracking' },
              ].map((agent, i) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{agent.emoji}</span>
                    <div>
                      <div className="text-xs font-medium text-white">{agent.name}</div>
                      <div className="text-[10px] text-gray-600">{agent.desc}</div>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* System Info */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              System Info
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Version</span>
                <span className="text-gray-300">2.0.0 Enterprise</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active Backend</span>
                <span className="text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Next.js + Prisma
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Python Backend</span>
                <span className="text-cyan-400">FastAPI @ :8001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Frontend</span>
                <span className="text-gray-300">Next.js 16</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">AI Engine</span>
                <span className="text-purple-400">Multi-Agent LLM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Database</span>
                <span className="text-gray-300">SQLite</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Protocol</span>
                <span className="text-gray-300">MCP v1.0</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
