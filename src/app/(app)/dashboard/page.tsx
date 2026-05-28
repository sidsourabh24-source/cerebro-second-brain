import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { generateResponse } from '@/lib/gemini'
import { 
  Brain, 
  CheckSquare, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  ArrowRight,
  Plus,
  Clock,
  User,
  Star
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const revalidate = 0 // Disable cache to get fresh metrics and briefings

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email || 'Commander'
  const username = email.split('@')[0]

  // Fetch metrics counts directly via Supabase count queries
  const { count: memoryCount } = await supabase
    .from('memories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id || '')

  const { count: pendingTaskCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id || '')
    .in('status', ['pending', 'in_progress'])

  const { count: chatCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id || '')

  // Fetch recent data sets
  const { data: recentTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user?.id || '')
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: recentMemories } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', user?.id || '')
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: recentChats } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user?.id || '')
    .order('updated_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8 relative z-10">
      {/* Top Welcome Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
            SYSTEM ONLINE
          </span>
          <h1 className="text-3xl font-bold tracking-wide mt-0.5 text-text-primary">
            Welcome back, <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-brand)' }}>{username}</span>
          </h1>
        </div>
        
        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2 rounded-xl self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-text-secondary">Neural Link Synced</span>
        </div>
      </header>

      {/* Dynamic AI Briefing Section (using Suspense) */}
      <Suspense fallback={<BriefingSkeleton />}>
        <AiDailyBriefing userId={user?.id || ''} username={username} />
      </Suspense>

      {/* Grid of Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            title: 'Semantic Memories',
            count: memoryCount || 0,
            desc: 'facts indexed in vault',
            href: '/memory',
            icon: <Brain size={20} className="text-indigo-400" />,
            glow: 'rgba(99, 102, 241, 0.15)'
          },
          {
            title: 'Active Chores',
            count: pendingTaskCount || 0,
            desc: 'tasks pending action',
            href: '/tasks',
            icon: <CheckSquare size={20} className="text-cyan-400" />,
            glow: 'rgba(6, 182, 212, 0.15)'
          },
          {
            title: 'Chats Recorded',
            count: chatCount || 0,
            desc: 'historical sync sessions',
            href: '/chat',
            icon: <MessageSquare size={20} className="text-violet-400" />,
            glow: 'rgba(139, 92, 246, 0.15)'
          }
        ].map((card, i) => (
          <Link 
            key={i} 
            href={card.href}
            className="glass-card p-6 flex items-center justify-between group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-radial-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(circle, ${card.glow} 0%, transparent 70%)` }}
            />
            <div className="space-y-1 relative z-10">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                {card.title}
              </p>
              <h3 className="text-3xl font-black text-text-primary mt-1">
                {card.count}
              </h3>
              <p className="text-[10px] text-text-secondary">
                {card.desc}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors relative z-10">
              {card.icon}
            </div>
          </Link>
        ))}
      </section>

      {/* Grid of Columns: Tasks, Memories, Chats */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: Active Chores */}
        <div className="glass-card p-5 flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 text-text-primary">
                <CheckSquare size={16} className="text-cyan-400" />
                Active Focus
              </h3>
              <Link href="/tasks" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-3">
              {!recentTasks || recentTasks.length === 0 ? (
                <p className="text-xs text-text-muted py-8 text-center">Your synaptic backlog is completely clear.</p>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                    <span className={`w-1.5 h-7 rounded shrink-0 mt-0.5 ${
                      task.priority === 'urgent'
                        ? 'bg-rose-500'
                        : task.priority === 'high'
                          ? 'bg-orange-500'
                          : task.priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-text-primary truncate">{task.title}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                        <Clock size={9} />
                        {task.due_date ? formatDate(task.due_date) : 'No due date'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Quick Action button */}
          <Link href="/tasks" className="mt-4 w-full py-2.5 rounded-xl bg-white/5 text-center text-xs font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 text-text-secondary">
            <Plus size={14} /> Schedule Chore
          </Link>
        </div>

        {/* COLUMN 2: Recent Memories */}
        <div className="glass-card p-5 flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 text-text-primary">
                <Brain size={16} className="text-indigo-400" />
                Latest Vault Syncs
              </h3>
              <Link href="/memory" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                Vault <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-3">
              {!recentMemories || recentMemories.length === 0 ? (
                <p className="text-xs text-text-muted py-8 text-center">CEREBRO vector index is currently blank.</p>
              ) : (
                recentMemories.map((mem) => (
                  <div key={mem.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between gap-2.5">
                    <p className="text-xs font-medium text-text-primary leading-relaxed line-clamp-2">{mem.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[8px] font-bold px-1.5 py-0.25 rounded-full uppercase tracking-wider ${
                        mem.source === 'auto-extract' ? 'text-cyan-400 bg-cyan-400/10' : 'text-violet-400 bg-violet-400/10'
                      }`}>
                        {mem.source === 'auto-extract' ? 'AI Auto' : 'Manual'}
                      </span>
                      <div className="flex items-center gap-0.5 text-[9px] text-amber-400">
                        <Star size={8} fill="currentColor" />
                        <span>{mem.importance}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <Link href="/memory" className="mt-4 w-full py-2.5 rounded-xl bg-white/5 text-center text-xs font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 text-text-secondary">
            <Brain size={14} /> Synchronize Fact
          </Link>
        </div>

        {/* COLUMN 3: Recent Chats */}
        <div className="glass-card p-5 flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 text-text-primary">
                <MessageSquare size={16} className="text-violet-400" />
                Recent Synchronies
              </h3>
              <Link href="/chat" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
                Chat <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-3">
              {!recentChats || recentChats.length === 0 ? (
                <p className="text-xs text-text-muted py-8 text-center">No synaptic link traces recorded.</p>
              ) : (
                recentChats.map((chat) => (
                  <Link 
                    href="/chat"
                    key={chat.id} 
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-text-primary truncate">{chat.title}</h4>
                      <p className="text-[9px] text-text-muted mt-0.5">
                        Updated {formatDate(chat.updated_at)}
                      </p>
                    </div>
                    <ArrowRight size={12} className="text-text-muted" />
                  </Link>
                ))
              )}
            </div>
          </div>
          
          <Link href="/chat" className="mt-4 w-full py-2.5 rounded-xl bg-white/5 text-center text-xs font-bold hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 text-text-secondary">
            <Sparkles size={14} /> Open Neural Link
          </Link>
        </div>
      </section>
    </div>
  )
}

/* ============================================================
   AI DAILY BRIEFING SERVER COMPONENT
   ============================================================ */
async function AiDailyBriefing({ userId, username }: { userId: string, username: string }) {
  const supabase = await createClient()

  // 1. Gather context: get latest memories and pending tasks
  const { data: memories } = await supabase
    .from('memories')
    .select('content')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: tasks } = await supabase
    .from('tasks')
    .select('title, due_date, priority')
    .eq('user_id', userId)
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(5)

  let briefingText = ''

  try {
    const memoriesText = memories && memories.length > 0
      ? memories.map((m, i) => `${i+1}. ${m.content}`).join('\n')
      : 'No background memories stored yet.'

    const tasksText = tasks && tasks.length > 0
      ? tasks.map((t, i) => `${i+1}. ${t.title} (Priority: ${t.priority}, Due: ${t.due_date ? formatDate(t.due_date) : 'none'})`).join('\n')
      : 'No active tasks.'

    const prompt = `
You are CEREBRO, a futuristic, intelligent AI second brain for user "${username}".
We have collected some facts about the user and their active tasks. Write a concise, futuristic, highly personalized daily briefing.
Keep it strictly under 3 sentences. Be extremely welcoming, direct, and encouraging. Incorporate details from their memories naturally if available.
If no memories or tasks exist, write a welcoming message introducing yourself as their AI second brain and instructing them to establish a neural link by chatting or scheduling tasks.

Facts/Memories about user:
${memoriesText}

Active tasks:
${tasksText}

Reference timestamp: "${new Date().toString()}"

Format your output in a sleek way, e.g.:
"Welcome back, Commander. I see you are working on [project] today. Let's tackle [task] by [date]. I've synced your preferences to optimize your neural link."
`
    briefingText = await generateResponse(prompt)
  } catch (err) {
    console.error('Failed to generate AI Daily Briefing:', err)
    briefingText = `Welcome back, ${username}. CEREBRO cognitive briefing is offline. All vector memories and task synapses remain secure and fully operational.`
  }

  return (
    <div className="glass-card p-6 border relative overflow-hidden"
      style={{
        borderColor: 'var(--border-default)',
        boxShadow: '0 0 20px rgba(99, 102, 241, 0.08)'
      }}
    >
      {/* Visual pulse border glow */}
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: 'var(--gradient-brand)' }} />
      
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <Sparkles size={16} className="text-indigo-400 animate-pulse" />
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
          CEREBRO Cognitive Daily Briefing
        </h3>
      </div>

      <p className="text-sm md:text-base font-medium leading-relaxed max-w-4xl select-text relative z-10 text-text-primary">
        {briefingText}
      </p>
    </div>
  )
}

/* ============================================================
   SKELETON LOADER FOR BRIEFING
   ============================================================ */
function BriefingSkeleton() {
  return (
    <div className="glass-card p-6 border relative overflow-hidden animate-pulse"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/30" />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-4 rounded-full bg-white/5" />
        <div className="h-3 bg-white/5 w-40 rounded" />
      </div>
      <div className="space-y-2.5">
        <div className="h-4 bg-white/5 w-full rounded" />
        <div className="h-4 bg-white/5 w-5/6 rounded" />
        <div className="h-4 bg-white/5 w-2/3 rounded" />
      </div>
    </div>
  )
}
