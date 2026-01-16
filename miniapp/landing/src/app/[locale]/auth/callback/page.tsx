'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

function AuthCallbackContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { login } = useAuth()
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
    const [message, setMessage] = useState('Ожидаем подтверждение в Telegram...')

    const token = searchParams.get('token')
    const returnUrl = searchParams.get('return') || '/'

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('Токен не найден')
            return
        }

        let attempts = 0
        const maxAttempts = 60 // 60 attempts * 2 seconds = 2 minutes timeout

        const checkToken = async () => {
            try {
                const response = await fetch(`/api/auth/validate-token?token=${token}`)
                const data = await response.json()

                if (data.success && data.user) {
                    // User confirmed! Log them in
                    setStatus('success')
                    setMessage('Успешно! Перенаправляем...')

                    // Store user in auth context
                    await login(data.user)

                    // Redirect after short delay
                    setTimeout(() => {
                        router.push(returnUrl)
                    }, 1000)
                    return true
                } else if (data.pending) {
                    // Still waiting for bot confirmation
                    attempts++
                    if (attempts >= maxAttempts) {
                        setStatus('error')
                        setMessage('Время ожидания истекло. Попробуйте снова.')
                        return true
                    }
                    return false
                } else {
                    // Error
                    setStatus('error')
                    setMessage(data.error || 'Ошибка авторизации')
                    return true
                }
            } catch (error) {
                console.error('Token check error:', error)
                setStatus('error')
                setMessage('Ошибка соединения')
                return true
            }
        }

        // Poll every 2 seconds
        const interval = setInterval(async () => {
            const done = await checkToken()
            if (done) {
                clearInterval(interval)
            }
        }, 2000)

        // Initial check
        checkToken()

        return () => clearInterval(interval)
    }, [token, returnUrl, login, router])

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="bg-[#151515] border border-white/10 rounded-2xl p-8">
                    {status === 'pending' && (
                        <>
                            <Loader2 className="w-16 h-16 text-[var(--accent)] mx-auto mb-6 animate-spin" />
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Авторизация
                            </h1>
                            <p className="text-gray-400 mb-6">{message}</p>
                            <div className="text-sm text-gray-500">
                                Откройте Telegram и подтвердите вход в боте @maincomapp_bot
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
                            <button
                                onClick={() => router.push('/')}
                                className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
                            >
                                Вернуться на главную
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// Loading fallback
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
