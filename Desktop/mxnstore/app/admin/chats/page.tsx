'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Send, Lock, MessageCircle, Users } from 'lucide-react'
import Image from 'next/image'

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

export default function AdminChatsPage() {
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        setIsAuthorized(true)
        loadChats()
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !isAuthorized) return
    
    setSending(true)
    
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
          <Image
            src="/logomxnpoints.png"
            alt="MxN"
            width={32}
            height={32}
            className="rounded"
          />
          <h1 className="text-2xl font-bold text-foreground">Chats con Clientes</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-150px)]">
          {/* Chat List */}
          <Card className="md:col-span-1 flex flex-col">
            <div className="p-3 border-b">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Conversaciones ({chats.length})
              </h2>
            </div>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : chats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay chats</p>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full text-left p-3 border-b hover:bg-secondary/50 ${
                      selectedChat?.id === chat.id ? 'bg-secondary' : ''
                    }`}
                  >
                    <p className="font-medium text-foreground truncate">{chat.user_email}</p>
                    <p className="text-sm text-muted-foreground truncate">{chat.last_message || 'Sin mensajes'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(chat.updated_at).toLocaleString('es-AR')}
                    </p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="md:col-span-2 flex flex-col">
            {selectedChat ? (
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
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Selecciona un chat para empezar</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
