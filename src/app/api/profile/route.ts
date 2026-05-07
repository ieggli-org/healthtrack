import { NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { ProfileUpdateSchema } from '@/lib/validation'

export async function GET() {
  let auth: Awaited<ReturnType<typeof getUser>>
  try { auth = await getUser() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { supabase, user } = auth

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return NextResponse.json({ profile: data ?? null })
}

export async function PUT(request: Request) {
  let auth: Awaited<ReturnType<typeof getUser>>
  try { auth = await getUser() } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { supabase, user } = auth

  const body = await request.json()
  const parsed = ProfileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...parsed.data })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}
