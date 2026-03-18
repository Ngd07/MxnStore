import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, type } = body

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!botToken || !chatId) {
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 })
    }

    const emoji = type === 'purchase' ? '🎮' : type === 'recarga' ? '💰' : '📢'
    const formattedMessage = `${emoji} *MxN Store*\n\n${message}`

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedMessage,
        parse_mode: 'Markdown'
      })
    })

    const data = await response.json()

    if (!data.ok) {
      console.error('Telegram error:', data)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
