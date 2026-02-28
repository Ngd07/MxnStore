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
import { Store } from "lucide-react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("all");

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
    const raritySet = new Set<string>();
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <ProfilePanel />
            <Image
              src="/logo.png"
              alt="MxNStore"
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
            <div>
              <h1 className="text-lg font-bold text-foreground">
                MxNStore
              </h1>
              {formattedDate && (
                <p className="text-xs text-muted-foreground capitalize">
                  {formattedDate}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <LanguageSwitcher />
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

        {!isLoading && !error && sections.length === 0 && (
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
            {sections.map(([sectionName, sectionEntries], sectionIndex) => (
              <ShopSection
                key={sectionName}
                name={sectionName}
                entries={sectionEntries}
                vbuckIcon={vbuckIcon}
                isFirstSection={sectionIndex === 0}
              />
            ))}
          </div>
        )}
      </main>

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
