import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Calendar, Sparkles, Bug, Zap, ExternalLink, ChevronRight } from 'lucide-react'
import { APP_VERSION, LATEST_RELEASE, CURRENT_APP_VERSION } from '@/lib/version'
import { Button } from '@/components/ui'

// Release history - add more releases here as they are made
// This is a simplified version - full changelog is on landing page
const RELEASE_HISTORY = [
  LATEST_RELEASE,
  // Add older releases here if needed
]

interface ChangelogSheetProps {
  isOpen: boolean
  onClose: () => void
}

const typeColors: Record<string, string> = {
  major: 'bg-purple-500/20 text-purple-400',
  minor: 'bg-blue-500/20 text-blue-400',
  patch: 'bg-green-500/20 text-green-400',
}

export const ChangelogSheet: React.FC<ChangelogSheetProps> = ({ isOpen, onClose }) => {
  const handleViewFull = () => {
    // Open landing page changelog
    window.open('https://main-platform.vercel.app/changelog', '_blank')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">История обновлений</h2>
                <p className="text-sm text-gray-400">Текущая версия: {APP_VERSION}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh] px-5 py-4">
              {RELEASE_HISTORY.map((release, index) => (
                <div
                  key={release.version}
                  className={`${index > 0 ? 'mt-6 pt-6 border-t border-white/10' : ''}`}
                >
                  {/* Version header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Tag size={16} className="text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">v{release.version}</span>
                        {index === 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                            Latest
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {release.date}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {release.summary && (
                    <p className="text-gray-400 text-sm mb-3">{release.summary}</p>
                  )}

                  {/* Highlights */}
                  {release.highlights && release.highlights.length > 0 && (
                    <div className="space-y-2">
                      {release.highlights.map((highlight, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
                        >
                          <Sparkles size={16} className="text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-white text-sm">{highlight.title}</p>
                            {highlight.description && (
                              <p className="text-xs text-gray-400 mt-0.5">{highlight.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Features list */}
                  {release.features && release.features.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Новые возможности
                      </h4>
                      <ul className="space-y-1.5">
                        {release.features.slice(0, 5).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                            <Zap size={12} className="text-green-400 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {release.features.length > 5 && (
                          <li className="text-xs text-gray-500">
                            +{release.features.length - 5} ещё...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Fixes */}
                  {release.fixes && release.fixes.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Исправления
                      </h4>
                      <ul className="space-y-1.5">
                        {release.fixes.map((fix, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                            <Bug size={12} className="text-blue-400 flex-shrink-0" />
                            {fix}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 bg-bg-card">
              <Button
                fullWidth
                variant="secondary"
                onClick={handleViewFull}
                className="flex items-center justify-center gap-2"
              >
                <span>Полная история на сайте</span>
                <ExternalLink size={14} />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ChangelogSheet
