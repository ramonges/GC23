import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Service-role client bypasses RLS. Import only from server code (route
// handlers, scripts); never from a 'use client' module.
let admin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient | null {
  if (typeof window !== 'undefined') {
    throw new Error('supabase-admin must not be used in the browser')
  }
  if (admin) return admin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  admin = createClient(url, key, { auth: { persistSession: false } })
  return admin
}
