import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('mxn_points')
      .eq('id', userId)
      .single()

    return NextResponse.json({ balance: profile?.mxn_points ?? 0 })
  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
