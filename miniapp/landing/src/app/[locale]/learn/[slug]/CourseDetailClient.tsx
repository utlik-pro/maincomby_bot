'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    ChevronRight,
    Clock,
    BookOpen,
    ShieldCheck,
    Play,
    Zap,
    ArrowLeft,
    CheckCircle,
    Lock,
    Crown,
    Sparkles
} from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/sections/Footer'
import { coursesData, AccessTier } from '@/data/courses'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

interface CourseDetailClientProps {
    dict: any
    locale: string
    slug: string
}

// Map tier to display name
const TIER_NAMES: Record<AccessTier, { ru: string; en: string }> = {
    free: { ru: 'Бесплатно', en: 'Free' },
    light: { ru: 'Light подписка', en: 'Light subscription' },
    pro: { ru: 'Pro подписка', en: 'Pro subscription' },
}

export default function CourseDetailClient({ dict, locale, slug }: CourseDetailClientProps) {
    // Find course by slug
    const course = coursesData.find(c => c.slug === slug)
    const isRussian = locale === 'ru'
    const router = useRouter()
    const { user, isLoading, checkCourseAccess, subscriptionTier } = useAuth()

    if (!course) {
        notFound()
    }

    const redirectToLogin = () => {
        router.push(`/${locale}/auth/callback?return=${encodeURIComponent(`/${locale}/learn/${slug}`)}`)
    }

    // Get access info for this course (only available when logged in)
    const accessInfo = checkCourseAccess(course.id)
    const hasAccess = accessInfo?.hasAccess || false
    const accessType = accessInfo?.accessType

    const handleStart = () => {
        if (!user) {
            redirectToLogin()
            return
        }
        window.open(`https://t.me/maincomapp_bot?start=course_${course.id}`, '_blank')
    }

    const handleUpgrade = () => {
        if (!user) {
            redirectToLogin()
            return
        }
        window.open('https://t.me/maincomapp_bot?start=subscribe', '_blank')
    }

    const handlePurchase = () => {
        if (!user) {
            redirectToLogin()
            return
        }
        window.open(`https://t.me/maincomapp_bot?start=buy_${course.id}`, '_blank')
    }

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navigation dict={dict.nav} locale={locale} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-4 overflow-hidden">
                {/* Dynamic ambient background based on course color */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at 50% 30%, ${course.color}, transparent 70%)`
                    }}
                />

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                        <Link href={`/${locale}/learn`} className="hover:text-[var(--accent)] transition-colors flex items-center gap-1">
                            <ArrowLeft size={14} />
                            {isRussian ? 'Все курсы' : 'All Courses'}
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-white truncate">{isRussian ? course.title : course.titleEn}</span>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Left Col: Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {/* Badges */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                {/* Access tier badge */}
                                {course.accessTier !== 'free' && (
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1.5 ${
                                        course.accessTier === 'pro'
                                            ? 'bg-purple-500/10 border-purple-500/40 text-purple-400'
                                            : 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                                    }`}>
                                        <Crown size={14} />
                                        {TIER_NAMES[course.accessTier][isRussian ? 'ru' : 'en']}
                                    </span>
                                )}
                                {/* Price badge */}
                                <span
                                    className="px-3 py-1 rounded-full text-sm font-bold border"
                                    style={{
                                        color: course.color,
                                        borderColor: `${course.color}40`,
                                        backgroundColor: `${course.color}10`
                                    }}
                                >
                                    {course.price === 0
                                        ? (isRussian ? 'Бесплатно' : 'Free')
                                        : `${course.price} ${course.currency}`}
                                </span>
                                {/* Difficulty badge */}
                                <span className="px-3 py-1 rounded-full text-sm bg-white/5 border border-white/10 text-gray-300 uppercase">
                                    {course.difficulty}
                                </span>
                                {/* User access status */}
                                {user && hasAccess && (
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 border border-green-500/40 text-green-400 flex items-center gap-1.5">
                                        <CheckCircle size={14} />
                                        {accessType === 'purchased' || accessType === 'gifted'
                                            ? (isRussian ? 'Куплено' : 'Purchased')
                                            : (isRussian ? 'Доступно' : 'Available')
                                        }
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                {isRussian ? course.title : course.titleEn}
                            </h1>
                            <p className="text-xl text-gray-400 mb-8">
                                {isRussian ? course.description : course.descriptionEn}
                            </p>

                            {/* Course Meta */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 py-6 border-y border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">{isRussian ? 'Длительность' : 'Duration'}</div>
                                        <div className="text-white font-medium">{course.duration} {isRussian ? 'мин' : 'min'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">{isRussian ? 'Уроков' : 'Lessons'}</div>
                                        <div className="text-white font-medium">{course.lessonsCount}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">{isRussian ? 'Сертификат' : 'Certificate'}</div>
                                        <div className="text-white font-medium">{isRussian ? 'Да' : 'Yes'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                {/* User has access to course */}
                                {hasAccess ? (
                                    <button
                                        onClick={handleStart}
                                        className="btn-shine flex-1 bg-[var(--accent)] text-black font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                                    >
                                        <Play size={20} />
                                        {isRussian ? 'Начать курс' : 'Start Course'}
                                    </button>
                                ) : (
                                    /* User doesn't have access */
                                    <>
                                        {/* Upgrade subscription button */}
                                        <button
                                            onClick={handleUpgrade}
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg py-4 px-8 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                                        >
                                            <Crown size={20} />
                                            {isRussian
                                                ? `Оформить ${TIER_NAMES[course.accessTier].ru}`
                                                : `Get ${TIER_NAMES[course.accessTier].en}`
                                            }
                                        </button>
                                        {/* Or buy separately */}
                                        {course.price > 0 && (
                                            <button
                                                onClick={handlePurchase}
                                                className="flex-1 sm:flex-none border border-white/20 text-white font-medium py-4 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                                            >
                                                <Sparkles size={18} />
                                                {isRussian
                                                    ? `Купить за ${course.price} ${course.currency}`
                                                    : `Buy for ${course.price} ${course.currency}`
                                                }
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            <p className="mt-4 text-xs text-center sm:text-left text-gray-500">
                                {hasAccess
                                    ? (isRussian ? 'У вас есть доступ к этому курсу' : 'You have access to this course')
                                    : !user
                                        ? (isRussian ? 'Войдите через Telegram, чтобы получить доступ' : 'Login with Telegram to get access')
                                        : (isRussian ? 'Оформите подписку или купите курс отдельно' : 'Subscribe or purchase this course separately')
                                }
                            </p>
                        </motion.div>

                        {/* Right Col: Preview / Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div
                                className="aspect-square rounded-[3rem] border border-white/10 bg-[#151515] p-12 flex items-center justify-center relative overflow-hidden"
                                style={{
                                    boxShadow: `0 0 100px -20px ${course.color}20`
                                }}
                            >
                                {/* Animated colored blobs */}
                                <div
                                    className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 animate-pulse"
                                    style={{ backgroundColor: course.color }}
                                />
                                <div
                                    className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[var(--accent)] blur-[80px] opacity-10 animate-pulse delay-700"
                                />

                                <course.icon
                                    size={240}
                                    strokeWidth={1}
                                    className="relative z-10 drop-shadow-2xl"
                                    style={{ color: course.color }}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* What you will learn */}
            <section className="py-16 px-4 bg-white/[0.02]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                        {isRussian ? 'Чему вы научитесь' : 'What you will learn'}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {(isRussian ? course.learningOutcomes : course.learningOutcomesEn).map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                                <CheckCircle className="text-[var(--accent)] shrink-0 mt-0.5" size={20} />
                                <span className="text-gray-300">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Curriculum */}
            <section id="curriculum" className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                        {isRussian ? 'Программа курса' : 'Course Curriculum'}
                    </h2>

                    <div className="space-y-4">
                        {course.program.map((lesson, i) => (
                            <div
                                key={i}
                                className="group flex items-center justify-between p-5 rounded-xl bg-[#151515] border border-white/5 hover:border-[var(--accent)]/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
                                        {i + 1}
                                    </div>
                                    <h3 className="font-medium text-gray-200 group-hover:text-white transition-colors">
                                        {isRussian ? lesson.title : lesson.titleEn}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500 hidden sm:block">
                                        {lesson.duration}
                                    </span>
                                    {course.price > 0 && i > 0 ? (
                                        <Lock size={16} className="text-gray-600" />
                                    ) : (
                                        <Play size={16} className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        {isRussian ? 'Готовы начать?' : 'Ready to start?'}
                    </h2>
                    {hasAccess ? (
                        <button
                            onClick={handleStart}
                            className="btn-shine bg-[var(--accent)] text-black font-bold text-lg py-4 px-12 rounded-xl hover:scale-105 transition-transform"
                        >
                            {isRussian ? 'Начать курс' : 'Start Course'}
                        </button>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={handleUpgrade}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg py-4 px-8 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                <Crown size={20} />
                                {isRussian
                                    ? `Оформить ${TIER_NAMES[course.accessTier].ru}`
                                    : `Get ${TIER_NAMES[course.accessTier].en}`
                                }
                            </button>
                            {course.price > 0 && (
                                <button
                                    onClick={handlePurchase}
                                    className="border border-white/20 text-white font-medium py-4 px-8 rounded-xl flex items-center gap-2 hover:bg-white/5 transition-colors"
                                >
                                    <Sparkles size={18} />
                                    {isRussian
                                        ? `Купить за ${course.price} ${course.currency}`
                                        : `Buy for ${course.price} ${course.currency}`
                                    }
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <Footer dict={dict.footer} locale={locale} />
        </main>
    )
}
