"use client";

import { MessageCircle, Shield, CreditCard, Headphones } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="relative z-10 mt-16 border-t border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Trust badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
            <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Compra Segura</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
            <CreditCard className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Pagos Rápidos</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
            <Headphones className="h-5 w-5 text-purple-500 flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Soporte 24/7</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
            <MessageCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
            <span className="text-xs text-muted-foreground">Discord</span>
          </div>
        </div>

        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-2">MxNStore</h3>
            <p className="text-sm text-muted-foreground">
              Tu tienda de confianza para skins de Fortnite. 
              Rápido, seguro y con soporte 24/7.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://discord.gg/nKs2jM7PNJ"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-indigo-500" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3">Enlaces</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/buy-vbucks" className="hover:text-foreground transition-colors">
                  Comprar MxN Points
                </Link>
              </li>
              <li>
                <Link href="/add-friend" className="hover:text-foreground transition-colors">
                  Agregar Bots
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Mi Cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Términos y Condiciones
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Política de Privacidad
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Política de Reembolso
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MxNStore. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
