'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, ArrowLeft, Copy, Check, MessageCircle } from 'lucide-react'
import Image from 'next/image'

const PACKAGES = [
  { mxn: 1000, price: 8.99, popular: false },
  { mxn: 2800, price: 22.99, popular: true },
  { mxn: 5000, price: 37.99, popular: false },
  { mxn: 10000, price: 69.99, popular: false },
]

export default function BuyVbucksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [])

  const handleCopyCVU = () => {
    navigator.clipboard.writeText('0000003100058974123456')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePaymentConfirm = async () => {
    if (!selectedPackage || !user) return

    try {
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'purchase',
        amount: selectedPackage.mxn,
        status: 'pending'
      })
      alert('¡Gracias por tu compra! Envíanos el comprobante por WhatsApp y te acreditaremos los MxN Points en pocos minutos.')
    } catch (error) {
      alert('¡Gracias por tu compra! Envíanos el comprobante por WhatsApp y te acreditaremos los MxN Points en pocos minutos.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Debes iniciar sesión</CardTitle>
            <CardDescription>Para comprar MxN Points necesitas una cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              Iniciar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <h1 className="text-lg font-bold text-foreground">Comprar MxN Points</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <Image
              src="/logomxnpoints.png"
              alt="MxN Points"
              width={64}
              height={64}
              className="rounded-lg"
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Elige tu paquete</h2>
          <p className="text-muted-foreground mt-2">
            Compra MxN Points y canjea las skins que quieras
          </p>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PACKAGES.map((pkg) => (
            <Card 
              key={pkg.mxn}
              className={`relative cursor-pointer transition-all hover:scale-105 ${
                selectedPackage?.mxn === pkg.mxn 
                  ? 'border-yellow-500 ring-2 ring-yellow-500' 
                  : ''
              } ${pkg.popular ? 'border-yellow-500/50' : ''}`}
              onClick={() => setSelectedPackage(pkg)}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full z-10">
                  POPULAR
                </div>
              )}
              <CardContent className="pt-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Image
                    src="/logomxnpoints.png"
                    alt="MxN Points"
                    width={40}
                    height={40}
                    className="rounded"
                  />
                </div>
                <div className="text-3xl font-bold text-yellow-500">{pkg.mxn}</div>
                <div className="text-sm text-muted-foreground">MxN Points</div>
                <div className="text-2xl font-bold text-foreground mt-2">${pkg.price}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Info */}
        {selectedPackage && !showPaymentInfo && (
          <div className="text-center">
            <Button 
              onClick={() => setShowPaymentInfo(true)}
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
            >
              Continuar con pago
            </Button>
          </div>
        )}

        {showPaymentInfo && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Información de pago</CardTitle>
              <CardDescription>
                Transfiere ${selectedPackage.price} USD a:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">CVU / Alias:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-foreground font-mono">0000003100058974123456</code>
                  <button
                    onClick={handleCopyCVU}
                    className="p-2 hover:bg-accent rounded"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                <p className="text-sm text-yellow-500 font-medium">
                  ⚠️ Envía el comprobante de pago por WhatsApp para acreditar los MxN Points
                </p>
              </div>

              <a
                href="https://wa.me/5491166666666"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium"
              >
                <MessageCircle className="h-5 w-5" />
                Enviar comprobante por WhatsApp
              </a>

              <p className="text-xs text-muted-foreground text-center">
                Una vez acreditado el pago, los MxN Points se sumarán automáticamente a tu cuenta
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
