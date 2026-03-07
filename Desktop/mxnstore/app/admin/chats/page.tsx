'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Send, Lock, MessageCircle, Users, ShoppingBag, ArrowLeft, Coins } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const ADMIN_EMAILS = ['nleonelli0@gmail.com', 'juancruzgc10@gmail.com']

interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface Chat {
  id: string
  user_id: string
  status: string
  created_at: string
  updated_at: string
  user_email?: string
  last_message?: string
}

interface PurchaseMessage {
  id: string
  purchase_id: string
  sender_id: string
  content: string
  created_at: string
}

interface PaymentMessage {
  id: string
  payment_id: string
  sender_id: string
  content: string
  created_at: string
}

interface ManualPayment {
  id: string
  user_id: string
  email: string
  package_id: string
  mxn_amount: number
  usd_amount: number
  receipt_url?: string
  status: string
  created_at: string
  last_message?: string
}

interface Purchase {
  id: string
  user_id: string
  skin_name: string
  skin_price: number
  fortnite_username?: string
  status: string
  created_at: string
  user_email?: string
  last_message?: string
}

export default function AdminChatsPage() {
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [activeTab, setActiveTab] = useState<'compras' | 'recargas'>('compras')
  
  // Purchases state
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [purchaseMessages, setPurchaseMessages] = useState<PurchaseMessage[]>([])
  
  // Payments state
  const [payments, setPayments] = useState<ManualPayment[]>([])
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null)
  const [paymentMessages, setPaymentMessages] = useState<PaymentMessage[]>([])
  
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setAdminUser(user)
      if (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        setIsAuthorized(true)
        loadPurchases()
        loadPayments()
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  const loadPurchases = async () => {
    const { data: purchasesData } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })

    if (purchasesData) {
      const userIds = [...new Set(purchasesData.map(p => p.user_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds)
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || [])

      const purchaseIds = purchasesData.map(p => p.id)
      const { data: lastMessages } = await supabase
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
      
      setPurchases(purchasesWithEmail)
    }
  }

  const loadPayments = async () => {
    const { data: paymentsData } = await supabase
      .from('manual_payments')
      .select('*')
      .order('created_at', { ascending: false })

    if (paymentsData) {
      const paymentIds = paymentsData.map(p => p.id)
      const { data: lastMessages } = await supabase
        .from('payment_messages')
        .select('payment_id, content')
        .in('payment_id', paymentIds)
        .order('created_at', { ascending: false })
      
      const lastMsgMap = new Map()
      lastMessages?.forEach(msg => {
        if (!lastMsgMap.has(msg.payment_id)) {
          lastMsgMap.set(msg.payment_id, msg.content)
        }
      })

      const paymentsWithLastMsg = paymentsData.map(payment => ({
        ...payment,
        last_message: lastMsgMap.get(payment.id) || ''
      }))
      
      setPayments(paymentsWithLastMsg)
    }
  }

  const loadPurchaseMessages = async (purchaseId: string) => {
    const { data } = await supabase
      .from('purchase_messages')
      .select('*')
      .eq('purchase_id', purchaseId)
      .order('created_at', { ascending: true })

    if (data) {
      setPurchaseMessages(data)
    }
  }

  const loadPaymentMessages = async (paymentId: string) => {
    const { data } = await supabase
      .from('payment_messages')
      .select('*')
      .eq('payment_id', paymentId)
      .order('created_at', { ascending: true })

    if (data) {
      setPaymentMessages(data)
    }
  }

  const [lastMessageCount, setLastMessageCount] = useState(0)

  useEffect(() => {
    if (activeTab === 'compras' && selectedPurchase) {
      loadPurchaseMessages(selectedPurchase.id)
      setLastMessageCount(0)
      const interval = setInterval(() => {
        loadPurchaseMessages(selectedPurchase.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedPurchase, activeTab])

  useEffect(() => {
    if (activeTab === 'recargas' && selectedPayment) {
      loadPaymentMessages(selectedPayment.id)
      setLastMessageCount(0)
      const interval = setInterval(() => {
        loadPaymentMessages(selectedPayment.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedPayment, activeTab])

  useEffect(() => {
    const currentCount = activeTab === 'compras' ? purchaseMessages.length : paymentMessages.length
    if (currentCount > lastMessageCount) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      setLastMessageCount(currentCount)
    }
  }, [purchaseMessages, paymentMessages, lastMessageCount, activeTab])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    if (activeTab === 'compras' && !selectedPurchase) {
      return
    }
    if (activeTab === 'recargas' && !selectedPayment) {
      return
    }
    
    setSending(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (activeTab === 'compras' && selectedPurchase) {
      const { data, error } = await supabase
        .from('purchase_messages')
        .insert({
          purchase_id: selectedPurchase.id,
          sender_id: user?.id || 'admin',
          content: newMessage.trim()
        })
        .select()
        .single()

      if (!error && data) {
        setPurchaseMessages([...purchaseMessages, data])
        setNewMessage('')
        loadPurchases()
      } else {
        console.error('Error:', error)
      }
    } else if (activeTab === 'recargas' && selectedPayment) {
      const { data, error } = await supabase
        .from('payment_messages')
        .insert({
          payment_id: selectedPayment.id,
          sender_id: user?.id || 'admin',
          content: newMessage.trim()
        })
        .select()
        .single()

      if (!error && data) {
        setPaymentMessages([...paymentMessages, data])
        setNewMessage('')
        loadPayments()
      } else {
        console.error('Error:', error)
      }
    }
    
    setSending(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/panel-admin"
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <Image
            src="/logomxnpoints.png"
            alt="MxN"
            width={32}
            height={32}
            className="rounded"
          />
          <h1 className="text-2xl font-bold text-foreground">Chats con Clientes</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setActiveTab('compras'); setSelectedPurchase(purchases[0] || null); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'compras' ? 'bg-purple-500 text-white' : 'bg-secondary text-muted-foreground'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Chats de Compras ({purchases.length})
          </button>
          <button
            onClick={() => { setActiveTab('recargas'); setSelectedPayment(payments[0] || null); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'recargas' ? 'bg-green-500 text-white' : 'bg-secondary text-muted-foreground'
            }`}
          >
            <Coins className="h-4 w-4" />
            Chats de Recargas ({payments.length})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chat List */}
          <Card className="lg:col-span-1 flex flex-col">
            <div className="p-3 border-b">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                {activeTab === 'compras' ? <ShoppingBag className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
                {activeTab === 'compras' ? `Compras (${purchases.length})` : `Recargas (${payments.length})`}
              </h2>
            </div>
            <CardContent className="max-h-[70vh] overflow-y-auto p-0">
              {activeTab === 'compras' ? (
                purchases.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay compras</p>
                ) : (
                  purchases.map((purchase) => (
                    <button
                      key={purchase.id}
                      onClick={() => { setSelectedPurchase(purchase); }}
                      className={`w-full text-left p-3 border-b hover:bg-secondary/50 ${
                        selectedPurchase?.id === purchase.id ? 'bg-secondary' : ''
                      }`}
                    >
                      <p className="font-medium text-foreground truncate">{purchase.user_email}</p>
                      <p className="text-sm text-purple-500 truncate font-medium">{purchase.skin_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{purchase.last_message || 'Sin mensajes'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          purchase.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          purchase.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          purchase.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {purchase.status === 'completed' ? 'Entregado' : 
                           purchase.status === 'pending' ? 'Pendiente' :
                           purchase.status === 'processing' ? 'Procesando' : 'Cancelado'}
                        </span>
                      </div>
                    </button>
                  ))
                )
              ) : (
                payments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay recargas</p>
                ) : (
                  payments.map((payment) => (
                    <button
                      key={payment.id}
                      onClick={() => { setSelectedPayment(payment); }}
                      className={`w-full text-left p-3 border-b hover:bg-secondary/50 ${
                        selectedPayment?.id === payment.id ? 'bg-secondary' : ''
                      }`}
                    >
                      <p className="font-medium text-foreground truncate">{payment.email}</p>
                      <p className="text-sm text-green-500 truncate font-medium">{payment.mxn_amount} MxN - ${payment.usd_amount} USD</p>
                      <p className="text-sm text-muted-foreground truncate">{payment.last_message || 'Sin mensajes'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          payment.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                          payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          payment.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {payment.status === 'approved' ? 'Aprobado' : 
                           payment.status === 'pending' ? 'Pendiente' :
                           payment.status === 'rejected' ? 'Rechazado' : payment.status}
                        </span>
                      </div>
                    </button>
                  ))
                )
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 flex flex-col">
            {/* Show receipt for payments */}
            {activeTab === 'recargas' && selectedPayment && selectedPayment.receipt_url && (
              <Card className="m-4 mb-0">
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Comprobante de pago:</p>
                  <a 
                    href={selectedPayment.receipt_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img 
                      src={selectedPayment.receipt_url} 
                      alt="Comprobante" 
                      className="max-w-full h-auto rounded-lg border cursor-pointer hover:opacity-90"
                    />
                  </a>
                </CardContent>
              </Card>
            )}

            {activeTab === 'compras' && selectedPurchase ? (
              <>
                {/* Purchase Details */}
              <Card className="m-4 mb-0">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Skin</p>
                        <p className="font-bold text-foreground">{selectedPurchase.skin_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Precio</p>
                        <p className="font-bold text-yellow-500">{selectedPurchase.skin_price} MxN</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Usuario Fortnite</p>
                        <p className="font-medium text-foreground">{selectedPurchase.fortnite_username || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground text-sm">{selectedPurchase.user_email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          selectedPurchase.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                          selectedPurchase.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          selectedPurchase.status === 'processing' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {selectedPurchase.status === 'completed' ? 'Entregado' : 
                           selectedPurchase.status === 'pending' ? 'Pendiente' :
                           selectedPurchase.status === 'processing' ? 'Procesando' : 'Cancelado'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Fecha</p>
                        <p className="font-medium text-foreground">
                          {new Date(selectedPurchase.created_at).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : activeTab === 'recargas' && selectedPayment ? (
              <>
                {/* Payment Details */}
                <Card className="m-4 mb-0">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Paquete</p>
                        <p className="font-bold text-foreground">{selectedPayment.mxn_amount} MxN</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Monto</p>
                        <p className="font-bold text-yellow-500">${selectedPayment.usd_amount} USD</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground text-sm">{selectedPayment.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          selectedPayment.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                          selectedPayment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          selectedPayment.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {selectedPayment.status === 'approved' ? 'Aprobado' : 
                           selectedPayment.status === 'pending' ? 'Pendiente' :
                           selectedPayment.status === 'rejected' ? 'Rechazado' : selectedPayment.status}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Fecha</p>
                        <p className="font-medium text-foreground">
                          {new Date(selectedPayment.created_at).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chat for Payments */}
                <Card className="m-4 mt-4 flex flex-col">
                  <div className="p-3 border-b">
                    <h3 className="font-bold text-foreground">Chat de Soporte</h3>
                  </div>
                  <CardContent className="flex-1 flex flex-col p-0">
                    <div className="max-h-[30vh] overflow-y-auto p-4 space-y-3">
                      {paymentMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === 'admin' || msg.sender_id === adminUser?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 ${
                              msg.sender_id === 'admin' || msg.sender_id === adminUser?.id
                                ? 'bg-yellow-500 text-black'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${
                              msg.sender_id === 'admin' || msg.sender_id === adminUser?.id ? 'text-black/70' : 'text-white/70'
                            }`}>
                              {new Date(msg.created_at).toLocaleTimeString('es-AR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t flex gap-2">
                      <Input
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button 
                        onClick={sendMessage} 
                        disabled={sending || !newMessage.trim()}
                        className="bg-yellow-500 hover:bg-yellow-600"
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-muted-foreground">Selecciona una conversación para empezar</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
