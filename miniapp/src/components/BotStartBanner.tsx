import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, ExternalLink } from 'lucide-react'
import { hapticFeedback } from '@/lib/telegram'

interface BotStartBannerProps {
  isVisible: boolean
  onDismiss: () => void
  onEnableNotifications: () => void
}

export const BotStartBanner: React.FC<BotStartBannerProps> = ({
  isVisible,
  onDismiss,
  onEnableNotifications
}) => {
  const handleEnable = () => {
    hapticFeedback.success()
    onEnableNotifications()
  }

  const handleDismiss = () => {
    hapticFeedback.light()
    onDismiss()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="mx-4 mb-3 p-4 rounded-2xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-accent" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white mb-1">
                Включите уведомления
              </h3>
              <p className="text-xs text-white/70 mb-3">
                Получайте билеты, напоминания о событиях и новые матчи
              </p>

              {/* Enable button */}
              <button
                onClick={handleEnable}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-black text-sm font-medium hover:bg-accent/90 active:scale-95 transition-all"
              >
                <span>Включить</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
