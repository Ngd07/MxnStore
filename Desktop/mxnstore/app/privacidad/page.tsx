import { ThemeProvider } from "@/lib/theme";
import { Footer } from "@/components/footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";

export const metadata = {
  title: "Política de Privacidad - MxNStore",
  description: "Política de Privacidad de MxNStore",
};

export default function PrivacidadPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
            <h1 className="text-lg font-bold text-foreground">Política de Privacidad</h1>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">
            <p className="text-muted-foreground mb-6">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">1. Introducción</h2>
              <p className="text-muted-foreground">
                En MxNStore, valoramos tu privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos 
                tu información personal.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">2. Información que Recopilamos</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Información de cuenta:</strong> Email, nombre de usuario de Epic Games</li>
                <li><strong>Información de pago:</strong> Procesada por proveedores de pago terceros (no almacenamos datos de tarjeta)</li>
                <li><strong>Datos de uso:</strong> Cookies, dirección IP, tipo de navegador</li>
                <li><strong>Comunicación:</strong> Mensajes enviados a través de nuestro sistema de soporte</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">3. Cómo Usamos tu Información</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Procesar tus compras y entregar productos</li>
                <li>Comunicarte sobre el estado de tu orden</li>
                <li>Brindar soporte al cliente</li>
                <li>Mejorar nuestros servicios</li>
                <li>Prevenir fraude y actividades ilegales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">4. Protección de Datos</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, 
                modificación, divulgación o destrucción. Usamos encriptación SSL para todas las transacciones.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">5. Compartir Información</h2>
              <p className="text-muted-foreground">
                No vendemos tu información personal. Compartimos datos solo con:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                <li><strong>Proveedores de pago:</strong> Para procesar transacciones</li>
                <li><strong>Servicios de entrega:</strong> Para entregar productos digitales</li>
                <li><strong>Requisitos legales:</strong> Cuando sea requerido por ley</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">6. Cookies</h2>
              <p className="text-muted-foreground">
                Usamos cookies para mejorar tu experiencia. Puedes configurar tu navegador para rechazar cookies, aunque algunas funciones 
                del sitio pueden no funcionar correctamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">7. Tus Derechos</h2>
              <p className="text-muted-foreground">
                Tienes derecho a: acceder a tu información, corregir datos incorrectos, solicitar eliminación u oposición al procesamiento. 
                Contáctanos a través de Discord para ejercer estos derechos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">8. Menores de Edad</h2>
              <p className="text-muted-foreground">
                Nuestro servicio no está diseñado para menores de 13 años. No recopilamos intencionalmente 
                información de menores de 13 años.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">9. Cambios a esta Política</h2>
              <p className="text-muted-foreground">
                Podemos actualizar esta política periódicamente. Notificaremos cambios importantes publicándolos en esta página.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">10. Contacto</h2>
              <p className="text-muted-foreground">
                Si tienes preguntas sobre esta Política de Privacidad, contáctanos a través de nuestro servidor de Discord.
              </p>
            </section>
          </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}