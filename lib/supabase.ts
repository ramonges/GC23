import { createClient } from '@supabase/supabase-js'

// Browser-safe client: only ever use the public anon key here. This module is
// imported by client components, so anything it reads ships to the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
