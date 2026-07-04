'use client';

import { useState, useEffect, useRef } from 'react';
import { useCampusStore, postAPI } from '@/lib/store';
import { Mic, X, Square, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Minimal Web Speech API types
interface SpeechRecognitionResult {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEvent {
  results: { length: number; [index: number]: SpeechRecognitionResult };
  resultIndex: number;
}
interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

export default function VoiceAssistant() {
  const { voiceOpen, setVoiceOpen, setChatOpen, addChatMessage, setChatLoading, selectedAgent } = useCampusStore();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sending, setSending] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR() as SpeechRecognition;
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let final = '';
      for (let i = 0; i < e.results.length; i++) {
        final += e.results[i][0].transcript;
      }
      setTranscript(final);
    };

    rec.onend = () => {
      setListening(false);
    };

    rec.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = rec;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition not supported. Try Chrome browser.');
      return;
    }
    setTranscript('');
    setSending(false);
    setListening(true);
    recognitionRef.current.start();
  };

  const stopListening = async () => {
    recognitionRef.current?.stop();
    setListening(false);

    // Wait a moment for final transcript to populate
    await new Promise((r) => setTimeout(r, 200));

    const finalTranscript = transcript.trim();
    if (!finalTranscript) return;

    // Show "Sending to AI..." state
    setSending(true);

    // Add user message to chat
    addChatMessage({ role: 'user', content: finalTranscript, agentType: selectedAgent });
    setChatLoading(true);

    // Open chat panel
    setChatOpen(true);

    // Brief delay to show "Sending to AI..." animation
    await new Promise((r) => setTimeout(r, 500));

    // Close voice modal
    setVoiceOpen(false);

    // Reset voice state
    setSending(false);
    setTranscript('');

    // Send to AI API
    try {
      const data = await postAPI('/chat', { message: finalTranscript, agentType: selectedAgent });
      addChatMessage({ role: 'assistant', content: data.response, agentType: data.agentType });
    } catch {
      addChatMessage({ role: 'assistant', content: 'Sorry, I encountered an error processing your voice query. Please try again.', agentType: selectedAgent });
    } finally {
      setChatLoading(false);
    }
  };

  // Quick suggestion handler - sends directly to AI chat
  const handleQuickSuggestion = async (suggestion: string) => {
    setTranscript(suggestion);
    setSending(true);
    addChatMessage({ role: 'user', content: suggestion, agentType: selectedAgent });
    setChatLoading(true);
    setChatOpen(true);

    await new Promise((r) => setTimeout(r, 500));
    setVoiceOpen(false);
    setSending(false);
    setTranscript('');

    try {
      const data = await postAPI('/chat', { message: suggestion, agentType: selectedAgent });
      addChatMessage({ role: 'assistant', content: data.response, agentType: data.agentType });
    } catch {
      addChatMessage({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', agentType: selectedAgent });
    } finally {
      setChatLoading(false);
    }
  };

  if (!voiceOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !sending && setVoiceOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[var(--bg-secondary)]/95 backdrop-blur-2xl border border-[var(--border-color)] rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Animated gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

          <button
            onClick={() => !sending && setVoiceOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--glass-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-10"
            disabled={sending}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 text-center">
            {/* Mic button / Sending animation */}
            {sending ? (
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center mx-auto mb-6"
              >
                <Send className="w-8 h-8 text-white" />
              </motion.div>
            ) : (
              <motion.div
                animate={{
                  scale: listening ? [1, 1.1, 1] : 1,
                  boxShadow: listening
                    ? ['0 0 0 0 rgba(139,92,246,0.4)', '0 0 0 20px rgba(139,92,246,0)', '0 0 0 0 rgba(139,92,246,0.4)']
                    : '0 0 30px rgba(139,92,246,0.2)',
                }}
                transition={{ duration: 1.5, repeat: listening ? Infinity : 0 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center mx-auto mb-6 cursor-pointer"
                onClick={listening ? stopListening : startListening}
              >
                {listening ? (
                  <Square className="w-8 h-8 text-white" fill="white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </motion.div>
            )}

            <h3 className="text-[var(--text-primary)] font-semibold text-lg mb-1">
              {sending ? 'Sending to AI...' : listening ? 'Listening...' : 'Voice Assistant'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              {sending ? 'Opening chat with your query' : listening ? 'Speak your question' : 'Tap the mic and ask anything'}
            </p>

            {/* Transcript */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-4 mb-4 text-left"
              >
                <div className="text-[10px] text-purple-600 dark:text-purple-400 uppercase mb-1">You said</div>
                <p className="text-sm text-[var(--text-primary)]">{transcript}</p>
              </motion.div>
            )}

            {/* Sending animation dots */}
            {sending && (
              <div className="flex justify-center gap-1.5 py-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400"
                  />
                ))}
              </div>
            )}

            {/* Quick suggestions - only when idle */}
            {!transcript && !sending && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {["What's my attendance?", "Any assignments due?", "Check my fees"].map(s => (
                  <button
                    key={s}
                    onClick={() => handleQuickSuggestion(s)}
                    className="px-3 py-1.5 rounded-full bg-[var(--glass-bg)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] hover:border-purple-500/30 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
