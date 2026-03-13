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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) setLoading(false);
          return;
        }
        const res = await fetch(`/api/balance?userId=${user.id}&t=${Date.now()}`);
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

    // Listen for balance updates from shop-item-card
    const onBalanceUpdate = (e: any) => {
      const bal = e?.detail?.balance;
      if (typeof bal === 'number') {
        setVbucksBalance(bal);
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
    <div className="flex items-center rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-4 py-2">
      {/* Left: Balance */}
      <div className="flex items-center gap-3 shrink-0">
        <Image
          src="/logomxnpoints.png"
          alt="MxN Points"
          width={24}
          height={24}
          className="rounded"
        />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{t("profile.mxnPoints")}</span>
            <span className="text-lg font-bold text-yellow-500">{vbucksBalance}</span>
          </div>
          <span className="text-xs text-muted-foreground">{t("profile.vbucks")}</span>
        </div>
      </div>

      {/* Center: Creator Code */}
      <span className="flex-1 text-center text-xs font-extrabold italic text-white uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
        CODIGO DE CREADOR: MXNSTORE
      </span>

      {/* Right: Buttons */}
      <div className="flex items-center gap-2 shrink-0">
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
