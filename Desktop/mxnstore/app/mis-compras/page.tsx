'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Lock, ShoppingBag } from 'lucide-react'
import Image from 'next/image'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface PurchaseMessage {
  id: string
  purchase_id: string
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

export default function MisComprasPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [messages, setMessages] = useState<PurchaseMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [txLoading, setTxLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
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
            .single()
          
          const purchasesWithEmail = purchasesData.map(p => ({
            ...p,
            email: profile?.email || ''
          }))
          
          setPurchases(purchasesWithEmail)
          if (purchasesWithEmail.length > 0) {
            setSelectedPurchase(purchasesWithEmail[0])
          }
        }
      }
      
      setLoading(false)
    }

    init()
  }, [])

  useEffect(() => {
    if (selectedPurchase) {
      loadMessages(selectedPurchase.id)
    }
  }, [selectedPurchase])

  const loadMessages = async (purchaseId: string) => {
    setTxLoading(true)
    const { data } = await supabase
      .from('purchase_messages')
      .select('*')
      .eq('purchase_id', purchaseId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
    }
    setTxLoading(false)
  }

  useEffect(() => {
    if (selectedPurchase) {
      const interval = setInterval(() => {
        loadMessages(selectedPurchase.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedPurchase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPurchase || !user) return
    
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
      setMessages([...messages, data])
      setNewMessage('')
    }
    
    setSending(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500'
      case 'processing': return 'bg-blue-500/20 text-blue-500'
      case 'completed': return 'bg-green-500/20 text-green-500'
      case 'cancelled': return 'bg-red-500/20 text-red-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'processing': return 'Procesando'
      case 'completed': return 'Entregado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
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
            <h2 className="text-xl font-bold text-foreground mb-2">Inicia sesión</h2>
            <p className="text-muted-foreground">Debes iniciar sesión para ver tus compras</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold text-foreground">Mis Compras</h1>
        </div>

        {purchases.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes compras todavía</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Purchase List */}
            <div className="lg:col-span-1 space-y-2">
              <h2 className="font-bold text-foreground mb-2">Tus canjes</h2>
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

            {/* Chat and Details */}
            {selectedPurchase && (
              <div className="lg:col-span-2">
                {/* Purchase Details */}
                <Card className="mb-4">
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
                        <p className="font-medium text-foreground text-sm">{selectedPurchase.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedPurchase.status)}`}>
                          {getStatusText(selectedPurchase.status)}
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

                {/* Chat */}
                <Card className="h-[400px] flex flex-col">
                  <div className="p-3 border-b">
                    <h3 className="font-bold text-foreground">Chat de soporte</h3>
                  </div>
                  <CardContent className="flex-1 flex flex-col p-0">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {txLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : messages.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          Escribinos si tenés alguna duda sobre tu compra
                        </p>
                      ) : (
                        messages.map((msg) => (
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
                              <p className={`text-[10px] mt-1 ${
                                msg.sender_id === user.id ? 'text-black/70' : 'text-white/70'
                              }`}>
                                {new Date(msg.created_at).toLocaleTimeString('es-AR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
