"use client";

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ChatsCenter() {
  const [loading, setLoading] = useState(true)
  const [chats, setChats] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('chats').select('*').order('updated_at', { ascending: false })
      if (data) setChats(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-yellow-500/20 rounded-lg">
            <span className="h-6 w-6 inline-block" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Chats Center (Nueva)</h1>
            <p className="text-sm text-muted-foreground">Nueva interfaz de gestión de chats de clientes.</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Chats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : chats.length === 0 ? (
              <div className="text-muted-foreground text-center py-6">No hay chats</div>
            ) : (
              chats.map((c) => (
                <div key={c.id} className="p-3 border rounded hover:bg-secondary/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{c.user_email || 'Usuario'}</div>
                    <div className="text-sm text-muted-foreground">{c.last_message || 'Sin mensajes'}</div>
                  </div>
                  <Link href={`/panel-admin/chats/${c.id}`} className="px-3 py-1 rounded bg-blue-500 text-white">Abrir</Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
