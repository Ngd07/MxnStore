'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Check, Send } from 'lucide-react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

const PACKAGES = [
  { id: '53020cef-71b2-42f7-ac76-9bc871d5036c', mxn: 2000, price: 8.00, paymentLink: 'https://app.takenos.com/pay/53020cef-71b2-42f7-ac76-9bc871d5036c' },
  { id: '9e8d117d-2224-41c3-92dc-d96aa42a6f30', mxn: 5000, price: 18.00, paymentLink: 'https://app.takenos.com/pay/9e8d117d-2224-41c3-92dc-d96aa42a6f30' },
  { id: 'adf34f8c-55c8-4fcc-97ab-5578991b5acd', mxn: 10000, price: 35.00, paymentLink: 'https://app.takenos.com/pay/adf34f8c-55c8-4fcc-97ab-5578991b5acd' },
  { id: 'ae20b72f-9084-4ef6-a6ee-91864ff19ba6', mxn: 13500, price: 45.00, paymentLink: 'https://app.takenos.com/pay/ae20b72f-9084-4ef6-a6ee-91864ff19ba6' },
  // Account packages
  { id: 'account-13500', mxn: 13500, price: 45.00, paymentLink: '', isAccount: true },
  { id: 'account-27000', mxn: 27000, price: 85.00, paymentLink: '', isAccount: true },
  { id: 'account-40500', mxn: 40500, price: 125.00, paymentLink: '', isAccount: true },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PaymentPage({ params }: PageProps) {
  const router = useRouter()
  const { t } = useI18n()
  const [pkg, setPkg] = useState<typeof PACKAGES[0] | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [fortniteUsername, setFortniteUsername] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadParams() {
      const { id } = await params
      const found = PACKAGES.find(p => p.id === id)
      setPkg(found || null)
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // If logged in, pre-fill email from auth
      if (user?.email) {
        setEmail(user.email)
      }
      
      setLoading(false)
    }
    loadParams()
  }, [params])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!pkg || !email.trim() || !receiptFile) {
      setError('Completa todos los campos')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('email', email.trim())
      formData.append('receipt', receiptFile)
      formData.append('packageId', pkg.id)
      formData.append('mxn', String(pkg.mxn))
      formData.append('price', String(pkg.price))
      if (user?.id) {
        formData.append('userId', user.id)
      }
      if (pkg.isAccount && fortniteUsername.trim()) {
        formData.append('fortniteUsername', fortniteUsername.trim())
        formData.append('isAccount', 'true')
      }

      const response = await fetch('/api/submit-receipt', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setPaymentId(data.payment?.id || null)
        setSubmitted(true)
      } else {
        setError(data.error || 'Error al enviar')
      }
    } catch (err) {
      setError('Error al enviar')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center mb-4">Paquete no encontrado</p>
            <Button onClick={() => router.push('/buy-vucks')} className="w-full">
              Volver a la tienda
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-green-500 mb-2">{t("payment.successTitle")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("payment.successMessage", { amount: pkg.mxn })}
            </p>
            <Button 
              onClick={() => router.push(paymentId ? `/purchases?payment=${paymentId}` : '/purchases')} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {t("payment.continueToChat")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Image
              src="/logomxnpoints.png"
              alt="MxN Points"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="font-bold">MxNStore</span>
          </div>
          <h1 className="text-lg font-bold">{pkg.mxn} MxN Points</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8 space-y-6">
        {pkg.isAccount ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{pkg.mxn.toLocaleString()} MxN Points</CardTitle>
              <p className="text-center text-2xl font-bold text-yellow-500">${pkg.price} USD</p>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-4">
                Cuenta Fortnite con {pkg.mxn.toLocaleString()} MxN Points
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">${pkg.price} USD</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={pkg.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-medium text-lg"
              >
                Ir a pagar
              </a>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Se abrirá Takenos en una nueva ventana
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-muted-foreground">{pkg.isAccount ? 'Completa tus datos para la cuenta:' : 'Una vez que pagues, completa tus datos:'}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos para acreditar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Tu email:</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {pkg.isAccount && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Usuario de Fortnite:</label>
                <Input
                  type="text"
                  placeholder="Tu usuario en Fortnite"
                  value={fortniteUsername}
                  onChange={(e) => setFortniteUsername(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Comprobante de pago:</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-600"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!email.trim() || (pkg.isAccount && !fortniteUsername.trim()) || !receiptFile || uploading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar comprobante
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
