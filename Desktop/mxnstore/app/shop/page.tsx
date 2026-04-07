import { ThemeProvider } from "@/lib/theme";
import { ShopClient } from "@/components/shop-client";

export default function ShopPage() {
  return (
    <ThemeProvider>
      <ShopClient />
    </ThemeProvider>
  );
}
