"use client";

import { ShopItemCard } from "@/components/shop-item-card";
import type { ShopEntry } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

interface ShopSectionProps {
  name: string;
  entries: ShopEntry[];
  vbuckIcon: string;
  isFirstSection?: boolean;
}

export function ShopSection({ name, entries, vbuckIcon, isFirstSection = false }: ShopSectionProps) {
  const { t } = useI18n();
  if (entries.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{name}</h2>
        <span className="rounded-full bg-secondary/80 backdrop-blur-sm px-3 py-0.5 text-xs font-medium text-muted-foreground border border-border/50">
          {entries.length} {entries.length === 1 ? t("shop.item") : t("shop.items")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {entries.map((entry, index) => (
          <div
            key={entry.offerId}
            className="animate-fade-in-up opacity-0"
            style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
          >
            <ShopItemCard
              entry={entry}
              vbuckIcon={vbuckIcon}
              priority={isFirstSection && index < 6}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
