'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Upload, Loader2, Check } from 'lucide-react'
import Image from 'next/image'

export default function ComprobantePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!email.trim() || !receiptFile) {
      setError('Completa todos los campos')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('email', email.trim())
      formData.append('receipt', receiptFile)

      const response = await fetch('/api/submit-receipt', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUploadSuccess(true)
      } else {
        setError(data.error || 'Error al enviar comprobante')
      }
    } catch (err) {
      setError('Error al enviar comprobante')
    } finally {
      setUploading(false)
    }
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-green-500 mb-2">Comprobante enviado!</h3>
            <p className="text-muted-foreground">
              Tu pago esta siendo verificado. Te avisaremos por email cuando este aprobado.
            </p>
            <Button 
              onClick={() => router.push('/')} 
              className="mt-4"
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <h1 className="text-lg font-bold text-foreground">Enviar comprobante</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Completa tus datos</CardTitle>
            <CardDescription>
              Ingresa tu email y adjunta el comprobante de pago
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tu email:
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Comprobante de pago:
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-600"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!email.trim() || !receiptFile || uploading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
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
