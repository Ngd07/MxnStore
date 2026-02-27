import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const ADMIN_EMAILS = ['tiendafnstore@gmail.com', 'nleonelli0@gmail.com', 'juancruzgc10@gmail.com']

async function checkAdminAuth() {
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabaseAnon.auth.getUser()
  return user?.email && ADMIN_EMAILS.includes(user.email)
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { user_email, amount, type = 'deposit' } = await request.json()

    if (!user_email || !amount) {
      return NextResponse.json(
        { error: 'Email y cantidad requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, vbucks_balance')
      .ilike('email', user_email)

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const user = users[0]
    const newBalance = type === 'deposit' 
      ? user.vbucks_balance + amount 
      : Math.max(0, user.vbucks_balance - amount)

    // Actualizar balance
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ vbucks_balance: newBalance })
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    // Registrar transacción
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount,
      type,
      status: 'completed'
    })

    return NextResponse.json({ 
      success: true, 
      profile,
      message: type === 'deposit' ? 'V-Bucks agregados' : 'V-Bucks descontados'
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdminAuth()
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .ilike('email', email)

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ balance: 0 })
    }

    return NextResponse.json({ balance: profiles[0].vbucks_balance })
  } catch (error) {
    return NextResponse.json({ balance: 0 })
  }
}
