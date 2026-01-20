import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, X, Gift, Crown, Loader2 } from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { searchUsers, giftUserPro } from '@/lib/supabase'
import { hapticFeedback } from '@/lib/telegram'
import { Avatar, Card } from './ui'

interface UserManagerProps {
    onClose: () => void
}

export const UserManager: React.FC<UserManagerProps> = ({ onClose }) => {
    const { user: currentUser } = useAppStore()
    const { addToast } = useToastStore()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isGifting, setIsGifting] = useState(false)

    // Verify superadmin status
    const isSuperAdmin = ['dmitryutlik', 'utlik_offer'].includes(currentUser?.username || '')

    // Search users
    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['searchUsers', searchQuery],
        queryFn: () => searchQuery.length >= 2 ? searchUsers(searchQuery) : [],
        enabled: searchQuery.length >= 2,
    })

    const handleSelectUser = (user: any) => {
        setSelectedUser(user)
        hapticFeedback.light()
    }

    const handleGiftPro = async () => {
        if (!selectedUser || !currentUser) return

        setIsGifting(true)
        hapticFeedback.medium()

        try {
            // Only dmitryutlik and utlik_offer can gift PRO
            const success = await giftUserPro(selectedUser.id, 30, {
                name: currentUser.first_name || 'Дмитрий Утлик',
                username: currentUser.username || 'dmitryutlik',
                // Avatar will be fetched by backend from profile if needed
            })


            if (success) {
                hapticFeedback.success()
                addToast(`PRO подписка подарена пользователю ${selectedUser.first_name}`, 'success')
                setSelectedUser({ ...selectedUser, subscription_tier: 'pro' })
            } else {
                throw new Error('Failed to gift PRO')
            }
        } catch (e) {
            console.error(e)
            hapticFeedback.error()
            addToast('Ошибка при выдаче PRO', 'error')
        } finally {
            setIsGifting(false)
        }
    }


    if (!isSuperAdmin) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Content */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative w-full max-w-lg bg-bg-card rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex justify-between items-center bg-accent/10">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-accent">
                        <Users size={20} />
                        Управление пользователями
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-border">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск по имени или @username..."
                            className="w-full bg-bg rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-accent"
                        />
                        <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
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

                                    {/* Actions (shown when selected) */}
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
                </div>

                {/* Footer */}
                <div className="p-4 bg-bg border-t border-border text-center text-xs text-gray-600 font-mono">
                    SUPERADMIN ONLY
                </div>
            </motion.div>
        </div>
    )
}
