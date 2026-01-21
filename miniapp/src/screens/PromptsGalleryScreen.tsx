import React, { useState, useCallback } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Loader2, Shield, ImagePlus } from 'lucide-react'
import { getApprovedPrompts, getPendingPromptsCount } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { useBackButton } from '@/lib/telegram'
import type { CommunityPrompt } from '@/types'
import { PromptDetailModal } from '@/components/PromptDetailModal'
import { PromptSubmitModal } from '@/components/PromptSubmitModal'
import { PromptModerationPanel } from '@/components/PromptModerationPanel'

const PAGE_SIZE = 20

export const PromptsGalleryScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAppStore()
    const [selectedPrompt, setSelectedPrompt] = useState<CommunityPrompt | null>(null)
    const [showSubmitModal, setShowSubmitModal] = useState(false)
    const [showModerationPanel, setShowModerationPanel] = useState(false)

    // Use Telegram system back button
    useBackButton(onBack)

    // Check if user is admin (core team)
    const isAdmin = user?.team_role === 'core'

    // Fetch pending prompts count for admin badge
    const { data: pendingCount = 0 } = useQuery({
        queryKey: ['pendingPromptsCount'],
        queryFn: getPendingPromptsCount,
        enabled: isAdmin,
        refetchInterval: 30000, // Refresh every 30 seconds
    })

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch
    } = useInfiniteQuery({
        queryKey: ['communityPrompts', user?.id],
        queryFn: async ({ pageParam = 0 }) => {
            return getApprovedPrompts({
                limit: PAGE_SIZE,
                offset: pageParam,
                userId: user?.id
            })
        },
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < PAGE_SIZE) return undefined
            return allPages.length * PAGE_SIZE
        },
        initialPageParam: 0,
    })

    const prompts = data?.pages.flat() || []

    // Split prompts into two columns for masonry layout
    const leftColumn: CommunityPrompt[] = []
    const rightColumn: CommunityPrompt[] = []

    prompts.forEach((prompt, index) => {
        if (index % 2 === 0) {
            leftColumn.push(prompt)
        } else {
            rightColumn.push(prompt)
        }
    })

    // Show placeholder in right column if there's an odd number of prompts
    const showRightPlaceholder = prompts.length > 0 && prompts.length % 2 === 1

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    const handlePromptSubmitted = () => {
        setShowSubmitModal(false)
        // Show success message - prompt is pending moderation
    }

    return (
        <div className="flex flex-col h-full bg-bg">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-border px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="w-10" /> {/* Spacer for balance */}
                    <h1 className="text-lg font-bold uppercase tracking-wide">
                        Inspired by Community
                    </h1>
                    <div className="flex items-center gap-1">
                        {isAdmin && (
                            <button
                                onClick={() => setShowModerationPanel(true)}
                                className="p-2 text-cyan-400 hover:text-cyan-300 relative"
                            >
                                <Shield size={22} />
                                {pendingCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                                        {pendingCount > 9 ? '9+' : pendingCount}
                                    </span>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => setShowSubmitModal(true)}
                            className="p-2 -mr-2 text-accent hover:text-accent/80"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div
                className="flex-1 overflow-y-auto px-3 py-4"
                onScroll={handleScroll}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 size={32} className="animate-spin text-accent" />
                    </div>
                ) : prompts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center px-8">
                        <div className="text-6xl mb-4">🎨</div>
                        <h3 className="text-lg font-semibold mb-2">Пока пусто</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Будь первым, кто поделится своим промптом!
                        </p>
                        <button
                            onClick={() => setShowSubmitModal(true)}
                            className="px-4 py-2 bg-accent text-black rounded-xl font-semibold"
                        >
                            Добавить промпт
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        {/* Left Column */}
                        <div className="flex-1 flex flex-col gap-3">
                            {leftColumn.map((prompt) => (
                                <PromptCard
                                    key={prompt.id}
                                    prompt={prompt}
                                    onClick={() => setSelectedPrompt(prompt)}
                                />
                            ))}
                        </div>

                        {/* Right Column */}
                        <div className="flex-1 flex flex-col gap-3">
                            {rightColumn.map((prompt) => (
                                <PromptCard
                                    key={prompt.id}
                                    prompt={prompt}
                                    onClick={() => setSelectedPrompt(prompt)}
                                />
                            ))}
                            {/* Dashed placeholder for adding more */}
                            {showRightPlaceholder && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-gray-600 cursor-pointer hover:border-accent/50 hover:text-gray-400 transition-colors"
                                    onClick={() => setShowSubmitModal(true)}
                                >
                                    <ImagePlus size={32} className="mb-2 opacity-50" />
                                    <span className="text-xs font-medium">Добавить</span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}

                {/* Loading more indicator */}
                {isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                        <Loader2 size={24} className="animate-spin text-accent" />
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedPrompt && (
                    <PromptDetailModal
                        prompt={selectedPrompt}
                        onClose={() => setSelectedPrompt(null)}
                        onLikeToggle={() => refetch()}
                    />
                )}
            </AnimatePresence>

            {/* Submit Modal */}
            <AnimatePresence>
                {showSubmitModal && (
                    <PromptSubmitModal
                        onClose={() => setShowSubmitModal(false)}
                        onSubmitted={handlePromptSubmitted}
                    />
                )}
            </AnimatePresence>

            {/* Moderation Panel (Admin only) */}
            <AnimatePresence>
                {showModerationPanel && (
                    <PromptModerationPanel
                        onClose={() => setShowModerationPanel(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

// Prompt Card Component
const PromptCard: React.FC<{
    prompt: CommunityPrompt
    onClick: () => void
}> = ({ prompt, onClick }) => {
    const [imageLoaded, setImageLoaded] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-xl overflow-hidden cursor-pointer group"
            onClick={onClick}
        >
            {/* Image */}
            <div className="relative">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-bg-card animate-pulse" />
                )}
                <img
                    src={prompt.image_url}
                    alt="AI generated"
                    className="w-full object-cover"
                    onLoad={() => setImageLoaded(true)}
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

                {/* Likes badge */}
                {prompt.likes_count > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <span className="text-red-500 text-xs">❤️</span>
                        <span className="text-white text-xs font-medium">{prompt.likes_count}</span>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default PromptsGalleryScreen
