'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Coins, UserPlus, Check, AlertCircle, Lock, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ADMIN_EMAILS = [
  'tiendafnstore@gmail.com',
  'nleonelli0@gmail.com',
  'juancruzgc10@gmail.com'
]

export default function AdminPanelPage() {
  const [userEmail, setUserEmail] = useState('')
  const [targetEmail, setTargetEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        const emailLower = user.email.toLowerCase()
        const adminList = ADMIN_EMAILS.map(e => e.toLowerCase())
        if (adminList.includes(emailLower)) {
          setIsAuthorized(true)
          setUserEmail(user.email)
        }
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  const handleAddPoints = async () => {
    if (!targetEmail || !amount) return
    
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/add-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          target_email: targetEmail, 
          amount: parseInt(amount)
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `✓ Se agregaron ${amount} MxN Points a ${targetEmail}` })
        setTargetEmail('')
        setAmount('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Error desconocido' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    }

    setLoading(false)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground">No tenés acceso a esta página.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-yellow-500/20 rounded-lg">
            <Image
              src="/logomxnpoints.png"
              alt="MxN"
              width={32}
              height={32}
              className="rounded"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Admin</h1>
            <p className="text-muted-foreground">Agregar MxN Points</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Agregar MxN Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Email del usuario
              </label>
              <Input
                type="email"
                placeholder="usuario@email.com"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Cantidad de MxN Points
              </label>
              <Input
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {message && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-500' 
                  : 'bg-red-500/20 text-red-500'
              }`}>
                {message.type === 'success' 
                  ? <Check className="h-4 w-4" /> 
                  : <AlertCircle className="h-4 w-4" />
                }
                {message.text}
              </div>
            )}

            <Button 
              onClick={handleAddPoints}
              disabled={loading || !targetEmail || !amount}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Coins className="mr-2 h-4 w-4" />
                  Agregar MxN Points
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Link to Transactions */}
        <div className="mt-6 text-center">
          <a 
            href="/admin/transactions" 
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 underline"
          >
            Ver historial de transacciones
          </a>
        </div>
      </div>
    </div>
  )
}
