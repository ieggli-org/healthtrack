import { NextResponse } from 'next/server'
import { subDays } from 'date-fns'
import { getUser } from '@/lib/supabase/server'
import { computeStats } from '@/lib/analytics'

export async function GET(request: Request) {
  let auth: Awaited<ReturnType<typeof getUser>>
  try {
    auth = await getUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { supabase, user } = auth

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') ?? subDays(new Date(), 90).toISOString()
  const to = searchParams.get('to') ?? new Date().toISOString()

  const [entriesResult, goalResult, profileResult] = await Promise.all([
    supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', from)
      .lte('logged_at', to)
      .order('logged_at', { ascending: true }),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('height_cm')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  const entries = entriesResult.data ?? []
  const goal = goalResult.data ?? null
  const heightCm = profileResult.data?.height_cm ?? null

  const stats = computeStats(entries, goal, heightCm, new Date(from), new Date(to))
  return NextResponse.json(stats)
}
