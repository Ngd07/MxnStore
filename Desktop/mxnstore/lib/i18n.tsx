"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Locale = "es" | "en" | "de" | "ru";

export const localeNames: Record<Locale, string> = {
  es: "Espanol",
  en: "English",
  de: "Deutsch",
  ru: "Pyccкий",
};

export const localeFlags: Record<Locale, string> = {
  es: "ES",
  en: "EN",
  de: "DE",
  ru: "RU",
};

const translations: Record<Locale, Record<string, string>> = {
  es: {
    "shop.title": "Tienda de Fortnite",
    "shop.refresh": "Actualizar",
    "shop.searchPlaceholder": "Buscar items...",
    "shop.itemsCount": "{filtered} de {total} items",
    "shop.errorTitle": "Error al cargar la tienda",
    "shop.errorDesc": "No se pudo conectar con el servidor de Fortnite.",
    "shop.retry": "Reintentar",
    "shop.noResults": "No se encontraron items",
    "shop.noResultsDesc": "Intenta cambiar los filtros o la busqueda.",
    "shop.footer": "Los datos de la tienda se obtienen de la API publica de Fortnite. No afiliado con Epic Games.",
    "shop.item": "item",
    "shop.items": "items",
    "filter.all": "Todos",
    "rarity.legendary": "Legendario",
    "rarity.epic": "Epico",
    "rarity.rare": "Raro",
    "rarity.uncommon": "Poco Comun",
    "rarity.common": "Comun",
    "rarity.gaminglegends": "Gaming Legends",
    "rarity.marvel": "Marvel",
    "rarity.dc": "DC",
    "rarity.icon": "Icon Series",
    "rarity.starwars": "Star Wars",
    "rarity.shadow": "Shadow",
    "rarity.slurp": "Slurp",
    "rarity.frozen": "Frozen",
    "rarity.lava": "Lava",
    "rarity.dark": "Dark",
    "profile.title": "Perfil",
    "profile.settings": "Configuraciones",
    "profile.email": "Email para notificaciones",
    "profile.emailPlaceholder": "tu@correo.com",
    "profile.emailSave": "Guardar",
    "profile.emailSaved": "Guardado",
    "profile.notifications": "Notificaciones",
    "profile.notificationsDesc": "Recibe alertas de items nuevos",
    "profile.theme": "Tema oscuro",
    "profile.themeDesc": "Cambiar entre modo claro y oscuro",
    "profile.language": "Idioma",
    "search.clear": "Limpiar busqueda",
  },
  en: {
    "shop.title": "Fortnite Shop",
    "shop.refresh": "Refresh",
    "shop.searchPlaceholder": "Search items...",
    "shop.itemsCount": "{filtered} of {total} items",
    "shop.errorTitle": "Error loading shop",
    "shop.errorDesc": "Could not connect to Fortnite server.",
    "shop.retry": "Retry",
    "shop.noResults": "No items found",
    "shop.noResultsDesc": "Try changing the filters or search.",
    "shop.footer": "Shop data obtained from the public Fortnite API. Not affiliated with Epic Games.",
    "shop.item": "item",
    "shop.items": "items",
    "filter.all": "All",
    "rarity.legendary": "Legendary",
    "rarity.epic": "Epic",
    "rarity.rare": "Rare",
    "rarity.uncommon": "Uncommon",
    "rarity.common": "Common",
    "rarity.gaminglegends": "Gaming Legends",
    "rarity.marvel": "Marvel",
    "rarity.dc": "DC",
    "rarity.icon": "Icon Series",
    "rarity.starwars": "Star Wars",
    "rarity.shadow": "Shadow",
    "rarity.slurp": "Slurp",
    "rarity.frozen": "Frozen",
    "rarity.lava": "Lava",
    "rarity.dark": "Dark",
    "profile.title": "Profile",
    "profile.settings": "Settings",
    "profile.email": "Email for notifications",
    "profile.emailPlaceholder": "your@email.com",
    "profile.emailSave": "Save",
    "profile.emailSaved": "Saved",
    "profile.notifications": "Notifications",
    "profile.notificationsDesc": "Receive alerts for new items",
    "profile.theme": "Dark mode",
    "profile.themeDesc": "Switch between light and dark mode",
    "profile.language": "Language",
    "search.clear": "Clear search",
  },
  de: {
    "shop.title": "Fortnite Shop",
    "shop.refresh": "Aktualisieren",
    "shop.searchPlaceholder": "Items suchen...",
    "shop.itemsCount": "{filtered} von {total} Items",
    "shop.errorTitle": "Fehler beim Laden des Shops",
    "shop.errorDesc": "Verbindung zum Fortnite-Server fehlgeschlagen.",
    "shop.retry": "Erneut versuchen",
    "shop.noResults": "Keine Items gefunden",
    "shop.noResultsDesc": "Versuche die Filter oder Suche zu andern.",
    "shop.footer": "Shopdaten stammen aus der offentlichen Fortnite-API. Nicht mit Epic Games verbunden.",
    "shop.item": "Item",
    "shop.items": "Items",
    "filter.all": "Alle",
    "rarity.legendary": "Legendar",
    "rarity.epic": "Episch",
    "rarity.rare": "Selten",
    "rarity.uncommon": "Ungewohnlich",
    "rarity.common": "Gewohnlich",
    "rarity.gaminglegends": "Gaming Legends",
    "rarity.marvel": "Marvel",
    "rarity.dc": "DC",
    "rarity.icon": "Icon Series",
    "rarity.starwars": "Star Wars",
    "rarity.shadow": "Shadow",
    "rarity.slurp": "Slurp",
    "rarity.frozen": "Frozen",
    "rarity.lava": "Lava",
    "rarity.dark": "Dark",
    "profile.title": "Profil",
    "profile.settings": "Einstellungen",
    "profile.email": "E-Mail fur Benachrichtigungen",
    "profile.emailPlaceholder": "deine@email.de",
    "profile.emailSave": "Speichern",
    "profile.emailSaved": "Gespeichert",
    "profile.notifications": "Benachrichtigungen",
    "profile.notificationsDesc": "Benachrichtigungen fur neue Items erhalten",
    "profile.theme": "Dunkler Modus",
    "profile.themeDesc": "Zwischen hellem und dunklem Modus wechseln",
    "profile.language": "Sprache",
    "search.clear": "Suche loschen",
  },
  ru: {
    "shop.title": "Maгaзин Fortnite",
    "shop.refresh": "Обновить",
    "shop.searchPlaceholder": "Поиск предметов...",
    "shop.itemsCount": "{filtered} из {total} предметов",
    "shop.errorTitle": "Ошибка загрузки магазина",
    "shop.errorDesc": "Не удалось подключиться к серверу Fortnite.",
    "shop.retry": "Повторить",
    "shop.noResults": "Предметы не найдены",
    "shop.noResultsDesc": "Попробуйте изменить фильтры или поиск.",
    "shop.footer": "Данные магазина получены из публичного API Fortnite. Не связано с Epic Games.",
    "shop.item": "предмет",
    "shop.items": "предметов",
    "filter.all": "Bce",
    "rarity.legendary": "Легендарный",
    "rarity.epic": "Эпический",
    "rarity.rare": "Редкий",
    "rarity.uncommon": "Необычный",
    "rarity.common": "Обычный",
    "rarity.gaminglegends": "Gaming Legends",
    "rarity.marvel": "Marvel",
    "rarity.dc": "DC",
    "rarity.icon": "Icon Series",
    "rarity.starwars": "Star Wars",
    "rarity.shadow": "Shadow",
    "rarity.slurp": "Slurp",
    "rarity.frozen": "Frozen",
    "rarity.lava": "Lava",
    "rarity.dark": "Dark",
    "profile.title": "Профиль",
    "profile.settings": "Настройки",
    "profile.email": "Email для уведомлений",
    "profile.emailPlaceholder": "ваш@email.com",
    "profile.emailSave": "Сохранить",
    "profile.emailSaved": "Сохранено",
    "profile.notifications": "Уведомления",
    "profile.notificationsDesc": "Получать уведомления о новых предметах",
    "profile.theme": "Темная тема",
    "profile.themeDesc": "Переключение между светлой и темной темой",
    "profile.language": "Язык",
    "search.clear": "Очистить поиск",
  },
};

const dateLocales: Record<Locale, string> = {
  es: "es-ES",
  en: "en-US",
  de: "de-DE",
  ru: "ru-RU",
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dateLocale: string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let text = translations[locale]?.[key] || translations.es[key] || key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dateLocale: dateLocales[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
