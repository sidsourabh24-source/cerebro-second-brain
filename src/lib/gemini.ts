import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Main chat model — Gemini 1.5 Flash (free tier)
export const geminiChat = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
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
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await geminiEmbedding.embedContent(text)
  return result.embedding.values
}

/**
 * Generate a streaming chat response from Gemini
 */
export async function streamChatResponse(
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[],
  systemPrompt?: string
) {
  const chat = geminiChat.startChat({
    history: messages.slice(0, -1), // All but last message
    systemInstruction: systemPrompt,
  })

  const lastMessage = messages[messages.length - 1]
  const result = await chat.sendMessageStream(lastMessage.parts[0].text)

  return result.stream
}

/**
 * Generate a one-shot response (for summaries, tasks, etc.)
 */
export async function generateResponse(prompt: string): Promise<string> {
  const result = await geminiChat.generateContent(prompt)
  return result.response.text()
}

export { genAI }
