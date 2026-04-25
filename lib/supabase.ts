import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser / server-component client — anon key, RLS enforced.
// Safe to import in components and server components.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service-role client — bypasses RLS.
// ONLY import this inside app/api/ route handlers. Never in components.
export function createServiceClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
}
