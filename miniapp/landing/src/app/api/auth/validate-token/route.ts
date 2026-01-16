import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

export const runtime = 'nodejs'

// CORS headers for cross-origin requests from miniapp
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * GET /api/auth/validate-token?token=xxx
 * Validates a token and returns user data if valid
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400, headers: corsHeaders })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500, headers: corsHeaders })
        }

        // Get token from database
        const { data: tokenData, error: tokenError } = await supabase
            .from('auth_session_tokens')
            .select('*')
            .eq('token', token)
            .single()

        if (tokenError || !tokenData) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders })
        }

        // Check if token is expired
        if (new Date(tokenData.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Token expired' }, { status: 401, headers: corsHeaders })
        }

        // Check if token was already used
        if (tokenData.used_at) {
            return NextResponse.json({ error: 'Token already used' }, { status: 401, headers: corsHeaders })
        }

        // Check if confirmed_tg_user_id is set (miniapp has confirmed)
        if (!tokenData.confirmed_tg_user_id) {
            return NextResponse.json({
                success: false,
                pending: true,
                message: 'Waiting for confirmation'
            }, { headers: corsHeaders })
        }

        // Get user data by tg_user_id
        console.log('GET: Looking up user with tg_user_id:', tokenData.confirmed_tg_user_id)

        const { data: user, error: userError } = await supabase
            .from('bot_users')
            .select('id, tg_user_id, username, first_name, last_name, subscription_tier, first_seen_at')
            .eq('tg_user_id', tokenData.confirmed_tg_user_id)
            .single()

        console.log('GET: User lookup result:', { user, error: userError?.message, code: userError?.code })

        if (userError || !user) {
            console.error('User lookup failed:', {
                confirmed_tg_user_id: tokenData.confirmed_tg_user_id,
                errorMessage: userError?.message,
                errorCode: userError?.code,
                errorDetails: userError?.details,
                errorHint: userError?.hint
            })
            return NextResponse.json({
                error: 'User not found',
                debug: {
                    confirmed_tg_user_id: tokenData.confirmed_tg_user_id,
                    errorMessage: userError?.message,
                    errorCode: userError?.code
                }
            }, { status: 404, headers: corsHeaders })
        }

        // Mark token as used
        await supabase
            .from('auth_session_tokens')
            .update({ used_at: new Date().toISOString() })
            .eq('token', token)

        // Return user data in the format expected by the frontend
        return NextResponse.json({
            success: true,
            user: {
                id: user.tg_user_id, // Telegram user ID
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                photo_url: null, // We don't have this in bot_users
                subscription_tier: user.subscription_tier,
                created_at: user.first_seen_at,
            }
        }, { headers: corsHeaders })

    } catch (error) {
        console.error('Validate token error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
    }
}

/**
 * POST /api/auth/validate-token
 * Called by miniapp to confirm a token with 6-digit code
 * Body: { code (6-digit), tg_user_id (telegram id) }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { code, tg_user_id } = body

        if (!code || !tg_user_id) {
            return NextResponse.json({ error: 'Code and tg_user_id are required' }, { status: 400, headers: corsHeaders })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500, headers: corsHeaders })
        }

        // Find token by short_code
        const { data: tokenData, error: tokenError } = await supabase
            .from('auth_session_tokens')
            .select('*')
            .eq('short_code', code)
            .is('used_at', null)
            .single()

        if (tokenError || !tokenData) {
            return NextResponse.json({ error: 'Неверный код' }, { status: 401, headers: corsHeaders })
        }

        // Check if token is expired
        if (new Date(tokenData.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Код истёк' }, { status: 401, headers: corsHeaders })
        }

        // Verify user exists in bot_users
        const { data: user, error: userError } = await supabase
            .from('bot_users')
            .select('id, tg_user_id, username, first_name, last_name, subscription_tier')
            .eq('tg_user_id', tg_user_id)
            .single()

        console.log('POST: Found user:', { user, tg_user_id, userError })

        if (userError || !user) {
            return NextResponse.json({
                error: 'Пользователь не найден',
                debug: { tg_user_id, userError: userError?.message }
            }, { status: 404, headers: corsHeaders })
        }

        // Store confirmed_tg_user_id (no foreign key constraint)
        const { error: updateError } = await supabase
            .from('auth_session_tokens')
            .update({ confirmed_tg_user_id: tg_user_id })
            .eq('short_code', code)

        console.log('POST: Updated token with confirmed_tg_user_id:', tg_user_id)

        if (updateError) {
            console.error('Error updating token:', updateError)
            return NextResponse.json({ error: 'Ошибка подтверждения' }, { status: 500, headers: corsHeaders })
        }

        return NextResponse.json({
            success: true,
            message: 'Вход подтверждён!',
            debug: { storedUserId: user.id, tg_user_id: user.tg_user_id }
        }, { headers: corsHeaders })

    } catch (error) {
        console.error('Confirm token error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
    }
}
