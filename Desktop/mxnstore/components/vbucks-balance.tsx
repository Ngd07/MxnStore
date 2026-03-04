"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
    <div className="flex items-center justify-between rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-4 py-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Image
            src="/logomxnpoints.png"
            alt="MxN Points"
            width={24}
            height={24}
            className="rounded"
          />
          <span className="text-sm font-medium text-foreground">{t("profile.mxnPoints")}</span>
          <span className="text-lg font-bold text-yellow-500">{vbucksBalance}</span>
        </div>
        <span className="text-xs text-muted-foreground">{t("profile.vbucks")}</span>
      </div>
      <button
        onClick={() => router.push('/buy-vbucks')}
        className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700 hover:scale-105 active:scale-95"
      >
        <Image
          src="/logomxnpoints.png"
          alt="MxN Points"
          width={20}
          height={20}
          className="rounded"
        />
        {t("profile.recharge")}
      </button>
    </div>
  );
}
