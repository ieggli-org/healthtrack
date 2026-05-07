import { NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { EntryUpdateSchema } from '@/lib/validation'

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  let auth: Awaited<ReturnType<typeof getUser>>
  try { auth = await getUser() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { supabase, user } = auth

  const { data, error } = await supabase
    .from('weight_entries')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ entry: data })
}

export async function PUT(request: Request, { params }: Params) {
  let auth: Awaited<ReturnType<typeof getUser>>
  try { auth = await getUser() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { supabase, user } = auth

  const body = await request.json()
  const parsed = EntryUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('weight_entries')
    .update(parsed.data)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ entry: data })
}

export async function DELETE(_req: Request, { params }: Params) {
  let auth: Awaited<ReturnType<typeof getUser>>
  try { auth = await getUser() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { supabase, user } = auth

  const { error } = await supabase
    .from('weight_entries')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
