'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, ChevronDown, BookOpen } from 'lucide-react'
import type { Lesson } from './types'

interface LessonSidebarProps {
    lessons: Lesson[]
    currentLessonId: number
    completedLessons: number[]
    courseSlug: string
    courseTitle: string
    locale: string
    isRussian: boolean
}

export function LessonSidebar({
    lessons,
    currentLessonId,
    completedLessons,
    courseSlug,
    courseTitle,
    locale,
    isRussian
}: LessonSidebarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const currentLesson = lessons.find(l => l.id === currentLessonId)
    const progressPercent = Math.round((completedLessons.length / lessons.length) * 100)

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-80 shrink-0">
                <div className="sticky top-28">
                    {/* Course title & progress */}
                    <div className="mb-6">
                        <Link
                            href={`/${locale}/learn/${courseSlug}`}
                            className="text-sm text-gray-500 hover:text-[var(--accent)] transition-colors"
                        >
                            {courseTitle}
                        </Link>

                        {/* Progress bar */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>{isRussian ? 'Прогресс' : 'Progress'}</span>
                                <span>{progressPercent}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[var(--accent)] rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Lessons list */}
                    <nav className="space-y-1">
                        {lessons.map((lesson) => {
                            const isCompleted = completedLessons.includes(lesson.id)
                            const isCurrent = lesson.id === currentLessonId

                            return (
                                <Link
                                    key={lesson.id}
                                    href={`/${locale}/learn/${courseSlug}/${lesson.id}`}
                                    className={`group flex items-start gap-3 p-3 rounded-xl transition-all ${
                                        isCurrent
                                            ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/30'
                                            : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    {/* Status icon */}
                                    <div className={`mt-0.5 shrink-0 ${
                                        isCompleted
                                            ? 'text-[var(--accent)]'
                                            : isCurrent
                                                ? 'text-[var(--accent)]'
                                                : 'text-gray-600'
                                    }`}>
                                        {isCompleted ? (
                                            <CheckCircle size={18} />
                                        ) : (
                                            <Circle size={18} className={isCurrent ? 'fill-[var(--accent)]/20' : ''} />
                                        )}
                                    </div>

                                    {/* Lesson info */}
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs mb-0.5 ${
                                            isCurrent ? 'text-[var(--accent)]' : 'text-gray-500'
                                        }`}>
                                            {isRussian ? `Урок ${lesson.id}` : `Lesson ${lesson.id}`}
                                        </div>
                                        <div className={`text-sm font-medium truncate ${
                                            isCurrent
                                                ? 'text-white'
                                                : isCompleted
                                                    ? 'text-gray-300'
                                                    : 'text-gray-400 group-hover:text-gray-200'
                                        }`}>
                                            {isRussian ? lesson.title : lesson.titleEn}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-0.5">
                                            {lesson.duration}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </aside>

            {/* Mobile dropdown */}
            <div className="lg:hidden mb-6">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-[#151515] border border-white/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                            <BookOpen size={16} className="text-[var(--accent)]" />
                        </div>
                        <div className="text-left">
                            <div className="text-xs text-gray-500">
                                {isRussian ? `Урок ${currentLessonId} из ${lessons.length}` : `Lesson ${currentLessonId} of ${lessons.length}`}
                            </div>
                            <div className="text-sm font-medium text-white">
                                {currentLesson && (isRussian ? currentLesson.title : currentLesson.titleEn)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Mini progress */}
                        <div className="text-xs text-gray-500">
                            {progressPercent}%
                        </div>
                        <ChevronDown
                            size={20}
                            className={`text-gray-400 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </button>

                <AnimatePresence>
                    {isMobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2 p-2 rounded-xl bg-[#151515] border border-white/10 space-y-1 max-h-[60vh] overflow-y-auto">
                                {lessons.map((lesson) => {
                                    const isCompleted = completedLessons.includes(lesson.id)
                                    const isCurrent = lesson.id === currentLessonId

                                    return (
                                        <Link
                                            key={lesson.id}
                                            href={`/${locale}/learn/${courseSlug}/${lesson.id}`}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                                isCurrent
                                                    ? 'bg-[var(--accent)]/10'
                                                    : 'hover:bg-white/5'
                                            }`}
                                        >
                                            <div className={`shrink-0 ${
                                                isCompleted
                                                    ? 'text-[var(--accent)]'
                                                    : isCurrent
                                                        ? 'text-[var(--accent)]'
                                                        : 'text-gray-600'
                                            }`}>
                                                {isCompleted ? (
                                                    <CheckCircle size={16} />
                                                ) : (
                                                    <Circle size={16} className={isCurrent ? 'fill-[var(--accent)]/20' : ''} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-sm truncate ${
                                                    isCurrent ? 'text-white font-medium' : 'text-gray-300'
                                                }`}>
                                                    {isRussian ? lesson.title : lesson.titleEn}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {lesson.duration}
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    )
}
