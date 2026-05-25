'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Search, 
  MessageSquare, 
  X, 
  AlertCircle,
  Sparkles, 
  Clock, 
  Database,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Send,
  HelpCircle
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Document {
  id: string
  filename: string
  file_type: string
  file_size: number
  summary: string
  created_at: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Drag & drop upload states
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')

  // Q&A Side Drawer States
  const [activeDoc, setActiveDoc] = useState<Document | null>(null)
  const [drawerTab, setDrawerTab] = useState<'summary' | 'chat'>('summary')
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Global Vault Query States
  const [globalQuery, setGlobalQuery] = useState('')
  const [globalAnswer, setGlobalAnswer] = useState('')
  const [globalSearching, setGlobalSearching] = useState(false)
  const [globalCardOpen, setGlobalCardOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      if (data.documents) {
        setDocuments(data.documents)
      }
    } catch (err) {
      console.error('Failed to load documents:', err)
    } finally {
      setLoading(false)
    }
  }

  // Upload handler logic
  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setUploadError('Only PDF files are supported.')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadProgress(10)

    // Simulate progress upload loader
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 80) {
          clearInterval(progressInterval)
          return 80
        }
        return prev + 15
      })
    }, 400)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      })
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await res.json()

      if (res.ok && data.document) {
        setDocuments(prev => [data.document, ...prev])
        setUploadProgress(0)
        setUploading(false)
      } else {
        setUploadError(data.error || 'Cognitive ingestion failed.')
        setUploading(false)
      }
    } catch (err) {
      clearInterval(progressInterval)
      setUploadError('Network sync error. Try again.')
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleDeleteDocument = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    e.preventDefault()
    if (!confirm('Forget this PDF and delete all its semantic vector chunks permanently?')) return

    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setDocuments(prev => prev.filter(d => d.id !== id))
        if (activeDoc?.id === id) {
          setActiveDoc(null)
        }
      }
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  // Document Q&A Queries
  const handleSendDocQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !activeDoc || chatLoading) return

    const userText = chatInput.trim()
    setChatInput('')
    setChatLoading(true)

    setChatHistory(prev => [...prev, { role: 'user', content: userText }])

    try {
      const res = await fetch('/api/documents/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          documentId: activeDoc.id
        })
      })
      const data = await res.json()

      if (res.ok && data.answer) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.answer }])
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.error || 'Failed to extract answers.'}` }])
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: '⚠️ Neural synchrony failure. Connection lost.' }])
    } finally {
      setChatLoading(false)
    }
  }

  // Global Vault Query
  const handleGlobalQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!globalQuery.trim() || globalSearching) return

    setGlobalSearching(true)
    setGlobalCardOpen(true)
    setGlobalAnswer('')

    try {
      const res = await fetch('/api/documents/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: globalQuery.trim(), documentId: null })
      })
      const data = await res.json()
      if (res.ok && data.answer) {
        setGlobalAnswer(data.answer)
      } else {
        setGlobalAnswer(`⚠️ Error querying vault: ${data.error || 'Unknown'}`)
      }
    } catch (err) {
      setGlobalAnswer('⚠️ Synaptic connection error.')
    } finally {
      setGlobalSearching(false)
    }
  }

  const filteredDocs = documents.filter(d => 
    d.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8 z-10 relative">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
            style={{ boxShadow: '0 0 20px rgba(6,182,212,0.1)' }}
          >
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
              COGNITIVE DOCUMENT VAULT
            </h1>
            <p className="text-xs text-text-secondary">
              Upload PDF texts to chunk, vector-index, auto-summarize, and semantically chat
            </p>
          </div>
        </div>
      </header>

      {/* Global Synapse Query Card */}
      <form onSubmit={handleGlobalQuery} className="glass-card p-5 relative overflow-hidden"
        style={{ boxShadow: '0 0 15px rgba(6, 182, 212, 0.05)' }}
      >
        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-radial-gradient rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)' }}
        />
        
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <Sparkles size={14} className="text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            CEREBRO Global Vault Query
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <input
            type="text"
            required
            value={globalQuery}
            onChange={(e) => setGlobalQuery(e.target.value)}
            placeholder="Ask a question across all your uploaded documents at once..."
            className="cerebro-input flex-1"
          />
          <button
            type="submit"
            disabled={globalSearching || !globalQuery.trim() || documents.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-brand text-xs font-bold transition-all duration-200 shrink-0 sm:w-auto"
            style={{ width: 'auto', background: 'var(--gradient-brand)' }}
          >
            {globalSearching ? 'Searching...' : (
              <>
                Ask Vault
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Global Search Result Display */}
      <AnimatePresence>
        {globalCardOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 relative border" style={{ borderColor: 'var(--border-default)' }}>
              <button 
                onClick={() => { setGlobalCardOpen(false); setGlobalQuery(''); }}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-cyan-400 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                  Global Vault Response
                </h4>
              </div>

              {globalSearching ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-white/5 w-full rounded" />
                  <div className="h-4 bg-white/5 w-5/6 rounded" />
                  <div className="h-4 bg-white/5 w-2/3 rounded" />
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap select-text text-text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {globalAnswer}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ingestion & Document List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Ingestion Portal (Drag & Drop) */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-text-muted pb-2 border-b border-white/5">
            Ingestion Portal
          </h3>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`glass-card p-8 text-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] ${
              dragActive ? 'border-cyan-500 bg-cyan-500/5 scale-[1.01]' : 'border-white/10 hover:border-cyan-500/50 hover:bg-white/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {uploading ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-cyan-500/20 bg-cyan-500/5 animate-pulse text-cyan-400">
                  <UploadCloud size={28} />
                </div>
                <div className="w-full max-w-[150px] space-y-1.5">
                  <p className="text-xs font-bold text-text-primary">Parsing PDF text...</p>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full bg-cyan-400"
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-white/5 text-text-muted hover:text-cyan-400 transition-colors">
                  <UploadCloud size={24} />
                </div>
                <h4 className="text-sm font-bold text-text-primary">Drag & Drop PDF</h4>
                <p className="text-xs text-text-secondary mt-1 max-w-[180px] mx-auto">
                  Select or drop your PDF document here to vectorize
                </p>
                <span className="text-[10px] text-text-muted mt-4 bg-white/5 px-2 py-0.5 rounded">
                  Max size: 10MB
                </span>
              </>
            )}
          </div>

          {uploadError && (
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Document List Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* List Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center pb-2 border-b border-white/5 gap-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-text-muted">
              Document Vault Index ({filteredDocs.length})
            </h3>
            
            {/* Search filter */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file index..."
                className="cerebro-input pl-8 py-1.5 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="glass-card p-5 h-20 animate-pulse" />
              ))}
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <FileText size={40} className="mx-auto text-cyan-400/40 mb-3" />
              <h4 className="text-sm font-bold text-text-primary">No documents indexed</h4>
              <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
                Drop your first PDF in the Ingestion Portal to query it semantically.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {filteredDocs.map((doc) => {
                  const isActive = activeDoc?.id === doc.id
                  return (
                    <motion.div
                      layout
                      key={doc.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      onClick={() => {
                        setActiveDoc(doc)
                        setChatHistory([])
                        setDrawerTab('summary')
                      }}
                      className="glass-card p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/5 hover:scale-[1.01] transition-all border-l-4 group"
                      style={{
                        borderLeftColor: isActive ? 'var(--brand-accent)' : 'transparent',
                        background: isActive ? 'rgba(6,182,212,0.06)' : 'var(--bg-glass)'
                      }}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-400/10">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-text-primary truncate">{doc.filename}</h4>
                          <div className="flex items-center gap-3 text-[10px] text-text-secondary mt-1">
                            <span className="font-semibold text-text-muted">{formatFileSize(doc.file_size)}</span>
                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                            <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(doc.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3.5 border-t sm:border-t-0 pt-2 sm:pt-0 justify-between sm:justify-end shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveDoc(doc); setDrawerTab('chat'); setChatHistory([]); }}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 flex items-center gap-1.5 transition"
                        >
                          <MessageSquare size={13} />
                          Query
                        </button>
                        
                        <button
                          onClick={(e) => handleDeleteDocument(e, doc.id)}
                          className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Forget file"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Sliding Side-Drawer for Document Workspace */}
      <AnimatePresence>
        {activeDoc && (
          <>
            {/* Backdrop close mask overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDoc(null)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />

            {/* Sliding Workspace Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-screen w-full md:w-[480px] bg-surface border-l z-50 flex flex-col"
              style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(25px)',
                borderColor: 'var(--border-subtle)',
                boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Drawer Header */}
              <div className="p-5 border-b flex items-center justify-between shrink-0"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                    <BookOpen size={15} />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary truncate" title={activeDoc.filename}>
                    {activeDoc.filename}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDoc(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Tabs Navigation */}
              <div className="flex px-4 py-2 border-b shrink-0 bg-black/10 gap-2"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {[
                  { key: 'summary' as const, label: 'Executive Summary' },
                  { key: 'chat' as const, label: 'Vocal Synapse Q&A' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDrawerTab(tab.key)}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition"
                    style={{
                      background: drawerTab === tab.key ? 'var(--gradient-brand)' : 'transparent',
                      color: drawerTab === tab.key ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    {tab.key === 'chat' && <Sparkles size={11} className="inline mr-1" />}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Drawer Body content area */}
              <div className="flex-1 overflow-y-auto p-5 select-text">
                <AnimatePresence mode="wait">
                  {drawerTab === 'summary' ? (
                    /* TAB 1: EXECUTIVE SUMMARY */
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap text-text-primary space-y-4"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {activeDoc.summary}
                      </ReactMarkdown>
                    </motion.div>
                  ) : (
                    /* TAB 2: NEURAL SYNAPSE Q&A */
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex flex-col h-full space-y-4"
                    >
                      {chatHistory.length === 0 ? (
                        /* Empty state helper suggestions */
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
                          <HelpCircle size={32} className="text-cyan-400/40 mb-3" />
                          <h4 className="text-xs font-bold text-text-primary">Synaptic Session Initialized</h4>
                          <p className="text-[11px] text-text-secondary mt-1 max-w-[220px]">
                            Ask specific questions about the contents of this document. CEREBRO will query matching segments.
                          </p>
                        </div>
                      ) : (
                        /* Chat bubble thread list */
                        <div className="space-y-4">
                          {chatHistory.map((msg, i) => {
                            const isUser = msg.role === 'user'
                            return (
                              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <div
                                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap select-text ${
                                    isUser 
                                      ? 'rounded-tr-none text-white' 
                                      : 'rounded-tl-none border text-text-primary'
                                  }`}
                                  style={{
                                    background: isUser ? 'var(--gradient-brand)' : 'var(--bg-glass)',
                                    borderColor: isUser ? 'transparent' : 'var(--border-subtle)'
                                  }}
                                >
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {msg.content}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Chat loading typing indicator */}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="glass-card px-3.5 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      )}
                      
                      <div ref={chatEndRef} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Drawer footer chat input (only on Chat tab) */}
              {drawerTab === 'chat' && (
                <div className="p-4 shrink-0 border-t bg-black/15"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <form onSubmit={handleSendDocQuery} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Query this document content..."
                      className="cerebro-input py-2 text-xs flex-1 rounded-xl"
                      disabled={chatLoading}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      className="p-2.5 rounded-xl btn-brand text-white flex items-center justify-center shrink-0 transition disabled:opacity-40"
                      style={{ width: 'auto', background: 'var(--gradient-brand)' }}
                    >
                      <Send size={13} />
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
