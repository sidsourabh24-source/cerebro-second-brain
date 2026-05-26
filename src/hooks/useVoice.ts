'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface UseVoiceOptions {
  conversationId?: string | null
  onConversationIdCreated?: (id: string) => void
  onMessageReceived?: (message: { role: 'user' | 'assistant'; content: string }) => void
}

export function useVoice({
  conversationId = null,
  onConversationIdCreated,
  onMessageReceived
}: UseVoiceOptions = {}) {
  const [enabled, setEnabled] = useState(true)
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const enabledRef = useRef(enabled)
  const voiceStateRef = useRef(voiceState)
  const messagesRef = useRef(messages)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const localConvIdRef = useRef<string | null>(conversationId)
  const silenceTimerRef = useRef<any>(null)

  // Keep refs synchronized to prevent stale closures
  useEffect(() => { enabledRef.current = enabled }, [enabled])
  useEffect(() => { voiceStateRef.current = voiceState }, [voiceState])
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { localConvIdRef.current = conversationId }, [conversationId])

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Helper to select the best neural/HD English voice
  const getBestVoice = (): SpeechSynthesisVoice | null => {
    if (!synthRef.current) return null
    const voices = synthRef.current.getVoices()
    
    // Prioritize natural sounding voices
    const searchTerms = ['google', 'natural', 'neural', 'microsoft', 'en-us', 'en-gb']
    for (const term of searchTerms) {
      const match = voices.find(v => 
        v.name.toLowerCase().includes(term) && v.lang.toLowerCase().startsWith('en')
      )
      if (match) return match
    }
    
    // Fallback to any English voice
    const enVoice = voices.find(v => v.lang.toLowerCase().startsWith('en'))
    return enVoice || voices[0] || null
  }

  // Speak function
  const speak = useCallback((text: string, callback?: () => void) => {
    if (!synthRef.current) return

    // Cancel any active speech
    synthRef.current.cancel()

    // Strip markdown tags from speech text to make it sound natural
    const cleanText = text
      .replace(/[\*\#\_]/g, '') // remove formatting symbols
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // replace markdown links with text
      .replace(/`([^`]+)`/g, '$1') // remove code blocks
      .trim()

    if (!cleanText) {
      if (callback) callback()
      return
    }

    setVoiceState('speaking')
    
    // Stop recognition while speaking so Jarvis doesn't hear itself
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.warn('Recognition stop error:', e)
      }
    }

    const utterance = new SpeechSynthesisUtterance(cleanText)
    activeUtteranceRef.current = utterance
    
    const bestVoice = getBestVoice()
    if (bestVoice) utterance.voice = bestVoice
    
    utterance.rate = 1.05 // slightly faster for responsiveness
    utterance.pitch = 1.0

    utterance.onend = () => {
      activeUtteranceRef.current = null
      setVoiceState('idle')
      if (callback) callback()
      
      // Resume listening if still enabled
      if (enabledRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          console.warn('Failed to restart recognition:', e)
        }
      }
    }

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis utterance error:', e)
      activeUtteranceRef.current = null
      setVoiceState('idle')
      if (callback) callback()
      
      // Resume listening if still enabled
      if (enabledRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (err) {
          console.warn('Failed to restart recognition on error:', err)
        }
      }
    }

    synthRef.current.speak(utterance)
  }, [])

  // Interrupt Speech
  const interrupt = useCallback(() => {
    if (synthRef.current && voiceStateRef.current === 'speaking') {
      synthRef.current.cancel()
      setVoiceState('idle')
      if (enabledRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          console.warn('Failed to restart recognition on interrupt:', e)
        }
      }
    }
  }, [])

  // Send Query to CEREBRO API
  const sendQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim()) return

    setVoiceState('thinking')
    
    // Add user message to history
    const userMsg: Message = { role: 'user', content: queryText }
    const updatedMessages = [...messagesRef.current, userMsg]
    setMessages(updatedMessages)
    if (onMessageReceived) onMessageReceived(userMsg)

    let currentConvId = localConvIdRef.current

    try {
      // 1. If it's a new chat, auto-create conversation first
      if (!currentConvId) {
        const createRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstMessage: queryText })
        })
        const createData = await createRes.json()
        if (createRes.ok && createData.conversation) {
          currentConvId = createData.conversation.id
          if (onConversationIdCreated) {
            onConversationIdCreated(currentConvId)
          }
        } else {
          throw new Error('Failed to create conversation')
        }
      }

      // 2. Format chat history for Gemini API
      const apiMessages = [
        ...updatedMessages.map(msg => ({
          role: msg.role === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: msg.content }]
        }))
      ]

      // 3. Send to Streaming API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          conversationId: currentConvId
        })
      })

      if (!response.ok || !response.body) {
        throw new Error('Chat streaming failed')
      }

      // 4. Read response stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantText += chunk
      }

      // 5. Finalize message and speak response
      const assistantMsg: Message = { role: 'assistant', content: assistantText }
      setMessages(prev => [...prev, assistantMsg])
      if (onMessageReceived) onMessageReceived(assistantMsg)

      // Speak out the final text
      speak(assistantText)

    } catch (err: any) {
      console.error('Error in sendQuery:', err)
      const errorMsg: Message = { role: 'assistant', content: 'CEREBRO experienced a sync failure. Please check connection.' }
      setMessages(prev => [...prev, errorMsg])
      if (onMessageReceived) onMessageReceived(errorMsg)
      speak(errorMsg.content)
    }
  }, [onConversationIdCreated, onMessageReceived, speak])

  // Initialize and manage SpeechRecognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('[useVoice] Initializing SpeechRecognition...')
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('[useVoice] Web Speech API is NOT supported in this browser!')
      setError('Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.')
      return
    }

    let rec: any
    try {
      rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'
      console.log('[useVoice] SpeechRecognition instance created successfully.')
    } catch (e: any) {
      console.error('[useVoice] Failed to create SpeechRecognition instance:', e)
      setError(`Failed to initialize speech recognition: ${e.message || String(e)}`)
      return
    }

    rec.onstart = () => {
      console.log('[useVoice] SpeechRecognition started (onstart triggered).')
      setError(null)
      if (voiceStateRef.current !== 'thinking' && voiceStateRef.current !== 'speaking') {
        setVoiceState('idle') // Idle state means listening for wake-word
      }
    }

    rec.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }

      const activeTranscript = (finalTranscript || interimTranscript).trim()
      setTranscript(activeTranscript)

      // If we are currently in 'idle' mode, wait for wake word
      if (voiceStateRef.current === 'idle') {
        const lowerTranscript = activeTranscript.toLowerCase()
        const wakeWordMatch = lowerTranscript.match(/(jarvis|cerebro)\b(.*)/i)
        
        if (wakeWordMatch) {
          // Soft state transition to listening
          setVoiceState('listening')
          
          // Clear any transcript before the wake word, extract the phrase after it
          const queryPhrase = wakeWordMatch[2]?.trim() || ''
          setActiveQuery(queryPhrase)
          setTranscript(queryPhrase)
        }
      } else if (voiceStateRef.current === 'listening') {
        // We are already capturing the query
        setActiveQuery(activeTranscript)

        // Clear existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
        }

        // Set silence timer to auto-submit after 1.5 seconds of complete silence
        silenceTimerRef.current = setTimeout(() => {
          console.log('[useVoice] Silence detected. Auto-submitting query:', activeTranscript)
          if (voiceStateRef.current === 'listening' && activeTranscript.trim()) {
            const queryToSubmit = activeTranscript
            setActiveQuery('')
            setTranscript('')
            
            // Stop speech recognition so it doesn't hear itself or get confused
            try {
              rec.stop()
            } catch (e) {}

            sendQuery(queryToSubmit)
          }
        }, 1500)
      }
    }

    // Handle Speech End / Timeout auto-capture inside the recognition system
    rec.onend = () => {
      // If voiceState was 'listening' when we ended, it means the user stopped speaking and we got a query!
      if (voiceStateRef.current === 'listening' && activeQuery.trim()) {
        const queryToSubmit = activeQuery
        setActiveQuery('')
        setTranscript('')
        sendQuery(queryToSubmit)
      } else {
        // Otherwise, restart recognition if we are still enabled and not in thinking/speaking state
        if (enabledRef.current && voiceStateRef.current !== 'thinking' && voiceStateRef.current !== 'speaking') {
          setTimeout(() => {
            if (enabledRef.current && voiceStateRef.current !== 'thinking' && voiceStateRef.current !== 'speaking') {
              try {
                rec.start()
              } catch (e) {
                // Ignore start crashes if it was already running
              }
            }
          }, 400)
        }
      }
    }

    rec.onerror = (event: any) => {
      console.error('[useVoice] SpeechRecognition error event triggered:', event.error)
      if (event.error === 'not-allowed') {
        setError('Microphone access is blocked. Please enable it in browser settings.')
        setEnabled(false)
      }
    }

    recognitionRef.current = rec
    console.log('[useVoice] Assigned SpeechRecognition reference to recognitionRef.current.')

    // Auto-start on mount if enabled is true
    if (enabledRef.current) {
      try {
        console.log('[useVoice] Auto-starting SpeechRecognition on mount to request permissions...')
        rec.start()
      } catch (e) {
        console.warn('[useVoice] Failed to auto-start SpeechRecognition on mount:', e)
      }
    }

    return () => {
      console.log('[useVoice] SpeechRecognition useEffect cleanup triggered. Stopping recognition.')
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
    }
  }, [sendQuery])

  // Process manual trigger to send active query
  const forceSubmit = useCallback(() => {
    if (voiceState === 'listening' && activeQuery.trim()) {
      const queryToSubmit = activeQuery
      setActiveQuery('')
      setTranscript('')
      sendQuery(queryToSubmit)
    }
  }, [voiceState, activeQuery, sendQuery])

  // Control Voice Mode Activation
  useEffect(() => {
    console.log('[useVoice] Activation effect triggered. enabled:', enabled, 'recognitionRef.current exists:', !!recognitionRef.current)
    if (!recognitionRef.current) {
      console.warn('[useVoice] Activation effect returned early because recognitionRef.current is null!')
      return
    }

    if (enabled) {
      try {
        console.log('[useVoice] Attempting to start SpeechRecognition...')
        recognitionRef.current.start()
      } catch (e) {
        console.warn('[useVoice] Recognition start error caught:', e)
      }
    } else {
      console.log('[useVoice] Disabling Voice Mode: setting voiceState to idle and stopping recognition.')
      setVoiceState('idle')
      setTranscript('')
      setActiveQuery('')
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [enabled])

  const toggleVoiceMode = useCallback(() => {
    console.log('[useVoice] toggleVoiceMode clicked. Toggling enabled state from:', enabledRef.current)
    setEnabled(prev => {
      console.log('[useVoice] Setting enabled to:', !prev)
      return !prev
    })
  }, [])

  return {
    enabled,
    voiceState,
    transcript: voiceState === 'listening' ? activeQuery : transcript,
    messages,
    error,
    toggleVoiceMode,
    interrupt,
    forceSubmit,
    speak
  }
}
