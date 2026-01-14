import React from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, ChevronRight, Lock } from 'lucide-react'
import type { Lesson } from '@/types'

interface LessonCardProps {
  lesson: Lesson
  index: number
  isCompleted: boolean
  isLocked?: boolean
  onClick: () => void
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  index,
  isCompleted,
  isLocked = false,
  onClick,
}) => {
  return (
    <motion.div
      whileTap={isLocked ? undefined : { scale: 0.98 }}
      onClick={isLocked ? undefined : onClick}
      className={`
        bg-bg-card rounded-card p-4
        ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer card-hover'}
        ${isCompleted ? 'border border-success/30' : ''}
      `}
    >
      <div className="flex items-center gap-4">
        {/* Number badge */}
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
            ${isCompleted ? 'bg-success text-bg' : 'bg-bg text-gray-400'}
          `}
        >
          {isCompleted ? (
            <CheckCircle size={20} />
          ) : isLocked ? (
            <Lock size={16} />
          ) : (
            index + 1
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${isCompleted ? 'text-gray-400' : 'text-white'}`}>
            {lesson.title}
          </h4>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <Clock size={12} />
            <span>{lesson.duration_minutes} мин</span>
          </div>
        </div>

        {/* Arrow */}
        {!isLocked && (
          <ChevronRight
            size={20}
            className={isCompleted ? 'text-gray-600' : 'text-gray-400'}
          />
        )}
      </div>
    </motion.div>
  )
}
