'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, ArrowLeft, Copy, Check, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

const PACKAGES: { mxn: number; price: number; popular: boolean; bestPrice?: boolean }[] = [
  { mxn: 2000, price: 8.00, popular: false },
  { mxn: 5000, price: 18.00, popular: false },
  { mxn: 10000, price: 35.00, popular: false },
  { mxn: 13500, price: 45.00, popular: true, bestPrice: true },
]

export default function BuyVbucksPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<{ mxn: number; price: number; popular: boolean; bestPrice?: boolean } | null>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0])
    }
  }

  const handleSubmitReceipt = async () => {
    if (!selectedPackage || !user || !receiptFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('mxnAmount', String(selectedPackage.mxn))
      formData.append('usdAmount', String(selectedPackage.price))
      formData.append('receipt', receiptFile)
      formData.append('userId', user.id)

      const response = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUploadSuccess(true)
      } else {
        alert(data.error || 'Error al subir comprobante')
      }
    } catch (error) {
      alert('Error al subir comprobante')
    } finally {
      setUploading(false)
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
            <CardTitle>{t("buy.noAccount")}</CardTitle>
            <CardDescription>{t("login.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              {t("profile.login")}
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
            {t("redeem.cancel")}
          </button>
          <h1 className="text-lg font-bold text-foreground">{t("buy.title")}</h1>
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
          <h2 className="text-2xl font-bold text-foreground">{t("buy.selectAmount")}</h2>
          <p className="text-muted-foreground mt-2">
            {t("buy.subtitle")}
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
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[10px] font-bold px-3 py-1 rounded-full z-10">
                  {pkg.bestPrice ? "MEJOR PRECIO" : t("buy.popular").toUpperCase()}
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
              {t("buy.selectAmount")}
            </Button>
          </div>
        )}

        {showPaymentInfo && !uploadSuccess && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Datos para transferir</CardTitle>
              <CardDescription>
                {selectedPackage?.mxn} MxN Points - ${selectedPackage?.price} USD
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
                  Una vez que transfieras, sube el comprobante de pago:
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Comprobante de pago:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-600"
                />
              </div>

              <Button
                onClick={handleSubmitReceipt}
                disabled={!receiptFile || uploading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar comprobante
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Te notificaremos cuando tu pago sea aprobado
              </p>
            </CardContent>
          </Card>
        )}

        {uploadSuccess && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-green-500 mb-2">Comprobante enviado!</h3>
              <p className="text-muted-foreground">
                Tu pago esta siendo verificado. Te notificaremos cuando sea aprobado.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
