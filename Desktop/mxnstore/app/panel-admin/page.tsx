'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Coins, UserPlus, Check, AlertCircle, Lock, Loader2, History, Gift, ShoppingCart, MessageCircle, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

const ADMIN_EMAILS = [
  'nleonelli0@gmail.com',
  'juancruzgc10@gmail.com'
]

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

interface Purchase {
  id: string
  user_id: string
  skin_name: string
  skin_price: number
  fortnite_username: string
  status: string
  created_at: string
  email?: string
}

export default function AdminPanelPage() {
  // In-page Chats section (replaces previous separate Chats Center)
  const [chatList, setChatList] = useState<any[]>([])
  const [chatLoading, setChatLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<any | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatNew, setChatNew] = useState('')
  const [chatSending, setChatSending] = useState(false)

  useEffect(() => {
    const loadChats = async () => {
      const { data } = await supabase.from('chats').select('*').not('purchase_id', 'is', null).order('updated_at', { ascending: false })
      if (data) {
        const enriched = await Promise.all(data.map(async (c) => {
          const { data: profile } = await supabase.from('profiles').select('email').eq('id', c.user_id).single()
          const { data: last } = await supabase.from('messages').select('content').eq('chat_id', c.id).order('created_at', { ascending: false }).limit(1).single()
          return { ...c, user_email: profile?.email || 'Unknown', last_message: last?.content || '' }
        }))
        setChatList(enriched)
        if (enriched.length > 0) {
          setSelectedChat(enriched[0])
        }
      }
      setChatLoading(false)
    }
    loadChats()
  }, [])

  useEffect(() => {
    const loadMsgs = async (chatId: string) => {
      const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true })
      if (data) setChatMessages(data)
    }
    if (selectedChat?.id) loadMsgs(selectedChat.id)
  }, [selectedChat?.id])

  const sendChatMessage = async () => {
    if (!selectedChat || !chatNew.trim()) return
    setChatSending(true)
    try {
      const { data } = await supabase.from('messages').insert({ chat_id: selectedChat.id, sender_id: 'admin', content: chatNew.trim() }).select().single()
      if (data) setChatMessages([...chatMessages, data])
      setChatNew('')
    } catch {}
    setChatSending(false)
  }
  const [activeTab, setActiveTab] = useState<'add-points' | 'transactions' | 'purchases'>('add-points')
  const [userEmail, setUserEmail] = useState('')
  const [targetEmail, setTargetEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [purchasesLoading, setPurchasesLoading] = useState(true)

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

  useEffect(() => {
    if (activeTab === 'transactions' && isAuthorized) {
      fetchTransactions()
    }
    if (activeTab === 'purchases' && isAuthorized) {
      fetchPurchases()
    }
  }, [activeTab, isAuthorized])

  const fetchTransactions = async () => {
    setTxLoading(true)
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
    setTxLoading(false)
  }

  const fetchPurchases = async () => {
    setPurchasesLoading(true)
    const { data } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      const purchasesWithEmail = await Promise.all(
        data.map(async (p) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', p.user_id)
            .single()
          return { ...p, email: profile?.email || 'Unknown' }
        })
      )
      setPurchases(purchasesWithEmail)
    }
    setPurchasesLoading(false)
  }

  const updatePurchaseStatus = async (id: string, status: string) => {
    await supabase
      .from('purchases')
      .update({ status })
      .eq('id', id)
    fetchPurchases()
  }

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

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id)
    fetchTransactions()
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
      <div className="max-w-6xl mx-auto">
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
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('add-points')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'add-points' 
                ? 'bg-yellow-500 text-black' 
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            <Coins className="inline-block mr-2 h-4 w-4" />
            Agregar MxN Points
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'transactions' 
                ? 'bg-blue-500 text-white' 
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            <History className="inline-block mr-2 h-4 w-4" />
            Transacciones
          </button>
          {/* Chats tab removed; use per-purchase chat route instead */}
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'purchases' 
                ? 'bg-purple-500 text-white' 
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            <Package className="inline-block mr-2 h-4 w-4" />
            Compras
          </button>
        </div>

        {/* Add Points Tab */}
        {activeTab === 'add-points' && (
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
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <Card>
            <CardContent className="pt-6">
              {txLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
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
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  ✓
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => updateStatus(t.id, 'cancelled')}
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
            </CardContent>
          </Card>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <Card>
            <CardContent className="pt-6">
              {purchasesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fecha</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Usuario</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Skin</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Usuario Fortnite</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Estado</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((p) => (
                        <tr key={p.id} className="border-b border-border/50">
                          <td className="p-3 text-sm text-foreground">
                            {new Date(p.created_at).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-3 text-sm text-foreground">{p.email}</td>
                          <td className="p-3 text-sm font-bold text-purple-500">{p.skin_name}</td>
                          <td className="p-3 text-sm text-foreground">{p.fortnite_username || '-'}</td>
                          <td className="p-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              p.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                              p.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              p.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>
                              {p.status === 'completed' ? 'Entregado' : 
                               p.status === 'pending' ? 'Pendiente' :
                               p.status === 'processing' ? 'Procesando' : 'Cancelado'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {p.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => updatePurchaseStatus(p.id, 'processing')}
                                    className="bg-blue-500 hover:bg-blue-600 text-xs"
                                  >
                                    Procesar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => updatePurchaseStatus(p.id, 'completed')}
                                    className="bg-green-500 hover:bg-green-600 text-xs"
                                  >
                                    ✓
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => updatePurchaseStatus(p.id, 'cancelled')}
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    ✗
                                  </Button>
                                </>
                              )}
                              {p.status === 'processing' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => updatePurchaseStatus(p.id, 'completed')}
                                    className="bg-green-500 hover:bg-green-600 text-xs"
                                  >
                                    ✓ Entregar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => updatePurchaseStatus(p.id, 'cancelled')}
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    ✗
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {purchases.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No hay compras</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {/* Chats (In-Page) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Chats</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 h-96">
            <div className="w-1/3 border-r border-border overflow-y-auto p-2">
              {chatLoading ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
              ) : (
                chatList.map((c) => (
                  <div key={c.id} className={`p-2 mb-1 rounded hover:bg-secondary/50 cursor-pointer ${selectedChat?.id===c.id?'bg-secondary':''}`} onClick={()=>setSelectedChat(c)}>
                    <div className="font-semibold truncate flex items-center gap-2">
                      <span>{c.user_email}</span>
                      {c.purchase_id && (
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-500">
                          {`Compra #${c.purchase_id}`}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{c.last_message || 'Sin mensajes'}</div>
                  </div>
                ))
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-2">
                {selectedChat ? (
                  chatMessages.map((m) => (
                    <div key={m.id} className={`mb-2 ${m!.sender_id==='admin' ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-block px-2 py-1 rounded ${m!.sender_id==='admin' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                        {m.content}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">Selecciona un chat</div>
                )}
              </div>
              <div className="p-2 border-t flex gap-2">
                <input className="flex-1 border rounded px-2 py-1" placeholder="Escribe un mensaje..." value={chatNew} onChange={e=>setChatNew(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') sendChatMessage(); }} />
                <button onClick={sendChatMessage} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded" disabled={!selectedChat || !chatNew.trim() || chatSending}>
                  {chatSending ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
