import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: Request) {
  try {
    // Authenticate user via session cookies
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Redeem - user:', user?.email, 'authError:', authError)
    if (!user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { itemName, price, fortniteUsername } = body

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })
    }

    // Read current balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('mxn_points')
      .eq('id', user.id)
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
      .eq('id', user.id)
    if (updError) throw updError

    // Create transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'redeem',
      amount: price,
      skin_name: itemName,
      skin_price: price,
      fortnite_username: fortniteUsername,
      status: 'pending'
    })

    // Create purchase record
    await supabase.from('purchases').insert({
      user_id: user.id,
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
