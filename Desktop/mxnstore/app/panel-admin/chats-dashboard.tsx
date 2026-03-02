"use client";

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function ChatsDashboard() {
  const [loading, setLoading] = useState(true)
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('chats').select('*').order('updated_at', { ascending: false })
      if (data) {
        const enriched = await Promise.all(data.map(async (c) => {
          const { data: profile } = await supabase.from('profiles').select('email').eq('id', c.user_id).single()
          const { data: last } = await supabase.from('messages').select('content').eq('chat_id', c.id).order('created_at', { ascending: false }).limit(1).single()
          return { ...c, user_email: profile?.email || 'Unknown', last_message: last?.content || '' }
        }))
        setChats(enriched)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (selectedChat) {
      const loadMsgs = async () => {
        const { data } = await supabase.from('messages').select('*').eq('chat_id', selectedChat.id).order('created_at', { ascending: true })
        if (data) setMessages(data)
      }
      loadMsgs()
    }
  }, [selectedChat])

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return
    setSending(true)
    try {
      const { data } = await supabase.from('messages').insert({ chat_id: selectedChat.id, sender_id: 'admin', content: newMessage.trim() }).select().single()
      if (data) {
        setMessages([...messages, data])
        setNewMessage('')
      }
    } catch {}
    setSending(false)
  }

  return (
    <Card className="flex-1 flex flex-col h-full">
      <CardHeader>
        <CardTitle>Chats</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex gap-4">
        <div className="w-1/3 border-r border-border overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
          ) : (
            chats.map((c) => (
              <div key={c.id} className={`p-2 mb-1 rounded hover:bg-secondary/50 cursor-pointer ${selectedChat?.id===c.id?'bg-secondary':''}`} onClick={()=>setSelectedChat(c)}>
                <div className="font-semibold truncate">{c.user_email}</div>
                <div className="text-xs text-muted-foreground truncate">{c.last_message || 'Sin mensajes'}</div>
              </div>
            ))
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-2">
            {selectedChat ? (
              messages.map((m) => (
                <div key={m.id} className={`mb-2 ${m.sender_id==='admin'?'text-right':'text-left'}`}>
                  <span className="inline-block bg-blue-500 text-white rounded px-2 py-1">{m.content}</span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">Selecciona un chat</div>
            )}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input className="flex-1 border rounded px-2 py-1" placeholder="Escribe un mensaje..." value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') sendMessage(); }} />
            <button onClick={sendMessage} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded" disabled={!selectedChat || !newMessage.trim()}>
              Enviar
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
