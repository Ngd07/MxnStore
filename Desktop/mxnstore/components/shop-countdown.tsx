"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export function ShopCountdown() {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const { t } = useI18n();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const utcNow = new Date(now.toISOString());
      
      // Calculate time until next UTC midnight
      const nextMidnight = new Date(utcNow);
      nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
      nextMidnight.setUTCHours(0, 0, 0, 0);
      
      const msUntilMidnight = nextMidnight.getTime() - utcNow.getTime();
      
      const hours = Math.floor(msUntilMidnight / (1000 * 60 * 60));
      const minutes = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((msUntilMidnight % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  return (
    <div className="rounded-lg bg-secondary/50 px-4 py-3 text-center">
      <p className="text-sm text-muted-foreground mb-1">Nueva tienda en</p>
      <p className="text-lg font-bold text-foreground font-mono">{timeLeft}</p>
    </div>
  );
}
