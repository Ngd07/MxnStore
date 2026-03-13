'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Coins, UserPlus, Check, AlertCircle, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useI18n } from '@/lib/i18n'

const ADMIN_EMAILS = ['nleonelli0@gmail.com', 'juancruzgc10@gmail.com']

export default function AdminPage() {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [currentUserEmail, setCurrentUserEmail] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('User logged in:', user?.email)
      const userEmail = user?.email?.toLowerCase()
      const adminList = ADMIN_EMAILS.map(e => e.toLowerCase())
      if (userEmail && adminList.includes(userEmail)) {
        setIsAuthorized(true)
        setCurrentUserEmail(user.email)
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t("admin.verify")}</p>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">{t("admin.accessDenied")}</h2>
            <p className="text-muted-foreground">{t("admin.notAdmin")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAddVbucks = async () => {
    if (!email || !amount) return
    
    setLoading(true)
    setMessage(null)

    try {
      console.log('Sending request with admin_email:', currentUserEmail)
      const res = await fetch('/api/admin/vbucks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_email: email, 
          amount: parseInt(amount),
          type: 'deposit',
          admin_email: currentUserEmail
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `Se agregaron ${amount} MxN Points a ${email}` })
        setEmail('')
        setAmount('')
      } else {
        setMessage({ type: 'error', text: data.error || 'Error desconocido' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-yellow-500/20 rounded-lg">
            <Coins className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("admin.title")}</h1>
            <p className="text-muted-foreground">{t("admin.addPoints")}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {t("admin.addPoints")}
            </CardTitle>
            <CardDescription>
              {t("admin.userEmail")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t("admin.userEmail")}
              </label>
              <Input
                type="email"
                placeholder={t("admin.userEmailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {t("admin.points")}
              </label>
              <Input
                type="number"
                placeholder={t("admin.pointsPlaceholder")}
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
              onClick={handleAddVbucks}
              disabled={loading || !email || !amount}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? t("admin.adding") : t("admin.addPoints")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
