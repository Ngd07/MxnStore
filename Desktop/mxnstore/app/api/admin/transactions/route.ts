import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
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
