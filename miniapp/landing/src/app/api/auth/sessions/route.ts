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
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders })
}

/**
 * GET /api/auth/sessions?tg_user_id=xxx
 * Returns active sessions for a user
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const tgUserId = searchParams.get('tg_user_id')

        if (!tgUserId) {
            return NextResponse.json({ error: 'tg_user_id is required' }, { status: 400, headers: corsHeaders })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500, headers: corsHeaders })
        }

        // Get active sessions (not expired, not revoked)
        const { data: sessions, error } = await supabase
            .from('web_sessions')
            .select('id, created_at, expires_at, user_agent')
            .eq('tg_user_id', tgUserId)
            .is('revoked_at', null)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching sessions:', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500, headers: corsHeaders })
        }

        return NextResponse.json({
            success: true,
            sessions: sessions || []
        }, { headers: corsHeaders })

    } catch (error) {
        console.error('Get sessions error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
    }
}

/**
 * DELETE /api/auth/sessions?session_id=xxx
 * Revokes a session
 */
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const sessionId = searchParams.get('session_id')
        const tgUserId = searchParams.get('tg_user_id')

        if (!sessionId) {
            return NextResponse.json({ error: 'session_id is required' }, { status: 400, headers: corsHeaders })
        }

        if (!tgUserId) {
            return NextResponse.json({ error: 'tg_user_id is required' }, { status: 400, headers: corsHeaders })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database not configured' }, { status: 500, headers: corsHeaders })
        }

        // Revoke the session (only if it belongs to this user)
        const { data, error } = await supabase
            .from('web_sessions')
            .update({ revoked_at: new Date().toISOString() })
            .eq('id', sessionId)
            .eq('tg_user_id', tgUserId)
            .select()
            .single()

        if (error) {
            console.error('Error revoking session:', error)
            return NextResponse.json({ error: 'Session not found or already revoked' }, { status: 404, headers: corsHeaders })
        }

        return NextResponse.json({
            success: true,
            message: 'Session revoked'
        }, { headers: corsHeaders })

    } catch (error) {
        console.error('Revoke session error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
    }
}
