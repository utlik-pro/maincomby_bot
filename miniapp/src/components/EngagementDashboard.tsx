import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Bell, TrendingUp, Users, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { getEngagementStats, type EngagementStats } from '@/lib/supabase'
import { backButton } from '@/lib/telegram'
import { Card } from './ui'

interface EngagementDashboardProps {
    onClose: () => void
}

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
    'profile_incomplete': 'Профиль',
    'no_swipes': 'Нетворкинг',
    'inactive_7d': '7 дней',
    'inactive_14d': '14 дней',
    'likes_1': '1 лайк',
    'likes_3': '3 лайка',
    'likes_5': '5 лайков',
    'likes_10': '10 лайков',
}

const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
    'profile_incomplete': '👤',
    'no_swipes': '🔥',
    'inactive_7d': '📅',
    'inactive_14d': '📆',
    'likes_1': '❤️',
    'likes_3': '💕',
    'likes_5': '⭐',
    'likes_10': '🎉',
}

export const EngagementDashboard: React.FC<EngagementDashboardProps> = ({ onClose }) => {
    // Telegram BackButton handler
    useEffect(() => {
        backButton.show(onClose)
        return () => {
            backButton.hide()
        }
    }, [onClose])

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['engagementStats'],
        queryFn: getEngagementStats,
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // 1 minute
    })

    // Calculate totals
    const totals = stats?.summary.reduce((acc, item) => ({
        sent: acc.sent + (item.total_sent || 0),
        delivered: acc.delivered + (item.delivered || 0),
        conversions: acc.conversions + (item.conversions || 0),
    }), { sent: 0, delivered: 0, conversions: 0 }) || { sent: 0, delivered: 0, conversions: 0 }

    const overallConversionRate = totals.delivered > 0
        ? ((totals.conversions / totals.delivered) * 100).toFixed(1)
        : '0.0'

    return (
        <div className="fixed inset-0 z-[60] bg-bg overflow-y-auto">
            {/* Top spacer for Telegram header */}
            <div className="h-14" />

            {/* Sticky Header */}
            <div className="sticky top-14 z-10 bg-bg border-b border-border">
                <div className="p-4 bg-green-500/10">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-green-500">
                        <Bell size={20} />
                        Engagement Аналитика
                    </h2>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <Loader2 size={32} className="mx-auto animate-spin text-accent" />
                            <p className="text-gray-400 mt-2">Загрузка статистики...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-400">
                            Ошибка загрузки статистики
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <Card className="text-center">
                                    <div className="text-3xl font-bold text-accent">{totals.sent}</div>
                                    <div className="text-xs text-gray-400 mt-1">Отправлено</div>
                                </Card>
                                <Card className="text-center">
                                    <div className="text-3xl font-bold text-green-500">{totals.conversions}</div>
                                    <div className="text-xs text-gray-400 mt-1">Конверсий</div>
                                </Card>
                                <Card className="text-center">
                                    <div className="text-3xl font-bold text-blue-400">{overallConversionRate}%</div>
                                    <div className="text-xs text-gray-400 mt-1">CR</div>
                                </Card>
                                <Card className="text-center">
                                    <div className="text-3xl font-bold text-yellow-500">{totals.delivered}</div>
                                    <div className="text-xs text-gray-400 mt-1">Доставлено</div>
                                </Card>
                            </div>

                            {/* By Type */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                                    <TrendingUp size={14} />
                                    По типам уведомлений
                                </h3>
                                <div className="space-y-2">
                                    {stats?.summary.map((item) => (
                                        <div
                                            key={item.notification_type}
                                            className="bg-bg rounded-xl p-3 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">
                                                    {NOTIFICATION_TYPE_ICONS[item.notification_type] || '📨'}
                                                </span>
                                                <div>
                                                    <div className="font-semibold text-sm">
                                                        {NOTIFICATION_TYPE_LABELS[item.notification_type] || item.notification_type}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {item.total_sent} отправлено
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold ${item.conversion_rate >= 20 ? 'text-green-500' : item.conversion_rate >= 10 ? 'text-yellow-500' : 'text-gray-400'}`}>
                                                    {item.conversion_rate?.toFixed(1) || '0.0'}%
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {item.conversions || 0} conv
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!stats?.summary || stats.summary.length === 0) && (
                                        <div className="text-center py-8 text-gray-500">
                                            Нет данных. Уведомления еще не отправлялись.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Daily Stats */}
                            {stats?.daily && stats.daily.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                                        <Clock size={14} />
                                        Последние дни
                                    </h3>
                                    <div className="space-y-2">
                                        {/* Group by date */}
                                        {Object.entries(
                                            stats.daily.reduce((acc, item) => {
                                                if (!acc[item.date]) acc[item.date] = []
                                                acc[item.date].push(item)
                                                return acc
                                            }, {} as Record<string, typeof stats.daily>)
                                        ).slice(0, 7).map(([date, items]) => {
                                            const daySent = items.reduce((sum, i) => sum + (i.total_sent || 0), 0)
                                            const dayConv = items.reduce((sum, i) => sum + (i.conversions || 0), 0)
                                            const dayRate = daySent > 0 ? ((dayConv / daySent) * 100).toFixed(1) : '0.0'

                                            return (
                                                <div key={date} className="bg-bg rounded-xl p-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold text-sm">
                                                            {new Date(date).toLocaleDateString('ru-RU', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </span>
                                                        <div className="flex gap-4 text-xs">
                                                            <span className="text-gray-400">{daySent} отпр.</span>
                                                            <span className="text-green-500">{dayConv} conv</span>
                                                            <span className="text-blue-400">{dayRate}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

            {/* Footer */}
            <div className="p-4 text-center text-xs text-gray-600 font-mono">
                ADMIN ONLY • Auto-refresh 1min
            </div>

            {/* Bottom spacer for navigation */}
            <div className="h-20" />
        </div>
    )
}
