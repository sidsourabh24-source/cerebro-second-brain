import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ tasks: data })
  } catch (error: any) {
    console.error('Tasks GET error:', error)
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
    const { title, description, priority = 'medium', due_date, ai_generated = false, tags = [] } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title,
        description,
        status: 'pending',
        priority,
        due_date,
        ai_generated,
        tags
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ task: data }, { status: 201 })
  } catch (error: any) {
    console.error('Tasks POST error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, status, title, description, priority, due_date } = body

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Build update object dynamically
    const updates: any = {}
    if (status !== undefined) updates.status = status
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (priority !== undefined) updates.priority = priority
    if (due_date !== undefined) updates.due_date = due_date

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ task: data })
  } catch (error: any) {
    console.error('Tasks PATCH error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
