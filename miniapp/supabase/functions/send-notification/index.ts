import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Telegram official domains for CORS
const ALLOWED_ORIGINS = [
  'https://t.me',
  'https://web.telegram.org',
  'https://webk.telegram.org',
  'https://webz.telegram.org',
]
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:3000']

function getCorsOrigin(requestOrigin: string | null): string {
  // Rollback flag
  if (Deno.env.get('SECURITY_CORS_STRICT') === 'false') {
    return '*'
  }
  const isProduction = Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined
  const allowedOrigins = isProduction ? ALLOWED_ORIGINS : [...ALLOWED_ORIGINS, ...DEV_ORIGINS]
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin
  }
  return ALLOWED_ORIGINS[0]
}

function getCorsHeaders(req: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(req.headers.get('origin')),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }
}

type NotificationType = 'match' | 'event' | 'achievement' | 'reminder' | 'system'

interface DeepLink {
  screen: string
  buttonText?: string
}

interface NotificationRequest {
  userTgId: number
  type: NotificationType
  title: string
  message: string
  deepLink?: DeepLink
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const BOT_TOKEN = Deno.env.get('BOT_TOKEN')
    if (!BOT_TOKEN) {
      return new Response(
        JSON.stringify({ success: false, error: 'Server misconfigured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { userTgId, type, title, message, deepLink }: NotificationRequest = await req.json()

    if (!userTgId || !title || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build message text with optional emoji
    const emoji: Record<NotificationType, string> = {
      match: '',
      event: '',
      achievement: '',
      reminder: '',
      system: ''
    }

    const emojiPrefix = emoji[type] || ''
    const text = `${emojiPrefix}${emojiPrefix ? ' ' : ''}*${escapeMarkdown(title)}*\n\n${escapeMarkdown(message)}`

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
      return new Response(
        JSON.stringify({ success: false, error: result.description || 'Telegram API error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message_id: result.result?.message_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Notification error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to send notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Escape special characters for Telegram Markdown
function escapeMarkdown(text: string): string {
  return text
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!')
}
