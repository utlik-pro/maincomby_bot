import React, { useEffect, useState } from 'react'
import { useAppStore, useToastStore } from '@/lib/store'
import { getUserInvites, generateInviteLink, createUserInvites } from '@/lib/supabase'
import { Invite } from '@/types'
import { Copy, Share, Gift, Users, Check, X } from '@/components/Icons'
import { getTelegramWebApp } from '@/lib/telegram'

interface InviteBottomSheetProps {
    onClose: () => void
}

export const InviteBottomSheet: React.FC<InviteBottomSheetProps> = ({ onClose }) => {
    const { user, addPoints } = useAppStore()
    const { addToast } = useToastStore()
    const [invites, setInvites] = useState<Invite[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    useEffect(() => {
        loadInvites()
    }, [])

    const loadInvites = async () => {
        if (!user) return
        setIsLoading(true)
        const data = await getUserInvites(user.id)
        setInvites(data)
        setIsLoading(false)
    }

    const handleCopy = (code: string, id: string) => {
        const link = generateInviteLink(code)
        navigator.clipboard.writeText(link)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
        addToast('Ссылка скопирована', 'success')
    }

    const handleShare = (code: string) => {
        const link = generateInviteLink(code)
        const webApp = getTelegramWebApp()

        const text = `🎁 Приглашаю тебя в MAIN Community! Регистрируйся по ссылке и получи +50 XP:`
        const url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`

        webApp?.openTelegramLink(url)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative w-full max-w-sm bg-card rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Gift className="text-accent" size={20} />
                        Твои приглашения
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-4 flex gap-3 text-sm">
                        <Users className="text-accent shrink-0" size={20} />
                        <p className="text-gray-300">
                            Получи <span className="text-accent font-bold">+50 XP</span> за каждого друга, который присоединится по твоему инвайту. Друг тоже получит бонус!
                        </p>
                    </div>

                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-sm text-gray-400">Доступно: {user?.invites_remaining || 0}</span>
                        <span className="text-sm text-gray-400">Всего: {invites.length}</span>
                    </div>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">Загрузка инвайтов...</div>
                        ) : invites.length > 0 ? (
                            invites.map((invite) => {
                                const isUsed = !!invite.used_at
                                return (
                                    <div
                                        key={invite.id}
                                        className={`p-3 rounded-xl border flex items-center justify-between ${isUsed ? 'bg-bg/50 border-border opacity-60' : 'bg-bg border-border'
                                            }`}
                                    >
                                        <div>
                                            <div className="font-mono text-lg font-bold tracking-wider">
                                                {invite.code}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {isUsed ? 'Использован' : 'Активен'}
                                            </div>
                                        </div>

                                        {!isUsed && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleCopy(invite.code, invite.id)}
                                                    className="p-2 rounded-lg bg-card hover:bg-card-hover transition-colors text-gray-300"
                                                >
                                                    {copiedId === invite.id ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                                </button>
                                                <button
                                                    onClick={() => handleShare(invite.code)}
                                                    className="p-2 rounded-lg bg-accent text-bg hover:bg-accent-light transition-colors"
                                                >
                                                    <Share size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-8 px-4 bg-bg rounded-xl border border-dashed border-border flex flex-col items-center gap-4">
                                <div className="text-gray-500">У вас пока нет сгенерированных инвайтов</div>
                                {user && user.invites_remaining > 0 && (
                                    <button
                                        onClick={async () => {
                                            setIsLoading(true)
                                            const success = await createUserInvites(user.id, user.invites_remaining)
                                            if (success) {
                                                await loadInvites()
                                                addToast('Инвайты успешно созданы!', 'success')
                                            } else {
                                                addToast('Ошибка при создании инвайтов', 'error')
                                                setIsLoading(false)
                                            }
                                        }}
                                        className="px-6 py-2 bg-accent text-bg font-bold rounded-xl hover:bg-accent-light transition-colors"
                                    >
                                        Создать {user.invites_remaining} инвайтов
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}
