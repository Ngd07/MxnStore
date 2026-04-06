"use client";

import Image from "next/image";
import type { ShopEntry } from "@/lib/types";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Gift, User } from "lucide-react";
import { supabase } from '@/lib/supabase'


interface ShopItemCardProps {
  entry: ShopEntry;
  vbuckIcon: string;
  priority?: boolean;
}

const rarityGradients: Record<string, string> = {
  legendary: "from-amber-500/30 via-amber-400/10 to-orange-600/30",
  epic: "from-fuchsia-500/30 via-fuchsia-400/10 to-purple-600/30",
  rare: "from-blue-500/30 via-blue-400/10 to-cyan-600/30",
  uncommon: "from-green-500/30 via-green-400/10 to-emerald-600/30",
  common: "from-zinc-500/20 via-zinc-400/5 to-gray-600/20",
  gaminglegends: "from-indigo-500/30 via-indigo-400/10 to-violet-600/30",
  marvel: "from-red-500/30 via-red-400/10 to-orange-600/30",
  dc: "from-blue-500/30 via-blue-400/10 to-indigo-600/30",
  icon: "from-teal-500/30 via-teal-400/10 to-cyan-600/30",
  starwars: "from-yellow-500/30 via-yellow-400/10 to-amber-600/30",
  shadow: "from-gray-600/30 via-gray-500/10 to-neutral-700/30",
  slurp: "from-cyan-500/30 via-cyan-400/10 to-blue-600/30",
  frozen: "from-sky-300/30 via-sky-200/10 to-blue-400/30",
  lava: "from-orange-500/30 via-orange-400/10 to-red-600/30",
  dark: "from-fuchsia-600/30 via-fuchsia-500/10 to-pink-700/30",
};

const rarityBorders: Record<string, string> = {
  legendary: "border-amber-500/60",
  epic: "border-fuchsia-500/60",
  rare: "border-blue-500/60",
  uncommon: "border-green-500/60",
  common: "border-zinc-500/40",
  gaminglegends: "border-indigo-500/60",
  marvel: "border-red-500/60",
  dc: "border-blue-500/60",
  icon: "border-teal-500/60",
  starwars: "border-yellow-500/60",
  shadow: "border-gray-500/60",
  slurp: "border-cyan-500/60",
  frozen: "border-sky-300/60",
  lava: "border-orange-500/60",
  dark: "border-fuchsia-600/60",
};

const rarityGlow: Record<string, string> = {
  legendary: "hover:shadow-amber-500/30",
  epic: "hover:shadow-fuchsia-500/30",
  rare: "hover:shadow-blue-500/30",
  uncommon: "hover:shadow-green-500/30",
  gaminglegends: "hover:shadow-indigo-500/30",
  marvel: "hover:shadow-red-500/30",
  dc: "hover:shadow-blue-500/30",
  icon: "hover:shadow-teal-500/30",
  starwars: "hover:shadow-yellow-500/30",
  lava: "hover:shadow-orange-500/30",
};

const rarityLabels: Record<string, string> = {
  legendary: "Legendario",
  epic: "Epico",
  rare: "Raro",
  uncommon: "Poco Comun",
  common: "Comun",
  gaminglegends: "Gaming Legends",
  marvel: "Marvel",
  dc: "DC",
  icon: "Icon Series",
  starwars: "Star Wars",
  shadow: "Shadow",
  slurp: "Slurp",
  frozen: "Frozen",
  lava: "Lava",
  dark: "Dark",
};

function getItemImage(entry: ShopEntry): string | null {
  // Check if brItems have their own featured images
  let hasIndividualFeaturedImage = false;
  if (entry.brItems && entry.brItems.length > 0) {
    for (const item of entry.brItems) {
      if (item.images.featured) {
        hasIndividualFeaturedImage = true;
        break;
      }
    }
  }

  // Only use bundle image if items DON'T have individual featured images
  if (entry.bundle?.image && !hasIndividualFeaturedImage) {
    const img = entry.bundle.image;
    if (img) {
      if (img.startsWith('http')) return img;
      if (img.startsWith('/')) return `https://fortnite-api.com${img}`;
    }
  }

  // Try all brItems for featured image
  if (entry.brItems && entry.brItems.length > 0) {
    for (const item of entry.brItems) {
      if (item.images.featured) {
        const img = item.images.featured;
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return `https://fortnite-api.com${img}`;
      }
    }
  }

  // Try all brItems for icon image
  if (entry.brItems && entry.brItems.length > 0) {
    for (const item of entry.brItems) {
      if (item.images.icon) {
        const img = item.images.icon;
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return `https://fortnite-api.com${img}`;
      }
    }
  }

  // Try renderImages
  if (entry.newDisplayAsset?.renderImages && entry.newDisplayAsset.renderImages.length > 0) {
    const img = entry.newDisplayAsset.renderImages[0].image;
    if (img) {
      if (img.startsWith('http')) return img;
      if (img.startsWith('/')) return `https://fortnite-api.com${img}`;
    }
  }

  // Try materialInstances featured
  if (entry.newDisplayAsset?.materialInstances) {
    for (const mat of entry.newDisplayAsset.materialInstances) {
      if (mat.images?.['featured']) {
        const img = mat.images['featured'];
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return `https://fortnite-api.com${img}`;
      }
    }
  }

  // Try materialInstances icon
  if (entry.newDisplayAsset?.materialInstances) {
    for (const mat of entry.newDisplayAsset.materialInstances) {
      if (mat.images?.['icon']) {
        const img = mat.images['icon'];
        if (img.startsWith('http')) return img;
        if (img.startsWith('/')) return `https://fortnite-api.com${img}`;
      }
    }
  }

  // Fallback to bundle image if no individual images found
  if (entry.bundle?.image) {
    const img = entry.bundle.image;
    if (img) {
      if (img.startsWith('http')) return img;
      if (img.startsWith('/')) return `https://fortnite-api.com${img}`;
    }
  }

  // Try tracks (Jam Tracks) - last resort
  if (entry.tracks && entry.tracks.length > 0) {
    const track = entry.tracks[0];
    if (track.albumArt) {
      return track.albumArt;
    }
  }

  return null;
}

