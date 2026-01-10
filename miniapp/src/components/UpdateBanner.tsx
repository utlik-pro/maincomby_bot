import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ChevronRight } from 'lucide-react'
import { APP_VERSION, LATEST_RELEASE } from '@/lib/version'

interface UpdateBannerProps {
  isVisible: boolean
  onDismiss: () => void
  onViewDetails: () => void
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({
  isVisible,
  onDismiss,
  onViewDetails,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-40 p-3 safe-area-inset-top"
        >
          <div className="bg-gradient-to-r from-accent/90 to-purple-500/90 backdrop-blur-lg rounded-xl p-3 shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-white" size={18} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">
                  Обновление v{APP_VERSION}
                </p>
                <p className="text-xs text-white/80 truncate">
                  {LATEST_RELEASE.summary || 'Новые возможности доступны'}
                </p>
              </div>

              <button
                onClick={onViewDetails}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors flex-shrink-0"
              >
                Подробнее
                <ChevronRight size={14} />
              </button>

              <button
                onClick={onDismiss}
                className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UpdateBanner
