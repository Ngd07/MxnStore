"use client";

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function ChatDetail() {
  const params = useParams()
  const chatId = (params && 'chatId' in params) ? (params as any).chatId : ''
  const [chat, setChat] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: c } = await supabase.from('chats').select('*').eq('id', chatId).single()
      if (c) setChat(c)
      const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true })
      if (data) setMessages(data)
      setLoading(false)
    }
    load()
  }, [chatId])

  const sendMessage = async () => {
    if (!chatId || !newMessage.trim()) return
    setSending(true)
    try {
      const { data } = await supabase.from('messages').insert({ chat_id: chatId, sender_id: 'admin', content: newMessage.trim() }).select().single()
      if (data) {
        setMessages([...messages, data])
        setNewMessage('')
      }
    } catch {
      // ignore
    }
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4"><button onClick={() => window.history.back()} className="text-sm">← Volver a Chats</button></div>
        <Card>
          <CardHeader>
            <CardTitle>Chat #{chatId}{chat?.user_email ? ` - ${chat.user_email}` : ''}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col" style={{ minHeight: '300px' }}>
            <div className="flex-1 overflow-y-auto mb-2 p-2" style={{ minHeight: '200px' }}>
              {loading ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`mb-2 ${m.sender_id==='admin' ? 'text-right' : 'text-left'}`}>
                    <span className={`inline-block px-2 py-1 rounded ${m.sender_id==='admin' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                      {m.content}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t flex gap-2">
              <input className="flex-1 border rounded px-2 py-1" placeholder="Escribe un mensaje..." value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') sendMessage(); }} />
              <button onClick={sendMessage} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded" disabled={!newMessage.trim() || sending}>
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