function getItemName(entry: ShopEntry): string {
  if (entry.brItems && entry.brItems.length > 0) {
    return entry.brItems[0].name;
  }
  if (entry.bundle) {
    return entry.bundle.name;
  }
  return entry.devName.split(" for ")[0].replace("[VIRTUAL]1 x ", "").replace("[VIRTUAL]", "");
}

function getItemType(entry: ShopEntry): string {
  if (entry.brItems && entry.brItems.length > 0) {
    return entry.brItems[0].type.displayValue;
  }
  if (entry.bundle) {
    return "Bundle";
  }
  return "Item";
}

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

function getItemDescription(entry: ShopEntry): string {
  if (entry.brItems && entry.brItems.length > 0) {
    return entry.brItems[0].description || "Skin exclusiva de Fortnite";
  }
  if (entry.bundle && 'description' in entry.bundle) {
    return (entry.bundle as any).description || "Pack especial de Fortnite";
  }
  return "Item de Fortnite";
}

export function ShopItemCard({ entry, vbuckIcon, priority = false }: ShopItemCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [fortniteUsername, setFortniteUsername] = useState("");
  const [redeemMessage, setRedeemMessage] = useState("");
  const [vbucksBalance, setVbucksBalance] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [justRedeemed, setJustRedeemed] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const { t } = useI18n();
  
  const image = getItemImage(entry);
  const name = getItemName(entry);
  const type = getItemType(entry);
  const rarity = getItemRarity(entry);
  const description = getItemDescription(entry);
  const price = entry.finalPrice;
  const gradient =
    rarityGradients[rarity] ||
    "from-zinc-500/20 via-zinc-400/5 to-gray-600/20";
  const borderColor = rarityBorders[rarity] || "border-zinc-500/40";
  const glowEffect = rarityGlow[rarity] || "";
  const isDiscounted = entry.finalPrice < entry.regularPrice;

  const fetchBalance = async () => {
setBalanceLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setUser(user);
      if (!user) {
        setBalanceLoading(false);
        return;
      }
      const token = session?.access_token;
      const res = await fetch(`/api/balance?userId=${user.id}&t=${Date.now()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.balance !== undefined) {
        setVbucksBalance(data.balance);
      }
    } catch (err) {
      // Silent fail
    }
    setBalanceLoading(false);
  };

  // Only fetch fresh balance when dialog opens
  useEffect(() => {
    if (showDialog) {
      fetchBalance();
    }
  }, [showDialog]);

  // Listen for balance updates from other item cards to keep this card in sync
  useEffect(() => {
    const onBalanceUpdate = (e: any) => {
      const bal = e?.detail?.balance;
      if (typeof bal === 'number') {
        setVbucksBalance(bal);
      }
    };
    window.addEventListener('mxn-balance-updated', onBalanceUpdate);
    return () => window.removeEventListener('mxn-balance-updated', onBalanceUpdate);
  }, []);

  const handleRedeem = async () => {
    if (!user?.id) {
      setRedeemMessage("No autorizado");
      return;
    }
    if (!fortniteUsername.trim()) {
      setRedeemMessage(t("redeem.enterUsername"));
      return;
    }
    
    setRedeeming(true);
    setRedeemMessage(t("redeem.processing"));
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ itemName: name, price, fortniteUsername, userId: user.id })
      });
      const data = await res.json();
      if (!res.ok) {
        setRedeemMessage(data?.error || 'Error canje');
        setRedeeming(false);
        return;
      }
      const newBalance = data.balance ?? vbucksBalance;
      setVbucksBalance(newBalance);
      setJustRedeemed(true);
      
      // Notify all components to refresh balance
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mxn-balance-updated', { detail: { balance: newBalance } }));
      }
      
      // Redirect to purchases chat immediately
      router.push(`/purchases?purchase=${data.purchaseId}`);
    } catch (err) {
      setRedeemMessage("Error al canjear. Intenta de nuevo.");
      setRedeeming(false);
    }
  };

  const canAfford = vbucksBalance >= price;
  const isLoggedIn = !!user;

  return (
    <>
      <div
        className={`group relative flex flex-col overflow-hidden rounded-2xl border ${borderColor} bg-gradient-to-br from-card via-card to-card transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:${glowEffect} ${glowEffect} cursor-pointer backdrop-blur-sm`}
        onClick={() => setShowDialog(true)}
      >
        {/* Banner (New, etc.) */}
        {entry.banner && (
          <div className="absolute top-3 left-3 z-10">
            <span className="rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-lg shadow-yellow-500/30">
              {entry.banner.value}
            </span>
          </div>
        )}

        {/* Image section */}
        <div
          className={`relative aspect-square w-full overflow-hidden bg-gradient-to-br ${gradient}`}
        >
          {/* V-Bucks price badge - top left */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-blue-600/80 backdrop-blur-md px-2.5 py-1 border border-blue-500/30 shadow-lg shadow-blue-500/20">
            <span className="text-[10px] font-bold text-white">V-Bucks: {entry.finalPrice}</span>
          </div>

          {image && !imageError ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-110 group-hover:saturate-[1.1]"
              onError={() => setImageError(true)}
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="text-4xl font-bold opacity-20">?</span>
            </div>
          )}
          
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rarity badge in image */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white border border-white/20">
              {t(`rarity.${rarity}`) !== `rarity.${rarity}` ? t(`rarity.${rarity}`) : (rarityLabels[rarity] || rarity)}
            </span>
          </div>
        </div>

        {/* Info section */}
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            {type}
          </p>
          <h3 className="text-sm font-bold leading-tight text-foreground line-clamp-2 text-balance tracking-tight">
            {name}
          </h3>

          {/* Price with premium styling - Both V-Bucks and MxN Points */}
          <div className="mt-auto flex items-center gap-2 pt-3">
            {/* V-Bucks price */}
            <div className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 border border-blue-500/30">
              <span className="text-[10px] font-bold text-blue-400">VBucks: {entry.finalPrice}</span>
            </div>
            {/* MxN Points price */}
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-3 py-1.5 border border-yellow-500/30">
              <Image
                src="/logomxnpoints.png"
                alt="MxN Points"
                width={14}
                height={14}
                className="flex-shrink-0"
              />
              {isDiscounted ? (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground/60 line-through">
                    {entry.regularPrice.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-yellow-400">
                    {entry.finalPrice.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-bold text-yellow-400">
                  {entry.finalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="relative w-full aspect-square mb-4">
              {image && !imageError ? (
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-64 items-center justify-center bg-muted rounded-lg">
                  <span className="text-4xl font-bold opacity-30">?</span>
                </div>
              )}
            </div>
            <DialogTitle className="text-xl">{name}</DialogTitle>
            <DialogDescription className="text-base pt-2">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Price and Balance */}
            <div className="flex items-center justify-between rounded-lg bg-card border border-border p-3">
              <div className="flex items-center gap-2">
                <Image
                  src={vbuckIcon}
                  alt="MxN Points"
                  width={24}
                  height={24}
                />
                <span className="font-bold text-foreground">{price.toLocaleString()} MxN Points</span>
              </div>
              {isLoggedIn && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Image
                    src="/logomxnpoints.png"
                    alt="MxN Points"
                    width={20}
                    height={20}
                    className="rounded"
                  />
{t("redeem.yourBalance")}: <span className="font-bold text-yellow-500">{balanceLoading ? '...' : vbucksBalance} MxN Points</span>
                </div>
              )}
            </div>

            {/* Fortnite Username */}
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("redeem.fortniteUser")}
                </label>
                <Input
                  placeholder={t("redeem.fortnitePlaceholder")}
                  value={fortniteUsername}
                  onChange={(e) => setFortniteUsername(e.target.value)}
                  className="bg-secondary"
                />
                {!fortniteUsername.trim() && isLoggedIn && (
                  <p className="text-sm text-red-500 mt-1">{t("redeem.usernameRequired")}</p>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>{t("redeem.loginToRedeem")}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            {isLoggedIn ? (
              <Button
                onClick={handleRedeem}
                disabled={!canAfford || !fortniteUsername.trim() || redeeming}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                <Gift className="mr-2 h-4 w-4" />
                {redeeming ? t("redeem.processing") : `${t("redeem.title")} ${price.toLocaleString()} MxN Points`}
              </Button>
              ) : (
              <Button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {t("profile.login")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
