import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'
import { setCorsHeaders } from './_lib/cors'
import { applyRateLimit, RATE_LIMITS } from './_lib/rate-limiter'

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || ''

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - restricted to Telegram domains
  const origin = req.headers.origin as string | undefined
  setCorsHeaders(res, origin)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Rate limiting: 30 requests per minute
  if (applyRateLimit(req, res, RATE_LIMITS.validateInitData)) {
    return // Response already sent by rate limiter
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' })
  }

  try {
    if (!BOT_TOKEN) {
      console.error('BOT_TOKEN not configured')
      return res.status(500).json({ valid: false, error: 'Server misconfigured' })
    }

    const { initData } = req.body

    if (!initData) {
      return res.status(400).json({ valid: false, error: 'No initData provided' })
    }

    // Parse initData query string
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')

    if (!hash) {
      return res.status(400).json({ valid: false, error: 'No hash in initData' })
    }

    params.delete('hash')

    // Sort parameters alphabetically and create data_check_string
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    // Calculate secret key: HMAC-SHA256(BOT_TOKEN, "WebAppData")
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest()

    // Calculate hash: HMAC-SHA256(data_check_string, secret_key)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    if (calculatedHash !== hash) {
      return res.status(401).json({ valid: false, error: 'Invalid signature' })
    }

    // Check auth_date - 5 min in production, 1 hour in development
    const authDate = parseInt(params.get('auth_date') || '0')
    const now = Math.floor(Date.now() / 1000)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
    // Rollback flag: if SECURITY_MAX_AGE_STRICT is 'false', use 24 hours
    const maxAge = process.env.SECURITY_MAX_AGE_STRICT === 'false'
      ? 86400 // 24 hours (rollback)
      : isProduction ? 300 : 3600 // 5 min prod, 1 hour dev

    if (now - authDate > maxAge) {
      return res.status(401).json({ valid: false, error: 'initData expired' })
    }

    // Parse user data
    const userStr = params.get('user')
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null

    return res.status(200).json({
      valid: true,
      user,
      auth_date: authDate
    })

  } catch (error) {
    console.error('Validation error:', error)
    return res.status(500).json({ valid: false, error: 'Validation failed' })
  }
}
