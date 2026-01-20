/**
 * Telegram Login API Route
 * Validates Telegram Login Widget data and creates session
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

function verifyTelegramAuth(data: TelegramUser): boolean {
  const { hash, ...userData } = data

  // Create data check string
  const dataCheckArr = Object.entries(userData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
  const dataCheckString = dataCheckArr.join('\n')

  // Create secret key from bot token
  const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest()

  // Calculate HMAC
  const hmac = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  // Verify hash
  if (hmac !== hash) {
    return false
  }

  // Check auth_date is not too old (24 hours)
  const now = Math.floor(Date.now() / 1000)
  if (now - data.auth_date > 86400) {
    return false
  }

  return true
}

export async function POST(request: NextRequest) {
  try {
    const data: TelegramUser = await request.json()

    // Dev bypass for localhost testing
    const isDev = process.env.NODE_ENV === 'development'
    const isDevBypass = isDev && data.hash === 'dev_bypass'

    // Verify Telegram auth data (skip for dev bypass)
    if (!isDevBypass && !verifyTelegramAuth(data)) {
      return NextResponse.json(
        { error: 'Invalid authentication data' },
        { status: 401 }
      )
    }

    const username = data.username?.toLowerCase()

    if (!username) {
      return NextResponse.json(
        { error: 'Telegram username is required' },
        { status: 400 }
      )
    }

    // Check if user is in admin_users table with god_mode role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('telegram_username', username)
      .eq('is_active', true)
      .single()

    if (error || !adminUser) {
      return NextResponse.json(
        { error: 'Access denied. You are not an administrator.' },
        { status: 403 }
      )
    }

    // Update telegram_id if not set
    if (!adminUser.telegram_id) {
      await supabase
        .from('admin_users')
        .update({ telegram_id: data.id })
        .eq('id', adminUser.id)
    }

    // Create session token
    const sessionData = {
      id: adminUser.id,
      telegram_id: data.id,
      telegram_username: username,
      role: adminUser.role,
      permissions: adminUser.permissions,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
    }

    // Encode session as base64 (in production, use proper JWT)
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64')

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        telegram_id: data.id,
        telegram_username: username,
        role: adminUser.role,
        first_name: data.first_name,
        photo_url: data.photo_url,
      },
    })

    response.cookies.set('god_mode_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Telegram auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  // Logout - clear session cookie
  const response = NextResponse.json({ success: true })
  response.cookies.delete('god_mode_session')
  return response
}
