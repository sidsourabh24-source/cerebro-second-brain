import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateResponse } from '@/lib/gemini'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const conversationId = url.searchParams.get('id')

    if (conversationId) {
      // Fetch messages for a specific conversation
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (msgError) throw msgError
      return NextResponse.json({ messages })
    }

    // Fetch list of conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (convError) throw convError
    return NextResponse.json({ conversations })
  } catch (error: any) {
    console.error('Conversations GET error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, id, firstMessage } = body

    if (id) {
      // Update existing conversation (e.g., title update)
      const { data, error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ conversation: data })
    }

    // Create new conversation
    let convTitle = title || 'New Conversation'

    if (firstMessage && !title) {
      try {
        // AI Title generation
        const aiPrompt = `Generate a very short 3-5 word summary title for this message. No quotes, no markdown, just the title. Message: "${firstMessage}"`
        const aiTitle = await generateResponse(aiPrompt)
        convTitle = aiTitle.replace(/["']/g, '').trim()
      } catch (e) {
        console.error('AI Title generation failed:', e)
      }
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: convTitle
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ conversation: data }, { status: 201 })
  } catch (error: any) {
    console.error('Conversations POST error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Conversations DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
