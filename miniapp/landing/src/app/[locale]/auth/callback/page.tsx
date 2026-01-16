'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Loader2, CheckCircle, XCircle, RefreshCw, Smartphone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

function AuthCallbackContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { loginFromToken } = useAuth()
    const [status, setStatus] = useState<'loading' | 'pending' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const [token, setToken] = useState<string | null>(null)
    const [shortCode, setShortCode] = useState<string | null>(null)
    const [expiresAt, setExpiresAt] = useState<Date | null>(null)
    const [timeLeft, setTimeLeft] = useState(30) // Countdown in seconds
    const [ttl, setTtl] = useState(30) // Total time to live

    const returnUrl = searchParams.get('return') || '/'

    // Generate token on mount
    useEffect(() => {
        generateToken()
    }, [])

    // Countdown timer with auto-refresh
    useEffect(() => {
        if (status !== 'pending') return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Auto-regenerate token when countdown reaches 0
                    generateToken()
                    return ttl
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [status, ttl])

    const generateToken = async () => {
        setStatus('loading')
        try {
            const response = await fetch('/api/auth/generate-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ return_url: returnUrl }),
            })
            const data = await response.json()

            if (data.success && data.token && data.shortCode) {
                setToken(data.token)
                setShortCode(data.shortCode)
                setExpiresAt(new Date(data.expiresAt))
                // Set countdown from API response
                const tokenTtl = data.ttl || 30
                setTtl(tokenTtl)
                setTimeLeft(tokenTtl)
                setStatus('pending')
                setMessage('Введите код в приложении MAIN')
            } else {
                setStatus('error')
                setMessage(data.error || 'Ошибка генерации кода')
            }
        } catch (error) {
            console.error('Generate token error:', error)
            setStatus('error')
            setMessage('Ошибка соединения')
        }
    }

    // Poll for confirmation (faster polling since token is short-lived)
    useEffect(() => {
        if (!token || status !== 'pending') return

        const checkToken = async () => {
            try {
                const response = await fetch(`/api/auth/validate-token?token=${token}`)
                const data = await response.json()

                if (data.success && data.user) {
                    setStatus('success')
                    setMessage('Успешно! Перенаправляем...')
                    await loginFromToken(data.user, data.session_id)
                    setTimeout(() => router.push(returnUrl), 1000)
                    return true
                } else if (data.pending) {
                    // Continue polling, token will auto-refresh when expired
                    return false
                } else if (data.error === 'Token expired') {
                    // Token expired, will be refreshed by countdown timer
                    return false
                } else {
                    setStatus('error')
                    setMessage(data.error || 'Ошибка авторизации')
                    return true
                }
            } catch (error) {
                console.error('Token check error:', error)
                return false
            }
        }

        // Poll every 1 second for faster response
        const interval = setInterval(async () => {
            const done = await checkToken()
            if (done) clearInterval(interval)
        }, 1000)

        checkToken()
        return () => clearInterval(interval)
    }, [token, status, returnUrl, loginFromToken, router])

    // Format code with space for readability: 847 293
    const formattedCode = shortCode ? `${shortCode.slice(0, 3)} ${shortCode.slice(3)}` : ''

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-[#151515] border border-white/10 rounded-2xl p-8">

                    {status === 'loading' && (
                        <>
                            <Loader2 className="w-16 h-16 text-[var(--accent)] mx-auto mb-6 animate-spin" />
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Подготовка...
                            </h1>
                        </>
                    )}

                    {status === 'pending' && shortCode && (
                        <>
                            {/* QR Code */}
                            <div className="bg-white p-4 rounded-xl inline-block mb-6">
                                <QRCodeSVG
                                    value={shortCode}
                                    size={180}
                                    level="M"
                                />
                            </div>

                            <h1 className="text-2xl font-bold text-white mb-2">
                                Войти на сайт
                            </h1>

                            <p className="text-gray-400 mb-4">{message}</p>

                            {/* Short code display with countdown */}
                            <div className="bg-black/30 border border-white/10 rounded-xl p-4 mb-6">
                                <div className="text-sm text-gray-500 mb-2">Код для входа:</div>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="text-4xl font-mono font-bold text-[var(--accent)] tracking-widest">
                                        {formattedCode}
                                    </div>
                                    {/* Circular countdown timer */}
                                    <div className="relative w-12 h-12 flex-shrink-0">
                                        <svg className="w-12 h-12 transform -rotate-90">
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r="20"
                                                fill="none"
                                                stroke="rgba(255,255,255,0.1)"
                                                strokeWidth="4"
                                            />
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r="20"
                                                fill="none"
                                                stroke={timeLeft <= 5 ? '#ef4444' : 'var(--accent)'}
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeDasharray={`${(timeLeft / ttl) * 125.6} 125.6`}
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
                                            {timeLeft}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    Код обновится автоматически
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="flex items-start gap-3 text-left bg-white/5 rounded-xl p-4 mb-4">
                                <Smartphone className="w-6 h-6 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-gray-400">
                                    <p className="font-medium text-white mb-1">Как войти:</p>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Откройте приложение MAIN в Telegram</li>
                                        <li>Нажмите «Войти на сайт»</li>
                                        <li>Введите код выше</li>
                                    </ol>
                                </div>
                            </div>

                            {/* Spinner */}
                            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Ожидаем подтверждение...
                            </div>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Успешно!
                            </h1>
                            <p className="text-gray-400">{message}</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Ошибка
                            </h1>
                            <p className="text-gray-400 mb-6">{message}</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={generateToken}
                                    className="flex items-center gap-2 bg-[var(--accent)] text-black px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                                >
                                    <RefreshCw size={18} />
                                    Попробовать снова
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    На главную
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function AuthCallbackLoading() {
    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-[#151515] border border-white/10 rounded-2xl p-8">
                    <Loader2 className="w-16 h-16 text-[var(--accent)] mx-auto mb-6 animate-spin" />
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Загрузка...
                    </h1>
                </div>
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<AuthCallbackLoading />}>
            <AuthCallbackContent />
        </Suspense>
    )
}
