import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const ADMIN_EMAILS = [
  'nleonelli0@gmail.com',
  'juancruzgc10@gmail.com'
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { target_email, amount } = body

    if (!target_email || !amount) {
      return NextResponse.json(
        { error: 'Email y cantidad requeridos' },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: users, error: findError } = await supabase
      .from('profiles')
      .select('id, email, mxn_points')
      .ilike('email', target_email)

    if (findError || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const user = users[0]
    const newBalance = user.mxn_points + amount

    // Update balance
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ mxn_points: newBalance })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar: ' + updateError.message },
        { status: 500 }
      )
    }

    // Save transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'TOP UP',
      amount: amount,
      status: 'completed'
    })

    return NextResponse.json({ 
      success: true, 
      profile,
      message: `Se agregaron ${amount} MxN Points`
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno: ' + error.message },
      { status: 500 }
    )
  }
}
