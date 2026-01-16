import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabase: any = null

if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey)
}

export const runtime = 'nodejs'

/**
 * POST /api/auth/generate-token
 * Generates a one-time token for bot-based authentication
 * Body: { return_url?: string }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}))
        const returnUrl = body.return_url || '/'

        // Generate random token
        const token = crypto.randomBytes(32).toString('hex')

        // Token expires in 5 minutes
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
        }

        // Store token (without user_id yet - will be set when bot confirms)
        const { error } = await supabase
            .from('auth_session_tokens')
            .insert({
                token,
                user_id: null, // Will be set when bot confirms
                expires_at: expiresAt,
                platform: 'landing',
            })

        if (error) {
            console.error('Error creating token:', error)
            return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
        }

        // Build bot deep link
        const botLink = `https://t.me/maincomapp_bot?start=auth_${token}`

        return NextResponse.json({
            success: true,
            token,
            botLink,
            expiresAt,
        })

    } catch (error) {
        console.error('Generate token error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
