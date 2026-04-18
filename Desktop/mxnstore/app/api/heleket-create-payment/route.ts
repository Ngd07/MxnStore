import { NextResponse } from 'next/server'
import crypto from 'crypto'

const HELENET_API_KEY = '0OZYVsNwF1Qn4hDJyhJy4ER2tgKkxZqADM79GfwkQOPBaUL6JD3teIe4DDy7eyjxm1Lu3HDZqoSpKPK9N7zVz3RTrsPHC3TDStcn3zBTBitTq5ByWOBqJGXj6aw8WFmR'
const HELENET_MERCHANT_ID = 'ba7a4e30-4ed2-4290-924c-3d6c885fa984'

console.log('Using hardcoded credentials')

async function createHeleketPayment(amount: number, orderId: string, userId: string) {
  const data = {
    amount: amount.toString(),
    currency: "USD",
    order_id: orderId,
  }

  const body = JSON.stringify(data)
  const base64Body = Buffer.from(body).toString('base64')
  const sign = crypto.createHash('md5').update(base64Body + HELENET_API_KEY).digest('hex')

  console.log('Sign payload:', { data, body, base64Body, sign })

  try {
    const response = await fetch('https://api.heleket.com/v1/payment', {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'merchant': HELENET_MERCHANT_ID,
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