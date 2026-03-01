'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Send, Lock, MessageCircle, Users, ShoppingBag, ArrowLeft } from 'lucide-react'
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

interface Purchase {
  id: string
  user_id: string
  skin_name: string
  skin_price: number
  status: string
  created_at: string
  user_email?: string
  last_message?: string
}

export default function AdminChatsPage() {
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [purchaseMessages, setPurchaseMessages] = useState<PurchaseMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'purchases'>('general')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        setIsAuthorized(true)
        loadChats()
        loadPurchases()
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  const loadChats = async () => {
    const { data: chatsData } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false })

    if (chatsData) {
      const chatsWithEmail = await Promise.all(
        chatsData.map(async (chat) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', chat.user_id)
            .single()
          
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('content')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return { 
            ...chat, 
            user_email: profile?.email || 'Unknown',
            last_message: lastMsg?.content || ''
          }
        })
      )
      setChats(chatsWithEmail)
    }
    setLoading(false)
  }

  const loadPurchases = async () => {
    const { data: purchasesData } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false })

    if (purchasesData) {
      const purchasesWithEmail = await Promise.all(
        purchasesData.map(async (purchase) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', purchase.user_id)
            .single()
          
          const { data: lastMsg } = await supabase
            .from('purchase_messages')
            .select('content')
            .eq('purchase_id', purchase.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return { 
            ...purchase, 
            user_email: profile?.email || 'Unknown',
            last_message: lastMsg?.content || ''
          }
        })
      )
      setPurchases(purchasesWithEmail)
    }
  }

  const loadMessages = async (chatId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
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

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id)
      const interval = setInterval(() => {
        loadMessages(selectedChat.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedChat])

  useEffect(() => {
    if (selectedPurchase) {
      loadPurchaseMessages(selectedPurchase.id)
      const interval = setInterval(() => {
        loadPurchaseMessages(selectedPurchase.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedPurchase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, purchaseMessages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    setSending(true)
    
    if (activeTab === 'general' && selectedChat) {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.id,
          sender_id: 'admin',
          content: newMessage.trim()
        })
        .select()
        .single()

      if (!error && data) {
        setMessages([...messages, data])
        setNewMessage('')
        loadChats()
      }
    } else if (activeTab === 'purchases' && selectedPurchase) {
      const { data: { user } } = await supabase.auth.getUser()
      
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
            onClick={() => { setActiveTab('purchases'); setSelectedPurchase(purchases[0] || null); setSelectedChat(null); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'purchases' 
                ? 'bg-purple-500 text-white' 
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Chats de Compras ({purchases.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)]">
          {/* Chat List - Purchases */}
          {activeTab === 'purchases' && (
            <Card className="md:col-span-1 flex flex-col">
              <div className="p-3 border-b">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Compras ({purchases.length})
                </h2>
              </div>
              <CardContent className="flex-1 overflow-y-auto p-0">
                {purchases.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay compras</p>
                ) : (
                  purchases.map((purchase) => (
                    <button
                      key={purchase.id}
                      onClick={() => { setSelectedPurchase(purchase); setSelectedChat(null); }}
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
                )}
              </CardContent>
            </Card>
          )}

          {/* Chat Window - General */}
          <Card className="md:col-span-2 flex flex-col">
            {activeTab === 'general' && selectedChat ? (
              <>
                <div className="p-3 border-b">
                  <h2 className="font-bold text-foreground">{selectedChat.user_email}</h2>
                </div>
                <CardContent className="flex-1 flex flex-col p-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            msg.sender_id === 'admin'
                              ? 'bg-blue-500 text-white'
                              : 'bg-secondary text-foreground'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${
                            msg.sender_id === 'admin' ? 'text-white/70' : 'text-muted-foreground'
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
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : activeTab === 'purchases' && selectedPurchase ? (
              <>
                <div className="p-3 border-b">
                  <h2 className="font-bold text-foreground">{selectedPurchase.user_email}</h2>
                  <p className="text-sm text-purple-500">{selectedPurchase.skin_name} - {selectedPurchase.skin_price} MxN</p>
                </div>
                <CardContent className="flex-1 flex flex-col p-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {purchaseMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id !== 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            msg.sender_id !== 'admin'
                              ? 'bg-yellow-500 text-black'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${
                            msg.sender_id !== 'admin' ? 'text-black/70' : 'text-white/70'
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
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Selecciona una conversación para empezar</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
