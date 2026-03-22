import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'purchases'
    const archived = searchParams.get('archived') === 'true'

    if (type === 'purchases') {
      let query = supabaseAdmin
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })

      if (archived) {
        query = query.eq('status', 'archived')
      } else {
        query = query.in('status', ['pending', 'processing', 'completed', 'cancelled'])
      }

      const { data: purchasesData, error } = await query

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      if (purchasesData && purchasesData.length > 0) {
        const userIds = [...new Set(purchasesData.map(p => p.user_id))]
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id, email')
          .in('id', userIds)
        
        const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || [])

        const purchaseIds = purchasesData.map(p => p.id)
        const { data: lastMessages } = await supabaseAdmin
          .from('purchase_messages')
          .select('purchase_id, content')
          .in('purchase_id', purchaseIds)
          .order('created_at', { ascending: false })
        
        const lastMsgMap = new Map()
        lastMessages?.forEach(msg => {
          if (!lastMsgMap.has(msg.purchase_id)) {
            lastMsgMap.set(msg.purchase_id, msg.content)
          }
        })

        const purchasesWithEmail = purchasesData.map(purchase => ({
          ...purchase,
          user_email: profileMap.get(purchase.user_id) || 'Unknown',
          last_message: lastMsgMap.get(purchase.id) || ''
        }))

        return NextResponse.json(purchasesWithEmail)
      }

      return NextResponse.json([])
    }

    if (type === 'recargas') {
      let query = supabaseAdmin
        .from('manual_payments')
        .select('*')
        .order('created_at', { ascending: false })

      if (archived) {
        query = query.eq('status', 'archived')
      } else {
        query = query.in('status', ['pending', 'approved', 'rejected'])
      }

      const { data: recargasData, error } = await query

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Get user emails from profiles
      if (recargasData && recargasData.length > 0) {
        const userIds = recargasData
          .map(r => r.user_id)
          .filter(id => id != null)
        
        if (userIds.length > 0) {
          const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .in('id', userIds)
          
          const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || [])
          
          const recargasWithEmail = recargasData.map(r => ({
            ...r,
            user_email: profileMap.get(r.user_id) || r.email || 'Unknown'
          }))
          
          return NextResponse.json(recargasWithEmail)
        }
        
        return NextResponse.json(recargasData.map(r => ({
          ...r,
          user_email: r.email || 'Unknown'
        })))
      }

      return NextResponse.json([])
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
