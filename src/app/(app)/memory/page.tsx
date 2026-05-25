'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Search, 
  Plus, 
  Trash2, 
  Sparkles, 
  User, 
  Calendar,
  Star,
  Check,
  AlertCircle
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Memory {
  id: string
  content: string
  importance: number
  source: string
  created_at: string
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'auto-extract' | 'manual'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'importance'>('date')
  
  // Creation form state
  const [newContent, setNewContent] = useState('')
  const [newImportance, setNewImportance] = useState(3)
  const [creating, setCreating] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMemories()
  }, [])

  const fetchMemories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/memories')
      const data = await res.json()
      if (data.memories) {
        setMemories(data.memories)
      }
    } catch (err) {
      console.error('Failed to fetch memories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim()) return

    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newContent.trim(),
          importance: newImportance,
          source: 'manual'
        })
      })
      const data = await res.json()
      if (res.ok && data.memory) {
        setMemories(prev => [data.memory, ...prev])
        setNewContent('')
        setNewImportance(3)
        setFormOpen(false)
      } else {
        setError(data.error || 'Failed to sync memory.')
      }
    } catch (err) {
      setError('Connection failure. Try again.')
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('Forget this memory permanently? CEREBRO will no longer incorporate this fact.')) return

    try {
      const res = await fetch(`/api/memories?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setMemories(prev => prev.filter(m => m.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete memory:', err)
    }
  }

  // Filter & sort logic
  const filteredMemories = memories
    .filter((m) => {
      const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSource = sourceFilter === 'all' || m.source === sourceFilter
      return matchesSearch && matchesSource
    })
    .sort((a, b) => {
      if (sortBy === 'importance') {
        return b.importance - a.importance || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  // Statistics calculations
  const totalCount = memories.length
  const aiCount = memories.filter(m => m.source === 'auto-extract').length
  const manualCount = memories.filter(m => m.source === 'manual').length
  const avgImportance = totalCount 
    ? (memories.reduce((acc, m) => acc + m.importance, 0) / totalCount).toFixed(1) 
    : '0.0'

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8 z-10 relative">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--gradient-brand)', boxShadow: '0 0 20px var(--brand-glow)' }}
          >
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
              SEMANTIC MEMORY VAULT
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Browse and modify facts CEREBRO has committed to vector index
            </p>
          </div>
        </div>

        {/* Add Memory Button */}
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl btn-brand text-sm font-semibold transition-all duration-200"
          style={{ width: 'auto' }}
        >
          <Plus size={16} />
          Manual Fact Sync
        </button>
      </header>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Memories', value: totalCount, icon: <Brain size={18} className="text-indigo-400" /> },
          { label: 'AI Extracted', value: aiCount, icon: <Sparkles size={18} className="text-cyan-400" /> },
          { label: 'Manually Logged', value: manualCount, icon: <User size={18} className="text-violet-400" /> },
          { label: 'Avg Importance', value: `${avgImportance} ★`, icon: <Star size={18} className="text-amber-400" /> },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </p>
              <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* Manual Sync Form Drawer */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateMemory} className="glass-card p-6 space-y-4 max-w-xl">
              <h3 className="text-sm font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                SYNCHRONIZE FACT MANUALLY
              </h3>
              
              {error && (
                <div className="p-3 rounded-lg flex items-center gap-2 text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Fact content</label>
                <textarea
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g. I prefer working in dark mode and usually code late at night."
                  rows={2}
                  className="cerebro-input"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Importance Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>Importance weight</label>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewImportance(star)}
                        className="text-amber-400 transition-transform duration-100 hover:scale-125"
                      >
                        <Star
                          size={18}
                          fill={star <= newImportance ? 'currentColor' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/5 transition"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newContent.trim()}
                    className="px-5 py-2.5 rounded-xl btn-brand text-xs font-semibold transition"
                    style={{ width: 'auto' }}
                  >
                    {creating ? 'Syncing...' : 'Commit to Vector'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar (Search, Filters, Sort) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface/30 p-4 rounded-2xl border"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-glass)' }}
      >
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search core memories..."
            className="cerebro-input pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Source filter */}
          <div className="flex items-center bg-white/5 rounded-xl p-0.5 border" style={{ borderColor: 'var(--border-subtle)' }}>
            {(['all', 'auto-extract', 'manual'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSourceFilter(filter)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: sourceFilter === filter ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: sourceFilter === filter ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {filter === 'all' ? 'All' : filter === 'auto-extract' ? 'AI Auto' : 'Manual'}
              </button>
            ))}
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'importance')}
              className="bg-white/5 border text-xs px-2.5 py-1.5 rounded-xl text-text-primary outline-none cursor-pointer"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <option value="date" className="bg-surface">Newest First</option>
              <option value="importance" className="bg-surface">Highest Importance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Memories */}
      {loading ? (
        /* Loading skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card p-6 h-36 animate-pulse space-y-3">
              <div className="h-4 bg-white/5 w-1/3 rounded" />
              <div className="h-10 bg-white/5 w-full rounded" />
              <div className="h-3 bg-white/5 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : filteredMemories.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 glass-card">
          <Brain size={48} className="mx-auto text-indigo-400/40 mb-4" />
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            No neural logs found
          </h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Start chatting with CEREBRO or manually insert a fact above to record long-term preferences.
          </p>
        </div>
      ) : (
        /* Card Grid */
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredMemories.map((memory) => (
              <motion.div
                layout
                key={memory.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="glass-card p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Background glow hover effect */}
                <div className="absolute inset-0 bg-radial-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 10% 10%, var(--brand-glow) 0%, transparent 60%)' }}
                />

                {/* Card Top: Source Tag & Delete button */}
                <div className="flex items-center justify-between gap-4 mb-3 relative z-10">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    memory.source === 'auto-extract' 
                      ? 'text-cyan-400 bg-cyan-400/10'
                      : 'text-violet-400 bg-violet-400/10'
                  }`}>
                    {memory.source === 'auto-extract' ? (
                      <>
                        <Sparkles size={9} />
                        AI Auto
                      </>
                    ) : (
                      <>
                        <User size={9} />
                        Manual
                      </>
                    )}
                  </span>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteMemory(memory.id)}
                    className="text-text-muted hover:text-red-400 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all duration-200"
                    title="Forget memory"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Memory content */}
                <p className="text-sm font-medium leading-relaxed mb-4 flex-1 select-text relative z-10" style={{ color: 'var(--text-primary)' }}>
                  {memory.content}
                </p>

                {/* Card Bottom: Stars & Date */}
                <div className="flex items-center justify-between border-t pt-3 mt-1 relative z-10"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= memory.importance ? 'text-amber-400' : 'text-slate-700'}
                        fill={star <= memory.importance ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={10} />
                    <span>{formatDate(memory.created_at)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
