import { NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { GoalCreateSchema } from '@/lib/validation'

export async function GET() {
  let auth: Awaited<ReturnType<typeof getUser>>
  try { auth = await getUser() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { supabase, user } = auth

  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ goal: data ?? null })
}

export async function POST(request: Request) {
  let auth: Awaited<ReturnType<typeof getUser>>
  try { auth = await getUser() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { supabase, user } = auth

  const body = await request.json()
  const parsed = GoalCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Deactivate all existing goals first
  await supabase
    .from('goals')
    .update({ is_active: false })
    .eq('user_id', user.id)

  const { data, error } = await supabase
    .from('goals')
    .insert({ ...parsed.data, user_id: user.id, is_active: true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ goal: data }, { status: 201 })
}
