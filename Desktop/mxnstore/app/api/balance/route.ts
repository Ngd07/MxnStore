import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyUser(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return { error: 'No autorizado', status: 401 }
  
  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { error: 'Token inválido', status: 401 }
  
  return { user }
}

export async function GET(request: Request) {
  try {
    const auth = await verifyUser(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')
    
    // Verify the user is requesting their own balance
    if (requestedUserId !== auth.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('mxn_points')
      .eq('id', requestedUserId)
      .single()

    return NextResponse.json({ balance: profile?.mxn_points ?? 0 })
  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
