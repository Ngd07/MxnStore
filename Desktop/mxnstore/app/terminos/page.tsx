import { ThemeProvider } from "@/lib/theme";
import { LanguageSwitcher } from "@/components/language-switcher";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones - MxNStore",
  description: "Términos y Condiciones de MxNStore",
};

export default function TerminosPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="MxNStore"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-foreground">MxNStore</span>
            </Link>
            <h1 className="text-lg font-bold text-foreground">Términos y Condiciones</h1>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">
            <p className="text-muted-foreground mb-6">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">1. Aceptación de Términos</h2>
              <p className="text-muted-foreground">
                Al acceder y utilizar MxNStore, aceptas vincularte a estos Términos y Condiciones. 
                Si no estás de acuerdo con alguno de estos términos, no utilices nuestro servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">2. Servicio</h2>
<p className="text-muted-foreground">
                MxNStore ofrece una plataforma para la compra de skins, cuentas y contenido digital relacionado con Fortnite. 
                Nos reservamos el derecho de modificar, suspender o interrumpir cualquier aspecto del servicio en cualquier momento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">3. Cuenta de Usuario</h2>
              <p className="text-muted-foreground">
                Para realizar compras, debes crear una cuenta. Eres responsable de mantener la confidencialidad de tu cuenta 
                y contraseña. Debes tener al menos 13 años de edad para utilizar nuestro servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">4. Compras y Pagos</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Todos los precios se indican en USD</li>
                <li>Los pagos se procesan a través de proveedores de pago terceros seguros</li>
                <li>Una vez completada la compra, no se ofrece reembolso excepto según nuestra Política de Reembolsos</li>
                <li>Nos reservamos el derecho de rechazar cualquier orden</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">5. Propiedad Intelectual</h2>
              <p className="text-muted-foreground">
                Todo el contenido en MxNStore, incluyendo textos, gráficos, logotipos e imágenes, son propiedad de MxNStore 
                o sus proveedores de contenido y están protegidos por leyes de derechos de autor.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">6. Uso Prohibido</h2>
              <p className="text-muted-foreground">
                No puedes utilizar nuestro servicio para cualquier propósito ilegal o no autorizado. 
                No violarás ninguna ley aplicable en tu jurisdicción.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">7. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground">
                MxNStore no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del uso 
                de nuestro servicio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4">8. Contacto</h2>
              <p className="text-muted-foreground">
                Si tienes alguna pregunta sobre estos Términos, contáctanos a través de nuestro servidor de Discord.
              </p>
            </section>
        </main>
      </div>
    </ThemeProvider>
  );
}