'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckSquare, 
  List, 
  Columns, 
  Plus, 
  Sparkles, 
  Trash2, 
  Calendar, 
  AlertCircle,
  Play,
  Check,
  X,
  Tag,
  ArrowRight
} from 'lucide-react'
import { formatDate, PRIORITY_COLORS, STATUS_COLORS } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  ai_generated: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all')

  // Form states
  const [manualFormOpen, setManualFormOpen] = useState(false)
  const [manualTitle, setManualTitle] = useState('')
  const [manualDesc, setManualDesc] = useState('')
  const [manualPriority, setManualPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [manualDueDate, setManualDueDate] = useState('')
  const [manualTags, setManualTags] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // AI input states
  const [aiInput, setAiInput] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      if (data.tasks) {
        setTasks(data.tasks)
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create Task manually or via AI attributes
  const handleCreateTask = async (taskData: {
    title: string
    description?: string | null
    priority: 'low' | 'medium' | 'high' | 'urgent'
    due_date?: string | null
    tags?: string[]
    ai_generated?: boolean
  }) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      const data = await res.json()
      if (res.ok && data.task) {
        setTasks(prev => [data.task, ...prev])
        return true
      }
    } catch (err) {
      console.error('Failed to create task:', err)
    }
    return false
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualTitle.trim()) return

    setFormLoading(true)
    const success = await handleCreateTask({
      title: manualTitle.trim(),
      description: manualDesc.trim() || null,
      priority: manualPriority,
      due_date: manualDueDate ? new Date(manualDueDate).toISOString() : null,
      tags: manualTags ? manualTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [],
      ai_generated: false
    })

    if (success) {
      setManualTitle('')
      setManualDesc('')
      setManualPriority('medium')
      setManualDueDate('')
      setManualTags('')
      setManualFormOpen(false)
    }
    setFormLoading(false)
  }

  // AI Task Generation (NLP parser)
  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiInput.trim() || aiGenerating) return

    setAiGenerating(true)
    setAiError('')
    try {
      const res = await fetch('/api/tasks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiInput.trim() })
      })
      const data = await res.json()
      
      if (res.ok && data.task) {
        // Auto save task
        const success = await handleCreateTask({
          title: data.task.title,
          description: data.task.description,
          priority: data.task.priority,
          due_date: data.task.due_date,
          tags: data.task.tags,
          ai_generated: true
        })

        if (success) {
          setAiInput('')
        } else {
          setAiError('Failed to save parsed AI task.')
        }
      } else {
        setAiError(data.error || 'Failed to parse task context.')
      }
    } catch (err) {
      setAiError('Link failure. Check your configuration.')
    } finally {
      setAiGenerating(false)
    }
  }

  // Update Task Status
  const handleUpdateStatus = async (id: string, newStatus: Task['status']) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      const data = await res.json()
      if (res.ok && data.task) {
        setTasks(prev => prev.map(t => t.id === id ? data.task : t))
      }
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    if (!confirm('Permanently delete this task?')) return

    try {
      // In Supabase SQL script or routing, DELETE isn't natively exposed for tasks.
      // But we can patch the status to 'cancelled' or perform a direct DELETE.
      // Let's perform a DELETE via PATCH or check if we need status update. 
      // Wait, let's delete using standard Supabase query if route.ts supports it. 
      // Let's check: does tasks route.ts support DELETE?
      // No, tasks/route.ts only has GET, POST, PATCH!
      // So instead of a DELETE method, we can just update the status to 'cancelled' using PATCH!
      // This is a great fallback that works with the existing backend perfectly without requiring another route edits!
      // Wait! Let's update status to 'cancelled' directly, or we can add a delete method to route.ts later.
      // Let's update status to 'cancelled' or set it as completed, but wait, the prompt had:
      // status IN ('pending', 'in_progress', 'completed', 'cancelled')
      // If we mark it cancelled, it is effectively soft deleted.
      // Let's use status update to 'cancelled' as the quick delete mechanism, or let's double check if we can add a DELETE method to `src/app/api/tasks/route.ts`.
      // Let's see: we can easily add a DELETE method to tasks API! But let's just allow users to delete task or mark status to cancelled.
      // Wait! In order to provide a truly premium experience, let's add the DELETE method to `src/app/api/tasks/route.ts` as well! It only takes 30 seconds and is extremely robust.
      // Let's do that! First let's check `src/app/api/tasks/route.ts` to see where we can add it.
      // Wait, we can edit it later, let's just make `TasksPage` perform a deletion if possible, or if it errors, fallback to patching status to `cancelled`.
      // Wait! Let's edit `src/app/api/tasks/route.ts` first, so our DELETE works perfectly! It's so clean.
    } catch (e) {
      console.error(e)
    }
  }

  // Deletion logic that uses a DELETE API route
  const handleTaskDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id))
      } else {
        // Fallback: mark cancelled
        handleUpdateStatus(id, 'cancelled')
      }
    } catch (err) {
      handleUpdateStatus(id, 'cancelled')
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    return priorityFilter === 'all' || t.priority === priorityFilter
  })

  // Group tasks for Kanban
  const getTasksByStatus = (status: Task['status']) => {
    return filteredTasks.filter(t => t.status === status)
  }

  // Check if task is overdue
  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return false
    return new Date(task.due_date).getTime() < Date.now()
  }

  // Status Action Buttons
  const renderStatusActions = (task: Task) => {
    return (
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {task.status !== 'in_progress' && task.status !== 'completed' && (
          <button
            onClick={() => handleUpdateStatus(task.id, 'in_progress')}
            className="p-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
            title="Start task"
          >
            <Play size={11} fill="currentColor" />
          </button>
        )}
        {task.status !== 'completed' && (
          <button
            onClick={() => handleUpdateStatus(task.id, 'completed')}
            className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
            title="Complete task"
          >
            <Check size={11} />
          </button>
        )}
        {task.status !== 'pending' && task.status !== 'completed' && (
          <button
            onClick={() => handleUpdateStatus(task.id, 'pending')}
            className="p-1 rounded bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 transition-all"
            title="Reset to pending"
          >
            <X size={11} />
          </button>
        )}
      </div>
    )
  }

  // Render a single Task Card
  const renderTaskCard = (task: Task) => {
    const overdue = isOverdue(task)
    return (
      <motion.div
        layout
        key={task.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`glass-card p-4 flex flex-col justify-between group relative transition-all duration-200 border-l-4 ${
          overdue ? 'border-red-500/60 shadow-lg shadow-red-500/5' : ''
        }`}
        style={{
          borderLeftColor: overdue 
            ? 'rgba(239, 68, 68, 0.7)' 
            : task.priority === 'urgent'
              ? '#f43f5e'
              : task.priority === 'high'
                ? '#f97316'
                : task.priority === 'medium'
                  ? '#eab308'
                  : '#10b981'
        }}
      >
        <div>
          {/* Card Top: priority level & delete & actions */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
            <div className="flex items-center gap-2">
              {renderStatusActions(task)}
              <button
                onClick={() => handleTaskDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-red-400 hover:bg-white/5 transition-all"
                title="Delete task"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>

          {/* Title */}
          <h4 className={`text-sm font-bold leading-snug ${task.status === 'completed' ? 'line-through opacity-40' : 'text-text-primary'}`}>
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className={`text-xs mt-1 leading-relaxed ${task.status === 'completed' ? 'opacity-30' : 'text-text-secondary'}`}>
              {task.description}
            </p>
          )}
        </div>

        {/* Card Bottom: Date & AI tag & general tags */}
        <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
          {/* Due date or Overdue badge */}
          <div className="flex items-center gap-1 text-[10px]">
            <Calendar size={10} style={{ color: overdue ? '#ef4444' : 'var(--text-muted)' }} />
            {overdue ? (
              <span className="font-semibold text-red-400 flex items-center gap-0.5">
                <AlertCircle size={9} /> OVERDUE
              </span>
            ) : task.due_date ? (
              <span style={{ color: 'var(--text-secondary)' }}>{formatDate(task.due_date)}</span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>No date</span>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1">
            {task.ai_generated && (
              <span className="text-[8px] font-extrabold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5" title="Generated by CEREBRO AI">
                <Sparkles size={8} /> AI
              </span>
            )}
            {task.tags?.slice(0, 1).map((t, idx) => (
              <span key={idx} className="text-[9px] bg-white/5 text-text-muted px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Tag size={8} /> {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8 z-10 relative">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--gradient-brand)', boxShadow: '0 0 20px var(--brand-glow)' }}
          >
            <CheckSquare className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
              PRODUCTIVITY SYNAPSE
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Manage tasks manually or command CEREBRO AI to parse natural language schedules
            </p>
          </div>
        </div>

        {/* View Selection & Manual Form Button */}
        <div className="flex items-center gap-3">
          {/* Kanban / List Toggle */}
          <div className="bg-white/5 p-0.5 rounded-xl border flex" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('kanban')}
              className="p-2 rounded-lg transition-all"
              style={{
                background: viewMode === 'kanban' ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--brand-primary)' : 'var(--text-muted)'
              }}
              title="Kanban Board"
            >
              <Columns size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 rounded-lg transition-all"
              style={{
                background: viewMode === 'list' ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: viewMode === 'list' ? 'var(--brand-primary)' : 'var(--text-muted)'
              }}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={() => setManualFormOpen(!manualFormOpen)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl btn-brand text-sm font-semibold transition-all duration-200"
            style={{ width: 'auto' }}
          >
            <Plus size={16} />
            Create Task
          </button>
        </div>
      </header>

      {/* AI Task Generator Bar */}
      <form onSubmit={handleAiGenerate} className="glass-card p-5 relative overflow-hidden"
        style={{ boxShadow: '0 0 15px rgba(99, 102, 241, 0.05)' }}
      >
        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-radial-gradient rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)' }}
        />
        
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <Sparkles size={14} className="text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            CEREBRO NLP Task Scheduler
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <input
            type="text"
            required
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Type: 'remind me to draft research proposal by Friday morning as high priority'"
            className="cerebro-input flex-1"
          />
          <button
            type="submit"
            disabled={aiGenerating || !aiInput.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-brand text-xs font-bold transition-all duration-200 shrink-0 sm:w-auto"
            style={{ width: 'auto' }}
          >
            {aiGenerating ? 'Syncing...' : (
              <>
                Schedule with AI
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        {aiError && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1 relative z-10">
            <AlertCircle size={12} /> {aiError}
          </p>
        )}
      </form>

      {/* Manual Task Drawer Form */}
      <AnimatePresence>
        {manualFormOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleManualSubmit} className="glass-card p-6 space-y-4 max-w-2xl">
              <h3 className="text-sm font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                CREATE MANUAL TASK
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Task title</label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Redesign dashboard view"
                    className="cerebro-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Priority weight</label>
                  <select
                    value={manualPriority}
                    onChange={(e) => setManualPriority(e.target.value as any)}
                    className="cerebro-input"
                  >
                    <option value="low" className="bg-surface">Low Priority</option>
                    <option value="medium" className="bg-surface">Medium Priority</option>
                    <option value="high" className="bg-surface">High Priority</option>
                    <option value="urgent" className="bg-surface">Urgent Priority</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Detailed description</label>
                <textarea
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  placeholder="Additional context about this task..."
                  rows={2}
                  className="cerebro-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Due date</label>
                  <input
                    type="datetime-local"
                    value={manualDueDate}
                    onChange={(e) => setManualDueDate(e.target.value)}
                    className="cerebro-input text-text-secondary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={manualTags}
                    onChange={(e) => setManualTags(e.target.value)}
                    placeholder="e.g. work, design, code"
                    className="cerebro-input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/5 transition"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !manualTitle.trim()}
                  className="px-5 py-2.5 rounded-xl btn-brand text-xs font-semibold transition"
                  style={{ width: 'auto' }}
                >
                  {formLoading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control filters bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-surface/30 p-4 rounded-2xl border gap-4"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-glass)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Priority Filter:</span>
          <div className="flex items-center bg-white/5 rounded-xl p-0.5 border" style={{ borderColor: 'var(--border-subtle)' }}>
            {(['all', 'low', 'medium', 'high', 'urgent'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setPriorityFilter(filter)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: priorityFilter === filter ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: priorityFilter === filter ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {filteredTasks.length} tasks matching active synchronization settings
        </div>
      </div>

      {/* Grid view selection rendering */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card p-6 h-40 bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <CheckSquare size={48} className="mx-auto text-indigo-400/40 mb-4" />
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Your synaptic schedule is clear
          </h3>
          <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Add chores manually, or type a natural schedule command in the AI bar above!
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {[
            { key: 'pending' as const, title: 'Pending Chores', color: 'text-slate-400 bg-slate-400/10' },
            { key: 'in_progress' as const, title: 'In Synchronization', color: 'text-blue-400 bg-blue-400/10' },
            { key: 'completed' as const, title: 'Archived / Complete', color: 'text-emerald-400 bg-emerald-400/10' },
            { key: 'cancelled' as const, title: 'Cancelled', color: 'text-red-400 bg-red-400/10' },
          ].map((column) => {
            const columnTasks = getTasksByStatus(column.key)
            return (
              <div
                key={column.key}
                className="glass-card p-4 flex flex-col gap-3 min-h-[350px]"
                style={{ background: 'rgba(13,13,31,0.3)' }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-text-primary">
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: column.key === 'pending'
                          ? '#94a3b8'
                          : column.key === 'in_progress'
                            ? '#3b82f6'
                            : column.key === 'completed'
                              ? '#10b981'
                              : '#ef4444'
                      }}
                    />
                    {column.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${column.color}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Cards Feed */}
                <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[500px] pr-1">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-12 text-[10px] text-text-muted select-none border border-dashed border-white/5 rounded-xl">
                      Empty segment
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {columnTasks.map(renderTaskCard)}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="glass-card p-4 space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-xs" style={{ color: 'var(--text-muted)' }}>
              No tasks match this filter.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <motion.div
                    layout
                    key={task.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border hover:bg-white/5 transition-all gap-4"
                    style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-glass)' }}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Priority left line bar */}
                      <div className="w-1.5 h-10 rounded shrink-0"
                        style={{
                          background: task.priority === 'urgent'
                            ? '#f43f5e'
                            : task.priority === 'high'
                              ? '#f97316'
                              : task.priority === 'medium'
                                ? '#eab308'
                                : '#10b981'
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold truncate ${task.status === 'completed' ? 'line-through opacity-45' : 'text-text-primary'}`}>
                            {task.title}
                          </h4>
                          <span className={`text-[8px] font-bold px-1.5 py-0.25 rounded uppercase tracking-wider ${STATUS_COLORS[task.status]}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-text-secondary truncate mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      {/* Date & tags info */}
                      <div className="flex flex-col items-start sm:items-end text-[10px]">
                        <span style={{ color: isOverdue(task) ? '#ef4444' : 'var(--text-secondary)' }} className="font-medium">
                          {task.due_date ? formatDate(task.due_date) : 'No due date'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {task.ai_generated && (
                            <span className="text-[8px] font-extrabold text-indigo-400 bg-indigo-500/10 px-1 py-0.25 rounded uppercase tracking-wider flex items-center gap-0.5">
                              <Sparkles size={8} /> AI
                            </span>
                          )}
                          {task.tags?.map((t, idx) => (
                            <span key={idx} className="text-[8px] text-text-muted bg-white/5 px-1 py-0.25 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Deletion & status update actions */}
                      <div className="flex items-center gap-2 border-l border-white/5 pl-4">
                        {renderStatusActions(task)}
                        <button
                          onClick={() => handleTaskDelete(task.id)}
                          className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-white/5 transition-all"
                          title="Delete task"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
