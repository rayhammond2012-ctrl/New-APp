import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.')
    }
    client = createClient(supabaseUrl, supabaseKey)
  }
  return client
}

// Re-export a convenience reference that throws at call-time, not import-time
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const c = getSupabaseClient()
    return (c as any)[prop]
  },
})
