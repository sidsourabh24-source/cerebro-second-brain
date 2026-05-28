import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/gemini'

/**
 * Store a memory with its semantic embedding
 */
export async function storeMemory(
  userId: string,
  content: string,
  importance: number = 1,
  source: string = 'chat'
) {
  const supabase = await createClient()
  const embedding = await generateEmbedding(content)

  const { data, error } = await supabase
    .from('memories')
    .insert({
      user_id: userId,
      content,
      embedding: JSON.stringify(embedding),
      importance,
      source,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Search for relevant memories using semantic similarity
 */
export async function searchMemories(
  userId: string,
  query: string,
  threshold: number = 0.65,
  limit: number = 5
): Promise<{ id: string; content: string; importance: number; similarity: number; created_at: string }[]> {
  const supabase = await createClient()
  const queryEmbedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc('search_memories', {
    query_embedding: queryEmbedding,
    match_user_id: userId,
    match_threshold: threshold,
    match_count: limit,
  })

  if (error) throw error
  return data || []
}

/**
 * Extract and store key facts from a conversation turn
 * Automatically identifies important information worth remembering
 */
export async function extractAndStoreMemories(
  userId: string,
  userMessage: string,
  assistantResponse: string
) {
  const { generateResponse } = await import('@/lib/gemini')

  const extractionPrompt = `
Analyze this conversation and extract important facts about the user that are worth remembering long-term.
Focus on: preferences, goals, skills, projects, personal info, and important context.
Return ONLY a JSON array of strings, each being a concise memory to store.
Return empty array [] if nothing important to remember.

User: ${userMessage}
Assistant: ${assistantResponse}

Return format: ["memory 1", "memory 2"] or []
`

  try {
    const response = await generateResponse(extractionPrompt)
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('AI output did not contain a valid JSON array')
    }
    const memories: string[] = JSON.parse(jsonMatch[0].trim())

    if (Array.isArray(memories) && memories.length > 0) {
      await Promise.all(
        memories.map((memory) =>
          storeMemory(userId, memory, 2, 'auto-extract')
        )
      )
    }

    return memories
  } catch {
    // Silent fail — memory extraction is best-effort
    return []
  }
}

/**
 * Build a context string from relevant memories to inject into prompts
 */
export async function buildMemoryContext(
  userId: string,
  query: string
): Promise<string> {
  const memories = await searchMemories(userId, query)

  if (memories.length === 0) return ''

  const memoryText = memories
    .sort((a, b) => b.importance - a.importance)
    .map((m) => `- ${m.content}`)
    .join('\n')

  return `\n\n[RELEVANT MEMORIES ABOUT THIS USER]\n${memoryText}\n[END MEMORIES]\n`
}
