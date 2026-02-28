"use client";

import Image from "next/image";
import type { ShopEntry } from "@/lib/types";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
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
import { createClient } from "@supabase/supabase-js";

const MXN_TO_USD = 0.0045;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ShopItemCardProps {
  entry: ShopEntry;
  vbuckIcon: string;
  priority?: boolean;
}

const rarityGradients: Record<string, string> = {
  legendary:
    "from-amber-600/40 via-amber-500/20 to-amber-900/40",
  epic: "from-fuchsia-600/40 via-fuchsia-500/20 to-fuchsia-900/40",
  rare: "from-sky-600/40 via-sky-500/20 to-sky-900/40",
  uncommon:
    "from-emerald-600/40 via-emerald-500/20 to-emerald-900/40",
  common: "from-zinc-600/40 via-zinc-500/20 to-zinc-900/40",
  gaminglegends:
    "from-indigo-600/40 via-indigo-500/20 to-indigo-900/40",
  marvel: "from-red-600/40 via-red-500/20 to-red-900/40",
  dc: "from-blue-600/40 via-blue-500/20 to-blue-900/40",
  icon: "from-teal-600/40 via-teal-500/20 to-teal-900/40",
  starwars:
    "from-yellow-600/40 via-yellow-500/20 to-yellow-900/40",
  shadow:
    "from-neutral-600/40 via-neutral-500/20 to-neutral-900/40",
  slurp: "from-cyan-600/40 via-cyan-500/20 to-cyan-900/40",
  frozen: "from-sky-400/40 via-sky-300/20 to-sky-600/40",
  lava: "from-orange-600/40 via-orange-500/20 to-orange-900/40",
  dark: "from-fuchsia-800/40 via-fuchsia-600/20 to-fuchsia-900/40",
};

