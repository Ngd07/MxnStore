'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('Checking auth...')
        console.log('URL:', window.location.href)
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(sessionError.message)
          return
        }

        console.log('Session:', session)

        if (session) {
          console.log('Redirecting to home...')
          router.push('/')
          router.refresh()
          return
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log('Auth event:', event, session)
          if (event === 'SIGNED_IN' && session) {
            router.push('/')
            router.refresh()
          }
        })

        setTimeout(() => {
          if (!session) {
            console.log('No session after timeout, going to login')
            router.push('/login')
          }
        }, 5000)

        return () => {
          subscription.unsubscribe()
        }
      } catch (err) {
        console.error('Auth error:', err)
        setError('Error al iniciar sesión')
      }
    }

    handleAuth()
  }, [router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <a href="/login" className="text-primary underline">Volver a intentar</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Iniciando sesión...</p>
      </div>
    </div>
  )
}
