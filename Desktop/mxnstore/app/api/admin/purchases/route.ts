import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  try {
    const { data: purchases, error } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (purchases && purchases.length > 0) {
      const userIds = [...new Set(purchases.map(p => p.user_id))]
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .in('id', userIds)
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || [])

      const purchasesWithEmail = purchases.map(p => ({
        ...p,
        email: profileMap.get(p.user_id) || 'Unknown'
      }))

      return NextResponse.json(purchasesWithEmail)
    }

    return NextResponse.json([])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
