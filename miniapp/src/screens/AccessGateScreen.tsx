import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore, useToastStore } from '@/lib/store'
import { getTelegramUser } from '@/lib/telegram'
import { useInviteAndCreateUser, validateInviteCode } from '@/lib/supabase'
import { Button, Card, Input } from '@/components/ui' // Assuming these exist, matching project style
import { Lock, Gift, ArrowRight, Loader2, Check } from '@/components/Icons'

const AccessGateScreen: React.FC = () => {
    const { pendingInviteCode, setAccessDenied, setLoading, setUser, setProfile, setPendingInviteCode } = useAppStore()
    const { addToast } = useToastStore()

    const [code, setCode] = useState(pendingInviteCode || '')
    const [isVerifying, setIsVerifying] = useState(false)
    const [inviteDetails, setInviteDetails] = useState<{ inviterName?: string } | null>(null)

    // If pendingInviteCode is set (from deep link), validate it immediately
    useEffect(() => {
        if (pendingInviteCode) {
            setCode(pendingInviteCode)
            validateCode(pendingInviteCode)
        }
    }, [pendingInviteCode])

    const validateCode = async (inviteCode: string) => {
        if (inviteCode.length < 3) return
        setIsVerifying(true)

        try {
            const { valid, inviterName, error } = await validateInviteCode(inviteCode)
            if (valid) {
                setInviteDetails({ inviterName })
            } else {
                setInviteDetails(null)
                // Only show toast if user manually entered it or clicked verify
                if (!pendingInviteCode) {
                    addToast(error || 'Неверный код', 'error')
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsVerifying(false)
        }
    }

    const handleJoin = async () => {
        if (!code) return

        setIsVerifying(true)
        const tgUser = getTelegramUser()

        if (!tgUser) {
            addToast('Ошибка получения данных Telegram', 'error')
            setIsVerifying(false)
            return
        }

        try {
            const { success, user, error } = await useInviteAndCreateUser(code, {
                tg_user_id: tgUser.id,
                username: tgUser.username,
                first_name: tgUser.first_name,
                last_name: tgUser.last_name,
                photo_url: tgUser.photo_url
            })

            if (success && user) {
                addToast('Доступ получен! +50 XP', 'success')
                // Update global state
                setUser(user)
                setAccessDenied(false)
                setPendingInviteCode(null)
                // Reload page to re-init everything cleanly or just let App handle it
                window.location.reload()
            } else {
                addToast(error || 'Ошибка активации', 'error')
            }
        } catch (e) {
            console.error(e)
            addToast('Что-то пошло не так', 'error')
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-sm"
            >
                <div className="w-20 h-20 bg-card rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-border">
                    {inviteDetails ? (
                        <Gift size={40} className="text-accent animate-bounce-subtle" />
                    ) : (
                        <Lock size={40} className="text-gray-400" />
                    )}
                </div>

                <h1 className="text-2xl font-bold mb-2">
                    {inviteDetails ? 'Вас пригласили!' : 'Доступ закрыт'}
                </h1>

                <p className="text-gray-400 mb-8 leading-relaxed">
                    {inviteDetails ? (
                        <>
                            <span className="text-white font-semibold">{inviteDetails.inviterName}</span> подарил вам инвайт в закрытое сообщество MAIN.
                            <br /><br />
                            <span className="text-accent">🎁 +50 XP</span> вам и другу
                            <br />
                            <span className="text-accent">🎫 5 инвайтов</span> для друзей
                        </>
                    ) : (
                        'Сейчас доступ в MAIN Community открыт только по приглашениям. Введите код доступа, чтобы присоединиться.'
                    )}
                </p>

                <div className="space-y-4">
                    {!inviteDetails && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Инвайт-код (например: AB12...)"
                                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-center text-lg font-mono tracking-wider focus:outline-none focus:border-accent transition-colors"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={12}
                            />
                        </div>
                    )}

                    <button
                        onClick={inviteDetails ? handleJoin : () => validateCode(code)}
                        disabled={isVerifying || !code}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${inviteDetails
                                ? 'bg-accent text-bg hover:bg-accent-light'
                                : 'bg-card hover:bg-card-hover text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isVerifying ? (
                            <Loader2 className="animate-spin" />
                        ) : inviteDetails ? (
                            <>Присоединиться <ArrowRight size={20} /></>
                        ) : (
                            'Проверить код'
                        )}
                    </button>

                    {!inviteDetails && (
                        <p className="text-xs text-gray-500 mt-4">
                            Если у вас нет кода, попросите его у участников сообщества или в нашем чате.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

export default AccessGateScreen
