import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import {
  getAllCourses,
  getAllCourseLessons,
  toggleCourseEnabled,
  toggleLessonEnabled,
} from '@/lib/supabase'
import { hapticFeedback, backButton } from '@/lib/telegram'
import { useToastStore } from '@/lib/store'
import type { Course, Lesson } from '@/types'

interface LearningAdminPanelProps {
  onClose: () => void
}

// Toggle switch component
const ToggleSwitch: React.FC<{
  enabled: boolean
  onChange: () => void
  isLoading?: boolean
  size?: 'sm' | 'md'
}> = ({ enabled, onChange, isLoading = false, size = 'md' }) => {
  const sizeClasses = size === 'sm'
    ? 'w-10 h-5'
    : 'w-12 h-6'
  const knobSizeClasses = size === 'sm'
    ? 'w-4 h-4'
    : 'w-5 h-5'
  const translateClass = size === 'sm'
    ? (enabled ? 'translate-x-5' : 'translate-x-0.5')
    : (enabled ? 'translate-x-6' : 'translate-x-0.5')

  return (
    <button
      onClick={onChange}
      disabled={isLoading}
      className={`${sizeClasses} rounded-full p-0.5 transition-colors relative ${
        enabled ? 'bg-green-500' : 'bg-gray-700'
      } ${isLoading ? 'opacity-50' : ''}`}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 size={size === 'sm' ? 12 : 14} className="animate-spin text-white" />
        </div>
      ) : (
        <div
          className={`${knobSizeClasses} rounded-full bg-white transition-transform ${translateClass}`}
        />
      )}
    </button>
  )
}

// Course item with expandable lessons
const CourseItem: React.FC<{
  course: Course
  onToggle: () => void
  isToggling: boolean
}> = ({ course, onToggle, isToggling }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const queryClient = useQueryClient()
  const { addToast } = useToastStore()

  // Fetch lessons for this course
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['adminCourseLessons', course.id],
    queryFn: () => getAllCourseLessons(course.id),
    enabled: isExpanded,
  })

  // Toggle lesson mutation
  const toggleLessonMutation = useMutation({
    mutationFn: ({ lessonId, enabled }: { lessonId: string; enabled: boolean }) =>
      toggleLessonEnabled(lessonId, enabled),
    onSuccess: () => {
      hapticFeedback.success()
      queryClient.invalidateQueries({ queryKey: ['adminCourseLessons', course.id] })
      queryClient.invalidateQueries({ queryKey: ['courseLessons'] })
    },
    onError: () => {
      addToast('Ошибка обновления урока', 'error')
    },
  })

  const handleToggleLesson = (lesson: Lesson) => {
    toggleLessonMutation.mutate({
      lessonId: lesson.id,
      enabled: !lesson.is_enabled,
    })
  }

  return (
    <div className="bg-bg rounded-xl border border-border overflow-hidden">
      {/* Course header */}
      <div className="p-3 flex items-center gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg hover:bg-bg-card transition-colors"
        >
          {isExpanded ? (
            <ChevronDown size={18} className="text-gray-400" />
          ) : (
            <ChevronRight size={18} className="text-gray-400" />
          )}
        </button>

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${course.color}20` }}
        >
          <BookOpen size={16} style={{ color: course.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className={`font-medium truncate ${!course.is_enabled ? 'text-gray-500' : ''}`}>
            {course.title}
          </div>
        </div>

        <ToggleSwitch
          enabled={course.is_enabled}
          onChange={onToggle}
          isLoading={isToggling}
        />
      </div>

      {/* Lessons list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-bg-card/50">
              {lessonsLoading ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  Загрузка уроков...
                </div>
              ) : lessons.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  Нет уроков
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="px-4 py-3 flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-bg flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm truncate ${!lesson.is_enabled ? 'text-gray-500' : ''}`}>
                          {lesson.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lesson.duration_minutes} мин
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={lesson.is_enabled}
                        onChange={() => handleToggleLesson(lesson)}
                        isLoading={
                          toggleLessonMutation.isPending &&
                          toggleLessonMutation.variables?.lessonId === lesson.id
                        }
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const LearningAdminPanel: React.FC<LearningAdminPanelProps> = ({ onClose }) => {
  const queryClient = useQueryClient()
  const { addToast } = useToastStore()
  const [togglingCourseId, setTogglingCourseId] = useState<string | null>(null)

  // Telegram BackButton handler
  useEffect(() => {
    backButton.show(onClose)
    return () => {
      backButton.hide()
    }
  }, [onClose])

  // Fetch all courses
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: getAllCourses,
  })

  // Toggle course mutation
  const toggleCourseMutation = useMutation({
    mutationFn: ({ courseId, enabled }: { courseId: string; enabled: boolean }) =>
      toggleCourseEnabled(courseId, enabled),
    onMutate: ({ courseId }) => {
      setTogglingCourseId(courseId)
    },
    onSuccess: () => {
      hapticFeedback.success()
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
    onError: () => {
      addToast('Ошибка обновления курса', 'error')
    },
    onSettled: () => {
      setTogglingCourseId(null)
    },
  })

  const handleToggleCourse = (course: Course) => {
    toggleCourseMutation.mutate({
      courseId: course.id,
      enabled: !course.is_enabled,
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full max-w-sm bg-bg-card rounded-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-center bg-accent/10">
          <h2 className="text-lg font-bold flex items-center gap-2 text-accent">
            <BookOpen size={20} />
            Управление курсами
          </h2>
        </div>

        {/* Courses list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">
              Загрузка курсов...
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Нет курсов
            </div>
          ) : (
            courses.map((course) => (
              <CourseItem
                key={course.id}
                course={course}
                onToggle={() => handleToggleCourse(course)}
                isToggling={togglingCourseId === course.id}
              />
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="p-4 bg-bg border-t border-border text-center text-xs text-gray-500">
          Выключенные курсы и уроки не видны пользователям
        </div>
      </div>
    </div>
  )
}
