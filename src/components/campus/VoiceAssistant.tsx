'use client';

import { useState, useEffect, useRef } from 'react';
import { useCampusStore, postAPI } from '@/lib/store';
import { Mic, X, Sparkles, Volume2, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

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
  const { voiceOpen, setVoiceOpen } = useCampusStore();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
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
    setResponse('');
    setListening(true);
    recognitionRef.current.start();
  };

  const stopListening = async () => {
    recognitionRef.current?.stop();
    setListening(false);
    if (transcript.trim()) {
      await sendQuery(transcript.trim());
    }
  };

  const sendQuery = async (q: string) => {
    setLoading(true);
    setResponse('');
    try {
      const data = await postAPI('/chat', { message: q, agentType: 'master' });
      setResponse(data.response);
      // Try TTS
      speakResponse(data.response);
    } catch (e) {
      setResponse('Sorry, I encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    // Clean markdown
    const clean = text.replace(/[*#`_]/g, '').replace(/\n+/g, '. ');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  };

  if (!voiceOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setVoiceOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#0a0a14]/95 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Animated gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

          <button
            onClick={() => setVoiceOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/[0.05] text-gray-500 hover:text-white transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 text-center">
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

            <h3 className="text-white font-semibold text-lg mb-1">
              {listening ? 'Listening...' : loading ? 'Thinking...' : 'Voice Assistant'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {listening ? 'Speak your question' : 'Tap the mic and ask anything'}
            </p>

            {/* Transcript */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 mb-4 text-left"
              >
                <div className="text-[10px] text-purple-400 uppercase mb-1">You said</div>
                <p className="text-sm text-white">{transcript}</p>
              </motion.div>
            )}

            {/* Response */}
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-purple-500/[0.05] border border-purple-500/20 rounded-2xl p-4 mb-4 text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span className="text-[10px] text-purple-400 uppercase">AI Response</span>
                  <button
                    onClick={() => speakResponse(response)}
                    className="ml-auto p-1 rounded hover:bg-white/[0.05]"
                    title="Replay audio"
                  >
                    <Volume2 className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                <div className="text-sm text-gray-300 prose prose-invert prose-sm max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              </motion.div>
            )}

            {/* Loading dots */}
            {loading && !response && (
              <div className="flex justify-center gap-1.5 py-4">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full bg-purple-400"
                  />
                ))}
              </div>
            )}

            {/* Quick suggestions */}
            {!transcript && !loading && !response && (
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {["What's my attendance?", "Any assignments due?", "Check my fees"].map(s => (
                  <button
                    key={s}
                    onClick={() => { setTranscript(s); sendQuery(s); }}
                    className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-purple-500/30 transition-all"
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
