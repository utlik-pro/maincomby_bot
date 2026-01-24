import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, X, MessageCircle, Sparkles } from 'lucide-react'
import { Avatar } from './ui'
import { hapticFeedback, openTelegramLink } from '@/lib/telegram'

interface ProGiftModalProps {
    isOpen: boolean
    onClose: () => void
    adminName: string
    adminUsername: string
    adminAvatarUrl?: string
    durationDays: number
}

export const ProGiftModal: React.FC<ProGiftModalProps> = ({
    isOpen,
    onClose,
    adminName,
    adminUsername,
    adminAvatarUrl,
    durationDays
}) => {
    const handleThankYou = () => {
        hapticFeedback.success()
        // Open chat with admin - clean username (remove @ prefix if present)
        const cleanUsername = (adminUsername || '').replace(/^@/, '').trim()
        if (cleanUsername) {
            openTelegramLink(`https://t.me/${cleanUsername}`)
        }
        onClose()
    }

    const handleClose = () => {
        hapticFeedback.light()
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop with confetti effect */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={handleClose}
                    />

                    {/* Floating sparkles */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    opacity: 0,
                                    y: '100vh',
                                    x: `${Math.random() * 100}vw`
                                }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    y: '-20vh',
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    delay: Math.random() * 2,
                                    repeat: Infinity,
                                }}
                                className="absolute text-yellow-400"
                            >
                                <Sparkles size={16 + Math.random() * 16} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-sm bg-gradient-to-b from-yellow-900/30 to-bg-card rounded-3xl overflow-hidden shadow-2xl border border-yellow-500/30"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                        >
                            <X size={24} />
                        </button>

                        {/* Gift icon */}
                        <div className="flex justify-center pt-8">
                            <motion.div
                                initial={{ rotate: -10 }}
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/30"
                            >
                                <Gift size={40} className="text-black" />
                            </motion.div>
                        </div>

                        {/* Title */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold text-center mt-6 text-white"
                        >
                            Вам подарили PRO! 🎉
                        </motion.h2>

                        {/* Admin info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center justify-center gap-3 mt-4 px-6"
                        >
                            <Avatar
                                src={adminAvatarUrl}
                                name={adminName}
                                size="md"
                                className="ring-2 ring-yellow-500/50"
                            />
                            <div className="text-left">
                                <div className="font-semibold text-white">{adminName}</div>
                                <div className="text-sm text-gray-400">@{adminUsername}</div>
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-center text-gray-300 mt-4 px-6"
                        >
                            Активировал для вас PRO на <span className="text-yellow-400 font-bold">{durationDays} дней</span>
                        </motion.p>

                        {/* Features */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 px-6 py-3 mx-6 rounded-xl bg-black/30 text-sm text-gray-300"
                        >
                            <div className="flex items-center gap-2 mb-1">✨ Безлимитные лайки</div>
                            <div className="flex items-center gap-2 mb-1">✨ 5 суперлайков в день</div>
                            <div className="flex items-center gap-2 mb-1">✨ Режим инкогнито</div>
                            <div className="flex items-center gap-2">✨ Перемотка анкеты</div>
                        </motion.div>

                        {/* Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="p-6 space-y-3"
                        >
                            <button
                                onClick={handleThankYou}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
                            >
                                <MessageCircle size={20} />
                                Поблагодарить 🙏
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-full py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                            >
                                Понятно
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
