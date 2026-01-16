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

        // Generate 6-digit short code for QR/manual entry
        const shortCode = Math.floor(100000 + Math.random() * 900000).toString()

        // Token expires in 30 seconds (like Google Authenticator)
        const TOKEN_TTL_SECONDS = 30
        const expiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString()

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
        }

        // Clean up old unused tokens (expired and not used)
        await supabase
            .from('auth_session_tokens')
            .delete()
            .is('used_at', null)
            .lt('expires_at', new Date().toISOString())

        // Store token with short_code (user_id will be set when miniapp confirms)
        const { error } = await supabase
            .from('auth_session_tokens')
            .insert({
                token,
                short_code: shortCode,
                user_id: null, // Will be set when miniapp confirms
                expires_at: expiresAt,
                platform: 'landing',
            })

        if (error) {
            console.error('Error creating token:', error)
            return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            token,
            shortCode,
            expiresAt,
            ttl: TOKEN_TTL_SECONDS, // For countdown display
        })

    } catch (error) {
        console.error('Generate token error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
