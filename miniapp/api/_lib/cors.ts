/**
 * CORS utility for Telegram Mini App security
 * Phase 1: Security Hardening
 */

// Telegram official domains
const ALLOWED_ORIGINS = [
  'https://t.me',
  'https://web.telegram.org',
  'https://webk.telegram.org',
  'https://webz.telegram.org',
]

// Development origins (only active when SECURITY_CORS_STRICT=false or NODE_ENV !== 'production')
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
]

/**
 * Get the appropriate CORS origin for the response
 * In production: only allows Telegram domains
 * In development: also allows localhost
 *
 * @param requestOrigin - Origin header from the request
 * @returns The origin to set in Access-Control-Allow-Origin header
 */
export function getCorsOrigin(requestOrigin: string | undefined): string {
  // Rollback flag: if SECURITY_CORS_STRICT is explicitly 'false', allow all origins
  if (process.env.SECURITY_CORS_STRICT === 'false') {
    return '*'
  }

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'

  const allowedOrigins = isProduction
    ? ALLOWED_ORIGINS
    : [...ALLOWED_ORIGINS, ...DEV_ORIGINS]

  // If the request origin is in our allowed list, reflect it back
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin
  }

  // Default to first allowed origin (Telegram main domain)
  return ALLOWED_ORIGINS[0]
}

/**
 * Get CORS headers for API responses
 */
export function getCorsHeaders(requestOrigin: string | undefined): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(requestOrigin),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // 24 hours preflight cache
  }
}

/**
 * Set CORS headers on a Vercel response object
 */
export function setCorsHeaders(
  res: { setHeader: (key: string, value: string) => void },
  requestOrigin: string | undefined
): void {
  const headers = getCorsHeaders(requestOrigin)
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
}

export { ALLOWED_ORIGINS, DEV_ORIGINS }
