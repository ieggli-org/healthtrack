import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

let client: ReturnType<typeof _createBrowserClient<Database>> | undefined

export function createBrowserClient() {
  if (client) return client
  client = _createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return client
}
