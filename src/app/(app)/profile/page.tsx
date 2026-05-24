import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { User, ArrowLeft, Shield, Calendar, Mail, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8 relative z-10">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border text-text-primary"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <User size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-text-primary">
            NEURAL USER SYNC
          </h1>
          <p className="text-xs text-text-secondary">
            Manage your cognitive user session credentials and synchrony telemetry
          </p>
        </div>
      </header>

      {/* Main Profile Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 border-2 border-indigo-500/30 text-indigo-400 bg-indigo-500/5">
            <User size={40} />
          </div>
          <h3 className="text-lg font-bold text-text-primary">
            {user?.email?.split('@')[0]}
          </h3>
          <p className="text-xs text-brand-accent mt-1">
            System Overseer
          </p>
          
          <div className="mt-6 pt-6 border-t border-white/5 w-full space-y-3.5 text-left text-xs">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="flex items-center gap-1.5"><Mail size={12} /> Email</span>
              <span className="font-bold text-text-primary truncate max-w-[150px]">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between text-text-secondary">
              <span className="flex items-center gap-1.5"><Calendar size={12} /> Joined</span>
              <span className="font-bold text-text-primary">
                {user?.created_at ? formatDate(user.created_at) : 'Today'}
              </span>
            </div>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="glass-card p-6 md:col-span-2 space-y-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-text-primary flex items-center gap-2">
            <Shield size={16} className="text-indigo-400" />
            Neural Synchronization Parameters
          </h3>

          <div className="space-y-4">
            {[
              { title: 'Semantic Memory Auto-Extraction', desc: 'Allows Gemini to automatically extract relevant facts about you from chat streams.' },
              { title: 'Vector Similarity Fallback', desc: 'Automatically queries similar historical inputs using cosine similarity indexes.' },
              { title: 'Continuous Task Synthesizer', desc: 'Utilizes neural natural language processing algorithms to index chore schedules.' }
            ].map((setting, i) => (
              <div key={i} className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-text-primary">{setting.title}</h4>
                  <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">{setting.desc}</p>
                </div>
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Check size={12} />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-brand text-xs font-bold transition-all"
              style={{ width: 'auto' }}
            >
              <ArrowLeft size={12} /> Return to Command
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
