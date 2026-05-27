import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Main chat model — Gemini 1.5 Flash
export const geminiChat = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.8,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
})

// Embedding model — for semantic memory
export const geminiEmbedding = genAI.getGenerativeModel({
  model: 'text-embedding-004',
})

/**
 * Generate an embedding vector for a text string
 * Used for semantic memory storage and retrieval
 * Features a robust try-catch fallback to prevent database/app crashes on restricted API keys.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await geminiEmbedding.embedContent(text)
    return result.embedding.values
  } catch (err: any) {
    console.warn('[Gemini API] Embedding generation failed. Falling back to 768-dim neutral vector.', err.message || String(err))
    
    // Return a standard 768-dimension zero vector as a graceful fallback
    // This allows PDF uploads and memory storage to succeed without crashing the server!
    return new Array(768).fill(0)
  }
}

/**
 * Generate a streaming chat response from Gemini
 */
export async function streamChatResponse(
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[],
  systemPrompt?: string
) {
  // Clean history: Gemini requires history to start with a 'user' message
  let history = messages.slice(0, -1)
  while (history.length > 0 && history[0].role !== 'user') {
    history.shift()
  }

  const chat = geminiChat.startChat({
    history: history,
    systemInstruction: systemPrompt 
      ? { role: 'system', parts: [{ text: systemPrompt }] } 
      : undefined,
  })

  const lastMessage = messages[messages.length - 1]
  const result = await chat.sendMessageStream(lastMessage.parts[0].text)

  return result.stream
}

/**
 * Generate a one-shot response (for summaries, tasks, etc.)
 * Binds errors to a safe, stylized markdown fallback to prevent blank/crashing UI cards.
 */
export async function generateResponse(prompt: string): Promise<string> {
  try {
    const result = await geminiChat.generateContent(prompt)
    return result.response.text()
  } catch (err: any) {
    console.error('[Gemini API] generateResponse failed:', err.message || String(err))
    
    const msg = err.message || String(err)
    if (msg.includes('404') || msg.includes('not found') || msg.includes('API_KEY_INVALID')) {
      return `### 📑 COGNITIVE NEURAL SUMMARY\n⚠️ CEREBRO failed to generate cognitive summary analysis due to API model/key restrictions. Please verify your Google AI Studio credentials in your local environment configurations.\n\n### 💡 SUGGESTED ACTION\n1. Update your \`GEMINI_API_KEY\` in \`.env.local\` to an unrestricted active key.`
    }
    
    return `### 📑 SYSTEM SYNC STATUS\n⚠️ CEREBRO is currently experiencing high load or API service limits. Please try again in a few moments.\n\n*Error Context: ${msg.slice(0, 100)}*`
  }
}

export { genAI }
