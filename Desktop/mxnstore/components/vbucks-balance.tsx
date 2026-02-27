"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Coins, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function VbucksBalance() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [vbucksBalance, setVbucksBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('vbucks_balance')
          .eq('id', user.id)
          .single();
        if (data) setVbucksBalance(data.vbucks_balance);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-4 py-2">
      <div className="flex items-center gap-2">
        <Coins className="h-5 w-5 text-yellow-500" />
        <span className="text-sm font-medium text-foreground">Vbucks</span>
        <span className="text-lg font-bold text-yellow-500">{vbucksBalance}</span>
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
