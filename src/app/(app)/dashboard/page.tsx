import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card p-10 text-center max-w-md w-full animate-fade-in">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C10.477 4 6 8.477 6 14c0 3.09 1.39 5.86 3.6 7.74L8 26l4.5-1.5A9.96 9.96 0 0016 25c5.523 0 10-4.477 10-10S21.523 4 16 4z" fill="white" fillOpacity="0.9"/>
            <circle cx="12" cy="14" r="1.5" fill="rgba(255,255,255,0.5)"/>
            <circle cx="16" cy="14" r="1.5" fill="white"/>
            <circle cx="20" cy="14" r="1.5" fill="rgba(255,255,255,0.5)"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Welcome back 🎉
        </h1>
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Logged in as</p>
        <p className="text-sm font-medium mb-6" style={{ color: 'var(--brand-accent)' }}>
          {user?.email}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Full Dashboard UI coming on Day 3 →
        </p>
      </div>
    </div>
  )
}
