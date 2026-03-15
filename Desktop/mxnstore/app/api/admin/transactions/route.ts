import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const ADMIN_EMAILS = [
  'nleonelli0@gmail.com',
  'juancruzgc10@gmail.com'
]

async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return { error: 'No autorizado', status: 401 }
  
  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { error: 'Token inválido', status: 401 }
  
  if (!ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
    return { error: 'No tienes permisos de admin', status: 403 }
  }
  
  return { user }
}

export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .neq('type', 'redeem')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (transactions && transactions.length > 0) {
      const userIds = [...new Set(transactions.map(t => t.user_id))]
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .in('id', userIds)
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || [])

      const transactionsWithEmail = transactions.map(t => ({
        ...t,
        email: profileMap.get(t.user_id) || 'Unknown'
      }))

      return NextResponse.json(transactionsWithEmail)
    }

    return NextResponse.json([])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { transaction_id, status } = body
    
    const { error } = await supabaseAdmin
      .from('transactions')
      .update({ status })
      .eq('id', transaction_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
