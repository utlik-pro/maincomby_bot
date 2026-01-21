import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Share2, Copy, Heart, Check, SlidersHorizontal } from 'lucide-react'
import { togglePromptLike, incrementPromptCopies } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { hapticFeedback } from '@/lib/telegram'
import type { CommunityPrompt } from '@/types'

interface PromptDetailModalProps {
    prompt: CommunityPrompt
    onClose: () => void
    onLikeToggle?: () => void
}

export const PromptDetailModal: React.FC<PromptDetailModalProps> = ({
    prompt,
    onClose,
    onLikeToggle
}) => {
    const { user } = useAppStore()
    const [isLiked, setIsLiked] = useState(prompt.is_liked || false)
    const [likesCount, setLikesCount] = useState(prompt.likes_count)
    const [copied, setCopied] = useState(false)
    const [isLiking, setIsLiking] = useState(false)

    const authorName = prompt.author?.first_name || prompt.author?.username || 'Anonymous'
    const authorAvatar = prompt.author?.profile?.photo_url

    const handleLike = async () => {
        if (!user?.id || isLiking) return

        setIsLiking(true)
        hapticFeedback.light()

        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1)

        const success = await togglePromptLike(prompt.id, user.id)

        if (!success) {
            // Revert on error
            setIsLiked(!newIsLiked)
            setLikesCount(prev => newIsLiked ? prev - 1 : prev + 1)
        } else {
            onLikeToggle?.()
        }

        setIsLiking(false)
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt.prompt_text)
            hapticFeedback.success()
            setCopied(true)

            // Track copy
            incrementPromptCopies(prompt.id)

            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
            hapticFeedback.error()
        }
    }

    const handleShare = async () => {
        hapticFeedback.light()

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'AI Prompt',
                    text: prompt.prompt_text,
                    url: window.location.href
                })
            } catch (err) {
                // User cancelled or share failed
            }
        } else {
            // Fallback: copy to clipboard
            handleCopy()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Header with Share button */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        handleShare()
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-bg-card/80 backdrop-blur-sm rounded-full text-white hover:bg-bg-card transition-colors"
                >
                    <Share2 size={18} />
                    <span className="font-medium">Share</span>
                </button>
                <div /> {/* Spacer */}
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center p-4" onClick={onClose}>
                <motion.img
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    src={prompt.image_url}
                    alt="AI generated"
                    className="max-w-full max-h-[60vh] object-contain rounded-xl"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            {/* Bottom Sheet */}
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="bg-bg-card rounded-t-3xl p-4 pb-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Author row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {authorAvatar ? (
                            <img
                                src={authorAvatar}
                                alt={authorName}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center text-lg">
                                {authorName[0]?.toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="font-semibold text-white">{authorName}</div>
                            <div className="text-xs text-gray-400">Author</div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Prompt section */}
                <div className="bg-bg rounded-xl p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-gray-400">
                            <SlidersHorizontal size={16} />
                            <span className="text-sm font-semibold uppercase">Prompt</span>
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                copied
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-bg-card text-white hover:bg-bg-card/80'
                            }`}
                        >
                            {copied ? (
                                <span className="flex items-center gap-1">
                                    <Check size={14} />
                                    Copied
                                </span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <Copy size={14} />
                                    Copy
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Prompt text */}
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {prompt.prompt_text}
                    </p>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    {/* Like button */}
                    <button
                        onClick={handleLike}
                        disabled={isLiking || !user}
                        className="flex items-center gap-2 text-sm"
                    >
                        <Heart
                            size={20}
                            className={`transition-colors ${
                                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
                            }`}
                        />
                        <span className={isLiked ? 'text-red-500' : 'text-gray-400'}>
                            {likesCount}
                        </span>
                    </button>

                    {/* Copy count */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Copy size={14} />
                        <span>{prompt.copies_count} copies</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default PromptDetailModal
