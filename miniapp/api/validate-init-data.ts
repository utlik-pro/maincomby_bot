import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

const BOT_TOKEN = process.env.BOT_TOKEN || ''

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
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

    // Check auth_date is not older than 24 hours
    const authDate = parseInt(params.get('auth_date') || '0')
    const now = Math.floor(Date.now() / 1000)
    const maxAge = 86400 // 24 hours in seconds

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
