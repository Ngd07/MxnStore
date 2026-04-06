"use client";

import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
      <BackToTop />
    </>
  );
}
