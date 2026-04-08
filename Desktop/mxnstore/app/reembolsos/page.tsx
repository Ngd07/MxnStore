import { ThemeProvider } from "@/lib/theme";
import { RotateCcw, AlertCircle, CheckCircle } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Política de Reembolsos - MxNStore",
  description: "Política de Reembolsos de MxNStore",
};

export default function ReembolsosPage() {
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
            <h1 className="text-lg font-bold text-foreground">Política de Reembolsos</h1>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-muted-foreground mb-6">Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
            <p className="text-blue-500 font-medium">
              En MxNStore striveamos ofrecer el mejor servicio posible. Lee esta política para entender cuándo y cómo puedes solicitar un reembolso.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Reembolsos Garantizados
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Producto no entregado:</strong> Si no recibes tu producto dentro de las 24 horas, contáctanos para un reembolso completo</li>
              <li><strong>Producto defectuoso:</strong> Si el producto no funciona, lo investigaremos y ofreceremos reemplazo o reembolso</li>
              <li><strong>Error en el nombre de usuario:</strong> Si proporcionaste el nombre correcto pero no se entregó, reintentaremos la entrega sin costo adicional</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Reembolsos Case-by-Case
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Cambio de opinión:</strong> No se ofrecen reembolsos por cambio de opinión después de la compra</li>
              <li><strong>Cuenta no encontrada:</strong> Si el nombre de Epic Games proporcionado no existe, intentaremos contactarte</li>
              <li><strong>Problemas con el cliente:</strong> Casos excepcionales serán evaluados por nuestro equipo</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-red-500" />
              No Reembolsable
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Entrega exitosa:</strong> Una vez entregado el producto, no se ofrecen reembolsos</li>
              <li><strong>Skin o Cuenta comprada y canjeada:</strong> Las ventas de contenido digital son finales</li>
              <li><strong>Información incorrecta proporcionada:</strong> Si proporcionaste mal tu nombre de usuario, no es nuestro error</li>
              <li><strong>Violación de términos de Epic Games:</strong> No somos responsables si tu cuenta es penalizada por Epic</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Cómo Solicitar un Reembolso</h2>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
              <li>Únete a nuestro servidor de Discord</li>
              <li>Abre un ticket de soporte</li>
              <li>Proporciona tu número de orden (recibido por email)</li>
              <li>Describe el problema brevemente</li>
              <li>Nuestro equipo responderá dentro de 24 horas</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Tiempo de Procesamiento</h2>
            <p className="text-muted-foreground">
              Los reembolsos aprobados se procesan en 5-10 días hábiles. El tiempo exacto varía según tu proveedor de pago.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Notas Importantes</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>No somos responsables de decisiones de Epic Games sobre cuentas</li>
              <li>Las skins o cuentas pueden ser bloqueadas por métodos de compra no autorizados</li>
              <li>Recomendamos usar métodos de pago propios para evitar problemas</li>
              <li>Al comprar, aceptas estos términos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Contacto</h2>
            <p className="text-muted-foreground">
              Para solicitudes de reembolso, contáctanos a través de nuestro servidor de Discord. ¡Estamos aquí para ayudar!
            </p>
          </section>
        </main>
      </div>
    </ThemeProvider>
  );
}