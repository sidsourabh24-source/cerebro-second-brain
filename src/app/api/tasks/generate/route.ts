import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateResponse } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { prompt } = body

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const todayStr = new Date().toString()
    const aiPrompt = `
Analyze the following natural language sentence and extract a structured todo task.
Calculate any relative dates (e.g., "tomorrow at 4pm", "by next Friday", "in 3 days", "tonight") using the reference timestamp: "${todayStr}".
Return ONLY a valid, single JSON object. Do not include markdown code block markers (like \`\`\`json), comments, or extra text.

The JSON schema MUST match:
{
  "title": "Short, clear and actionable task title (max 50 chars)",
  "description": "Elaborated details or context mentioned in the prompt, or null if none",
  "priority": "low" | "medium" | "high" | "urgent",
  "due_date": "ISO 8601 string calculated relative to the reference timestamp, or null if no date mentioned",
  "tags": ["array", "of", "1-3", "lowercase", "tags", "matching", "category", "or", "empty", "array"]
}

Input: "${prompt}"
`

    const response = await generateResponse(aiPrompt)
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim()
    
    let taskAttributes
    try {
      taskAttributes = JSON.parse(cleaned)
    } catch (parseErr) {
      console.error('Failed to parse AI structured response:', cleaned, parseErr)
      return NextResponse.json({ error: 'AI failed to construct a valid task schema.' }, { status: 422 })
    }

    return NextResponse.json({ task: taskAttributes })
  } catch (error: any) {
    console.error('Tasks generate POST error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
