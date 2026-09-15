import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://kimrrkqodnbfyzbzemhf.supabase.co'

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpbXJya3FvZG5iZnl6YnplbWhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODYyMzU3NSwiZXhwIjoyMDg0MTk5NTc1fQ.npOqex6vBbF1_DdSlFWfXDrC3VkkQA5w56thj05Zj1M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
