import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, X, Gift, Crown, Loader2 } from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { searchUsers, giftUserPro, getRecentAdminActions } from '@/lib/supabase'
import { hapticFeedback } from '@/lib/telegram'
import { Avatar, Card } from './ui'

interface UserManagerProps {
    onClose: () => void
}

export const UserManager: React.FC<UserManagerProps> = ({ onClose }) => {
    const { user } = useAppStore()
    const { addToast } = useToastStore()
    const [activeTab, setActiveTab] = useState<'search' | 'history'>('search')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isGifting, setIsGifting] = useState(false)

    // Search query
    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['adminSearch', searchQuery],
        queryFn: () => searchUsers(searchQuery),
        enabled: searchQuery.length >= 2,
        staleTime: 0
    })

    // History query
    const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
        queryKey: ['adminHistory'],
        queryFn: () => getRecentAdminActions(),
        enabled: activeTab === 'history',
        refetchInterval: 5000
    })

    const handleSelectUser = (u: any) => {
        if (selectedUser?.id === u.id) {
            setSelectedUser(null)
        } else {
            setSelectedUser(u)
            hapticFeedback.selection()
        }
    }

    const handleGiftPro = async () => {
        if (!selectedUser || !user) return

        setIsGifting(true)
        try {
            const success = await giftUserPro(selectedUser.id, 30, {
                name: user.first_name || 'Admin',
                username: user.username || 'admin'
            })
            if (success) {
                addToast(`PRO статус выдан пользователю ${selectedUser.first_name}`, 'success')
                setSelectedUser(null)
                hapticFeedback.success()
                if (activeTab === 'history') refetchHistory()
            } else {
                addToast('Ошибка при выдаче PRO', 'error')
                hapticFeedback.error()
            }
        } catch (e) {
            console.error(e)
            addToast('Ошибка выполнения', 'error')
        } finally {
            setIsGifting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-bg-card w-full max-w-md rounded-2xl border border-border flex flex-col max-h-[80vh] overflow-hidden shadow-2xl"
            >
                {/* Header with Tabs */}
                <div className="p-4 border-b border-border bg-accent/10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 text-accent">
                            <Users size={20} />
                            Управление пользователями
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex gap-2 p-1 bg-black/20 rounded-lg">
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'search'
                                ? 'bg-accent text-black shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Поиск
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history'
                                ? 'bg-accent text-black shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            История
                        </button>
                    </div>
                </div>

                {/* Content based on tab */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeTab === 'search' ? (
                        <>
                            <div className="mb-4 relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Поиск по имени или @username..."
                                    className="w-full bg-bg rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-accent"
                                />
                                <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
                            </div>

                            {searchQuery.length < 2 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <Search size={48} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Введите минимум 2 символа для поиска</p>
                                </div>
                            ) : isLoading ? (
                                <div className="text-center py-12">
                                    <Loader2 size={32} className="mx-auto animate-spin text-accent" />
                                </div>
                            ) : searchResults && searchResults.length > 0 ? (
                                searchResults.map((user: any) => {
                                    const profileData = Array.isArray(user.profile) ? user.profile[0] : user.profile
                                    const isSelected = selectedUser?.id === user.id
                                    const isPro = user.subscription_tier === 'pro'

                                    return (
                                        <Card
                                            key={user.id}
                                            className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-accent' : ''}`}
                                            onClick={() => handleSelectUser(user)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    src={profileData?.photo_url}
                                                    name={user.first_name || 'User'}
                                                    size="sm"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold truncate flex items-center gap-2">
                                                        {user.first_name} {user.last_name || ''}
                                                        {isPro && <Crown size={14} className="text-yellow-500 fill-yellow-500" />}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        @{user.username || 'no_username'} • {user.points} XP
                                                    </div>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden mt-3 pt-3 border-t border-border"
                                                    >
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleGiftPro()
                                                            }}
                                                            disabled={isGifting}
                                                            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                                        >
                                                            {isGifting ? (
                                                                <Loader2 size={18} className="animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Gift size={18} />
                                                                    Подарить PRO (30 дней)
                                                                </>
                                                            )}
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Card>
                                    )
                                })
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Users size={48} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Пользователи не найдены</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            {historyLoading ? (
                                <div className="text-center py-8">
                                    <Loader2 size={24} className="mx-auto animate-spin text-accent" />
                                </div>
                            ) : !historyData?.length ? (
                                <div className="text-center py-8 text-gray-400">
                                    История пуста
                                </div>
                            ) : (
                                historyData.map((action: any) => {
                                    const payload = action.payload || {}
                                    const date = new Date(action.created_at).toLocaleString('ru-RU', {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })

                                    let statusColor = 'text-gray-400'
                                    let statusText = 'Ожидание'

                                    if (action.status === 'completed') {
                                        statusColor = 'text-green-500'
                                        statusText = 'Выполнено'
                                    } else if (action.status === 'failed') {
                                        statusColor = 'text-red-500'
                                        statusText = 'Ошибка'
                                    } else if (action.status === 'processing') {
                                        statusColor = 'text-blue-500'
                                        statusText = 'В процессе'
                                    }

                                    return (
                                        <div key={action.id} className="p-3 rounded-xl bg-bg border border-border">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-semibold text-sm">
                                                    {action.action === 'gift_pro' ? '🎁 Подарок PRO' : action.action}
                                                </div>
                                                <div className={`text-xs font-bold ${statusColor}`}>
                                                    {statusText}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-300 space-y-1">
                                                <div>User ID: {payload.user_id}</div>
                                                <div>Срок: {payload.duration_days} дней</div>
                                                <div className="text-gray-500 mt-1">{date}</div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-bg border-t border-border text-center text-xs text-gray-600 font-mono">
                    SUPERADMIN ONLY • {activeTab === 'history' ? 'Auto-refresh 5s' : 'User Manager'}
                </div>
            </motion.div>
        </div>
    )
}
