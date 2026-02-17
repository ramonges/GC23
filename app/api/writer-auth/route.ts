import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('writer_credentials')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .eq('password_hash', password)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Simple token — in production use JWT
    const token = Buffer.from(`${data.id}:${data.email}:${Date.now()}`).toString('base64')
    return NextResponse.json({ token, email: data.email })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
