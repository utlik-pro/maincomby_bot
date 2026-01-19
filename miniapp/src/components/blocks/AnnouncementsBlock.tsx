/**
 * Announcements Block - Important notices
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui'
import type { AppBlock, AnnouncementsBlockConfig } from '@shared/types'

interface AnnouncementsBlockProps {
  block: AppBlock<'announcements'>
}

// Mock announcements - in production would come from database
const MOCK_ANNOUNCEMENTS = [
  { id: '1', title: 'Welcome!', message: 'Thanks for joining our community.' },
  { id: '2', title: 'New Event', message: 'Check out our upcoming meetup.' },
]

export function AnnouncementsBlock({ block }: AnnouncementsBlockProps) {
  const config = block.config as AnnouncementsBlockConfig
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const announcements = MOCK_ANNOUNCEMENTS.filter(a => !dismissed.has(a.id))

  // Auto-rotate
  useEffect(() => {
    if (!config.autoRotate || announcements.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % announcements.length)
    }, (config.rotationInterval || 5) * 1000)

    return () => clearInterval(interval)
  }, [config.autoRotate, config.rotationInterval, announcements.length])

  if (announcements.length === 0) return null

  const current = announcements[currentIndex % announcements.length]
  const title = block.title?.ru || 'Announcements'

  return (
    <div className="px-4 mb-6">
      <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
            <Megaphone className="text-yellow-400" size={20} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 min-w-0"
            >
              <div className="font-medium text-yellow-300">{current.title}</div>
              <div className="text-sm text-gray-400">{current.message}</div>
            </motion.div>
          </AnimatePresence>

          {config.showDismissButton && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setDismissed(prev => new Set([...prev, current.id]))}
              className="text-gray-500 hover:text-gray-300"
            >
              <X size={18} />
            </motion.button>
          )}
        </div>

        {announcements.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={() => setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length)}
              className="text-gray-500 hover:text-gray-300"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1">
              {announcements.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === currentIndex % announcements.length ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % announcements.length)}
              className="text-gray-500 hover:text-gray-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
