import { createClient, SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured.')
    }
    client = createClient(supabaseUrl, supabaseKey)
  }
  return client
}

export const supabase = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop) {
    const c = getSupabaseClient()
    const val = (c as any)[prop]
    if (typeof val === 'function') {
      return val.bind(c)
    }
    return val
  },
})