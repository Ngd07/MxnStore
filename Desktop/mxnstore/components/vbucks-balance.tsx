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
    <div className="glass-card rounded-2xl border border-yellow-500/20 px-4 md:px-6 py-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Balance - always visible */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative group">
            <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-yellow-500/30 to-amber-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Image
              src="/logomxnpoints.png"
              alt="MxN Points"
              width={40}
              height={40}
              className="relative rounded-xl"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-medium text-muted-foreground/70 tracking-wider uppercase">{t("profile.mxnPoints")}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold gradient-text tracking-tight">{vbucksBalance.toLocaleString()}</span>
              <span className="text-sm text-yellow-500/50 font-medium">MxN</span>
            </div>
          </div>
        </div>

        {/* Creator Code - only on desktop */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative px-6 py-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent" />
            <span className="relative text-base font-bold text-white/90 uppercase tracking-[0.15em]">
              {t("profile.creatorCode")} <span className="gradient-text">MXNSTORE</span>
            </span>
          </div>
        </div>

        {/* Buttons - only on desktop */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            onClick={() => router.push('/add-friend')}
            className="btn-premium group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white overflow-hidden hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all duration-300"
          >
            <UserPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>{t("profile.addFriend")}</span>
          </button>
          <button
            onClick={() => router.push('/buy-vbucks')}
            className="btn-premium group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white overflow-hidden hover:shadow-lg hover:shadow-purple-500/30 active:scale-95 transition-all duration-300"
          >
            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
            <span>{t("profile.recharge")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
