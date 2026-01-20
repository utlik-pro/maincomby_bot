'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Loader2, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

// Extend window for Telegram callback
declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTelegramAuth = useCallback(async (user: TelegramUser) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Authentication failed')
        toast.error(data.error || 'Authentication failed')
        return
      }

      toast.success(`Welcome, ${data.user.first_name}!`)
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('An error occurred during authentication')
      toast.error('An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Set global callback for Telegram widget
    window.onTelegramAuth = handleTelegramAuth

    // Load Telegram widget script
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'maincomapp_bot')
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '8')
    script.setAttribute('data-onauth', 'onTelegramAuth(user)')
    script.setAttribute('data-request-access', 'write')
    script.async = true

    const container = document.getElementById('telegram-login-container')
    if (container) {
      container.innerHTML = ''
      container.appendChild(script)
    }

    return () => {
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [handleTelegramAuth])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Zap className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">God Mode</CardTitle>
          <CardDescription>
            Sign in with Telegram to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Telegram Login Widget */}
          <div className="flex justify-center">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <div id="telegram-login-container" />
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Access notice */}
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Restricted Access</p>
              <p className="mt-1">
                Only authorized administrators can access this panel.
                Contact the system owner if you need access.
              </p>
            </div>
          </div>

          {/* Dev login for localhost testing */}
          {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
            <div className="border-t pt-4">
              <p className="mb-3 text-center text-xs text-muted-foreground">
                Development Mode (localhost only)
              </p>
              <button
                onClick={() => handleTelegramAuth({
                  id: 123456789,
                  first_name: 'Dmitry',
                  username: 'dmitryutlik',
                  auth_date: Math.floor(Date.now() / 1000),
                  hash: 'dev_bypass'
                })}
                disabled={loading}
                className="w-full rounded-lg bg-[#54a9eb] px-4 py-3 font-medium text-white hover:bg-[#4a96d1] disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Dev Login as @dmitryutlik'}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
