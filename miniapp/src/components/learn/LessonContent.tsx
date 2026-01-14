import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clock, CheckCircle, Copy, Check, Lightbulb, X } from 'lucide-react'
import { Button } from '@/components/ui'
import type { Lesson, LessonBlock } from '@/types'
import { hapticFeedback } from '@/lib/telegram'

interface LessonContentProps {
  lesson: Lesson
  isCompleted: boolean
  onBack: () => void
  onComplete: () => void
  isLoading?: boolean
}

// Block renderer component
const BlockRenderer: React.FC<{ block: LessonBlock }> = ({ block }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      hapticFeedback.success()
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.warn('Failed to copy:', e)
    }
  }

  switch (block.type) {
    case 'heading':
      return (
        <h2 className="text-lg font-bold text-white mt-6 mb-3 first:mt-0">
          {block.content}
        </h2>
      )

    case 'text':
      return (
        <p className="text-gray-300 leading-relaxed mb-4">
          {block.content}
        </p>
      )

    case 'tip':
      return (
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <Lightbulb size={20} className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-200">{block.content}</p>
          </div>
        </div>
      )

    case 'example':
      return (
        <div
          className={`
            relative rounded-xl p-4 mb-4 font-mono text-sm
            ${block.good ? 'bg-success/10 border border-success/30' : 'bg-danger/10 border border-danger/30'}
          `}
        >
          {/* Good/Bad indicator */}
          <div className={`
            absolute -top-2 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase
            ${block.good ? 'bg-success text-bg' : 'bg-danger text-white'}
          `}>
            {block.good ? 'Хорошо' : 'Плохо'}
          </div>

          {/* Copy button */}
          <button
            onClick={() => handleCopy(block.content)}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-bg/50 hover:bg-bg transition-colors"
          >
            {copied ? (
              <Check size={14} className="text-success" />
            ) : (
              <Copy size={14} className="text-gray-400" />
            )}
          </button>

          {/* Content */}
          <pre className="whitespace-pre-wrap text-gray-200 mt-2 pr-8">
            {block.content}
          </pre>
        </div>
      )

    case 'list':
      return (
        <div className="mb-4">
          {block.content && (
            <p className="text-gray-300 font-medium mb-2">{block.content}</p>
          )}
          <ul className="space-y-2">
            {block.items?.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300">
                <span className="text-accent mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )

    default:
      return null
  }
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  isCompleted,
  onBack,
  onComplete,
  isLoading = false,
}) => {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-bg-card">
        <div className="flex items-center gap-3 p-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 rounded-full bg-bg-card"
          >
            <ArrowLeft size={20} />
          </motion.button>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-white truncate">{lesson.title}</h1>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              <span>{lesson.duration_minutes} мин</span>
            </div>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-1 text-success text-xs">
              <CheckCircle size={16} />
              <span>Пройден</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {lesson.content.map((block, index) => (
              <BlockRenderer key={index} block={block} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg via-bg to-transparent">
        <div className="max-w-lg mx-auto">
          {isCompleted ? (
            <Button
              variant="secondary"
              fullWidth
              onClick={onBack}
            >
              Вернуться к курсу
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              onClick={onComplete}
              isLoading={isLoading}
              icon={<CheckCircle size={18} />}
            >
              Урок пройден
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
