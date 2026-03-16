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
    <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-3 md:px-4 py-2">
      {/* Balance - always visible */}
      <div className="flex items-center gap-2 shrink-0">
        <Image
          src="/logomxnpoints.png"
          alt="MxN Points"
          width={20}
          height={20}
          className="rounded"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-xs md:text-sm font-medium text-foreground">{t("profile.mxnPoints")}</span>
            <span className="text-sm md:text-lg font-bold text-yellow-500">{vbucksBalance}</span>
          </div>
        </div>
      </div>

      {/* Creator Code - only on desktop */}
      <span className="hidden md:inline flex-1 text-center text-base font-bold text-white uppercase tracking-widest drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]">
          {t("profile.creatorCode")} MXNSTORE
      </span>

      {/* Buttons - only on desktop */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <button
          onClick={() => router.push('/add-friend')}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
        >
          <UserPlus className="h-3.5 w-3.5" />
          {t("profile.addFriend")}
        </button>
        <button
          onClick={() => router.push('/buy-vbucks')}
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t("profile.recharge")}
        </button>
      </div>
    </div>
  );
}
