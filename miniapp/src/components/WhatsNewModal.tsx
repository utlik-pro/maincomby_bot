import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Check, Rocket, Gift, Star } from 'lucide-react'
import { APP_VERSION, LATEST_RELEASE } from '@/lib/version'
import { Button } from '@/components/ui'

interface WhatsNewModalProps {
  isOpen: boolean
  onClose: () => void
}

const iconMap: Record<string, React.ReactNode> = {
  'Telegram Mini App': <Rocket size={20} className="text-blue-400" />,
  'Networking': <Gift size={20} className="text-pink-400" />,
  'Events': <Star size={20} className="text-yellow-400" />,
  'Achievements': <Sparkles size={20} className="text-purple-400" />,
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-16"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/10 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Sparkles className="text-accent" size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Что нового</h2>
                  <p className="text-sm text-gray-400">Версия {APP_VERSION}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Summary */}
            {LATEST_RELEASE.summary && (
              <p className="text-gray-300 mb-6 leading-relaxed">
                {LATEST_RELEASE.summary}
              </p>
            )}

            {/* Highlights */}
            <div className="space-y-3 mb-6">
              {LATEST_RELEASE.highlights.map((highlight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {iconMap[highlight.title] || <Check size={20} className="text-accent" />}
                  </div>
                  <div>
                    <p className="font-medium text-white">{highlight.title}</p>
                    {highlight.description && (
                      <p className="text-sm text-gray-400 mt-0.5">{highlight.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Features list */}
            {LATEST_RELEASE.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Новые возможности
                </h3>
                <ul className="space-y-2">
                  {LATEST_RELEASE.features.slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check size={14} className="text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action button */}
            <Button
              fullWidth
              onClick={onClose}
              className="bg-accent hover:bg-accent/90 text-white font-medium"
            >
              Понятно
            </Button>

            {/* Date */}
            <p className="text-center text-xs text-gray-500 mt-4">
              {LATEST_RELEASE.date}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WhatsNewModal
