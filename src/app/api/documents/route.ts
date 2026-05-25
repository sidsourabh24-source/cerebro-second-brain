import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmbedding, generateResponse } from '@/lib/gemini'
import pdf from 'pdf-parse'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('documents')
      .select('id, filename, file_type, file_size, summary, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ documents: data })
  } catch (error: any) {
    console.error('Documents GET error:', error)
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

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF documents are supported' }, { status: 400 })
    }

    // Convert file to buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text using pdf-parse
    let parsedPdf
    try {
      const parsePdf = (pdf as any).default || pdf
      parsedPdf = await parsePdf(buffer)
    } catch (parseErr: any) {
      console.error('pdf-parse failed:', parseErr)
      return NextResponse.json({ error: 'Failed to extract text from PDF file.' }, { status: 422 })
    }

    const rawText = parsedPdf.text || ''
    const cleanedText = rawText.replace(/\s+/g, ' ').trim()

    if (!cleanedText) {
      return NextResponse.json({ error: 'PDF file contains no readable text' }, { status: 422 })
    }

    // 1. Perform semantic chunking: split text into blocks of ~1000 characters with a 150-character overlap
    const chunks: string[] = []
    const chunkSize = 1000
    const chunkOverlap = 150
    
    let index = 0
    while (index < cleanedText.length) {
      const chunk = cleanedText.slice(index, index + chunkSize).trim()
      if (chunk.length > 0) {
        chunks.push(chunk)
      }
      index += chunkSize - chunkOverlap
    }

    // Guard: Limit total chunks for safety in development (first 50 chunks max ~50,000 words)
    const activeChunks = chunks.slice(0, 50)

    // 2. Generate vector embeddings for each chunk
    let embeddings: number[][] = []
    try {
      embeddings = await Promise.all(
        activeChunks.map(chunk => generateEmbedding(chunk))
      )
    } catch (embErr: any) {
      console.error('Embedding generation failed:', embErr)
      return NextResponse.json({ error: 'Failed to generate vector embeddings.' }, { status: 502 })
    }

    // 3. Generate Executive Summary using Gemini
    let summary = ''
    try {
      const summaryPrompt = `
Analyze the following text extracted from a PDF document and generate a premium, highly structured executive summary.
Return ONLY valid markdown containing these three sections:

### 📑 OVERVIEW
[A professional 3-4 sentence abstract of the document's main scope, background, and goals]

### 💡 KEY TAKEAWAYS
- **Point 1**: [First critical fact, metric, or finding]
- **Point 2**: [Second critical fact, metric, or finding]
- **Point 3**: [Third critical fact, metric, or finding]

### 🎙️ SUGGESTED QUERIES
1. "[First intelligent question that a user can ask CEREBRO to query this specific document]"
2. "[Second intelligent question that a user can ask CEREBRO to query this specific document]"
3. "[Third intelligent question that a user can ask CEREBRO to query this specific document]"

Text content to summarize:
"${cleanedText.slice(0, 6000)}"
`
      summary = await generateResponse(summaryPrompt)
    } catch (sumErr) {
      console.error('AI Summary generation failed:', sumErr)
      summary = '### 📑 OVERVIEW\nPDF uploaded successfully. CEREBRO failed to generate cognitive summary analysis.\n\n### 💡 KEY TAKEAWAYS\n- Summary offline.\n\n### 🎙️ SUGGESTED QUERIES\n1. "What is in this document?"'
    }

    // 4. Save to Supabase 'documents' table
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_type: file.type || 'application/pdf',
        file_size: file.size,
        summary: summary
      })
      .select()
      .single()

    if (docError) throw docError

    // 5. Batch insert chunks with vector embeddings to 'document_chunks' table
    const chunkInserts = activeChunks.map((chunk, i) => ({
      document_id: document.id,
      user_id: user.id,
      content: chunk,
      embedding: JSON.stringify(embeddings[i]),
      chunk_index: i
    }))

    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkInserts)

    if (chunkError) {
      // Cleanup orphan document entry if chunk save fails
      await supabase.from('documents').delete().eq('id', document.id)
      throw chunkError
    }

    return NextResponse.json({ document }, { status: 201 })
  } catch (error: any) {
    console.error('Documents POST error:', error)
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
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Documents DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
