"use client";

import { useI18n } from "@/lib/i18n";

interface RarityFilterProps {
  rarities: string[];
  selected: string;
  onChange: (rarity: string) => void;
}

const rarityColors: Record<string, string> = {
  legendary: "bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-300 border-amber-500/50 hover:from-amber-500/40 hover:to-orange-500/40",
  epic: "bg-gradient-to-r from-fuchsia-500/30 to-purple-500/30 text-fuchsia-300 border-fuchsia-500/50 hover:from-fuchsia-500/40 hover:to-purple-500/40",
  rare: "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300 border-blue-500/50 hover:from-blue-500/40 hover:to-cyan-500/40",
  uncommon: "bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border-green-500/50 hover:from-green-500/40 hover:to-emerald-500/40",
  common: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40 hover:bg-zinc-500/30",
  gaminglegends: "bg-gradient-to-r from-indigo-500/30 to-violet-500/30 text-indigo-300 border-indigo-500/50 hover:from-indigo-500/40 hover:to-violet-500/40",
  marvel: "bg-gradient-to-r from-red-500/30 to-orange-500/30 text-red-300 border-red-500/50 hover:from-red-500/40 hover:to-orange-500/40",
  dc: "bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-300 border-blue-500/50 hover:from-blue-500/40 hover:to-indigo-500/40",
  icon: "bg-gradient-to-r from-teal-500/30 to-cyan-500/30 text-teal-300 border-teal-500/50 hover:from-teal-500/40 hover:to-cyan-500/40",
  starwars: "bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 border-yellow-500/50 hover:from-yellow-500/40 hover:to-amber-500/40",
  shadow: "bg-gradient-to-r from-gray-600/30 to-neutral-700/30 text-gray-300 border-gray-500/50 hover:from-gray-600/40 hover:to-neutral-700/40",
  slurp: "bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border-cyan-500/50 hover:from-cyan-500/40 hover:to-blue-500/40",
  frozen: "bg-gradient-to-r from-sky-300/30 to-blue-400/30 text-sky-200 border-sky-300/50 hover:from-sky-300/40 hover:to-blue-400/40",
  lava: "bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-300 border-orange-500/50 hover:from-orange-500/40 hover:to-red-500/40",
  dark: "bg-gradient-to-r from-fuchsia-600/30 to-pink-700/30 text-fuchsia-300 border-fuchsia-600/50 hover:from-fuchsia-600/40 hover:to-pink-700/40",
  accounts: "bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border-green-500/50 hover:from-green-500/40 hover:to-emerald-500/40",
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
    if (rarity === 'accounts') {
      return t("rarity.accounts");
    }
    const key = `rarity.${rarity}`;
    const translated = t(key);
    return translated !== key ? translated : (rarityLabels[rarity] || rarity);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
          selected === "all"
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg shadow-purple-500/30"
            : "bg-secondary/80 text-secondary-foreground border-border/50 backdrop-blur-sm hover:bg-secondary hover:border-border"
        }`}
      >
        {t("filter.all")}
      </button>
      {rarities.map((rarity) => (
        <button
          key={rarity}
          onClick={() => onChange(rarity)}
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 ${
            selected === rarity
              ? (rarityColors[rarity] || "bg-secondary text-secondary-foreground border-border") +
                " shadow-lg backdrop-blur-sm"
              : "bg-secondary/60 text-secondary-foreground border-border/50 backdrop-blur-sm hover:bg-secondary hover:border-border"
          }`}
        >
          {getLabel(rarity)}
        </button>
      ))}
    </div>
  );
}
