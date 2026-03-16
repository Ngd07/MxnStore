'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/')
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [router])

  const handleLogin = async () => {
    console.log('Starting OAuth login...')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('OAuth error:', error)
      alert('Error: ' + error.message)
    } else {
      console.log('OAuth data:', data)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-yellow-900 to-purple-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-yellow-900 to-purple-900 p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center mb-4">
          <Image
            src="/logo.png"
            alt="MxNStore"
            width={100}
            height={100}
            className="rounded-2xl shadow-2xl"
            priority
          />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
          MxNStore
        </h1>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Welcome back
          </h2>
          <p className="text-white/70 text-center mb-6 text-sm sm:text-base">
            Sign in to continue
          </p>

          <Button
            onClick={handleLogin}
            className="w-full gap-3 bg-white text-gray-900 hover:bg-gray-100 h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02]"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
        </div>

        {/* Footer */}
        <p className="text-white/50 text-center mt-6 text-xs">
          By signing in, you accept our terms and conditions
        </p>
      </div>
    </div>
  )
}
