'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'
import { ThemeProvider } from '@/lib/theme'
import { ProfilePanel } from '@/components/profile-panel'
import { NotificationsBell } from '@/components/notifications-bell'
import { LanguageSwitcher } from '@/components/language-switcher'

const PACKAGES: { id: string; mxn: number; price: number; popular: boolean; bestPrice?: boolean }[] = [
  { id: 'f28039f8-fae9-406d-9d66-8f7f58b20a60', mxn: 2000, price: 10.00, popular: false },
  { id: '19afa736-6407-4cf3-badc-623eeb33b9e5', mxn: 5000, price: 20.00, popular: false },
  { id: 'af8a2da0-0429-49f8-b440-d7da81a8fab5', mxn: 8000, price: 30.00, popular: false },
  { id: '3ee33bdc-3465-4a6f-b246-7d2ef02ed6f4', mxn: 12500, price: 45.00, popular: true, bestPrice: true },
]

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

  return (
    <ThemeProvider>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-2 sm:px-4 py-2 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <Image
              src="/logo.png"
              alt="MxNStore"
              width={28}
              height={28}
              className="rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-base sm:text-2xl font-bold text-foreground truncate">
                MxNStore
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <NotificationsBell />
            <LanguageSwitcher />
            <ProfilePanel />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {!user && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-8 text-center">
            <p className="text-blue-500 font-medium">Inicia sesión para comprar MxN Points</p>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 blur-xl rounded-full" />
            <Image
              src="/logomxnpoints.png"
              alt="MxN Points"
              width={64}
              height={64}
              className="relative rounded-xl"
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
            <div
              key={pkg.mxn}
              className={`relative group cursor-pointer transition-all duration-300 hover-lift ${
                selectedPackage?.mxn === pkg.mxn 
                  ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background' 
                  : ''
              }`}
              onClick={() => {
                if (!user) {
                  router.push('/login')
                  return
                }
                setSelectedPackage(pkg)
              }}
            >
              <div className="glass-card rounded-2xl overflow-hidden border border-border/30 h-full opacity-80 hover:opacity-100 transition-opacity">
                {pkg.popular && (
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px] font-bold px-4 py-1.5 rounded-b-lg z-10 shadow-lg shadow-yellow-500/30">
                    {pkg.bestPrice ? "MEJOR PRECIO" : t("buy.popular").toUpperCase()}
                  </div>
                )}
                <div className="pt-8 pb-6 px-4 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Image
                      src="/logomxnpoints.png"
                      alt="MxN Points"
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="text-3xl font-bold gradient-text">{pkg.mxn.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground/70">MxN Points</div>
                  <div className="text-2xl font-bold text-foreground mt-3">${pkg.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        {selectedPackage && (
          <div className="glass-card rounded-2xl p-6 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold gradient-text">{selectedPackage.mxn.toLocaleString()} MxN Points</div>
              <div className="text-lg text-muted-foreground mt-1">${selectedPackage.price} USD</div>
            </div>
            <button
              onClick={async () => {
                if (!user) {
                  router.push('/login')
                  return
                }
                
                try {
                  const res = await fetch('/api/heleket-create-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      amount: selectedPackage.price,
                      mxnAmount: selectedPackage.mxn,
                      userId: user.id,
                    }),
                  })
                  const data = await res.json()
                  
                  if (data.success && data.paymentLink) {
                    window.open(data.paymentLink, '_blank')
                  } else {
                    alert('Error al crear pago: ' + (data.error || 'Unknown error'))
                  }
                } catch (err) {
                  alert('Error al procesar pago')
                }
              }}
              className="btn-premium flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-green-500/30 active:scale-95 transition-all w-full"
            >
              {t("buy.continueToPayment")}
            </button>
            <p className="text-xs text-muted-foreground/60 text-center mt-4">
              {t("buy.seAbrira")}
            </p>
          </div>
        )}
      </main>
    </div>
    </ThemeProvider>
  )
}
