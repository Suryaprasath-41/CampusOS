'use client';

import { useState, useRef, useEffect } from 'react';
import { useCampusStore, postAPI } from '@/lib/store';
import { X, Send, Bot, Sparkles, Mic, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const agentOptions = [
  { id: 'master', label: 'Master AI', icon: '🤖' },
  { id: 'attendance', label: 'Attendance', icon: '📊' },
  { id: 'placement', label: 'Placement', icon: '🎯' },
  { id: 'library', label: 'Library', icon: '📚' },
  { id: 'academic', label: 'Academic', icon: '🎓' },
  { id: 'hostel', label: 'Hostel', icon: '🏠' },
  { id: 'finance', label: 'Finance', icon: '💰' },
];

const quickActions = [
  "Can I miss tomorrow's class?",
  "Check my attendance",
  "Placement readiness",
  "Book recommendation",
  "What assignments are due?",
  "How much fee is pending?",
];

export default function ChatPanel() {
  const { chatOpen, setChatOpen, chatMessages, addChatMessage, chatLoading, setChatLoading, selectedAgent, setSelectedAgent } = useCampusStore();
  const [input, setInput] = useState('');
  const [showAgents, setShowAgents] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (chatOpen) inputRef.current?.focus();
  }, [chatOpen]);

  const handleSend = async () => {
    if (!input.trim() || chatLoading) return;
    const msg = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: msg, agentType: selectedAgent });
    setChatLoading(true);

    try {
      const data = await postAPI('/chat', { message: msg, agentType: selectedAgent });
      addChatMessage({ role: 'assistant', content: data.response, agentType: data.agentType });
    } catch {
      addChatMessage({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', agentType: selectedAgent });
    } finally {
      setChatLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    setTimeout(() => {
      const msg = action;
      setInput('');
      addChatMessage({ role: 'user', content: msg, agentType: selectedAgent });
      setChatLoading(true);
      postAPI('/chat', { message: msg, agentType: selectedAgent })
        .then((data) => addChatMessage({ role: 'assistant', content: data.response, agentType: data.agentType }))
        .catch(() => addChatMessage({ role: 'assistant', content: 'Error. Please try again.', agentType: selectedAgent }))
        .finally(() => setChatLoading(false));
    }, 100);
  };

  const currentAgent = agentOptions.find(a => a.id === selectedAgent);

  if (!chatOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-shadow z-50"
      >
        <Bot className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-0 right-6 w-[420px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[80vh] bg-[var(--bg-secondary)]/95 backdrop-blur-2xl border border-[var(--border-color)] rounded-t-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">CampusOS AI</div>
            <div className="flex items-center gap-1.5">
              <div className="text-[10px] text-[var(--text-muted)]">Multi-Agent System</div>
              <span className="text-[8px] px-1 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">AI</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Agent Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAgents(!showAgents)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--glass-bg)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
            >
              <span>{currentAgent?.icon}</span>
              <span>{currentAgent?.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showAgents && (
              <div className="absolute right-0 top-full mt-1 w-44 py-1 bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-color)] rounded-xl shadow-xl z-10">
                {agentOptions.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => { setSelectedAgent(agent.id); setShowAgents(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[var(--glass-bg)] transition-colors ${
                      selectedAgent === agent.id ? 'text-purple-600 dark:text-purple-400 bg-purple-500/5' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <span>{agent.icon}</span>
                    {agent.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--glass-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-[var(--text-primary)] font-semibold mb-1">Ask Campus AI</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Your intelligent campus assistant</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="px-3 py-1.5 rounded-full bg-[var(--glass-bg)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] hover:border-purple-500/30 transition-all"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-purple-500/20 dark:bg-purple-600/30 border border-purple-500/20 text-[var(--text-primary)]'
                : 'bg-[var(--glass-bg)] border border-[var(--border-color)] text-[var(--text-secondary)]'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2 [&>li]:mb-0.5">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] px-4 py-3 rounded-2xl">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-2 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 focus-within:border-purple-500/40 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Campus AI..."
            className="flex-1 bg-transparent text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chatLoading}
            className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
