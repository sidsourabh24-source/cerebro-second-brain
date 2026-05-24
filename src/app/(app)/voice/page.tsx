import Link from 'next/link'
import { Mic, ArrowLeft, Sparkles } from 'lucide-react'

export default function VoicePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base">
      <div className="glass-card p-10 text-center max-w-md w-full relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-radial-gradient rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)' }}
        />

        {/* Pulsing Voice Avatar Indicator */}
        <div className="relative inline-flex mb-6">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-indigo-400/20 opacity-75" />
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-indigo-400">
            <Mic size={30} />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3 tracking-wide text-text-primary flex items-center justify-center gap-2">
          JARVIS VOCAL LINK
          <span className="text-[9px] bg-indigo-400/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold flex items-center gap-0.5">
            <Sparkles size={8} /> Day 5
          </span>
        </h1>
        
        <p className="text-sm mb-8 leading-relaxed text-text-secondary">
          Talk directly to CEREBRO with continuous wake words, automated Speech-to-Text pipelines, and responsive neural feedback synthesis coming soon.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold text-text-secondary"
        >
          <ArrowLeft size={14} /> Back to Command
        </Link>
      </div>
    </div>
  )
}
