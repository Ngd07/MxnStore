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

export async function POST(request: Request) {
  try {
    const auth = await verifyUser(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    
    const body = await request.json()
    const { itemName, price, fortniteUsername, userId } = body

    // Verify the user is redeeming for themselves
    if (userId !== auth.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 })
    }

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
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: userId,
        skin_name: itemName,
        skin_price: price,
        fortnite_username: fortniteUsername,
        status: 'pending'
      })
      .select()
      .single()

    // Send Telegram notification
    try {
      const telegramMessage = `*Nueva compra de skin!*\n\n👤 Usuario: ${auth.user.email}\n🎮 Skin: ${itemName}\n💰 Precio: ${price.toLocaleString()} MxN\n🎮 Fortnite: ${fortniteUsername || 'No proporcionado'}\n\n🔗 https://mxnstore.vercel.app/admin/chats`

      await fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/telegram-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: telegramMessage,
          type: 'purchase'
        })
      })
    } catch (telegramError) {
      console.error('Telegram notification failed:', telegramError)
    }

    return NextResponse.json({ 
      success: true, 
      balance: newBalance, 
      message: 'Redeemed',
      purchaseId: purchase?.id
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
