"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Coins, RefreshCw, UserPlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export function VbucksBalance() {
  const router = useRouter();
  const { t } = useI18n();
  const [vbucksBalance, setVbucksBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) {
          if (mounted) setLoading(false);
          return;
        }
        const token = session?.access_token;
        const res = await fetch(`/api/balance?userId=${user.id}&t=${Date.now()}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (mounted && res.ok && data.balance !== undefined) {
          setVbucksBalance(data.balance);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('mxn-balance-updated', { detail: { balance: data.balance } }));
          }
        }
      } catch (err) {
        // Silent fail
      }
      
      if (mounted) {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for balance updates from shop-item-card or admin panel
    const onBalanceUpdate = async (e: any) => {
      const bal = e?.detail?.balance;
      const shouldRefresh = e?.detail?.refresh;
      
      if (typeof bal === 'number') {
        setVbucksBalance(bal);
      } else if (shouldRefresh) {
        // Refresh balance from server
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (user) {
          const token = session?.access_token;
          const res = await fetch(`/api/balance?userId=${user.id}&t=${Date.now()}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          const data = await res.json();
          if (res.ok && data.balance !== undefined) {
            setVbucksBalance(data.balance);
          }
        }
      }
    };
    window.addEventListener('mxn-balance-updated', onBalanceUpdate);
    
    return () => {
      mounted = false;
      window.removeEventListener('mxn-balance-updated', onBalanceUpdate);
    };
  }, []);

  if (loading) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-yellow-500/10 backdrop-blur-md px-4 md:px-6 py-3 shadow-lg shadow-yellow-500/10">
      {/* Balance - always visible */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <Image
            src="/logomxnpoints.png"
            alt="MxN Points"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <div className="absolute -inset-1 rounded-lg bg-yellow-500/20 blur-md -z-10" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs md:text-sm font-medium text-muted-foreground tracking-wide">{t("profile.mxnPoints")}</span>
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-bold text-yellow-400 tracking-tight">{vbucksBalance.toLocaleString()}</span>
            <span className="text-xs text-yellow-500/60">MxN</span>
          </div>
        </div>
      </div>

      {/* Creator Code - only on desktop */}
      <span className="hidden md:inline flex-1 text-center text-base font-bold text-white uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
          {t("profile.creatorCode")} MXNSTORE
      </span>

      {/* Buttons - only on desktop */}
      <div className="hidden md:flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.push('/add-friend')}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-400 hover:to-blue-500 hover:scale-105"
        >
          <UserPlus className="h-4 w-4" />
          {t("profile.addFriend")}
        </button>
        <button
          onClick={() => router.push('/buy-vbucks')}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:from-purple-400 hover:to-pink-400 hover:scale-105"
        >
          <RefreshCw className="h-4 w-4" />
          {t("profile.recharge")}
        </button>
      </div>
    </div>
  );
}
