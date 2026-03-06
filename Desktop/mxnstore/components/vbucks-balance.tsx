"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Users } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2 rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-3 py-2 sm:px-4 sm:py-2">
      <div className="flex flex-col gap-1 order-1 sm:order-1">
        <div className="flex items-center gap-2">
          <Image
            src="/logomxnpoints.png"
            alt="MxN Points"
            width={20}
            height={20}
            className="rounded"
          />
          <span className="text-xs sm:text-sm font-medium text-foreground">{t("profile.mxnPoints")}</span>
          <span className="text-base sm:text-lg font-bold text-yellow-500">{vbucksBalance}</span>
        </div>
        <span className="text-xs text-muted-foreground">{t("profile.vbucks")}</span>
      </div>
      <div className="flex flex-row gap-2 order-2 sm:order-2 overflow-x-auto pb-1 sm:pb-0">
        <a
          href="/add-friend"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 sm:gap-2 rounded-xl border border-blue-500/50 bg-blue-500/10 px-3 py-2 sm:px-4 sm:py-3 hover:bg-blue-500/20 transition-colors whitespace-nowrap"
        >
          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          <span className="text-xs sm:text-sm font-medium text-foreground">{t("profile.addFriend")}</span>
        </a>
        <button
          onClick={() => router.push('/buy-vbucks')}
          className="flex items-center justify-center gap-1 sm:gap-2 rounded-xl border border-purple-500/50 bg-purple-500/10 px-3 py-2 sm:px-4 sm:py-3 hover:bg-purple-500/20 transition-colors whitespace-nowrap"
        >
          <Image
            src="/logomxnpoints.png"
            alt="MxN Points"
            width={16}
            height={16}
            className="rounded"
          />
          <span className="text-xs sm:text-sm font-medium text-foreground">{t("profile.recharge")}</span>
        </button>
      </div>
    </div>
  );
}
