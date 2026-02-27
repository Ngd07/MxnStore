"use client";

import { Search, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ShopSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ShopSearch({ value, onChange }: ShopSearchProps) {
  const { t } = useI18n();
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder={t("shop.searchPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-secondary pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t("search.clear")}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
