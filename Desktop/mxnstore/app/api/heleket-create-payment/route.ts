import { NextResponse } from 'next/server'
import crypto from 'crypto'

const HELENET_API_KEY = process.env.HELEKET_API_KEY
const HELENET_MERCHANT_ID = process.env.HELEKET_MERCHANT_ID

console.log('ENV CHECK:', {
  apiKey: HELENET_API_KEY ? 'exists' : 'MISSING',
  merchantId: HELENET_MERCHANT_ID ? 'exists' : 'MISSING'
})

async function createHeleketPayment(amount: number, orderId: string, userId: string) {
  const data = {
    amount: amount.toString(),
    currency: 'USD',
    network: 'TRON',
    order_id: orderId,
    url_callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/heleket-webhook?userId=${userId}`,
    is_payment_multiple: false,
  }

  const body = JSON.stringify(data)
  const base64Body = Buffer.from(body).toString('base64')
  const sign = crypto.createHash('md5').update(base64Body + HELENET_API_KEY).digest('hex')

  console.log('Heleket request:', { 
      amount, 
      body, 
      base64Body: base64Body.substring(0, 30), 
      sign: sign, 
      merchantFull: HELENET_MERCHANT_ID,
      merchantLen: HELENET_MERCHANT_ID?.length 
    })

  try {
    const response = await fetch('https://api.heleket.com/v1/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchant': HELENET_MERCHANT_ID!,
        'sign': sign,
      },
      body: body,
    })

    const text = await response.text()
    console.log('Heleket response status:', response.status, 'text:', text.substring(0, 200))

    try {
      return JSON.parse(text)
    } catch {
      return { state: 1, message: 'Invalid response from Heleket: ' + text.substring(0, 100) }
    }
  } catch (err: any) {
    console.error('Fetch error:', err)
    return { state: 1, message: err.message }
  }
}

export async function POST(request: Request) {
  try {
    const { amount, mxnAmount, userId } = await request.json()

    if (!amount || !userId) {
      return NextResponse.json({ error: 'Missing amount or userId' }, { status: 400 })
    }

    const orderId = `mxn_${mxnAmount || 0}_${userId}_${Date.now()}`

    console.log('Creating Heleket payment:', { amount, orderId, HELENET_MERCHANT_ID: HELENET_MERCHANT_ID?.substring(0, 10) })

    const result = await createHeleketPayment(amount, orderId, userId)

    console.log('Heleket result:', result)

    if (result.state === 0 && result.result?.link) {
      return NextResponse.json({
        success: true,
        paymentLink: result.result.link,
        orderId: orderId,
      })
    } else {
      return NextResponse.json({ error: result.message || 'Failed to create payment', details: result }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Heleket error:', error)
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  }
}