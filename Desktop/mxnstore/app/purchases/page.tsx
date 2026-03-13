'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Lock, ShoppingBag, Coins } from 'lucide-react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

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
}

export default function PurchasesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <PurchasesContent />
    </Suspense>
  )
}

function PurchasesContent() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const purchaseId = searchParams.get('purchase')
  const paymentId = searchParams.get('payment')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'canjes' | 'recargas'>('canjes')
  
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
  const [txLoading, setTxLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Load purchases
        const { data: purchasesData } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (purchasesData) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', user.id)
            .maybeSingle()
          
          const purchasesWithEmail = purchasesData.map(p => ({
            ...p,
            email: profile?.email || ''
          }))
          
          setPurchases(purchasesWithEmail)
          if (purchasesWithEmail.length > 0) {
            if (purchaseId) {
              const found = purchasesWithEmail.find(p => p.id === purchaseId)
              setSelectedPurchase(found || purchasesWithEmail[0])
            } else {
              setSelectedPurchase(purchasesWithEmail[0])
            }
          }
        }

        // Load manual payments
        const { data: paymentsData } = await supabase
          .from('manual_payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (paymentsData) {
          setPayments(paymentsData)
          if (paymentsData.length > 0) {
            if (paymentId) {
              const found = paymentsData.find(p => p.id === paymentId)
              setSelectedPayment(found || paymentsData[0])
              setActiveTab('recargas')
            } else {
              setSelectedPayment(paymentsData[0])
            }
          }
        }
      }
      
      setLoading(false)
    }

    init()
  }, [])

  // Load purchase messages
  useEffect(() => {
    if (selectedPurchase) {
      loadPurchaseMessages(selectedPurchase.id)
    }
  }, [selectedPurchase])

  // Load payment messages
  useEffect(() => {
    if (selectedPayment) {
      loadPaymentMessages(selectedPayment.id)
    }
  }, [selectedPayment])

  const loadPurchaseMessages = async (purchaseId: string, isInitial = false) => {
    if (isInitial) setTxLoading(true)
    const { data } = await supabase
      .from('purchase_messages')
      .select('*')
      .eq('purchase_id', purchaseId)
      .order('created_at', { ascending: true })

    if (data) {
      setPurchaseMessages(data)
    }
    if (isInitial) setTxLoading(false)
  }

  const loadPaymentMessages = async (paymentId: string, isInitial = false) => {
    if (isInitial) setTxLoading(true)
    const { data } = await supabase
      .from('payment_messages')
      .select('*')
      .eq('payment_id', paymentId)
      .order('created_at', { ascending: true })

    if (data) {
      setPaymentMessages(data)
    }
    if (isInitial) setTxLoading(false)
  }

  // Auto-refresh messages
  useEffect(() => {
    if (activeTab === 'canjes' && selectedPurchase) {
      loadPurchaseMessages(selectedPurchase.id, true)
      const interval = setInterval(() => {
        loadPurchaseMessages(selectedPurchase.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedPurchase, activeTab])

  useEffect(() => {
    if (activeTab === 'recargas' && selectedPayment) {
      loadPaymentMessages(selectedPayment.id, true)
      const interval = setInterval(() => {
        loadPaymentMessages(selectedPayment.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedPayment, activeTab])

  const sendPurchaseMessage = async () => {
    if (!newMessage.trim() || !selectedPurchase) return
    
    if (!user) {
      alert('Debes iniciar sesión para enviar mensajes')
      return
    }
    
    setSending(true)
    
    const { data, error } = await supabase
      .from('purchase_messages')
      .insert({
        purchase_id: selectedPurchase.id,
        sender_id: user.id,
        content: newMessage.trim()
      })
      .select()
      .single()

    if (!error && data) {
      setPurchaseMessages([...purchaseMessages, data])
      setNewMessage('')
    } else {
      console.error('Error sending message:', error)
    }
    
    setSending(false)
  }

  const sendPaymentMessage = async () => {
    if (!newMessage.trim() || !selectedPayment) return

    if (!user) {
      alert('Debes iniciar sesión para enviar mensajes')
      return
    }
    
    setSending(true)
    
    const { data, error } = await supabase
      .from('payment_messages')
      .insert({
        payment_id: selectedPayment.id,
        sender_id: user.id,
        content: newMessage.trim()
      })
      .select()
      .single()

    if (!error && data) {
      setPaymentMessages([...paymentMessages, data])
      setNewMessage('')
    } else {
      console.error('Error sending message:', error)
    }
    
    setSending(false)
  }

  const sendMessage = () => {
    if (activeTab === 'canjes') {
      sendPurchaseMessage()
    } else {
      sendPaymentMessage()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const currentMessages = activeTab === 'canjes' ? purchaseMessages : paymentMessages

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500'
      case 'processing': return 'bg-blue-500/20 text-blue-500'
      case 'completed': return 'bg-green-500/20 text-green-500'
      case 'approved': return 'bg-green-500/20 text-green-500'
      case 'rejected': return 'bg-red-500/20 text-red-500'
      case 'cancelled': return 'bg-red-500/20 text-red-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t("purchases.statusPending")
      case 'processing': return t("purchases.statusProcessing")
      case 'completed': return t("purchases.statusCompleted")
      case 'approved': return t("purchases.statusApproved")
      case 'rejected': return t("purchases.statusRejected")
      case 'cancelled': return t("purchases.statusCancelled")
      default: return status
    }
  }

  const getPackageName = (packageId: string) => {
    const packages: Record<string, { mxn: number }> = {
      '53020cef-71b2-42f7-ac76-9bc871d5036c': { mxn: 2000 },
      '9e8d117d-2224-41c3-92dc-d96aa42a6f30': { mxn: 5000 },
      'adf34f8c-55c8-4fcc-97ab-5578991b5acd': { mxn: 10000 },
      'ae20b72f-9084-4ef6-a6ee-91864ff19ba6': { mxn: 13500 },
    }
    return packages[packageId]?.mxn || packageId
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">{t("profile.login")}</h2>
            <p className="text-muted-foreground">{t("purchases.login")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const showPurchases = activeTab === 'canjes'
  const showPayments = activeTab === 'recargas'
  const hasPurchases = purchases.length > 0
  const hasPayments = payments.length > 0

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Image
            src="/logomxnpoints.png"
            alt="MxN"
            width={32}
            height={32}
            className="rounded"
          />
          <h1 className="text-2xl font-bold text-foreground">{t("purchases.title")}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('canjes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'canjes'
                ? 'bg-yellow-500 text-black'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            {t("purchases.yourRedeems")}
          </button>
          <button
            onClick={() => setActiveTab('recargas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'recargas'
                ? 'bg-yellow-500 text-black'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className="h-4 w-4" />
            {t("purchases.yourRecargas")}
          </button>
        </div>

        {/* Purchases Tab */}
        {showPurchases && (
          hasPurchases ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <div className="max-h-[70vh] overflow-y-auto space-y-2 pr-1">
                  {purchases.map((purchase) => (
                    <button
                      key={purchase.id}
                      onClick={() => setSelectedPurchase(purchase)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPurchase?.id === purchase.id 
                          ? 'border-yellow-500 bg-yellow-500/10' 
                          : 'border-border hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-foreground truncate flex-1">{purchase.skin_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(purchase.status)}`}>
                          {getStatusText(purchase.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPurchase && (
                <div className="lg:col-span-2">
                  <Card className="mb-4">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("purchases.skin")}</p>
                          <p className="font-bold text-foreground">{selectedPurchase.skin_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("purchases.price")}</p>
                          <p className="font-bold text-yellow-500">{selectedPurchase.skin_price} MxN</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("purchases.fortniteUser")}</p>
                          <p className="font-medium text-foreground">{selectedPurchase.fortnite_username || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("purchases.status")}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPurchase.status)}`}>
                            {getStatusText(selectedPurchase.status)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col">
                    <div className="p-3 border-b">
                      <h3 className="font-bold text-foreground">Chat de soporte</h3>
                    </div>
                    <CardContent className="flex-1 flex flex-col p-0">
                      <div className="max-h-[30vh] overflow-y-auto p-4 space-y-3">
                        {txLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : purchaseMessages.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            Escribí para contactarte con soporte
                          </p>
                        ) : (
                          purchaseMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg px-3 py-2 ${
                                  msg.sender_id === user.id
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-blue-500 text-white'
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="p-3 border-t flex gap-2">
                        <Input
                          placeholder="Escribí un mensaje..."
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
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t("purchases.noCanjes")}</p>
              </CardContent>
            </Card>
          )
        )}

        {/* Payments Tab */}
        {showPayments && (
          hasPayments ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <div className="max-h-[70vh] overflow-y-auto space-y-2 pr-1">
                  {payments.map((payment) => (
                    <button
                      key={payment.id}
                      onClick={() => setSelectedPayment(payment)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPayment?.id === payment.id 
                          ? 'border-yellow-500 bg-yellow-500/10' 
                          : 'border-border hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-foreground">{getPackageName(payment.package_id)} MxN</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-500">${payment.usd_amount} USD</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPayment && (
                <div className="lg:col-span-2">
                  {/* Receipt Image */}
                  {selectedPayment.receipt_url && (
                    <Card className="mb-4">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground mb-2">{t("payment.yourReceipt")}</p>
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

                  <Card className="mb-4">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t("purchases.package")}</p>
                          <p className="font-bold text-foreground">{getPackageName(selectedPayment.package_id)} MxN</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("purchases.amount")}</p>
                          <p className="font-bold text-yellow-500">${selectedPayment.usd_amount} USD</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("purchases.email")}</p>
                          <p className="font-medium text-foreground text-sm">{selectedPayment.email || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("purchases.status")}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPayment.status)}`}>
                            {getStatusText(selectedPayment.status)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex flex-col">
                    <div className="p-3 border-b">
                      <h3 className="font-bold text-foreground">Chat de soporte</h3>
                    </div>
                    <CardContent className="flex-1 flex flex-col p-0">
                      <div className="max-h-[30vh] overflow-y-auto p-4 space-y-3">
                        {txLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : paymentMessages.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            Escribí para contactarte con soporte
                          </p>
                        ) : (
                          paymentMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg px-3 py-2 ${
                                  msg.sender_id === user.id
                                    ? 'bg-yellow-500 text-black'
                                    : 'bg-blue-500 text-white'
                                }`}
                              >
                                <p className="text-sm">{msg.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="p-3 border-t flex gap-2">
                        <Input
                          placeholder="Escribí un mensaje..."
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
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t("purchases.noRecargas")}</p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  )
}
