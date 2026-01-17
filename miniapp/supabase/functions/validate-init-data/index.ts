import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

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
        JSON.stringify({ valid: false, error: 'Server misconfigured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { initData } = await req.json()

    if (!initData) {
      return new Response(
        JSON.stringify({ valid: false, error: 'No initData provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse initData query string
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')

    if (!hash) {
      return new Response(
        JSON.stringify({ valid: false, error: 'No hash in initData' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    params.delete('hash')

    // Sort parameters alphabetically and create data_check_string
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    // Calculate secret key: HMAC-SHA256(BOT_TOKEN, "WebAppData")
    const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest()

    // Calculate hash: HMAC-SHA256(data_check_string, secret_key)
    const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    if (calculatedHash !== hash) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check auth_date - 5 min in production, 1 hour in development
    const authDate = parseInt(params.get('auth_date') || '0')
    const now = Math.floor(Date.now() / 1000)
    const isProduction = Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined
    // Rollback flag: if SECURITY_MAX_AGE_STRICT is 'false', use 24 hours
    const maxAge = Deno.env.get('SECURITY_MAX_AGE_STRICT') === 'false'
      ? 86400 // 24 hours (rollback)
      : isProduction ? 300 : 3600 // 5 min prod, 1 hour dev

    if (now - authDate > maxAge) {
      return new Response(
        JSON.stringify({ valid: false, error: 'initData expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse user data
    const userStr = params.get('user')
    const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null

    return new Response(
      JSON.stringify({
        valid: true,
        user,
        auth_date: authDate
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Validation error:', error)
    return new Response(
      JSON.stringify({ valid: false, error: 'Validation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
