'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
        router.refresh()
      } else {
        router.push('/login')
      }
    }
    handleSession()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Cargando...</p>
      </div>
    </div>
  )
}
