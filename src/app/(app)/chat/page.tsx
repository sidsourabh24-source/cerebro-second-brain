'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Send, 
  Bot, 
  User, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  Menu, 
  X,
  Copy,
  Check
} from 'lucide-react'

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Fetch conversations on load
  useEffect(() => {
    fetchConversations()
  }, [])

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId)
    } else {
      setMessages([])
    }
  }, [activeConvId])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      if (data.conversations) {
        setConversations(data.conversations)
        // If there are conversations and no active one is set, select the latest
        if (data.conversations.length > 0 && !activeConvId) {
          setActiveConvId(data.conversations[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations?id=${convId}`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  const handleStartNewChat = () => {
    setActiveConvId(null)
    setMessages([])
    if (inputRef.current) inputRef.current.focus()
  }

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    e.preventDefault()
    if (!confirm('Are you sure you want to delete this conversation?')) return

    try {
      const res = await fetch(`/api/conversations?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setConversations(conversations.filter(c => c.id !== id))
        if (activeConvId === id) {
          setActiveConvId(conversations[0]?.id || null)
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err)
    }
  }

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || loading) return

    const userText = inputText.trim()
    setInputText('')
    setLoading(true)

    // Optimistically add user message
    const userMsg: Message = { role: 'user', content: userText }
    setMessages(prev => [...prev, userMsg])

    let convId = activeConvId

    try {
      // 1. If it's a new chat, auto-create conversation first
      if (!convId) {
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstMessage: userText })
        })
        const createData = await createRes.json()
        if (createRes.ok && createData.conversation) {
          convId = createData.conversation.id
          setActiveConvId(convId)
          setConversations(prev => [createData.conversation, ...prev])
        } else {
          throw new Error('Failed to create conversation')
        }
      }

      // 2. Format chat history for Gemini API
      // Format should match: { role: 'user' | 'model', parts: [{ text: string }] }
      const apiMessages = [
        ...messages.map(msg => ({
          role: msg.role === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: msg.content }]
        })),
        { role: 'user' as const, parts: [{ text: userText }] }
      ]

      // 3. Send to Streaming API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          conversationId: convId
        })
      })

      if (!response.ok || !response.body) {
        throw new Error('Chat streaming failed')
      }

      // 4. Read response stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      setStreamingMessage(' ') // Start streaming state with space

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantText += chunk
        setStreamingMessage(assistantText)
      }

      // 5. Finalize message
      const assistantMsg: Message = { role: 'assistant', content: assistantText }
      setMessages(prev => [...prev, assistantMsg])
      setStreamingMessage('')

      // Refresh conversations list to update title / sorting
      fetchConversations()

    } catch (err) {
      console.error('Error sending message:', err)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '⚠️ CEREBRO suffered a neural sync error. Please try again.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Handle textarea enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Mobile Toggle Panel Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden absolute top-4 left-4 z-50 p-2.5 rounded-xl glass-card text-text-primary"
        style={{ background: 'var(--bg-glass)' }}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Left Sidebar - Chat History */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="h-full shrink-0 flex flex-col border-r relative z-40 bg-surface md:bg-opacity-50"
            style={{
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-subtle)',
            }}
          >
            {/* New Chat Button */}
            <div className="p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <button
                onClick={handleStartNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl btn-brand text-sm font-semibold transition-all duration-200"
              >
                <Plus size={16} />
                New Synchrony
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.length === 0 ? (
                <div className="text-center py-8 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                  No historical syncs. Start talking below to create memory.
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = activeConvId === conv.id
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConvId(conv.id)
                        if (window.innerWidth < 768) setSidebarOpen(false)
                      }}
                      className="group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5 relative"
                      style={{
                        background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                        border: isActive ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare
                          size={15}
                          style={{ color: isActive ? 'var(--brand-accent)' : 'var(--text-muted)' }}
                        />
                        <span
                          className="text-sm font-medium truncate flex-1"
                          style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                        >
                          {conv.title}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 rounded transition-all duration-200"
                        style={{ color: 'var(--text-muted)' }}
                        title="Delete chat"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Screen */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-base relative">
        {/* Top Header */}
        <header
          className="h-16 shrink-0 flex items-center justify-between px-6 border-b z-20"
          style={{
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header Title */}
          <div className="flex items-center gap-3">
            {/* Sidebar toggle for desktop if closed */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden md:flex p-1.5 rounded-lg hover:bg-white/5 text-text-secondary transition-all"
              >
                <ChevronRight size={18} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
                  CEREBRO NEURAL LINK
                </h2>
                <p className="text-[10px]" style={{ color: 'var(--brand-accent)' }}>
                  Active memory retrieval enabled
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats/Indicators */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span style={{ color: 'var(--text-secondary)' }}>Gemini 1.5 Flash Sync</span>
            </div>
          </div>
        </header>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 z-10">
          {messages.length === 0 && !streamingMessage ? (
            /* Welcome / Empty Screen */
            <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto text-center px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: 'var(--gradient-brand)', boxShadow: '0 0 20px var(--brand-glow)' }}
              >
                <Sparkles size={30} className="text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold mb-3 tracking-wide" style={{ color: 'var(--text-primary)' }}>
                Establish Neural Link
              </h1>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                I am CEREBRO. I record key details from our talks into my vector memory so I remember you across threads. Ask me, note tasks, or query concepts.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {[
                  '“Remember that I am learning Rust for my new backend project.”',
                  '“What are my goals that I mentioned yesterday?”',
                  '“Plan a quick workout schedule for me.”',
                  '“Remind me to finish slides by tonight as high priority.”'
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(prompt.replace(/[“”]/g, ''))}
                    className="glass-card text-left p-3.5 text-xs transition-all duration-200 hover:border-indigo-500/50 hover:bg-white/5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active message bubbles */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user'
                const msgId = msg.id || `msg-${i}`
                return (
                  <motion.div
                    key={msgId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Bot Avatar on Left */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          background: 'rgba(99,102,241,0.1)',
                          borderColor: 'rgba(99,102,241,0.2)',
                          color: 'var(--brand-primary)'
                        }}
                      >
                        <Bot size={15} />
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div className="relative group max-w-[85%]">
                      <div
                        className={`p-4 rounded-2xl relative shadow-md transition-all ${
                          isUser
                            ? 'rounded-tr-none text-white'
                            : 'rounded-tl-none border text-text-primary'
                        }`}
                        style={{
                          background: isUser ? 'var(--gradient-brand)' : 'var(--bg-glass)',
                          borderColor: isUser ? 'transparent' : 'var(--border-subtle)',
                        }}
                      >
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyText(msg.content, msgId)}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
                          title="Copy content"
                        >
                          {copiedId === msgId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>

                        <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap select-text">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    {/* User Avatar on Right */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          background: 'rgba(6,182,212,0.1)',
                          borderColor: 'rgba(6,182,212,0.2)',
                          color: 'var(--brand-accent)'
                        }}
                      >
                        <User size={15} />
                      </div>
                    )}
                  </motion.div>
                )
              })}

              {/* Streaming AI Message */}
              {streamingMessage && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border animate-pulse"
                    style={{
                      background: 'rgba(99,102,241,0.1)',
                      borderColor: 'rgba(99,102,241,0.2)',
                      color: 'var(--brand-primary)'
                    }}
                  >
                    <Bot size={15} />
                  </div>
                  <div className="max-w-[85%]">
                    <div
                      className="p-4 rounded-2xl rounded-tl-none border text-text-primary shadow-md"
                      style={{
                        background: 'var(--bg-glass)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {streamingMessage}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {loading && !streamingMessage && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border animate-pulse"
                    style={{
                      background: 'rgba(99,102,241,0.1)',
                      borderColor: 'rgba(99,102,241,0.2)',
                      color: 'var(--brand-primary)'
                    }}
                  >
                    <Bot size={15} />
                  </div>
                  <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div
          className="p-4 shrink-0 z-20 border-t"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            background: 'linear-gradient(to top, var(--bg-base) 60%, transparent)',
          }}
        >
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative flex items-end gap-2.5">
            <div className="flex-1 relative glass-card" style={{ borderRadius: '14px' }}>
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Synchronize a memory or ask CEREBRO..."
                className="w-full pl-4 pr-12 py-3 bg-transparent border-0 text-sm outline-none resize-none max-h-36 min-h-[44px]"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                }}
              />
              <div className="absolute right-3 bottom-2.5 flex items-center gap-1.5">
                {/* Voice button (link placeholder) */}
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Enter ↵ to send
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-3.5 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'var(--gradient-brand)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: inputText.trim() ? '0 0 10px var(--brand-glow)' : 'none',
              }}
              title="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
