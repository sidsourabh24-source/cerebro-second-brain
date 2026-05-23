import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { streamChatResponse } from '@/lib/gemini'
import { buildMemoryContext, extractAndStoreMemories } from '@/lib/memory'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const messages = body.messages || []

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid request: messages array required', { status: 400 })
    }

    // Get the latest user message
    const lastMessage = messages[messages.length - 1]
    
    // Fetch relevant context from vector database
    const memoryContext = await buildMemoryContext(user.id, lastMessage.parts[0].text)
    
    // Build system prompt for Gemini
    const systemPrompt = `You are CEREBRO, a helpful, intelligent personal AI second brain. 
You are speaking with a user who has saved personal information that you should incorporate naturally.
Be concise, helpful, and direct.${memoryContext}`

    // Start streaming from Gemini
    const geminiStream = await streamChatResponse(messages, systemPrompt)

    // Set up a TransformStream to process the response
    let fullResponse = ''
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of geminiStream) {
            const chunkText = chunk.text()
            fullResponse += chunkText
            controller.enqueue(new TextEncoder().encode(chunkText))
          }
          controller.close()

          // Background task: save messages and extract memory after stream finishes
          saveInteractionAsync(user.id, lastMessage.parts[0].text, fullResponse)
        } catch (error) {
          console.error('Error during streaming:', error)
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

/**
 * Fire-and-forget function to store the conversation interaction and trigger memory extraction
 */
async function saveInteractionAsync(userId: string, userText: string, assistantText: string) {
  try {
    const supabase = await createClient()

    // Find or create today's conversation (simplified logic for now)
    let { data: conversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!conversation) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ user_id: userId, title: 'Chat' })
        .select('id')
        .single()
      conversation = newConv
    }

    if (conversation) {
      // Save messages
      await supabase.from('messages').insert([
        { conversation_id: conversation.id, user_id: userId, role: 'user', content: userText },
        { conversation_id: conversation.id, user_id: userId, role: 'assistant', content: assistantText }
      ])
    }

    // Trigger memory extraction using the text
    await extractAndStoreMemories(userId, userText, assistantText)
  } catch (err) {
    console.error('Background save error:', err)
  }
}
