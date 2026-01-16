'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/sections/Footer'
import { LessonHeader, ContentBlock, Quiz, SummaryCard, LessonNav } from '@/components/course'
import { promptEngineeringCourse, getLessonById, getAdjacentLessons } from '@/data/lessons/prompt-engineering'
import type { Lesson } from '@/components/course/types'

interface LessonClientProps {
    dict: any
    locale: string
    courseSlug: string
    lessonId: number
}

export default function LessonClient({ dict, locale, courseSlug, lessonId }: LessonClientProps) {
    const router = useRouter()
    const { user, isLoading } = useAuth()
    const isRussian = locale === 'ru'

    const [isCompleting, setIsCompleting] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)

    // Get lesson data
    const lesson = getLessonById(lessonId)
    const { prev, next } = getAdjacentLessons(lessonId)
    const totalLessons = promptEngineeringCourse.lessons.length

    // Check if lesson is already completed
    useEffect(() => {
        const checkProgress = async () => {
            if (!user?.id) return

            try {
                const response = await fetch(
                    `/api/courses/progress?user_id=${user.id}&course_slug=${courseSlug}`
                )
                if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.completedLessons?.includes(lessonId)) {
                        setIsCompleted(true)
                    }
                }
            } catch (error) {
                console.error('Failed to check progress:', error)
            }
        }

        checkProgress()
    }, [user?.id, courseSlug, lessonId])

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            const returnUrl = encodeURIComponent(`/${locale}/learn/${courseSlug}/${lessonId}`)
            router.push(`/${locale}/auth/callback?return=${returnUrl}`)
        }
    }, [isLoading, user, router, locale, courseSlug, lessonId])

    // Mark lesson as complete
    const handleComplete = async () => {
        if (!user?.id || isCompleting) return

        setIsCompleting(true)
        try {
            const response = await fetch('/api/courses/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    course_slug: courseSlug,
                    lesson_number: lessonId
                })
            })

            if (response.ok) {
                setIsCompleted(true)
                // Navigate to next lesson if available
                if (next) {
                    setTimeout(() => {
                        router.push(`/${locale}/learn/${courseSlug}/${next.id}`)
                    }, 1000)
                }
            }
        } catch (error) {
            console.error('Failed to mark lesson as complete:', error)
        } finally {
            setIsCompleting(false)
        }
    }

    // Show loading while checking auth
    if (isLoading) {
        return (
            <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            </main>
        )
    }

    // Don't render if not authenticated (will redirect)
    if (!user) {
        return (
            <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            </main>
        )
    }

    // Lesson not found
    if (!lesson) {
        return (
            <main className="min-h-screen bg-[var(--background)]">
                <Navigation dict={dict.nav} locale={locale} />
                <div className="pt-32 pb-16 px-4 text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">
                        {isRussian ? 'Урок не найден' : 'Lesson not found'}
                    </h1>
                    <Link
                        href={`/${locale}/learn/${courseSlug}`}
                        className="text-[var(--accent)] hover:underline"
                    >
                        {isRussian ? 'Вернуться к курсу' : 'Back to course'}
                    </Link>
                </div>
                <Footer dict={dict.footer} locale={locale} />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navigation dict={dict.nav} locale={locale} />

            <article className="pt-28 pb-16 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link
                            href={`/${locale}/learn/${courseSlug}`}
                            className="hover:text-[var(--accent)] transition-colors flex items-center gap-1"
                        >
                            <ArrowLeft size={14} />
                            {isRussian
                                ? promptEngineeringCourse.title
                                : promptEngineeringCourse.titleEn
                            }
                        </Link>
                    </div>

                    {/* Lesson Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <LessonHeader
                            lessonNumber={lesson.id}
                            totalLessons={totalLessons}
                            title={isRussian ? lesson.title : lesson.titleEn}
                            duration={lesson.duration}
                            badge={isRussian ? lesson.badge : lesson.badgeEn}
                            objectives={isRussian ? lesson.objectives : lesson.objectivesEn}
                            isRussian={isRussian}
                        />
                    </motion.div>

                    {/* Lesson Content */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8"
                    >
                        {lesson.content.map((block, i) => (
                            <ContentBlock
                                key={i}
                                block={block}
                                isRussian={isRussian}
                            />
                        ))}
                    </motion.div>

                    {/* Quiz */}
                    {lesson.quiz && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-12"
                        >
                            <Quiz
                                data={lesson.quiz}
                                isRussian={isRussian}
                            />
                        </motion.div>
                    )}

                    {/* Summary */}
                    {lesson.summary && lesson.summary.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-12"
                        >
                            <SummaryCard
                                items={isRussian ? lesson.summary : lesson.summaryEn}
                                isRussian={isRussian}
                            />
                        </motion.div>
                    )}

                    {/* Complete Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 text-center"
                    >
                        {isCompleted ? (
                            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
                                <CheckCircle size={20} />
                                {isRussian ? 'Урок завершён!' : 'Lesson completed!'}
                            </div>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={isCompleting}
                                className="btn-shine bg-[var(--accent)] text-black font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 mx-auto hover:scale-[1.02] transition-transform disabled:opacity-50"
                            >
                                {isCompleting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        {isRussian ? 'Сохранение...' : 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        {next
                                            ? (isRussian ? 'Завершить и продолжить' : 'Complete & Continue')
                                            : (isRussian ? 'Завершить курс' : 'Complete Course')
                                        }
                                    </>
                                )}
                            </button>
                        )}
                    </motion.div>

                    {/* Navigation */}
                    <LessonNav
                        locale={locale}
                        courseSlug={courseSlug}
                        prevLesson={prev ? {
                            id: prev.id,
                            title: isRussian ? prev.title : prev.titleEn
                        } : undefined}
                        nextLesson={next ? {
                            id: next.id,
                            title: isRussian ? next.title : next.titleEn
                        } : undefined}
                        isRussian={isRussian}
                    />
                </div>
            </article>

            <Footer dict={dict.footer} locale={locale} />
        </main>
    )
}
