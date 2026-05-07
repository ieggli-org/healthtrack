import { NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { EntryCreateSchema } from '@/lib/validation'

export async function GET(request: Request) {
  let auth: Awaited<ReturnType<typeof getUser>>
  try {
    auth = await getUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { supabase, user } = auth

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = Math.min(Number(searchParams.get('limit') ?? 200), 500)

  let query = supabase
    .from('weight_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(limit)

  if (from) query = query.gte('logged_at', from)
  if (to) query = query.lte('logged_at', to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entries: data })
}

export async function POST(request: Request) {
  let auth: Awaited<ReturnType<typeof getUser>>
  try {
    auth = await getUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { supabase, user } = auth

  const body = await request.json()
  const parsed = EntryCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('weight_entries')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data }, { status: 201 })
}
