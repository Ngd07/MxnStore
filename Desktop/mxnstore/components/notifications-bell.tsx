"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export function NotificationsBell() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (open && user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [open, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notifications]);

  const loadNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data.reverse());
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        sender_id: user.id,
        content: newMessage.trim(),
        is_read: false
      })
      .select()
      .single();

    if (!error && data) {
      setNotifications([...notifications, data]);
      setNewMessage("");
    }

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center rounded-lg bg-secondary p-2 text-foreground transition-colors hover:bg-secondary/80"
      >
        <Bell className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h3 className="font-bold text-foreground">Notificaciones</h3>
            <button onClick={() => setOpen(false)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto p-3 space-y-2">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No hay notificaciones
              </p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`rounded-lg p-2 text-sm ${
                    notif.sender_id === user.id
                      ? "bg-yellow-500/20 text-foreground"
                      : "bg-blue-500/20 text-foreground"
                  }`}
                >
                  <p>{notif.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.created_at).toLocaleString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-2">
            <div className="flex gap-2">
              <Input
                placeholder="Escribir mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={sending || !newMessage.trim()}
                size="icon"
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
