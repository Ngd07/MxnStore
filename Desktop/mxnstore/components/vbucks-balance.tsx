"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Coins, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function VbucksBalance() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [vbucksBalance, setVbucksBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let loadingTimeout: NodeJS.Timeout;
    
    const checkUser = async () => {
      // Start timeout to force loading false after 10 seconds
    loadingTimeout = setTimeout(() => {
        if (mounted) {
          setLoading(false);
        }
      }, 10000);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;
        
        console.log('User in VbucksBalance:', user);
        setUser(user);
        
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('mxn_points')
            .eq('id', user.id)
            .single();
          
          if (mounted && data) {
            setVbucksBalance(data.mxn_points);
          }
        }
      } catch (err) {
        console.error('Error in VbucksBalance:', err);
      }
      
      if (mounted) {
        setLoading(false);
      }
    };
    
    checkUser();
    
    return () => {
      mounted = false;
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Inicia sesión para ver tu saldo</span>
        </div>
      </div>
    );
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
          <span className="text-sm font-medium text-foreground">MxN Points</span>
          <span className="text-lg font-bold text-yellow-500">{vbucksBalance}</span>
        </div>
        <span className="text-xs text-muted-foreground">1 MxN Points = 1 V-Bucks</span>
      </div>
      <button
        onClick={() => router.push('/buy-vbucks')}
        className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-700"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Recargar
      </button>
    </div>
  );
}
