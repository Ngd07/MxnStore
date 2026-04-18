import { NextResponse } from 'next/server'
import crypto from 'crypto'

const HELENET_API_KEY = process.env.HELEKET_API_KEY!
const HELENET_MERCHANT_ID = process.env.HELEKET_MERCHANT_ID!

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
  const sign = crypto.createHash('md5').update(Buffer.from(body).toString('base64') + HELENET_API_KEY).digest('hex')

  const response = await fetch('https://api.heleket.com/v1/payment/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchant': HELENET_MERCHANT_ID,
      'sign': sign,
    },
    body: body,
  })

  return response.json()
}

export async function POST(request: Request) {
  try {
    const { amount, mxnAmount, userId } = await request.json()

    if (!amount || !userId) {
      return NextResponse.json({ error: 'Missing amount or userId' }, { status: 400 })
    }

    const orderId = `mxn_${mxnAmount || 0}_${userId}_${Date.now()}`

    const result = await createHeleketPayment(amount, orderId, userId)

    if (result.state === 0 && result.result?.link) {
      return NextResponse.json({
        success: true,
        paymentLink: result.result.link,
        orderId: orderId,
      })
    } else {
      return NextResponse.json({ error: result.message || 'Failed to create payment' }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}