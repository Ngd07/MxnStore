'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'

const PACKAGES: { id: string; mxn: number; price: number; popular: boolean; bestPrice?: boolean }[] = [
  { id: '53020cef-71b2-42f7-ac76-9bc871d5036c', mxn: 2000, price: 8.00, popular: false },
  { id: '9e8d117d-2224-41c3-92dc-d96aa42a6f30', mxn: 5000, price: 18.00, popular: false },
  { id: 'adf34f8c-55c8-4fcc-97ab-5578991b5acd', mxn: 10000, price: 35.00, popular: false },
  { id: 'ae20b72f-9084-4ef6-a6ee-91864ff19ba6', mxn: 13500, price: 45.00, popular: true, bestPrice: true },
]

const PAYMENT_LINKS: Record<string, string> = {
  '53020cef-71b2-42f7-ac76-9bc871d5036c': 'https://app.takenos.com/pay/53020cef-71b2-42f7-ac76-9bc871d5036c',
  '9e8d117d-2224-41c3-92dc-d96aa42a6f30': 'https://app.takenos.com/pay/9e8d117d-2224-41c3-92dc-d96aa42a6f30',
  'adf34f8c-55c8-4fcc-97ab-5578991b5acd': 'https://app.takenos.com/pay/adf34f8c-55c8-4fcc-97ab-5578991b5acd',
  'ae20b72f-9084-4ef6-a6ee-91864ff19ba6': 'https://app.takenos.com/pay/ae20b72f-9084-4ef6-a6ee-91864ff19ba6',
}

export default function BuyVbucksPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<{ id: string; mxn: number; price: number; popular: boolean; bestPrice?: boolean } | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [])

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
        {selectedPackage && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>{selectedPackage.mxn} MxN Points</CardTitle>
              <CardDescription>
                ${selectedPackage.price} USD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <a
                href={`/pagar/${selectedPackage.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-medium text-lg"
              >
                Continuar al pago
              </a>

              <p className="text-xs text-muted-foreground text-center">
                {t("buy.seAbrira")}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
