"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { User, Settings, Mail, Bell, Check, LogIn, LogOut, Coins, MessageCircle } from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function ProfilePanel() {
  const { t } = useI18n();
  const { isDark, toggle } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vbucksBalance, setVbucksBalance] = useState(0);
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemMessage, setRedeemMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('mxn_points')
          .eq('id', user.id)
          .single();
        if (data) setVbucksBalance(data.mxn_points);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setVbucksBalance(0);
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      setRedeemMessage("Ingresa un código");
      return;
    }
    setRedeemMessage("Canjeando...");
    
    // Aquí implementarías la lógica de canje
    // Por ahora solo demostrativo
    setRedeemMessage("Código canjeado exitosamente!");
    setRedeemCode("");
    setTimeout(() => setRedeemMessage(""), 3000);
  };

  const handleSaveEmail = () => {
    if (email.trim()) {
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 2000);
    }
  };

  if (loading) {
    return (
      <button
        className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
      >
        <User className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Cargando...</span>
      </button>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Iniciar sesión</span>
      </button>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
          aria-label={t("profile.title")}
        >
          <User className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{user.email}</span>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-background border-border overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5 text-primary" />
            {t("profile.settings")}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {t("profile.title")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-6">
          {/* V-Bucks Balance */}
          <div className="flex flex-col gap-2 rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/logomxnpoints.png"
                  alt="MxN Points"
                  width={24}
                  height={24}
                  className="rounded"
                />
                <span className="text-sm font-medium text-foreground">MxN Points</span>
              </div>
              <span className="text-2xl font-bold text-yellow-500">{vbucksBalance}</span>
            </div>
            <span className="text-xs text-muted-foreground">1 MxN Points = 1 V-Bucks</span>
          </div>

          {/* Chat Button */}
          <button
            onClick={() => router.push('/chat')}
            className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/50 bg-blue-500/10 p-4 hover:bg-blue-500/20 transition-colors"
          >
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-foreground">Chatear con soporte</span>
          </button>

          {/* Email section */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <label className="text-sm font-medium text-foreground">
                {t("profile.email")}
              </label>
            </div>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t("profile.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary text-foreground border-border"
              />
              <button
                onClick={handleSaveEmail}
                disabled={!email.trim()}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailSaved ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    {t("profile.emailSaved")}
                  </>
                ) : (
                  t("profile.emailSave")
                )}
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {t("profile.notifications")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("profile.notificationsDesc")}
                </span>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          {/* Theme toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-4 w-4 items-center justify-center text-primary">
                {isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {t("profile.theme")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("profile.themeDesc")}
                </span>
              </div>
            </div>
            <Switch checked={isDark} onCheckedChange={toggle} />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-4 text-red-500 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
