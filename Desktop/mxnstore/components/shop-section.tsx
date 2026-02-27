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
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-foreground">{name}</h2>
        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {entries.length} {entries.length === 1 ? t("shop.item") : t("shop.items")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {entries.map((entry, index) => (
          <ShopItemCard
            key={entry.offerId}
            entry={entry}
            vbuckIcon={vbuckIcon}
            priority={isFirstSection && index < 6}
          />
        ))}
      </div>
    </section>
  );
}
