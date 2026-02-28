import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const ADMIN_EMAILS = ['nleonelli0@gmail.com', 'juancruzgc10@gmail.com']

async function checkAdminAuth() {
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error } = await supabaseAnon.auth.getUser()
  console.log('Admin check - user:', user?.email, 'error:', error)
  return user?.email && ADMIN_EMAILS.includes(user.email)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_email, amount, type = 'deposit', admin_email } = body

    console.log('Received request - admin_email:', admin_email)
    
    // TEMPORARY: Allow all requests for testing
    // TODO: Enable proper admin check after testing
    /*
    const isValidAdmin = admin_email && (
      admin_email.toLowerCase() === 'nleonelli0@gmail.com' ||
      admin_email.toLowerCase() === 'juancruzgc10@gmail.com'
    )
    
    if (!isValidAdmin) {
      console.log('Admin not authorized:', admin_email)
      return NextResponse.json(
        { error: 'No autorizado', received: admin_email },
        { status: 401 }
      )
    }
    */
    
    if (!admin_email) {
      return NextResponse.json(
        { error: 'No autorizado - no email provided' },
        { status: 401 }
      )
    }

    if (!user_email || !amount) {
      return NextResponse.json(
        { error: 'Email y cantidad requeridos' },
        { status: 400 }
      )
    }

    // Buscar usuario por email
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, mxn_points')
      .ilike('email', user_email)

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const user = users[0]
    const newBalance = type === 'deposit' 
      ? user.mxn_points + amount 
      : Math.max(0, user.mxn_points - amount)

    // Actualizar balance
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ mxn_points: newBalance })
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

    return NextResponse.json({ balance: profiles[0].mxn_points })
  } catch (error) {
    return NextResponse.json({ balance: 0 })
  }
}
