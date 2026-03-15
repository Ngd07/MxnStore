import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

const ADMIN_EMAILS = ['nleonelli0@gmail.com', 'juancruzgc10@gmail.com']

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return { error: 'No autorizado', status: 401 }
  
  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return { error: 'Token inválido', status: 401 }
  
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return { error: 'No tienes permisos de admin', status: 403 }
  }
  
  return { user }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const body = await request.json()
    const { purchase_id, status, refund_amount, user_id, is_payment } = body

    if (is_payment) {
      // Handle manual_payments (recargas)
      const { error } = await supabaseAdmin
        .from('manual_payments')
        .update({ status })
        .eq('id', purchase_id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      
      return NextResponse.json({ success: true })
    }

    // Handle purchases
    if (status === 'cancelled' && refund_amount && user_id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('mxn_points')
        .eq('id', user_id)
        .maybeSingle()

      const currentPoints = profile?.mxn_points || 0
      await supabaseAdmin
        .from('profiles')
        .update({ mxn_points: currentPoints + refund_amount })
        .eq('id', user_id)
    }

    const { error } = await supabaseAdmin
      .from('purchases')
      .update({ status })
      .eq('id', purchase_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
