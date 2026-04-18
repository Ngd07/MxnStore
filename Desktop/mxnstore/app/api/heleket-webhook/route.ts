import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const HELENET_API_KEY = process.env.HELEKET_API_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order_id, status, amount, payment_amount_usd, currency, network } = body

    if (!order_id || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const dataWithoutSign = { ...body }
    delete dataWithoutSign.sign
    const calculatedSign = crypto
      .createHash('md5')
      .update(Buffer.from(JSON.stringify(dataWithoutSign)).toString('base64') + HELENET_API_KEY)
      .digest('hex')

    if (calculatedSign !== body.sign) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (status === 'paid') {
      const orderParts = order_id.split('_')
      const mxnAmount = parseInt(orderParts[1] || '0')
      const userId = orderParts[2]

      if (userId && mxnAmount > 0) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('mxn_points')
          .eq('id', userId)
          .single()

        const newBalance = (profile?.mxn_points || 0) + mxnAmount

        await supabaseAdmin
          .from('profiles')
          .update({ mxn_points: newBalance })
          .eq('id', userId)

        await supabaseAdmin
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'purchase',
            amount: mxnAmount,
            status: 'completed',
            skin_price: parseFloat(payment_amount_usd || '0'),
          })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}