const rarityBorders: Record<string, string> = {
  legendary: "border-amber-500/50",
  epic: "border-fuchsia-500/50",
  rare: "border-sky-500/50",
  uncommon: "border-emerald-500/50",
  common: "border-zinc-500/50",
  gaminglegends: "border-indigo-500/50",
  marvel: "border-red-500/50",
  dc: "border-blue-500/50",
  icon: "border-teal-500/50",
  starwars: "border-yellow-500/50",
  shadow: "border-neutral-500/50",
  slurp: "border-cyan-500/50",
  frozen: "border-sky-300/50",
  lava: "border-orange-500/50",
  dark: "border-fuchsia-700/50",
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
  // Try renderImages first
  if (
    entry.newDisplayAsset?.renderImages &&
    entry.newDisplayAsset.renderImages.length > 0
  ) {
    const img = entry.newDisplayAsset.renderImages[0].image;
    if (img && img.includes('http')) return img;
  }

  // Try materialInstances images
  if (entry.newDisplayAsset?.materialInstances) {
    for (const mat of entry.newDisplayAsset.materialInstances) {
      if (mat.images) {
        const img = mat.images['featured'] || mat.images['icon'] || mat.images['smallIcon'] || mat.images['Background'] || Object.values(mat.images)[0];
        if (img && img.includes('http')) return img;
      }
    }
  }

  if (entry.brItems && entry.brItems.length > 0) {
    const item = entry.brItems[0];
    const img = item.images.featured || item.images.icon || item.images.smallIcon;
    if (img && img.includes('http')) return img;
  }

  // Try bundle image
  if (entry.bundle?.image) {
    const img = entry.bundle.image;
    if (img && img.includes('http')) return img;
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
  const [imageError, setImageError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [fortniteUsername, setFortniteUsername] = useState("");
  const [redeemMessage, setRedeemMessage] = useState("");
  const [vbucksBalance, setVbucksBalance] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const { t } = useI18n();
  
  const image = getItemImage(entry);
  const name = getItemName(entry);
  const type = getItemType(entry);
  const rarity = getItemRarity(entry);
  const description = getItemDescription(entry);
  const price = entry.finalPrice;
  const gradient =
    rarityGradients[rarity] ||
    "from-zinc-600/40 via-zinc-500/20 to-zinc-900/40";
  const borderColor = rarityBorders[rarity] || "border-zinc-500/50";
  const isDiscounted = entry.finalPrice < entry.regularPrice;

  const fetchBalance = async () => {
    setBalanceLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('mxn_points')
        .eq('id', user.id)
        .single();
      if (data) {
        setVbucksBalance(data.mxn_points);
      }
    }
    setBalanceLoading(false);
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // Refresh balance when dialog opens
  useEffect(() => {
    if (showDialog) {
      fetchBalance();
    }
  }, [showDialog]);

  const handleRedeem = async () => {
    if (!fortniteUsername.trim()) {
      setRedeemMessage("Ingresa tu usuario de Fortnite");
      return;
    }
    if (vbucksBalance < price) {
      setRedeemMessage("No tienes suficientes MxN Points");
      return;
    }
    setRedeemMessage("Canjeando...");
    
    // Get fresh user data
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      setRedeemMessage("Error: No estas logueado");
      return;
    }
    
    // Deduct MxN Points from balance
    const { error } = await supabase
      .from('profiles')
      .update({ mxn_points: vbucksBalance - price })
      .eq('id', currentUser.id);
    
    if (error) {
      console.error('Error deducting points:', error);
      setRedeemMessage("Error al canjear. Intenta de nuevo.");
      return;
    }

    // Save transaction
    try {
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: currentUser.id,
        type: 'redeem',
        amount: price,
        skin_name: name,
        skin_price: price,
        fortnite_username: fortniteUsername,
        status: 'pending'
      });
      if (txError) {
        console.error('Error saving transaction:', txError);
      } else {
        console.log('Transaction saved successfully!');
      }
    } catch (txErr) {
      console.error('Transaction error:', txErr);
    }
    
    setRedeemMessage("¡Canjeado exitosamente! Te contactaremos en WhatsApp");
    setVbucksBalance(vbucksBalance - price);
    setFortniteUsername("");
    setTimeout(() => {
      setShowDialog(false);
      setRedeemMessage("");
    }, 3000);
  };

  const canAfford = vbucksBalance >= price;
  const isLoggedIn = !!user;

  return (
    <>
      <div
        className={`group relative flex flex-col overflow-hidden rounded-xl border ${borderColor} bg-card transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/30 cursor-pointer`}
        onClick={() => setShowDialog(true)}
      >
        {/* Banner (New, etc.) */}
        {entry.banner && (
          <div className="absolute top-2 left-2 z-10">
            <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              {entry.banner.value}
            </span>
          </div>
        )}

        {/* Image section */}
        <div
          className={`relative aspect-square w-full overflow-hidden bg-gradient-to-br ${gradient}`}
        >
          {image && !imageError ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
              priority={priority}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="text-3xl font-bold opacity-30">?</span>
            </div>
          )}
          
          
          {/* V-Bucks price badge */}
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-blue-600/80 px-2 py-1">
            <span className="text-[10px] font-bold text-white">V-Bucks: {entry.finalPrice}</span>
          </div>
        </div>

        {/* Info section */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {type}
          </p>
          <h3 className="text-sm font-bold leading-tight text-foreground line-clamp-2 text-balance">
            {name}
          </h3>

          {/* Rarity badge */}
          <span className="mt-0.5 text-[10px] font-medium capitalize text-muted-foreground">
            {t(`rarity.${rarity}`) !== `rarity.${rarity}` ? t(`rarity.${rarity}`) : (rarityLabels[rarity] || rarity)}
          </span>

          {/* Price */}
          <div className="mt-auto flex flex-col gap-0.5 pt-2">
            <div className="flex items-center gap-1.5">
              <Image
                src="/logomxnpoints.png"
                alt="MxN Points"
                width={16}
                height={16}
                className="flex-shrink-0"
              />
              {isDiscounted ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground line-through">
                    {entry.regularPrice.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-yellow-500">
                    {entry.finalPrice.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-bold text-yellow-500">
                  {entry.finalPrice.toLocaleString()} MxN
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground pl-[22px]">
              {"$"}{(entry.finalPrice * MXN_TO_USD).toFixed(2)} USD
            </span>
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
                  Tu saldo: <span className="font-bold text-yellow-500">{balanceLoading ? '...' : vbucksBalance} MxN Points</span>
                </div>
              )}
            </div>

            {/* Fortnite Username */}
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Usuario de Fortnite
                </label>
                <Input
                  placeholder="Tu nombre de usuario en Fortnite"
                  value={fortniteUsername}
                  onChange={(e) => setFortniteUsername(e.target.value)}
                  className="bg-secondary"
                />
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>Inicia sesión para canjear este item</p>
              </div>
            )}
          </div>

          <DialogFooter>
            {redeemMessage && (
              <p className={`text-sm text-center w-full mb-2 ${redeemMessage.includes("Error") || redeemMessage.includes("No tienes") ? "text-red-500" : "text-green-500"}`}>
                {redeemMessage}
              </p>
            )}
            {isLoggedIn ? (
              <Button
                onClick={handleRedeem}
                disabled={!canAfford}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                <Gift className="mr-2 h-4 w-4" />
                Canjear {price.toLocaleString()} MxN Points
              </Button>
            ) : (
              <Button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Iniciar sesión
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
