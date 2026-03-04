import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { purchase_id, status, refund_amount, user_id } = body

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
