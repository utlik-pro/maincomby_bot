import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GraduationCap, Sparkles, ArrowLeft } from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { Skeleton, EmptyState, Progress } from '@/components/ui'
import { CourseCard, LessonCard, LessonContent } from '@/components/learn'
import {
  getEnabledCourses,
  getCourseLessons,
  getUserLessonProgress,
  markLessonComplete,
  getCourseStats,
} from '@/lib/supabase'
import { hapticFeedback } from '@/lib/telegram'
import type { Course, Lesson } from '@/types'

type ViewState =
  | { type: 'courses' }
  | { type: 'lessons'; course: Course }
  | { type: 'lesson'; course: Course; lesson: Lesson }

const LearnScreen: React.FC = () => {
  const { user } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [viewState, setViewState] = useState<ViewState>({ type: 'courses' })

  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: getEnabledCourses,
  })

  // Fetch user progress
  const { data: userProgress = [] } = useQuery({
    queryKey: ['lessonProgress', user?.id],
    queryFn: () => (user ? getUserLessonProgress(user.id) : []),
    enabled: !!user,
  })

  // Fetch lessons when viewing a course
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['courseLessons', viewState.type === 'lessons' || viewState.type === 'lesson' ? viewState.course.id : null],
    queryFn: () =>
      viewState.type === 'lessons' || viewState.type === 'lesson'
        ? getCourseLessons(viewState.course.id)
        : [],
    enabled: viewState.type === 'lessons' || viewState.type === 'lesson',
  })

  // Fetch course stats for all courses
  const { data: courseStats = {} } = useQuery({
    queryKey: ['courseStats', courses.map(c => c.id).join(',')],
    queryFn: async () => {
      const stats: Record<string, { totalLessons: number; enabledLessons: number; totalDuration: number }> = {}
      for (const course of courses) {
        stats[course.id] = await getCourseStats(course.id)
      }
      return stats
    },
    enabled: courses.length > 0,
  })

  // Mark lesson complete mutation
  const completeMutation = useMutation({
    mutationFn: (lessonId: string) => {
      if (!user) throw new Error('Not authenticated')
      return markLessonComplete(user.id, lessonId)
    },
    onSuccess: () => {
      hapticFeedback.notification('success')
      addToast('Урок пройден! +50 XP', 'xp')
      queryClient.invalidateQueries({ queryKey: ['lessonProgress'] })
    },
    onError: (error) => {
      console.error('Failed to mark lesson complete:', error)
      addToast('Ошибка сохранения прогресса', 'error')
    },
  })

  // Calculate completed lessons for a course
  const getCompletedLessonsCount = (courseId: string) => {
    const courseLessonIds = lessons
      .filter((l) => l.course_id === courseId)
      .map((l) => l.id)
    return userProgress.filter((p) => courseLessonIds.includes(p.lesson_id)).length
  }

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some((p) => p.lesson_id === lessonId)
  }

  // Navigate back
  const goBack = () => {
    hapticFeedback.selection()
    if (viewState.type === 'lesson') {
      setViewState({ type: 'lessons', course: viewState.course })
    } else if (viewState.type === 'lessons') {
      setViewState({ type: 'courses' })
    }
  }

  // Open course
  const openCourse = (course: Course) => {
    hapticFeedback.selection()
    setViewState({ type: 'lessons', course })
  }

  // Open lesson
  const openLesson = (lesson: Lesson) => {
    hapticFeedback.selection()
    if (viewState.type === 'lessons') {
      setViewState({ type: 'lesson', course: viewState.course, lesson })
    }
  }

  // Complete lesson
  const handleCompleteLesson = () => {
    if (viewState.type === 'lesson') {
      completeMutation.mutate(viewState.lesson.id)
    }
  }

  // Render lesson content view
  if (viewState.type === 'lesson') {
    return (
      <LessonContent
        lesson={viewState.lesson}
        isCompleted={isLessonCompleted(viewState.lesson.id)}
        onBack={goBack}
        onComplete={handleCompleteLesson}
        isLoading={completeMutation.isPending}
      />
    )
  }

  // Render lessons list view
  if (viewState.type === 'lessons') {
    const course = viewState.course
    const stats = courseStats[course.id]
    const completedCount = lessons.filter((l) => isLessonCompleted(l.id)).length
    const progress = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0

    return (
      <div className="pb-24">
        {/* Header */}
        <div className="p-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={goBack}
            className="flex items-center gap-2 text-gray-400 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Назад</span>
          </motion.button>

          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${course.color}20` }}
            >
              <Sparkles size={32} style={{ color: course.color }} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{course.title}</h1>
              {course.description && (
                <p className="text-sm text-gray-400 mt-1">{course.description}</p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 bg-bg-card rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Ваш прогресс</span>
              <span className="text-sm font-medium text-accent">
                {completedCount}/{lessons.length} уроков
              </span>
            </div>
            <Progress value={progress} max={100} />
          </div>
        </div>

        {/* Lessons list */}
        <div className="px-4 mt-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Уроки курса
          </h2>

          {lessonsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  isCompleted={isLessonCompleted(lesson.id)}
                  onClick={() => openLesson(lesson)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render courses list view (default)
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap size={28} className="text-accent" />
          <h1 className="text-xl font-bold text-white">Обучение</h1>
        </div>
        <p className="text-sm text-gray-400">
          Развивайте навыки работы с AI
        </p>
      </div>

      {/* Courses list */}
      <div className="px-4">
        {coursesLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={48} className="text-gray-600" />}
            title="Курсы скоро появятся"
            description="Мы готовим для вас интересные материалы"
          />
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const stats = courseStats[course.id] || {
                totalLessons: 0,
                enabledLessons: 0,
                totalDuration: 0,
              }
              // Count completed lessons for this course from userProgress
              const completedForCourse = userProgress.filter(p => {
                // We need to check if the lesson belongs to this course
                // Since we don't have lessons loaded yet for all courses,
                // we'll fetch them when the card is rendered
                return false // Will be updated after lessons are fetched
              }).length

              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  totalLessons={stats.enabledLessons}
                  completedLessons={0} // Will update with actual progress
                  totalDuration={stats.totalDuration}
                  onClick={() => openCourse(course)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default LearnScreen
