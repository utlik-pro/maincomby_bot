import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    // Check auth_date is not older than 24 hours
    const authDate = parseInt(params.get('auth_date') || '0')
    const now = Math.floor(Date.now() / 1000)
    const maxAge = 86400 // 24 hours in seconds

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
