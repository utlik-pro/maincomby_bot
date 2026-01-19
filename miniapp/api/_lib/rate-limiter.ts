/**
 * Rate Limiter for Telegram Mini App API
 * Phase 3: Security Hardening
 *
 * Note: In-memory rate limiting works per-instance.
 * For production-scale apps, consider using Redis or Vercel KV.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  windowMs: number       // Time window in milliseconds
  maxRequests: number    // Max requests per window
  keyPrefix?: string     // Prefix for the key
}

// In-memory store (per serverless instance)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 60 seconds
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 60000

function cleanupExpiredEntries(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  lastCleanup = now
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For, X-Real-IP, or falls back to a default
 */
function getClientKey(req: VercelRequest): string {
  const forwardedFor = req.headers['x-forwarded-for']
  if (forwardedFor) {
    const ip = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0]
    return ip.trim()
  }

  const realIp = req.headers['x-real-ip']
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp
  }

  // Fallback for local dev
  return 'unknown'
}

/**
 * Check if request should be rate limited
 * Returns null if allowed, or a response object if limited
 */
export function checkRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetTime: number } {
  // Rollback flag: disable rate limiting if SECURITY_RATE_LIMIT is 'false'
  if (process.env.SECURITY_RATE_LIMIT === 'false') {
    return { limited: false, remaining: config.maxRequests, resetTime: 0 }
  }

  cleanupExpiredEntries()

  const clientKey = getClientKey(req)
  const key = `${config.keyPrefix || 'default'}:${clientKey}`
  const now = Date.now()

  let entry = rateLimitStore.get(key)

  // Create new entry if doesn't exist or window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    }
  }

  entry.count++
  rateLimitStore.set(key, entry)

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const resetTime = entry.resetTime

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', config.maxRequests.toString())
  res.setHeader('X-RateLimit-Remaining', remaining.toString())
  res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())

  if (entry.count > config.maxRequests) {
    res.setHeader('Retry-After', Math.ceil((resetTime - now) / 1000).toString())
    return { limited: true, remaining: 0, resetTime }
  }

  return { limited: false, remaining, resetTime }
}

/**
 * Apply rate limiting to a request
 * Returns true if the request was rate limited (response already sent)
 */
export function applyRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  config: RateLimitConfig
): boolean {
  const result = checkRateLimit(req, res, config)

  if (result.limited) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
    })
    return true
  }

  return false
}

// Pre-configured rate limit configs for different endpoints
export const RATE_LIMITS = {
  // validate-init-data: 30 requests per minute
  validateInitData: {
    windowMs: 60000,
    maxRequests: 30,
    keyPrefix: 'validate',
  },
  // send-notification: 10 requests per minute
  sendNotification: {
    windowMs: 60000,
    maxRequests: 10,
    keyPrefix: 'notify',
  },
  // send-broadcast: 60 requests per minute (polling every 1.5s = 40 req/min)
  sendBroadcast: {
    windowMs: 60000,
    maxRequests: 60,
    keyPrefix: 'broadcast',
  },
} as const
