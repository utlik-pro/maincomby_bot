import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, CheckCircle, Sparkles, GraduationCap, Code, Lightbulb } from 'lucide-react'
import { Progress } from '@/components/ui'
import type { Course } from '@/types'

// Map icon name to component
const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  BookOpen,
  Sparkles,
  GraduationCap,
  Code,
  Lightbulb,
}

interface CourseCardProps {
  course: Course
  totalLessons: number
  completedLessons: number
  totalDuration: number
  onClick: () => void
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  totalLessons,
  completedLessons,
  totalDuration,
  onClick,
}) => {
  const IconComponent = ICON_MAP[course.icon] || BookOpen
  const isCompleted = completedLessons === totalLessons && totalLessons > 0
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-bg-card rounded-card p-4 cursor-pointer card-hover"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${course.color}20` }}
        >
          <IconComponent
            size={28}
            className="transition-colors"
            style={{ color: course.color }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white truncate">{course.title}</h3>
            {isCompleted && (
              <CheckCircle size={18} className="text-success flex-shrink-0" />
            )}
          </div>

          {course.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {course.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen size={12} />
              <span>{totalLessons} уроков</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{totalDuration} мин</span>
            </div>
          </div>

          {/* Progress bar */}
          {totalLessons > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Прогресс</span>
                <span>{completedLessons}/{totalLessons}</span>
              </div>
              <Progress value={progress} max={100} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
