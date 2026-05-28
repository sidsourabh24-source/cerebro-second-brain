'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useVoice, VoiceState } from '@/hooks/useVoice'
import { 
  Mic, 
  MicOff, 
  ArrowLeft, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Terminal, 
  Cpu, 
  AlertCircle,
  Database,
  History,
  HelpCircle,
  Square,
  Play
} from 'lucide-react'

export default function VoicePage() {
  const [showTips, setShowTips] = useState(false)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  const {
    enabled,
    voiceState,
    transcript,
    messages,
    error,
    toggleVoiceMode,
    interrupt,
    forceSubmit
  } = useVoice()

  // Scroll transcript log to bottom on new messages or transcripts
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, transcript])

  // Get status details based on current state
  const getStateDetails = (state: VoiceState) => {
    switch (state) {
      case 'listening':
        return {
          title: 'CAPTURING AUDITORY SYNAPSE',
          desc: 'Listening to your query... speak naturally.',
          color: 'var(--brand-accent)',
          glow: '0 0 30px rgba(6, 182, 212, 0.4)',
          bg: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)'
        }
      case 'thinking':
        return {
          title: 'NEURAL LINK THINKING',
          desc: 'Processing input through Gemini flash cognitive engine...',
          color: '#8b5cf6', // Violet
          glow: '0 0 30px rgba(139, 92, 246, 0.4)',
          bg: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)'
        }
      case 'speaking':
        return {
          title: 'JARVIS VOCALIZING',
          desc: 'Vocalizing neural response... tap core to interrupt.',
          color: 'var(--brand-primary)', // Indigo
          glow: '0 0 35px rgba(99, 102, 241, 0.5)',
          bg: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)'
        }
      case 'idle':
      default:
        return {
          title: enabled ? 'AWAITING WAKE SYMPTON' : 'NEURAL INTERFACE OFFLINE',
          desc: enabled 
            ? 'Say "Jarvis" or "Cerebro" followed by your command.' 
            : 'Toggle the system link to engage vocal assistant.',
          color: enabled ? 'rgba(99, 102, 241, 0.6)' : 'var(--text-muted)',
          glow: enabled ? '0 0 15px rgba(99, 102, 241, 0.15)' : 'none',
          bg: 'transparent'
        }
    }
  }

  const details = getStateDetails(voiceState)

  return (
    <div className="min-h-screen bg-mesh p-4 md:p-8 flex flex-col items-center justify-between text-text-primary overflow-x-hidden relative">
      
      {/* Top Header Panel */}
      <div className="w-full max-w-5xl flex items-center justify-between z-20">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-xs font-semibold text-text-secondary"
        >
          <ArrowLeft size={14} /> Back to Command
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center gap-1.5 shadow-sm">
            <Cpu size={12} className="animate-pulse text-indigo-400" />
            Neural Synapse Active
          </span>
        </div>
      </div>

      {/* Main Reactor & Visualizer Widget */}
      <div className="flex-1 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 my-6 items-center z-10">
        
        {/* Visualizer Widget Column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 md:p-8 relative">
          
          {/* Main Visualizer Core Box */}
          <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
            
            {/* Ambient Core Glow mesh */}
            <div 
              className="absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-700 pointer-events-none"
              style={{ background: details.bg }}
            />

            {/* Ripple Wave Effects (Only while speaking) */}
            {voiceState === 'speaking' && (
              <>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0.8 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                  className="absolute w-64 h-64 rounded-full border border-indigo-500/30"
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0.6 }}
                  animate={{ scale: 2.3, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.6 }}
                  className="absolute w-64 h-64 rounded-full border border-indigo-500/20"
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0.4 }}
                  animate={{ scale: 2.8, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 1.2 }}
                  className="absolute w-64 h-64 rounded-full border border-cyan-500/10"
                />
              </>
            )}

            {/* Rapid wave expand-contract (Only while listening) */}
            {voiceState === 'listening' && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  className="absolute w-72 h-72 rounded-full border-2 border-cyan-400/15"
                />
                <motion.div
                  animate={{ scale: [1.1, 1.4, 1.1], opacity: [0.1, 0.4, 0.1] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
                  className="absolute w-72 h-72 rounded-full border border-cyan-400/10"
                />
              </>
            )}

            {/* Outer Concentric Ring 1 (Slow spin clockwise) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
              className="absolute w-72 h-72 md:w-80 md:h-80 rounded-full border border-indigo-500/10 flex items-center justify-center"
            >
              <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-indigo-500/40 -translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full bg-cyan-500/40 -translate-x-1/2" />
            </motion.div>

            {/* Middle Concentric Ring 2 (Dashed, spin counter-clockwise) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
              className="absolute w-56 h-56 md:w-64 md:h-64 rounded-full border-2 border-dashed border-cyan-500/10"
            />

            {/* Inner Concentric Ring 3 (Glowing segments) */}
            <motion.div
              animate={voiceState === 'thinking' ? { rotate: 360 } : { rotate: -120 }}
              transition={voiceState === 'thinking' ? { repeat: Infinity, duration: 3, ease: 'linear' } : { duration: 1 }}
              className="absolute w-44 h-44 md:w-50 md:h-50 rounded-full border border-white/5 flex items-center justify-center"
              style={{
                borderColor: voiceState === 'thinking' ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                borderWidth: voiceState === 'thinking' ? '2px' : '1px',
                borderStyle: voiceState === 'thinking' ? 'dashed' : 'solid',
                boxShadow: voiceState === 'thinking' ? '0 0 15px rgba(139, 92, 246, 0.3)' : 'none'
              }}
            />

            {/* Core Reactor Interactive Circle */}
            <motion.button
              onClick={voiceState === 'speaking' ? interrupt : toggleVoiceMode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={
                voiceState === 'listening' 
                  ? { scale: [1, 1.15, 1], boxShadow: details.glow }
                  : voiceState === 'speaking'
                  ? { scale: [1, 1.06, 1], boxShadow: details.glow }
                  : voiceState === 'thinking'
                  ? { scale: [0.98, 1.02, 0.98], boxShadow: details.glow }
                  : enabled
                  ? { scale: [1, 1.03, 1], boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)' }
                  : { scale: 1, boxShadow: 'none' }
              }
              transition={
                voiceState === 'listening'
                  ? { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
                  : voiceState === 'speaking'
                  ? { repeat: Infinity, duration: 0.8, ease: 'easeInOut' }
                  : voiceState === 'thinking'
                  ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
                  : { repeat: Infinity, duration: 4, ease: 'easeInOut' }
              }
              className="absolute w-32 h-32 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 border border-white/10 overflow-hidden"
              style={{
                background: voiceState === 'listening'
                  ? 'radial-gradient(circle, #0e1e2d 0%, #064e5b 100%)'
                  : voiceState === 'speaking'
                  ? 'radial-gradient(circle, #10122e 0%, #1e1b4b 100%)'
                  : voiceState === 'thinking'
                  ? 'radial-gradient(circle, #170d2b 0%, #311042 100%)'
                  : enabled
                  ? 'radial-gradient(circle, #0a0a16 0%, #131333 100%)'
                  : 'radial-gradient(circle, #080811 0%, #0f0f20 100%)',
                color: details.color
              }}
            >
              {/* Reactor center graphic */}
              <AnimatePresence mode="wait">
                {voiceState === 'speaking' ? (
                  <motion.div
                    key="speaking"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="flex flex-col items-center gap-1 text-white"
                  >
                    <Square size={26} className="fill-white animate-pulse" />
                    <span className="text-[8px] uppercase tracking-widest font-extrabold text-indigo-300">Stop</span>
                  </motion.div>
                ) : voiceState === 'thinking' ? (
                  <motion.div
                    key="thinking"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="flex flex-col items-center gap-1 text-indigo-400"
                  >
                    <Cpu size={26} className="animate-spin" />
                    <span className="text-[8px] uppercase tracking-widest font-extrabold text-indigo-300">Syncing</span>
                  </motion.div>
                ) : voiceState === 'listening' ? (
                  <motion.div
                    key="listening"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="flex flex-col items-center gap-1 text-cyan-400"
                  >
                    <Mic size={26} className="animate-bounce" />
                    <span className="text-[8px] uppercase tracking-widest font-extrabold text-cyan-300">Live</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="flex flex-col items-center gap-1"
                    style={{ color: enabled ? 'var(--brand-primary)' : 'var(--text-muted)' }}
                  >
                    {enabled ? (
                      <>
                        <Mic size={26} className="animate-pulse" />
                        <span className="text-[8px] uppercase tracking-widest font-extrabold text-indigo-400">Jarvis Ready</span>
                      </>
                    ) : (
                      <>
                        <MicOff size={26} />
                        <span className="text-[8px] uppercase tracking-widest font-extrabold text-text-muted">Link Offline</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Reactor Text Description */}
          <div className="text-center mt-6 max-w-sm">
            <motion.h2 
              animate={{ color: details.color }} 
              className="text-base font-extrabold tracking-widest mb-1.5 transition-colors duration-300"
            >
              {details.title}
            </motion.h2>
            <p className="text-xs text-text-secondary leading-relaxed h-10">
              {details.desc}
            </p>
          </div>

          {/* Error Panel if any */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl border border-red-500/20 bg-red-950/20 text-red-300 text-xs flex items-center gap-2 max-w-md"
            >
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Interface Buttons Controls */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={toggleVoiceMode}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
                enabled
                  ? 'bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20'
                  : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
              }`}
            >
              {enabled ? <MicOff size={13} /> : <Mic size={13} />}
              {enabled ? 'Disable Jarvis Mode' : 'Enable Jarvis Mode'}
            </button>

            {enabled && voiceState === 'listening' && (
              <button
                onClick={forceSubmit}
                className="px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Play size={13} /> Force Submit
              </button>
            )}

            {voiceState === 'speaking' && (
              <button
                onClick={interrupt}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Square size={13} /> Interrupt Playback
              </button>
            )}

            <button
              onClick={() => setShowTips(!showTips)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-text-muted hover:text-text-secondary text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <HelpCircle size={13} /> Wake Word Tips
            </button>
          </div>
        </div>

        {/* Live Conversation Transcript Feed */}
        <div className="lg:col-span-5 flex flex-col h-[400px] lg:h-[480px] glass-card overflow-hidden">
          
          {/* Transcript Panel Title Header */}
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-text-secondary flex items-center gap-2">
              <Terminal size={14} className="text-brand-accent" />
              VOCAL SYNAPSE LOG
            </span>
            <span className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
              <Database size={10} className="text-emerald-400" /> Vector Synced
            </span>
          </div>

          {/* Log Message Bubbles */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="p-3.5 rounded-xl bg-white/5 text-text-muted mb-3">
                  <History size={20} />
                </div>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">
                  Vocal Transcripts
                </p>
                <p className="text-[11px] text-text-muted max-w-[200px] leading-relaxed">
                  Start Jarvis and issue a spoken query. The feed details will print here.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold mb-1">
                    {msg.role === 'user' ? 'USER SPEECH' : 'CEREBRO VOICE'}
                  </span>
                  <div 
                    className={`p-3.5 rounded-2xl max-w-[90%] text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-500/10 border border-indigo-500/25 text-indigo-100 rounded-tr-none'
                        : 'bg-white/5 border border-white/5 text-text-secondary rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {/* Interim Transcript (Real-time user speaking) */}
            {voiceState === 'listening' && transcript && (
              <div className="flex flex-col items-end animate-pulse">
                <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold mb-1 flex items-center gap-1">
                  Capturing Interim
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
                </span>
                <div className="p-3.5 rounded-2xl rounded-tr-none bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs leading-relaxed max-w-[90%] font-mono">
                  {transcript}
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse" />
                </div>
              </div>
            )}

            {/* Thinking interim status placeholder */}
            {voiceState === 'thinking' && (
              <div className="flex flex-col items-start">
                <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold mb-1">
                  CEREBRO THINKING
                </span>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-indigo-500/5 border border-indigo-500/10 text-text-muted text-xs flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="font-mono text-[10px] ml-1">Analyzing memory blocks...</span>
                </div>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>

      {/* Slide-up Tips Drawer */}
      <AnimatePresence>
        {showTips && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg mx-auto p-5 rounded-2xl glass-card border border-indigo-500/20 bg-[#0d0d1f]/95 shadow-2xl z-40"
          >
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold tracking-widest text-brand-primary uppercase flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-400" />
                Wake-Word Integration Guide
              </h3>
              <button 
                onClick={() => setShowTips(false)}
                className="text-[10px] text-text-muted hover:text-text-secondary font-bold uppercase transition-all"
              >
                Close
              </button>
            </div>
            
            <p className="text-[11px] text-text-secondary leading-relaxed mb-4">
              To trigger CEREBRO completely hands-free, enable Jarvis Mode above and say the wake word. For best results, speak key questions after a small pause:
            </p>

            <ul className="space-y-2 text-[10px] text-text-secondary font-mono">
              <li className="p-2 rounded bg-white/5 border border-white/5 flex items-start gap-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>Say: <strong className="text-text-primary">"Jarvis, tell me about my saved goals."</strong></span>
              </li>
              <li className="p-2 rounded bg-white/5 border border-white/5 flex items-start gap-2">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>Say: <strong className="text-text-primary">"Cerebro, what were my high-priority tasks?"</strong></span>
              </li>
              <li className="p-2 rounded bg-white/5 border border-white/5 flex items-start gap-2">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>Say: <strong className="text-text-primary">"Jarvis, add a new memory."</strong></span>
              </li>
            </ul>

            <div className="mt-4 p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/10 flex items-center gap-2">
              <AlertCircle size={14} className="text-indigo-400 shrink-0" />
              <span className="text-[9px] text-indigo-300 leading-normal">
                Continuous sessions automatically restart background listeners once assistant stops vocalizing!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info bar */}
      <div className="w-full max-w-5xl text-center text-[10px] text-text-muted font-medium z-20">
        CEREBRO vocal synthesizers function locally client-side via Web Speech & SpeechSynthesis API structures.
      </div>

    </div>
  )
}
