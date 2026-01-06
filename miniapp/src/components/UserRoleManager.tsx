import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Shield, Award, Medal, Crown, HeartHandshake, X, Check, Loader2 } from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { searchUsers, updateUserRole } from '@/lib/supabase'
import { hapticFeedback } from '@/lib/telegram'
import { Avatar, Badge, Button, Card } from './ui'
import { TeamRole, TEAM_BADGES } from '@/types'

interface UserRoleManagerProps {
    onClose: () => void
}

const ROLE_OPTIONS: Array<{ value: TeamRole; label: string; icon: React.ReactNode; color: string }> = [
    { value: null, label: 'Нет роли', icon: <X size={16} />, color: 'bg-gray-600' },
    { value: 'core', label: 'Core Team', icon: <Shield size={16} />, color: 'bg-[#c8ff00] text-black' },
    { value: 'volunteer', label: 'Волонтёр', icon: <HeartHandshake size={16} />, color: 'bg-green-500' },
    { value: 'speaker', label: 'Спикер', icon: <Award size={16} />, color: 'bg-purple-500' },
    { value: 'partner', label: 'Партнёр', icon: <Medal size={16} />, color: 'bg-blue-500' },
    { value: 'sponsor', label: 'Спонсор', icon: <Crown size={16} />, color: 'bg-yellow-500 text-black' },
]

export const UserRoleManager: React.FC<UserRoleManagerProps> = ({ onClose }) => {
    const { user: currentUser } = useAppStore()
    const { addToast } = useToastStore()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isUpdating, setIsUpdating] = useState(false)

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

    const handleUpdateRole = async (newRole: TeamRole) => {
        if (!selectedUser) return

        setIsUpdating(true)
        hapticFeedback.medium()

        try {
            const success = await updateUserRole(selectedUser.id, newRole)

            if (success) {
                hapticFeedback.success()
                addToast(
                    newRole
                        ? `Роль "${ROLE_OPTIONS.find(r => r.value === newRole)?.label}" назначена`
                        : 'Роль удалена',
                    'success'
                )
                setSelectedUser({ ...selectedUser, team_role: newRole })
            } else {
                hapticFeedback.error()
                addToast('Ошибка обновления роли', 'error')
            }
        } catch (e) {
            hapticFeedback.error()
            addToast('Ошибка', 'error')
        } finally {
            setIsUpdating(false)
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
                        Управление ролями
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
                            const roleOption = ROLE_OPTIONS.find(r => r.value === user.team_role)

                            return (
                                <Card
                                    key={user.id}
                                    className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-accent' : ''
                                        }`}
                                    onClick={() => handleSelectUser(user)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar
                                            src={profileData?.photo_url}
                                            name={user.first_name || 'User'}
                                            size="sm"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold truncate">
                                                {user.first_name} {user.last_name || ''}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                @{user.username || 'no_username'} • {user.points} XP
                                            </div>
                                        </div>
                                        {roleOption && roleOption.value && (
                                            <Badge className={roleOption.color}>
                                                {roleOption.icon}
                                                {roleOption.label}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Role selector (shown when selected) */}
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden mt-3 pt-3 border-t border-border"
                                            >
                                                <div className="text-xs text-gray-400 mb-2">Назначить роль:</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {ROLE_OPTIONS.map((option) => (
                                                        <button
                                                            key={option.label}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleUpdateRole(option.value)
                                                            }}
                                                            disabled={isUpdating || user.team_role === option.value}
                                                            className={`
                                p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1
                                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                ${user.team_role === option.value
                                                                    ? option.color + ' ring-2 ring-white'
                                                                    : 'bg-bg hover:bg-bg-card border border-border'
                                                                }
                              `}
                                                        >
                                                            {isUpdating ? (
                                                                <Loader2 size={14} className="animate-spin" />
                                                            ) : (
                                                                <>
                                                                    {option.icon}
                                                                    {option.label}
                                                                    {user.team_role === option.value && <Check size={14} />}
                                                                </>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
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
                    ADMIN ONLY • {searchResults?.length || 0} результатов
                </div>
            </motion.div>
        </div>
    )
}
