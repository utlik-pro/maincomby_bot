import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, XCircle, Loader2, Eye, Users, CheckCheck } from 'lucide-react'
import { getAllProfilesAdmin, moderateProfileAdmin, batchModerateProfiles, ProfileModerationStatus } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { hapticFeedback, backButton, showConfirm } from '@/lib/telegram'

interface ProfileForModeration {
    id: number
    user_id: number
    photo_url: string | null
    occupation: string | null
    bio: string | null
    moderation_status: ProfileModerationStatus
    created_at: string
    user?: {
        id: number
        username: string | null
        first_name: string | null
        last_name: string | null
        tg_user_id: number
    }
}

interface ProfileModerationPanelProps {
    onClose: () => void
}

export const ProfileModerationPanel: React.FC<ProfileModerationPanelProps> = ({ onClose }) => {
    const { user } = useAppStore()
    const queryClient = useQueryClient()
    const [filter, setFilter] = useState<ProfileModerationStatus | 'all'>('pending')
    const [selectedProfile, setSelectedProfile] = useState<ProfileForModeration | null>(null)

    // Telegram BackButton handler
    useEffect(() => {
        backButton.show(onClose)
        return () => {
            backButton.hide()
        }
    }, [onClose])

    const { data: profiles = [], isLoading } = useQuery({
        queryKey: ['adminProfiles', filter],
        queryFn: () => filter === 'all'
            ? getAllProfilesAdmin()
            : getAllProfilesAdmin(filter as ProfileModerationStatus),
    })

    const pendingCount = profiles.filter(p => p.moderation_status === 'pending').length

    const approveMutation = useMutation({
        mutationFn: async (profileId: number) => {
            if (!user?.id) throw new Error('Not authenticated')
            return moderateProfileAdmin(profileId, 'approved', user.id)
        },
        onSuccess: () => {
            hapticFeedback.success()
            queryClient.invalidateQueries({ queryKey: ['adminProfiles'] })
            queryClient.invalidateQueries({ queryKey: ['analytics'] })
            setSelectedProfile(null)
        }
    })

    const rejectMutation = useMutation({
        mutationFn: async (profileId: number) => {
            if (!user?.id) throw new Error('Not authenticated')
            return moderateProfileAdmin(profileId, 'rejected', user.id)
        },
        onSuccess: () => {
            hapticFeedback.success()
            queryClient.invalidateQueries({ queryKey: ['adminProfiles'] })
            queryClient.invalidateQueries({ queryKey: ['analytics'] })
            setSelectedProfile(null)
        }
    })

    const batchApproveMutation = useMutation({
        mutationFn: async (profileIds: number[]) => {
            if (!user?.id) throw new Error('Not authenticated')
            return batchModerateProfiles(profileIds, 'approved', user.id)
        },
        onSuccess: (result) => {
            hapticFeedback.success()
            queryClient.invalidateQueries({ queryKey: ['adminProfiles'] })
            queryClient.invalidateQueries({ queryKey: ['analytics'] })
        }
    })

    const handleApprove = (profileId: number) => {
        approveMutation.mutate(profileId)
    }

    const handleReject = (profileId: number) => {
        rejectMutation.mutate(profileId)
    }

    const handleBatchApprove = async () => {
        const pendingProfiles = profiles.filter(p => p.moderation_status === 'pending')
        if (pendingProfiles.length === 0) return

        const confirmed = await showConfirm(
            `Одобрить все ${pendingProfiles.length} профилей?`
        )
        if (confirmed) {
            batchApproveMutation.mutate(pendingProfiles.map(p => p.id))
        }
    }

    const getProfileName = (profile: ProfileForModeration) => {
        if (profile.user) {
            return [profile.user.first_name, profile.user.last_name]
                .filter(Boolean)
                .join(' ') || profile.user.username || 'Unknown'
        }
        return 'Unknown'
    }

    const getStatusBadge = (status: ProfileModerationStatus) => {
        const config = {
            pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Ожидает' },
            approved: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Одобрен' },
            rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Отклонён' },
        }
        const c = config[status]
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
                {c.label}
            </span>
        )
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-bg-card w-full max-w-lg rounded-2xl border border-border flex flex-col max-h-[85vh] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-4 border-b border-border bg-pink-500/10">
                    <div className="flex justify-between items-center">
                        <div /> {/* Spacer */}
                        <h2 className="text-lg font-bold flex items-center gap-2 text-pink-400">
                            <Users size={20} />
                            Профили
                            {pendingCount > 0 && (
                                <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Filter tabs + Batch action */}
                    <div className="flex items-center justify-between mt-3 gap-2">
                        <div className="flex gap-2 flex-1 overflow-x-auto">
                            {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                        filter === status
                                            ? 'bg-pink-500 text-black'
                                            : 'bg-bg text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {status === 'pending' ? 'Ожидают' :
                                     status === 'approved' ? 'Одобрены' :
                                     status === 'rejected' ? 'Отклонены' : 'Все'}
                                </button>
                            ))}
                        </div>

                        {/* Batch approve button */}
                        {filter === 'pending' && pendingCount > 0 && (
                            <button
                                onClick={handleBatchApprove}
                                disabled={batchApproveMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors whitespace-nowrap"
                            >
                                {batchApproveMutation.isPending ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <CheckCheck size={14} />
                                )}
                                Все
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <Loader2 size={32} className="mx-auto animate-spin text-pink-400" />
                            <p className="text-gray-400 mt-2">Загрузка...</p>
                        </div>
                    ) : profiles.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            {filter === 'pending' ? 'Нет профилей на модерации' : 'Нет профилей'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {profiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    className="bg-bg rounded-xl p-3 border border-border hover:border-pink-500/30 transition-colors"
                                >
                                    <div className="flex gap-3">
                                        {/* Profile photo */}
                                        {profile.photo_url ? (
                                            <img
                                                src={profile.photo_url}
                                                alt="Profile"
                                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                <Users size={24} className="text-gray-500" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            {/* Name + Status */}
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-sm font-medium truncate">
                                                    {getProfileName(profile)}
                                                </span>
                                                {getStatusBadge(profile.moderation_status)}
                                            </div>

                                            {/* Occupation */}
                                            {profile.occupation && (
                                                <p className="text-xs text-pink-400 truncate">
                                                    {profile.occupation}
                                                </p>
                                            )}

                                            {/* Bio preview */}
                                            {profile.bio && (
                                                <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                                                    {profile.bio}
                                                </p>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => setSelectedProfile(profile)}
                                                    className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 hover:bg-gray-600"
                                                >
                                                    <Eye size={12} />
                                                    Просмотр
                                                </button>

                                                {profile.moderation_status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(profile.id)}
                                                            disabled={approveMutation.isPending}
                                                            className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded text-xs text-green-400 hover:bg-green-500/30"
                                                        >
                                                            <Check size={12} />
                                                            OK
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(profile.id)}
                                                            disabled={rejectMutation.isPending}
                                                            className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded text-xs text-red-400 hover:bg-red-500/30"
                                                        >
                                                            <XCircle size={12} />
                                                            Нет
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-bg border-t border-border text-center text-xs text-gray-600 font-mono">
                    PROFILE MODERATION • {profiles.length} total
                </div>
            </motion.div>

            {/* Detail/Preview Modal */}
            <AnimatePresence>
                {selectedProfile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
                        onClick={() => setSelectedProfile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-bg-card max-w-md w-full rounded-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {selectedProfile.photo_url ? (
                                <img
                                    src={selectedProfile.photo_url}
                                    alt="Profile"
                                    className="w-full max-h-64 object-cover"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                                    <Users size={64} className="text-gray-600" />
                                </div>
                            )}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold">{getProfileName(selectedProfile)}</span>
                                    {getStatusBadge(selectedProfile.moderation_status)}
                                </div>

                                {selectedProfile.occupation && (
                                    <p className="text-sm text-pink-400 mb-2">
                                        {selectedProfile.occupation}
                                    </p>
                                )}

                                {selectedProfile.bio && (
                                    <p className="text-sm text-gray-300 mb-4 whitespace-pre-wrap">
                                        {selectedProfile.bio}
                                    </p>
                                )}

                                {selectedProfile.user?.username && (
                                    <p className="text-xs text-gray-500 mb-4">
                                        @{selectedProfile.user.username}
                                    </p>
                                )}

                                {selectedProfile.moderation_status === 'pending' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(selectedProfile.id)}
                                            disabled={approveMutation.isPending}
                                            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                                        >
                                            {approveMutation.isPending ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Check size={18} />
                                            )}
                                            Одобрить
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedProfile.id)}
                                            disabled={rejectMutation.isPending}
                                            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                                        >
                                            {rejectMutation.isPending ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <XCircle size={18} />
                                            )}
                                            Отклонить
                                        </button>
                                    </div>
                                )}

                                {selectedProfile.moderation_status !== 'pending' && (
                                    <button
                                        onClick={() => setSelectedProfile(null)}
                                        className="w-full py-3 bg-gray-700 text-white rounded-xl font-semibold"
                                    >
                                        Закрыть
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ProfileModerationPanel
