"use client";

import { useI18n } from "@/lib/i18n";

interface RarityFilterProps {
  rarities: string[];
  selected: string;
  onChange: (rarity: string) => void;
}

const rarityColors: Record<string, string> = {
  legendary: "bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30",
  epic: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40 hover:bg-fuchsia-500/30",
  rare: "bg-sky-500/20 text-sky-400 border-sky-500/40 hover:bg-sky-500/30",
  uncommon: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30",
  common: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40 hover:bg-zinc-500/30",
  gaminglegends: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40 hover:bg-indigo-500/30",
  marvel: "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30",
  dc: "bg-blue-500/20 text-blue-400 border-blue-500/40 hover:bg-blue-500/30",
  icon: "bg-teal-500/20 text-teal-400 border-teal-500/40 hover:bg-teal-500/30",
  starwars: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/30",
  shadow: "bg-neutral-500/20 text-neutral-400 border-neutral-500/40 hover:bg-neutral-500/30",
  slurp: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30",
  frozen: "bg-sky-300/20 text-sky-300 border-sky-300/40 hover:bg-sky-300/30",
  lava: "bg-orange-500/20 text-orange-400 border-orange-500/40 hover:bg-orange-500/30",
  dark: "bg-fuchsia-700/20 text-fuchsia-300 border-fuchsia-700/40 hover:bg-fuchsia-700/30",
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

export function RarityFilter({ rarities, selected, onChange }: RarityFilterProps) {
  const { t } = useI18n();

  const getLabel = (rarity: string) => {
    const key = `rarity.${rarity}`;
    const translated = t(key);
    return translated !== key ? translated : (rarityLabels[rarity] || rarity);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
          selected === "all"
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
        }`}
      >
        {t("filter.all")}
      </button>
      {rarities.map((rarity) => (
        <button
          key={rarity}
          onClick={() => onChange(rarity)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
            selected === rarity
              ? (rarityColors[rarity] || "bg-secondary text-secondary-foreground border-border") +
                " ring-1 ring-foreground/20"
              : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
          }`}
        >
          {getLabel(rarity)}
        </button>
      ))}
    </div>
  );
}
