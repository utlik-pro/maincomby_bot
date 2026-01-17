import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setCorsHeaders } from './_lib/cors'
import { applyRateLimit, RATE_LIMITS } from './_lib/rate-limiter'

const BOT_TOKEN = process.env.BOT_TOKEN || ''

type NotificationType = 'match' | 'event' | 'achievement' | 'reminder' | 'system'

interface DeepLink {
  screen: string
  buttonText?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - restricted to Telegram domains
  const origin = req.headers.origin as string | undefined
  setCorsHeaders(res, origin)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Rate limiting: 10 requests per minute
  if (applyRateLimit(req, res, RATE_LIMITS.sendNotification)) {
    return // Response already sent by rate limiter
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    if (!BOT_TOKEN) {
      console.error('BOT_TOKEN not configured')
      return res.status(500).json({ success: false, error: 'Server misconfigured' })
    }

    const { userTgId, type, title, message, deepLink } = req.body as {
      userTgId: number
      type: NotificationType
      title: string
      message: string
      deepLink?: DeepLink
    }

    if (!userTgId || !title || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' })
    }

    // Build message text (no emoji prefix for cleaner messages)
    const text = `*${escapeMarkdown(title)}*\n\n${escapeMarkdown(message)}`

    // Build request body
    const body: Record<string, unknown> = {
      chat_id: userTgId,
      text,
      parse_mode: 'Markdown',
    }

    // Add inline button with deep link if specified
    if (deepLink) {
      body.reply_markup = {
        inline_keyboard: [[{
          text: deepLink.buttonText || 'Открыть',
          url: `https://t.me/maincomapp_bot?startapp=${deepLink.screen}`
        }]]
      }
    }

    // Send message via Telegram Bot API
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (!result.ok) {
      console.error('Telegram API error:', result)
      return res.status(400).json({ success: false, error: result.description || 'Telegram API error' })
    }

    return res.status(200).json({ success: true, message_id: result.result?.message_id })

  } catch (error) {
    console.error('Notification error:', error)
    return res.status(500).json({ success: false, error: 'Failed to send notification' })
  }
}

// Escape special characters for Telegram Markdown
function escapeMarkdown(text: string): string {
  return text
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/\-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!')
}
