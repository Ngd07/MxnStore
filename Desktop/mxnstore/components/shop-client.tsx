"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { ShopSearch } from "@/components/shop-search";
import { RarityFilter } from "@/components/rarity-filter";
import { ShopSection } from "@/components/shop-section";
import { ShopSkeleton } from "@/components/shop-skeleton";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ProfilePanel } from "@/components/profile-panel";
import { VbucksBalance } from "@/components/vbucks-balance";
import { NotificationsBell } from "@/components/notifications-bell";
import type { ShopData, ShopEntry } from "@/lib/types";
import { Store, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

const ACCOUNT_ITEMS = [
  { id: "account-13500", name: "Cuenta con 13,500 V-Bucks", price: 13500, description: "Cuenta totalmente nueva con 13.500 V-Bucks. Lista para usarla o para enviar regalos." },
  { id: "account-27000", name: "Cuenta con 27,000 V-Bucks", price: 26000, description: "Cuenta totalmente nueva con 27.000 V-Bucks. Lista para usarla o para enviar regalos." },
  { id: "account-40500", name: "Cuenta con 40,500 V-Bucks", price: 37000, description: "Cuenta totally nueva con 40.500 V-Bucks. Lista para usarla o para enviar regalos." },
];

const getAccountItems = (t: any) => ACCOUNT_ITEMS.map(item => {
  const key = item.id.replace('account-', 'accountItem') + 'Name';
  const descKey = item.id.replace('account-', 'accountItem') + 'Desc';
  return {
    ...item,
    name: t(`shop.${key}`) !== `shop.${key}` ? t(`shop.${key}`) : item.name,
    description: t(`shop.${descKey}`) !== `shop.${descKey}` ? t(`shop.${descKey}`) : item.description,
  };
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getItemRarity(entry: ShopEntry): string {
  if (entry.brItems && entry.brItems.length > 0) {
    if (entry.brItems[0].series) {
      return entry.brItems[0].series.backendValue
        .replace("Series", "")
        .toLowerCase()
        .trim();
    }
    return entry.brItems[0].rarity.value;
  }
  return "common";
}

function getItemName(entry: ShopEntry): string {
  if (entry.brItems && entry.brItems.length > 0) {
    return entry.brItems[0].name;
  }
  if (entry.bundle) {
    return entry.bundle.name;
  }
  return entry.devName;
}

function getSectionName(entry: ShopEntry): string {
  if (entry.layout?.name) return entry.layout.name;
  return "Otros Items";
}

export function ShopClient() {
  const { data, error, isLoading, mutate } = useSWR<ShopData>(
    "/api/shop",
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000,
      refreshInterval: 60000, // Poll every 60 seconds
    }
  );

  const { t, dateLocale } = useI18n();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  
  // Account purchase dialog
  const [selectedAccount, setSelectedAccount] = useState<{ id: string; name: string; price: number; description: string } | null>(null);
  const [fortniteUsername, setFortniteUsername] = useState("");
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState("");

  // Get user and balance
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("mxn_points")
          .eq("id", user.id)
          .single();
        setBalance(profile?.mxn_points ?? 0);
      }
      setBalanceLoading(false);
    }
    loadUser();
  }, []);

  // Get account items filtered by search
  const accountItems = getAccountItems(t);
  const filteredAccountItems = useMemo(() => {
    return accountItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, accountItems]);

  const handleBuyAccount = async () => {
    if (!user) {
      setPurchaseMessage(t("profile.login"));
      return;
    }
    if (!fortniteUsername.trim()) {
      setPurchaseMessage("Ingresa tu usuario de Fortnite");
      return;
    }
    if (balance < selectedAccount!.price) {
      setPurchaseMessage(t("shop.accountInsufficient"));
      return;
    }

    setPurchasing(true);
    setPurchaseMessage("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          itemName: selectedAccount!.name,
          price: selectedAccount!.price,
          fortniteUsername: fortniteUsername.trim(),
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPurchaseMessage("✓ Canjeado exitosamente!");
        setBalance(data.balance);
        
        // Notify other components to refresh balance
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mxn-balance-updated', { detail: { balance: data.balance } }));
        }
        
        // Redirect to purchases chat
        router.push(`/purchases?purchase=${data.purchaseId}`);
      } else {
        setPurchaseMessage(data.error || "Error al canjear");
      }
    } catch {
      setPurchaseMessage(t("shop.accountError"));
    }

    setPurchasing(false);
  }

  const entries = data?.data?.entries ?? [];
  const vbuckIcon = data?.data?.vbuckIcon ?? "";
  const shopDate = data?.data?.date ?? "";

  // Auto-refresh at UTC midnight
  useEffect(() => {
    const checkMidnightUTC = () => {
      const now = new Date();
      const utcNow = new Date(now.toISOString());
      const msUntilMidnight = (24 * 60 * 60 * 1000) - (utcNow.getUTCHours() * 60 * 60 * 1000 + utcNow.getUTCMinutes() * 60 * 1000 + utcNow.getUTCSeconds() * 1000);
      
      const timer = setTimeout(() => {
        mutate();
        checkMidnightUTC();
      }, msUntilMidnight);
      
      return () => clearTimeout(timer);
    };
    
    checkMidnightUTC();
  }, [mutate]);

  // Get unique rarities
  const rarities = useMemo(() => {
    const raritySet = new Set<string>(["accounts"]);
    entries.forEach((entry) => {
      raritySet.add(getItemRarity(entry));
    });
    return Array.from(raritySet).sort();
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const name = getItemName(entry).toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      const matchesRarity =
        selectedRarity === "all" || getItemRarity(entry) === selectedRarity;
      return matchesSearch && matchesRarity;
    });
  }, [entries, searchQuery, selectedRarity]);

  // Group by layout/section
  const sections = useMemo(() => {
    const map = new Map<string, ShopEntry[]>();
    filteredEntries.forEach((entry) => {
      const sectionName = getSectionName(entry);
      if (!map.has(sectionName)) {
        map.set(sectionName, []);
      }
      map.get(sectionName)!.push(entry);
    });
    const sectionOrder = ['Skins', 'Bundles', 'Packs', 'Otros Items'];
    const sorted = Array.from(map.entries()).sort((a, b) => {
      const indexA = sectionOrder.indexOf(a[0]);
      const indexB = sectionOrder.indexOf(b[0]);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      if (a[0].toLowerCase().includes('jam')) return 1;
      if (b[0].toLowerCase().includes('jam')) return -1;
      return a[0].localeCompare(b[0]);
    });
    return sorted;
  }, [filteredEntries]);

  const formattedDate = shopDate
    ? new Date(shopDate).toLocaleDateString(dateLocale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextShop = new Date(now);
      nextShop.setUTCHours(24, 0, 0, 0);
      const diff = nextShop.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="MxNStore"
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                MxNStore
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 border border-yellow-500/30 rounded-lg px-4 py-2">
              <span className="text-sm font-bold text-yellow-500 uppercase tracking-wide">{t("shop.countdown")}</span>
              <div className="flex items-center">
                <span className="text-xl font-bold text-yellow-500 font-mono tabular-nums">
                  {String(timeLeft.hours).padStart(2, '0')}<span className="text-yellow-500/60">:</span>{String(timeLeft.minutes).padStart(2, '0')}<span className="text-yellow-500/60">:</span>{String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <LanguageSwitcher />
            <ProfilePanel />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4">
          <VbucksBalance />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ShopSearch value={searchQuery} onChange={setSearchQuery} />
            <p className="text-sm text-muted-foreground">
              {t("shop.itemsCount", {
                filtered: filteredEntries.length,
                total: entries.length,
              })}
            </p>
          </div>
          <RarityFilter
            rarities={rarities}
            selected={selectedRarity}
            onChange={setSelectedRarity}
          />
        </div>

        {/* Content */}
        {error && (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <p className="text-lg font-medium text-foreground">
              {t("shop.errorTitle")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("shop.errorDesc")}
            </p>
            <button
              onClick={() => mutate()}
              className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("shop.retry")}
            </button>
          </div>
        )}

        {isLoading && <ShopSkeleton />}

        {!isLoading && !error && sections.length === 0 && selectedRarity !== "accounts" && (
          <div className="flex flex-col items-center justify-center gap-2 py-20">
            <p className="text-lg font-medium text-foreground">
              {t("shop.noResults")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("shop.noResultsDesc")}
            </p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="flex flex-col gap-10">
            {selectedRarity === "accounts" ? (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">{t("shop.accounts")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAccountItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="border border-border rounded-lg p-4 bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedAccount(item)}
                    >
                      <div className="aspect-square relative mb-3 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        <Image
                          src="/cuentasfoto.png"
                          alt="Cuenta Fortnite"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h3 className="font-bold text-foreground mb-1">{item.name}</h3>
                      <div className="flex items-center gap-1">
                        <Image src="/logomxnpoints.png" alt="MxN" width={20} height={20} className="rounded" />
                        <span className="text-lg font-bold text-yellow-500">{item.price.toLocaleString()} MxN</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              sections.map(([sectionName, sectionEntries], sectionIndex) => (
                <ShopSection
                  key={sectionName}
                  name={sectionName}
                  entries={sectionEntries}
                  vbuckIcon={vbuckIcon}
                  isFirstSection={sectionIndex === 0}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* Account Purchase Dialog */}
      <Dialog open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="sr-only">{t("shop.accountBuy")}</DialogTitle>
            <DialogDescription className="sr-only">{selectedAccount?.name}</DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                <Image
                  src="/cuentasfoto.png"
                  alt="Cuenta Fortnite"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-xl text-foreground">{selectedAccount.name}</p>
                <p className="text-base text-muted-foreground mt-1">{selectedAccount.description}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">{t("shop.accountYourBalance")} <span className="text-yellow-500">{balanceLoading ? "..." : balance.toLocaleString()} MxN</span></p>
                <p className="text-sm font-medium">{t("shop.accountPrice")} <span className="text-yellow-500">{selectedAccount.price.toLocaleString()} MxN</span></p>
              </div>

              <div>
                <label className="text-sm font-medium">{t("shop.accountFortniteUser")}</label>
                <Input
                  placeholder={t("shop.accountFortnitePlaceholder")}
                  value={fortniteUsername}
                  onChange={(e) => setFortniteUsername(e.target.value)}
                />
              </div>

              {purchaseMessage && (
                <p className={`text-sm text-center ${purchaseMessage.includes("✓") ? "text-green-500" : "text-red-500"}`}>
                  {purchaseMessage}
                </p>
              )}

              <Button
                onClick={handleBuyAccount}
                disabled={purchasing || !fortniteUsername.trim() || balance < selectedAccount.price}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {purchasing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Canjeando...
                  </>
                ) : (
                  t("shop.accountRedeem", { price: selectedAccount.price.toLocaleString() })
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-center text-xs text-muted-foreground">
            {t("shop.footer")}
          </p>
        </div>
      </footer>
    </div>
  );
}
