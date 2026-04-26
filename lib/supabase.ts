import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _anon: SupabaseClient | null = null

// Browser / server-component client — anon key, RLS enforced.
// Lazy singleton: instantiated on first call, not at module load.
export function getSupabase(): SupabaseClient {
  if (!_anon) {
    _anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return _anon
}

// Service-role client — bypasses RLS.
// ONLY call this inside app/api/ route handlers. Never in components.
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}
