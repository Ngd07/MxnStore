"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Coins, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export function VbucksBalance() {
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [vbucksBalance, setVbucksBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;
      
      if (session?.user) {
        setUser(session.user);
        
        const { data } = await supabase
          .from('profiles')
          .select('mxn_points')
          .eq('id', session.user.id)
          .single();
        
        if (mounted && data) {
          console.log('VbucksBalance initial fetch:', data.mxn_points);
          setVbucksBalance(data.mxn_points);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for balance updates from shop-item-card
    const onBalanceUpdate = (e: any) => {
      const bal = e?.detail?.balance;
      console.log('VbucksBalance received update:', bal);
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

  if (!user) {
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
        className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-700"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        {t("profile.recharge")}
      </button>
    </div>
  );
}
