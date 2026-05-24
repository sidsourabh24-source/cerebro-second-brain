import Link from 'next/link'
import { FileText, ArrowLeft, Sparkles } from 'lucide-react'

export default function DocumentsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base">
      <div className="glass-card p-10 text-center max-w-md w-full relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-radial-gradient rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)' }}
        />

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-white/5 border border-white/10 text-cyan-400">
          <FileText size={32} />
        </div>

        <h1 className="text-2xl font-bold mb-3 tracking-wide text-text-primary flex items-center justify-center gap-2">
          DOCUMENT SYNC
          <span className="text-[9px] bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold flex items-center gap-0.5">
            <Sparkles size={8} /> Day 4
          </span>
        </h1>
        
        <p className="text-sm mb-8 leading-relaxed text-text-secondary">
          Upload and index PDF papers directly into CEREBRO's vector chunk storage. Establish cognitive Q&A synthesis soon.
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
