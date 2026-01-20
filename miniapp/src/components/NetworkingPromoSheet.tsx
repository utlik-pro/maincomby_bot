import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, X, Heart } from 'lucide-react'
import { hapticFeedback } from '@/lib/telegram'

interface NetworkingPromoSheetProps {
  isOpen: boolean
  onClose: () => void
  likesCount: number
  onOpenNetwork: () => void
}

export const NetworkingPromoSheet: React.FC<NetworkingPromoSheetProps> = ({
  isOpen,
  onClose,
  likesCount,
  onOpenNetwork
}) => {
  const handleOpenNetwork = () => {
    hapticFeedback.success()
    onOpenNetwork()
  }

  const handleClose = () => {
    hapticFeedback.light()
    onClose()
  }

  // Pluralization for Russian
  const getLikesText = (count: number) => {
    if (count === 1) return 'лайк'
    if (count >= 2 && count <= 4) return 'лайка'
    return 'лайков'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Floating hearts animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  y: '100vh',
                  x: `${10 + Math.random() * 80}vw`
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
                className="absolute text-red-500"
              >
                <Heart size={16 + Math.random() * 16} fill="currentColor" />
              </motion.div>
            ))}
          </div>

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-gradient-to-t from-red-950/95 to-bg-card rounded-t-3xl overflow-hidden shadow-2xl border-t border-red-500/30"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
            >
              <X size={24} />
            </button>

            {/* Content */}
            <div className="px-6 pb-8 pt-2">
              {/* Flame icon */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/40"
                >
                  <Flame size={40} className="text-white" fill="white" />
                </motion.div>
              </div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-center mt-6 text-white"
              >
                У вас {likesCount} {getLikesText(likesCount)}!
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-gray-300 mt-2"
              >
                Кто-то хочет познакомиться с вами
              </motion.p>

              {/* Features */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 px-4 py-4 rounded-xl bg-black/30 text-sm text-gray-300 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-red-400" fill="currentColor" />
                  <span>Посмотрите, кому вы понравились</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-orange-400" />
                  <span>Ответьте взаимностью для контакта</span>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 space-y-3"
              >
                <button
                  onClick={handleOpenNetwork}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98] shadow-lg shadow-red-500/30"
                >
                  <Flame size={20} />
                  Открыть Нетворкинг
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Позже
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
