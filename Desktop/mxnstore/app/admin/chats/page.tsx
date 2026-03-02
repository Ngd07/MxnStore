"use client";

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Chat = any
type Message = any

export default function ChatsPage(): JSX.Element {
  const [chats, setChats] = useState<Chat[]>([])
  const [loadingChats, setLoadingChats] = useState(true)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  // Load chats with non-null purchase_id
  useEffect(() => {
    const loadChats = async () => {
      setLoadingChats(true)
      const { data } = await supabase.from('chats').select('*').not('purchase_id', 'is', null).order('updated_at', { ascending: false })
      if (data && data.length) {
        // Enrich with user email and last message snippet
        const enriched = await Promise.all(data.map(async (c: any) => {
          const { data: profile } = await supabase.from('profiles').select('email').eq('id', c.user_id).single()
          const { data: last } = await supabase.from('messages').select('content').eq('chat_id', c.id).order('created_at', { ascending: false }).limit(1).single()
          return {
            ...c,
            user_email: profile?.email || 'Unknown',
            last_message: last?.content || '',
          }
        }))
        setChats(enriched)
        setSelectedChat(enriched[0])
      } else {
        setChats([])
        setSelectedChat(null)
      }
      setLoadingChats(false)
    }
    loadChats()
  }, [])

  // Load messages for selected chat
  useEffect(() => {
    const loadMessages = async (chatId: string) => {
      const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true })
      if (data) setMessages(data)
    }
    if (selectedChat?.id) loadMessages(selectedChat.id)
  }, [selectedChat?.id])

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return
    setSending(true)
    try {
      const { data } = await supabase.from('messages').insert({ chat_id: selectedChat.id, sender_id: 'admin', content: newMessage.trim() }).select().single()
      if (data) setMessages([...messages, data])
      setNewMessage('')
    } catch {
      // ignore
    }
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Chats</CardTitle>
          </CardHeader>
          <CardContent className="flex h-[520px] gap-4">
            <div className="w-1/3 border-r border-border overflow-y-auto p-2">
              {loadingChats ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
              ) : (
                chats.length === 0 ? (
                  <div className="text-muted-foreground text-center py-6">No hay chats disponibles</div>
                ) : (
                  chats.map((c) => (
                    <div key={c.id} className={`p-2 mb-1 rounded hover:bg-secondary/50 cursor-pointer ${selectedChat?.id===c.id?'bg-secondary':''}`} onClick={()=>setSelectedChat(c)}>
                      <div className="font-semibold truncate flex items-center gap-2">
                        <span>{c.user_email}</span>
                        {c.purchase_id && (
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-500">{`Compra #${c.purchase_id}`}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{c.last_message || 'Sin mensajes'}</div>
                    </div>
                  ))
                )
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-2">
                {selectedChat ? (
                  messages.map((m) => (
                    <div key={m.id} className={`mb-2 ${m.sender_id==='admin' ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-block px-2 py-1 rounded ${m.sender_id==='admin' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                        {m.content}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">Selecciona un chat</div>
                )}
              </div>
              <div className="p-2 border-t flex gap-2">
                <input className="flex-1 border rounded px-2 py-1" placeholder="Escribe un mensaje..." value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') sendMessage(); }} />
                <button onClick={sendMessage} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded" disabled={!selectedChat || !newMessage.trim() || sending}>
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
