import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface ExpandableSectionProps {
  title: string
  preview: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  preview,
  expanded,
  onToggle,
  children
}) => {
  return (
    <div className="bg-bg-card rounded-card mb-4">
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start justify-between text-left"
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          {!expanded && (
            <p className="text-gray-400 text-sm truncate">{preview}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3 mt-0.5">
          <span className="text-accent text-sm">
            {expanded ? 'скрыть' : 'подробнее'}
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-accent" />
          </motion.div>
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
