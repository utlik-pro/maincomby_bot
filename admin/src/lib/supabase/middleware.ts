/**
 * God Mode - Auth Middleware
 * Checks god_mode_session cookie for authentication
 */

import { NextResponse, type NextRequest } from 'next/server'

interface SessionData {
  id: string
  telegram_id: number
  telegram_username: string
  role: string
  permissions: Record<string, Record<string, boolean>>
  exp: number
}

function getSession(request: NextRequest): SessionData | null {
  const sessionCookie = request.cookies.get('god_mode_session')

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    ) as SessionData

    // Check if session is expired
    const now = Math.floor(Date.now() / 1000)
    if (sessionData.exp < now) {
      return null
    }

    return sessionData
  } catch {
    return null
  }
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  const session = getSession(request)
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  const isProtectedRoute = !isLoginPage && !isApiRoute

  // DEV: Skip auth check for development testing
  const isDev = process.env.NODE_ENV === 'development'
  const skipAuth = isDev && process.env.SKIP_AUTH === 'true'

  // Redirect to login if no session and trying to access protected route
  if (isProtectedRoute && !session && !skipAuth) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if logged in and trying to access login page
  if (isLoginPage && session) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}
