import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey)
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
            return NextResponse.json({ error: 'Token is required' }, { status: 400 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
        }

        // Get token from database
        const { data: tokenData, error: tokenError } = await supabase
            .from('auth_session_tokens')
            .select('*')
            .eq('token', token)
            .single()

        if (tokenError || !tokenData) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // Check if token is expired
        if (new Date(tokenData.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Token expired' }, { status: 401 })
        }

        // Check if token was already used
        if (tokenData.used_at) {
            return NextResponse.json({ error: 'Token already used' }, { status: 401 })
        }

        // Check if user_id is set (bot has confirmed)
        if (!tokenData.user_id) {
            return NextResponse.json({
                success: false,
                pending: true,
                message: 'Waiting for bot confirmation'
            })
        }

        // Get user data
        const { data: user, error: userError } = await supabase
            .from('bot_users')
            .select('id, tg_user_id, username, first_name, last_name, subscription_tier, created_at')
            .eq('id', tokenData.user_id)
            .single()

        if (userError || !user) {
            console.error('User lookup failed:', { tokenUserId: tokenData.user_id, error: userError })
            return NextResponse.json({
                error: 'User not found',
                debug: { tokenUserId: tokenData.user_id }
            }, { status: 404 })
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
                created_at: user.created_at,
            }
        })

    } catch (error) {
        console.error('Validate token error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

        // Get internal user ID from Telegram user_id
        const { data: user, error: userError } = await supabase
            .from('bot_users')
            .select('id')
            .eq('tg_user_id', tg_user_id)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404, headers: corsHeaders })
        }

        // Update token with user_id
        const { error: updateError } = await supabase
            .from('auth_session_tokens')
            .update({ user_id: user.id })
            .eq('short_code', code)

        if (updateError) {
            console.error('Error updating token:', updateError)
            return NextResponse.json({ error: 'Ошибка подтверждения' }, { status: 500, headers: corsHeaders })
        }

        return NextResponse.json({
            success: true,
            message: 'Вход подтверждён!'
        }, { headers: corsHeaders })

    } catch (error) {
        console.error('Confirm token error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
    }
}
