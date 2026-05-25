import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding, generateResponse } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { query, documentId = null } = body

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query prompt is required' }, { status: 400 })
    }

    // 1. Generate vector embedding for the query prompt
    let queryEmbedding: number[]
    try {
      queryEmbedding = await generateEmbedding(query.trim())
    } catch (embErr) {
      console.error('Query embedding failed:', embErr)
      return NextResponse.json({ error: 'Failed to generate query vector embedding.' }, { status: 502 })
    }

    // 2. Fetch relevant vector text chunks using Supabase RPC function
    // match_document_id is optional; if null, it searches across all user's documents!
    const { data: chunks, error: rpcError } = await supabase.rpc('search_document_chunks', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_user_id: user.id,
      match_document_id: documentId || null,
      match_threshold: 0.35, // Balanced threshold for document semantic retrieval
      match_count: 6
    })

    if (rpcError) throw rpcError

    // 3. Handle empty semantic results gracefully
    if (!chunks || chunks.length === 0) {
      return NextResponse.json({
        answer: "🔍 **No matching semantic traces found in the Vault.**\n\nI searched your uploaded document chunks, but couldn't find any segments that match your query (similarity match under threshold). Try rephrasing your question or checking if the details are in the document!",
        sources: []
      })
    }

    // 4. Compile relevant chunks context
    const contextSegments = chunks
      .map((c: any, i: number) => `[Document Segment ${i+1}]:\n${c.content}`)
      .join('\n\n')

    // 5. Synthesis Prompt for Gemini
    const synthesisPrompt = `
You are CEREBRO, a helpful, highly advanced personal AI Second Brain.
A user has asked a question regarding their uploaded PDF document(s). Below is the raw semantic text segments extracted from the files.
Answer the user's question using ONLY the provided semantic context segments.

Strict Guidelines:
1. Base your answer directly on the details in the provided segments.
2. If the answer cannot be found or inferred from the text, state clearly: "🔍 **I couldn't locate this information in the active document vault.**"
3. Cite your sources naturally in your answer referencing the segments, e.g., "[Segment 1]" or "[Segment 3]".
4. Format your response beautifully in Markdown. Keep it direct, accurate, and concise.

[EXTRACTED VAULT CONTEXT SEGMENTS]
${contextSegments}
[END OF CONTEXT]

User Question: "${query.trim()}"
`

    let synthesizedAnswer = ''
    try {
      synthesizedAnswer = await generateResponse(synthesisPrompt)
    } catch (aiErr) {
      console.error('Gemini synthesis failed:', aiErr)
      return NextResponse.json({ error: 'Gemini cognitive synthesis failed.' }, { status: 502 })
    }

    // Return the answer and referenced sources
    const sources = chunks.map((c: any) => ({
      id: c.id,
      content: c.content,
      similarity: c.similarity
    }))

    return NextResponse.json({
      answer: synthesizedAnswer,
      sources
    })
  } catch (error: any) {
    console.error('Documents Query API error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
