"use client";

import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, localeNames, localeFlags, type Locale } from "@/lib/i18n";

const locales: Locale[] = ["es", "en", "de", "ru"];

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
          aria-label="Change language"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{localeFlags[locale]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={locale === loc ? "bg-secondary font-semibold" : ""}
          >
            <span className="mr-2 text-xs font-bold text-muted-foreground">
              {localeFlags[loc]}
            </span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
