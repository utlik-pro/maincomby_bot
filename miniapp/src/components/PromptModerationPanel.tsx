import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, XCircle, Loader2, Eye, Sparkles } from 'lucide-react'
import { getAllPromptsAdmin, moderatePrompt } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { hapticFeedback, backButton } from '@/lib/telegram'
import type { CommunityPrompt, PromptStatus } from '@/types'

interface PromptModerationPanelProps {
    onClose: () => void
}

export const PromptModerationPanel: React.FC<PromptModerationPanelProps> = ({ onClose }) => {
    const { user } = useAppStore()
    const queryClient = useQueryClient()
    const [filter, setFilter] = useState<PromptStatus | 'all'>('pending')

    // Telegram BackButton handler
    useEffect(() => {
        backButton.show(onClose)
        return () => {
            backButton.hide()
        }
    }, [onClose])
    const [selectedPrompt, setSelectedPrompt] = useState<CommunityPrompt | null>(null)

    const { data: prompts = [], isLoading } = useQuery({
        queryKey: ['adminPrompts', filter],
        queryFn: () => filter === 'all'
            ? getAllPromptsAdmin()
            : getAllPromptsAdmin(filter as PromptStatus),
    })

    const pendingCount = prompts.filter(p => p.status === 'pending').length

    const approveMutation = useMutation({
        mutationFn: async (promptId: number) => {
            if (!user?.id) throw new Error('Not authenticated')
            return moderatePrompt(promptId, 'approved', user.id)
        },
        onSuccess: () => {
            hapticFeedback.success()
            queryClient.invalidateQueries({ queryKey: ['adminPrompts'] })
            queryClient.invalidateQueries({ queryKey: ['pendingPromptsCount'] })
            setSelectedPrompt(null)
        }
    })

    const rejectMutation = useMutation({
        mutationFn: async (promptId: number) => {
            if (!user?.id) throw new Error('Not authenticated')
            return moderatePrompt(promptId, 'rejected', user.id)
        },
        onSuccess: () => {
            hapticFeedback.success()
            queryClient.invalidateQueries({ queryKey: ['adminPrompts'] })
            queryClient.invalidateQueries({ queryKey: ['pendingPromptsCount'] })
            setSelectedPrompt(null)
        }
    })

    const handleApprove = (promptId: number) => {
        approveMutation.mutate(promptId)
    }

    const handleReject = (promptId: number) => {
        rejectMutation.mutate(promptId)
    }

    const getAuthorName = (prompt: CommunityPrompt) => {
        return [prompt.author?.first_name, prompt.author?.last_name]
            .filter(Boolean)
            .join(' ') || 'Unknown'
    }

    const getStatusBadge = (status: PromptStatus) => {
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
                <div className="p-4 border-b border-border bg-cyan-500/10">
                    <div className="flex justify-between items-center">
                        <div /> {/* Spacer */}
                        <h2 className="text-lg font-bold flex items-center gap-2 text-cyan-400">
                            <Sparkles size={20} />
                            Модерация
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

                    {/* Filter tabs */}
                    <div className="flex gap-2 mt-3">
                        {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    filter === status
                                        ? 'bg-cyan-500 text-black'
                                        : 'bg-bg text-gray-400 hover:text-white'
                                }`}
                            >
                                {status === 'pending' ? 'Ожидают' :
                                 status === 'approved' ? 'Одобрены' :
                                 status === 'rejected' ? 'Отклонены' : 'Все'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <Loader2 size={32} className="mx-auto animate-spin text-cyan-400" />
                            <p className="text-gray-400 mt-2">Загрузка...</p>
                        </div>
                    ) : prompts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            {filter === 'pending' ? 'Нет промптов на модерации' : 'Нет промптов'}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {prompts.map((prompt) => (
                                <div
                                    key={prompt.id}
                                    className="bg-bg rounded-xl p-3 border border-border hover:border-cyan-500/30 transition-colors"
                                >
                                    <div className="flex gap-3">
                                        {/* Thumbnail */}
                                        <img
                                            src={prompt.image_url}
                                            alt="Prompt"
                                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                        />

                                        <div className="flex-1 min-w-0">
                                            {/* Author + Status */}
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-sm font-medium truncate">
                                                    {getAuthorName(prompt)}
                                                </span>
                                                {getStatusBadge(prompt.status)}
                                            </div>

                                            {/* Prompt preview */}
                                            <p className="text-xs text-gray-400 line-clamp-2">
                                                {prompt.prompt_text}
                                            </p>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => setSelectedPrompt(prompt)}
                                                    className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 hover:bg-gray-600"
                                                >
                                                    <Eye size={12} />
                                                    Просмотр
                                                </button>

                                                {prompt.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(prompt.id)}
                                                            disabled={approveMutation.isPending}
                                                            className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded text-xs text-green-400 hover:bg-green-500/30"
                                                        >
                                                            <Check size={12} />
                                                            OK
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(prompt.id)}
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
                    PROMPT MODERATION • {prompts.length} total
                </div>
            </motion.div>

            {/* Detail/Preview Modal */}
            <AnimatePresence>
                {selectedPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90"
                        onClick={() => setSelectedPrompt(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-bg-card max-w-md w-full rounded-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedPrompt.image_url}
                                alt="Prompt"
                                className="w-full max-h-64 object-cover"
                            />
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold">{getAuthorName(selectedPrompt)}</span>
                                    {getStatusBadge(selectedPrompt.status)}
                                </div>
                                <p className="text-sm text-gray-300 mb-4 whitespace-pre-wrap">
                                    {selectedPrompt.prompt_text}
                                </p>

                                {selectedPrompt.status === 'pending' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(selectedPrompt.id)}
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
                                            onClick={() => handleReject(selectedPrompt.id)}
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

                                {selectedPrompt.status !== 'pending' && (
                                    <button
                                        onClick={() => setSelectedPrompt(null)}
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

export default PromptModerationPanel
