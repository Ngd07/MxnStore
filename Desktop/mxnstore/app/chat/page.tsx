'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Send, User, MessageCircle } from 'lucide-react'
import Image from 'next/image'

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
}

export default function ChatPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Buscar chat existente del usuario
        const { data: existingChat } = await supabase
          .from('chats')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (existingChat) {
          setChat(existingChat)
          loadMessages(existingChat.id)
        } else {
          // Crear nuevo chat
          const { data: newChat } = await supabase
            .from('chats')
            .insert({ user_id: user.id })
            .select()
            .single()
          
          if (newChat) {
            setChat(newChat)
          }
        }
      }
      
      setLoading(false)
    }

    initChat()
  }, [])

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
    if (chat) {
      const interval = setInterval(() => {
        loadMessages(chat.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [chat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat || !user) return
    
    setSending(true)
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chat.id,
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
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Inicia sesión</h2>
            <p className="text-muted-foreground">Debes iniciar sesión para chatear con nosotros</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/logomxnpoints.png"
            alt="MxN"
            width={32}
            height={32}
            className="rounded"
          />
          <h1 className="text-2xl font-bold text-foreground">Soporte</h1>
        </div>

        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base">Chat con MxNStore</CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  ¡Hola! Escribinos para ayudarte con tu compra o canje.
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
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${
                        msg.sender_id === user.id ? 'text-black/70' : 'text-muted-foreground'
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

            {/* Input */}
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
    </div>
  )
}
