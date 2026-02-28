"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

interface Notification {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export function NotificationsBell() {
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const loadNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read && n.sender_id !== user.id).length);
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
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h3 className="font-bold text-foreground">{t("notifications.title")}</h3>
            <button onClick={() => setOpen(false)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto p-3 space-y-2">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                {t("notifications.empty")}
              </p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`rounded-lg p-2 text-sm ${
                    notif.sender_id === user.id
                      ? "bg-yellow-500/20 text-foreground"
                      : notif.is_read
                      ? "bg-muted text-muted-foreground"
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
          </div>
        </div>
      )}
    </div>
  );
}
