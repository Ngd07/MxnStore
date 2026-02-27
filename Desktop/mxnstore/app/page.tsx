import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { ShopClient } from "@/components/shop-client";

export default function Home() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ShopClient />
      </ThemeProvider>
    </I18nProvider>
  );
}
