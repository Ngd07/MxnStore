import { ThemeProvider } from "@/lib/theme";
import { ShopClient } from "@/components/shop-client";

export default function Home() {
  return (
    <ThemeProvider>
      <ShopClient />
    </ThemeProvider>
  );
}
