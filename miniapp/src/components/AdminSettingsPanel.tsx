import React, { useState, useEffect } from 'react'
import { useAppStore, useToastStore } from '@/lib/store'
import { isInviteRequired, updateAppSetting, getActiveEvents } from '@/lib/supabase'
import { Settings, X, Shield, Users, AlertCircle, UserCog, Link, Copy, Calendar, ChevronLeft, Share2, BarChart3, RotateCcw, BookOpen, Send } from 'lucide-react'
import { UserRoleManager } from './UserRoleManager'
import { AnalyticsPanel } from './AnalyticsPanel'
import { LearningAdminPanel } from './LearningAdminPanel'
import { BroadcastPanel } from './BroadcastPanel'
import { Event } from '@/types'
import { hapticFeedback, shareUrl } from '@/lib/telegram'

interface AdminSettingsPanelProps {
    onClose: () => void
}

export const AdminSettingsPanel: React.FC<AdminSettingsPanelProps> = ({ onClose }) => {
    const { user, setInviteRequired } = useAppStore()
    const { addToast } = useToastStore()

    const [inviteRequired, setLocalInviteRequired] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [showRoleManager, setShowRoleManager] = useState(false)
    const [showEventLinks, setShowEventLinks] = useState(false)
    const [showAnalytics, setShowAnalytics] = useState(false)
    const [showLearningAdmin, setShowLearningAdmin] = useState(false)
    const [showBroadcast, setShowBroadcast] = useState(false)
    const [events, setEvents] = useState<Event[]>([])
    const [eventsLoading, setEventsLoading] = useState(false)

    // Verify superadmin status
    const isSuperAdmin = ['dmitryutlik', 'utlik_offer'].includes(user?.username || '')

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setIsLoading(true)
        const required = await isInviteRequired()
        setLocalInviteRequired(required)
        setIsLoading(false)
    }

    const handleToggleInvite = async () => {
        if (!user) return
        setIsSaving(true)
        try {
            const newValue = !inviteRequired
            const success = await updateAppSetting('invite_required', newValue, user.id)

            if (success) {
                setLocalInviteRequired(newValue)
                setInviteRequired(newValue)
                addToast(`Система инвайтов ${newValue ? 'включена' : 'выключена'}`, 'success')
            } else {
                addToast('Ошибка сохранения', 'error')
            }
        } catch (e) {
            console.error(e)
            addToast('Ошибка', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    const loadEvents = async () => {
        setEventsLoading(true)
        try {
            const data = await getActiveEvents()
            setEvents(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setEventsLoading(false)
        }
    }

    const handleOpenEventLinks = () => {
        setShowEventLinks(true)
        loadEvents()
    }

    const copyEventLink = (eventId: number, eventTitle: string) => {
        const link = `https://t.me/maincomapp_bot?startapp=event_${eventId}`
        navigator.clipboard.writeText(link).then(() => {
            hapticFeedback.success()
            addToast(`Ссылка скопирована`, 'success')
        }).catch(() => {
            addToast('Ошибка копирования', 'error')
        })
    }

    const shareEventLink = (eventId: number, eventTitle: string) => {
        hapticFeedback.light()
        const link = `https://t.me/maincomapp_bot?startapp=event_${eventId}`
        shareUrl(link, `${eventTitle} — присоединяйся!`)
    }

    if (!isSuperAdmin) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative w-full max-w-sm bg-bg-card rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-border flex justify-between items-center bg-red-500/10">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-red-500">
                        <Shield size={20} />
                        Admin Control
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="p-4 rounded-xl bg-bg border border-border">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${inviteRequired ? 'bg-green-500/20 text-green-500' : 'bg-gray-700/50 text-gray-500'}`}>
                                    <Users size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold">Система инвайтов</div>
                                    <div className="text-xs text-gray-400">Доступ только по кодам</div>
                                </div>
                            </div>

                            <button
                                onClick={handleToggleInvite}
                                disabled={isSaving || isLoading}
                                className={`w-14 h-8 rounded-full p-1 transition-colors ${inviteRequired ? 'bg-green-500' : 'bg-gray-700'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${inviteRequired ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                            Если включено, новые пользователи не смогут войти без валидного инвайт-кода. Существующие пользователи сохранят доступ.
                        </p>
                    </div>

                    {/* User Role Management */}
                    <button
                        onClick={() => setShowRoleManager(true)}
                        className="w-full p-4 rounded-xl bg-bg border border-border hover:border-accent/50 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                                    <UserCog size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">Управление ролями</div>
                                    <div className="text-xs text-gray-400">Назначать core, volunteer и др.</div>
                                </div>
                            </div>
                            <div className="text-accent">→</div>
                        </div>
                    </button>

                    {/* Event Links */}
                    <button
                        onClick={handleOpenEventLinks}
                        className="w-full p-4 rounded-xl bg-bg border border-border hover:border-accent/50 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center">
                                    <Link size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">Ссылки на события</div>
                                    <div className="text-xs text-gray-400">Скопировать deep link</div>
                                </div>
                            </div>
                            <div className="text-accent">→</div>
                        </div>
                    </button>

                    {/* Analytics */}
                    <button
                        onClick={() => setShowAnalytics(true)}
                        className="w-full p-4 rounded-xl bg-bg border border-border hover:border-purple-500/50 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center">
                                    <BarChart3 size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">Аналитика</div>
                                    <div className="text-xs text-gray-400">Статистика приложения</div>
                                </div>
                            </div>
                            <div className="text-purple-500">→</div>
                        </div>
                    </button>

                    {/* Learning Admin */}
                    <button
                        onClick={() => setShowLearningAdmin(true)}
                        className="w-full p-4 rounded-xl bg-bg border border-border hover:border-accent/50 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                                    <BookOpen size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">Управление курсами</div>
                                    <div className="text-xs text-gray-400">Вкл/выкл курсы и уроки</div>
                                </div>
                            </div>
                            <div className="text-accent">→</div>
                        </div>
                    </button>

                    {/* Broadcast */}
                    <button
                        onClick={() => setShowBroadcast(true)}
                        className="w-full p-4 rounded-xl bg-bg border border-border hover:border-blue-500/50 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center">
                                    <Send size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">Рассылка</div>
                                    <div className="text-xs text-gray-400">Push-уведомления пользователям</div>
                                </div>
                            </div>
                            <div className="text-blue-500">→</div>
                        </div>
                    </button>

                    {/* Reset Easter Eggs */}
                    <button
                        onClick={() => {
                            localStorage.removeItem('unlocked_easter_eggs')
                            hapticFeedback.success()
                            addToast('Пасхалки сброшены! Перезагрузи приложение', 'success')
                        }}
                        className="w-full p-4 rounded-xl bg-bg border border-border hover:border-orange-500/50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center">
                                    <RotateCcw size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">Сбросить пасхалки</div>
                                    <div className="text-xs text-gray-400">Для тестирования XP</div>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="p-4 bg-bg border-t border-border text-center text-xs text-gray-600 font-mono">
                    LOGGED AS: {user?.username} (SUPERADMIN)
                </div>
            </div>

            {/* User Role Manager Modal */}
            {showRoleManager && (
                <UserRoleManager onClose={() => setShowRoleManager(false)} />
            )}

            {/* Analytics Panel */}
            {showAnalytics && (
                <AnalyticsPanel onClose={() => setShowAnalytics(false)} />
            )}

            {/* Learning Admin Panel */}
            {showLearningAdmin && (
                <LearningAdminPanel onClose={() => setShowLearningAdmin(false)} />
            )}

            {/* Broadcast Panel */}
            {showBroadcast && (
                <BroadcastPanel onClose={() => setShowBroadcast(false)} />
            )}

            {/* Event Links Panel */}
            {showEventLinks && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowEventLinks(false)}
                    />
                    <div className="relative w-full max-w-sm bg-bg-card rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-blue-500/10">
                            <button
                                onClick={() => setShowEventLinks(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <h2 className="text-lg font-bold flex items-center gap-2 text-blue-500">
                                <Link size={20} />
                                Ссылки на события
                            </h2>
                            <div className="w-6" />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {eventsLoading ? (
                                <div className="text-center text-gray-400 py-8">Загрузка...</div>
                            ) : events.length === 0 ? (
                                <div className="text-center text-gray-400 py-8">Нет активных событий</div>
                            ) : (
                                events.map((event) => (
                                    <div
                                        key={event.id}
                                        className="p-3 rounded-xl bg-bg border border-border"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold truncate">{event.title}</div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                    <Calendar size={12} />
                                                    {new Date(event.event_date).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => copyEventLink(event.id, event.title)}
                                                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-700/50 text-gray-300 flex items-center justify-center active:scale-95 transition-transform"
                                                    title="Скопировать"
                                                >
                                                    <Copy size={18} />
                                                </button>
                                                <button
                                                    onClick={() => shareEventLink(event.id, event.title)}
                                                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center active:scale-95 transition-transform"
                                                    title="Поделиться"
                                                >
                                                    <Share2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 font-mono break-all">
                                            t.me/maincomapp_bot?startapp=event_{event.id}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
