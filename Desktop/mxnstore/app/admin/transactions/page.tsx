'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Coins, UserPlus, Check, AlertCircle, Lock, History, Gift, ShoppingCart } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const ADMIN_EMAILS = ['tiendafnstore@gmail.com', 'nleonelli0@gmail.com', 'juancruzgc10@gmail.com']

interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  skin_name: string | null
  skin_price: number | null
  fortnite_username: string | null
  status: string
  created_at: string
  email?: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAuthorized(true)
        fetchTransactions()
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      const transactionsWithEmail = await Promise.all(
        data.map(async (t) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', t.user_id)
            .single()
          return { ...t, email: profile?.email || 'Unknown' }
        })
      )
      setTransactions(transactionsWithEmail)
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id)
    
    fetchTransactions()
    setUpdatingId(null)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Verificando...</p>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <History className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Historial de Transacciones</h1>
            <p className="text-muted-foreground">Todas las compras y canjes</p>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Cargando...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Usuario</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cantidad</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Skin</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Usuario Fortnite</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-border/50">
                    <td className="p-3 text-sm text-foreground">
                      {new Date(t.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3 text-sm text-foreground">{t.email}</td>
                    <td className="p-3 text-sm">
                      {t.type === 'TOP UP' ? (
                        <span className="flex items-center gap-1 text-green-500">
                          <ShoppingCart className="h-4 w-4" />
                          Top Up
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-purple-500">
                          <Gift className="h-4 w-4" />
                          Canje
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm font-bold text-yellow-500">{t.amount}</td>
                    <td className="p-3 text-sm text-foreground">{t.skin_name || '-'}</td>
                    <td className="p-3 text-sm text-foreground">{t.fortnite_username || '-'}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        t.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                        t.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {t.status === 'completed' ? 'Completado' : 
                         t.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="p-3">
                      {t.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(t.id, 'completed')}
                            disabled={updatingId === t.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(t.id, 'cancelled')}
                            disabled={updatingId === t.id}
                            variant="destructive"
                          >
                            ✗
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No hay transacciones</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
