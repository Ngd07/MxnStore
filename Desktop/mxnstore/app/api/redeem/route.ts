import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { itemName, price, fortniteUsername, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Read current balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('mxn_points')
      .eq('id', userId)
      .single()

    const balance = profile?.mxn_points ?? 0
    if (balance < price) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    const newBalance = balance - price

    // Deduct balance
    const { error: updError } = await supabase
      .from('profiles')
      .update({ mxn_points: newBalance })
      .eq('id', userId)
    if (updError) throw updError

    // Create transaction
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'redeem',
      amount: price,
      skin_name: itemName,
      skin_price: price,
      fortnite_username: fortniteUsername,
      status: 'pending'
    })

    // Create purchase record
    await supabase.from('purchases').insert({
      user_id: userId,
      skin_name: itemName,
      skin_price: price,
      fortnite_username: fortniteUsername,
      status: 'pending'
    })

    return NextResponse.json({ success: true, balance: newBalance, message: 'Redeemed' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
