"use client";

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'

export default function ChatsByPurchase() {
  const params = useParams()
  const purchaseId = (params as any)?.purchaseId ?? ''
  const [chat, setChat] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!purchaseId) { setLoading(false); return; }
      // find chat for this purchase
      const { data: chats } = await supabase.from('chats').select('*').eq('purchase_id', parseInt(purchaseId as string)).limit(1)
      const c = (Array.isArray(chats) ? chats[0] : null) || null
      if (c) setChat(c)
      if (c) {
        const { data } = await supabase.from('messages').select('*').eq('chat_id', c.id).order('created_at', { ascending: true })
        if (data) setMessages(data)
      }
      setLoading(false)
    }
    load()
  }, [purchaseId])

  const sendMessage = async () => {
    if (!chat || !newMessage.trim()) return
    setSending(true)
    try {
      const { data } = await supabase.from('messages').insert({ chat_id: chat.id, sender_id: 'admin', content: newMessage.trim() }).select().single()
      if (data) setMessages([...messages, data])
      setNewMessage('')
    } catch {
      // ignore
    }
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-yellow-500/20 rounded-lg">Chat por Compra #{purchaseId}</div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chat de Compra</h1>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{chat ? `Chat with ${chat.user_email ?? 'Usuario'}` : 'Sin chat'}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col" style={{ minHeight: '300px' }}>
            <div className="flex-1 overflow-y-auto mb-2 p-2" style={{ minHeight: '200px' }}>
              {loading ? (
                <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
              ) : chat ? (
                messages.map(m => (
                  <div key={m.id} className={`mb-2 ${m.sender_id==='admin' ? 'text-right' : 'text-left'}`}>
                    <span className={`inline-block px-2 py-1 rounded ${m.sender_id==='admin' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                      {m.content}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">No hay mensajes</div>
              )}
            </div>
            <div className="p-2 border-t flex gap-2">
              <input className="flex-1 border rounded px-2 py-1" placeholder="Escribe un mensaje..." value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') sendMessage(); }} />
              <button onClick={sendMessage} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded" disabled={!chat || !newMessage.trim() || sending}>
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
