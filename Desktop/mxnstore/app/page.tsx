"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/lib/theme";
import { ShoppingBag, UserPlus, Coins, Zap, Shield, Clock, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Entrega Instantánea",
      description: "Recibe tu skin o V-Bucks al instante después de la compra.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "100% Seguro",
      description: "Transacciones seguras y protegidas en todo momento.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Soporte 24/7",
      description: "Estamos disponibles siempre para ayudarte.",
    },
    {
      icon: <Image src="/logo.png" alt="Discord" width={24} height={24} className="h-6 w-6" />,
      title: "Discord Activo",
      description: "Comunidad y soporte directo en Discord.",
    },
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="MxNStore"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="font-bold text-lg">MxNStore</span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full blur-xl opacity-30" />
              <Image
                src="/logo.png"
                alt="MxNStore"
                width={100}
                height={100}
                className="relative rounded-2xl"
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              MxNStore
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tu tienda de confianza para skins de Fortnite. 
              Compra rápida, segura y con soporte 24/7.
            </p>

            {/* Main CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => router.push("/shop")}
                className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
              >
                <ShoppingBag className="h-5 w-5" />
                Ver Tienda
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={() => router.push("/add-friend")}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors font-semibold"
              >
                <UserPlus className="h-5 w-5" />
                Agregar Bots
              </button>
              
              <button
                onClick={() => router.push("/buy-vbucks")}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors font-semibold text-yellow-400"
              >
                <Coins className="h-5 w-5" />
                Comprar MxN Points
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Shop Actualizado
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Envío Instantáneo
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Soporte 24/7
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-bold text-center mb-10">¿Por qué elegirnos?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors group"
                >
                  <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 px-4 bg-card/30">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-10">¿Cómo funciona?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-semibold mb-2">Elige tu skin</h3>
                <p className="text-sm text-muted-foreground">Navega por nuestra tienda y selecciona la skin que quieras.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-semibold mb-2">Realiza el pago</h3>
                <p className="text-sm text-muted-foreground">Paga de forma segura con crypto o métodos disponibles.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-semibold mb-2">Recibe tu skin</h3>
                <p className="text-sm text-muted-foreground">Recibe tu skin al instante en tu cuenta de Fortnite.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ThemeProvider>
  );
}