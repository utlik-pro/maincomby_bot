'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Sparkles,
    ChevronRight,
    Target,
    Lightbulb,
    Rocket,
    GraduationCap,
    Play
} from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/sections/Footer'
import { coursesData } from '@/data/courses'
import { CourseCard } from '@/components/CourseCard'

// Feature card for benefits section
const FeatureCard: React.FC<{
    icon: React.ElementType
    title: string
    description: string
    index: number
}> = ({ icon: Icon, title, description, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="bg-[var(--bg-card)] border border-white/5 rounded-xl p-6 hover:border-[var(--accent)]/30 transition-colors"
    >
        <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-[var(--accent)]" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
)

interface LearnClientPageProps {
    dict: any
    locale: string
}

export default function LearnClientPage({ dict, locale }: LearnClientPageProps) {
    const isRussian = locale === 'ru'

    const benefits = isRussian
        ? [
            { icon: Target, title: 'Практика с первого дня', description: 'Каждый урок содержит упражнения для закрепления навыков' },
            { icon: Lightbulb, title: 'От простого к сложному', description: 'Структурированная программа для любого уровня подготовки' },
            { icon: Rocket, title: 'Актуальные знания', description: 'Контент обновляется с каждым релизом AI-моделей' },
            { icon: GraduationCap, title: 'Сертификация', description: 'Получите подтверждение своих навыков после прохождения' },
        ]
        : [
            { icon: Target, title: 'Practice from Day One', description: 'Every lesson includes exercises to reinforce your skills' },
            { icon: Lightbulb, title: 'From Simple to Complex', description: 'Structured program for any skill level' },
            { icon: Rocket, title: 'Up-to-date Knowledge', description: 'Content updated with every AI model release' },
            { icon: GraduationCap, title: 'Certification', description: 'Get confirmation of your skills after completion' },
        ]

    // Stats
    const stats = [
        { value: '1,200+', label: isRussian ? 'Студентов' : 'Students' },
        { value: coursesData.length.toString(), label: isRussian ? 'Курсов' : 'Courses' },
        { value: '40+', label: isRussian ? 'Часов контента' : 'Hours of content' },
        { value: '4.9', label: isRussian ? 'Средний рейтинг' : 'Average rating' },
    ]

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navigation dict={dict.nav} locale={locale} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 via-transparent to-transparent" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-gray-500 mb-8"
                    >
                        <a href={`/${locale}`} className="hover:text-[var(--accent)] transition-colors">
                            {isRussian ? 'Главная' : 'Home'}
                        </a>
                        <ChevronRight size={14} />
                        <span className="text-[var(--accent)]">{isRussian ? 'Обучение' : 'Learning'}</span>
                    </motion.div>

                    {/* Hero content */}
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] px-4 py-2 rounded-full text-sm font-medium mb-6"
                        >
                            <Sparkles size={16} />
                            {isRussian ? 'ИИ Академия' : 'AI Academy'}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-6"
                        >
                            {isRussian ? (
                                <>
                                    Освой <span className="gradient-text">AI-инструменты</span>
                                    <br />за несколько часов
                                </>
                            ) : (
                                <>
                                    Master <span className="gradient-text">AI Tools</span>
                                    <br />in Just Hours
                                </>
                            )}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
                        >
                            {isRussian
                                ? 'Структурированные курсы по работе с нейросетями. От базовых промптов до разработки собственных AI-агентов.'
                                : 'Structured courses on working with neural networks. From basic prompts to developing your own AI agents.'}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            <a
                                href="#courses"
                                className="btn-shine flex items-center gap-2 bg-[var(--accent)] text-black font-semibold px-8 py-4 rounded-xl text-lg"
                            >
                                <Rocket size={20} />
                                {isRussian ? 'Выбрать курс' : 'Choose Course'}
                            </a>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-gray-500 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Courses Section */}
            <section id="courses" className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {isRussian ? 'Каталог курсов' : 'Course Catalog'}
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            {isRussian
                                ? 'Актуальные знания от практиков. Выберите направление и начните обучение.'
                                : 'Current knowledge from practitioners. Choose a direction and start learning.'}
                        </p>
                    </motion.div>

                    {/* Course grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                        {coursesData.map((course, index) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                index={index}
                                locale={locale}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 bg-gradient-to-b from-transparent via-[var(--bg-card)]/50 to-transparent">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {isRussian ? 'Почему учиться у нас?' : 'Why Learn With Us?'}
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            {isRussian
                                ? 'Мы создаём курсы, которые действительно работают'
                                : 'We create courses that actually work'}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <FeatureCard key={index} {...benefit} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-[var(--accent)]/20 via-[var(--bg-card)] to-purple-500/10 border border-[var(--accent)]/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[var(--accent)]/20 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                {isRussian ? 'Готов начать?' : 'Ready to Start?'}
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                                {isRussian
                                    ? 'Выбери курс и получи доступ к материалам прямо в Telegram. Учись в удобном формате.'
                                    : 'Choose a course and get access to materials right in Telegram. Learn in a convenient format.'}
                            </p>
                            <a
                                href="https://t.me/maincomapp_bot/app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-shine inline-flex items-center gap-2 bg-[var(--accent)] text-black font-semibold px-10 py-4 rounded-xl text-lg"
                            >
                                <Play size={20} />
                                {isRussian ? 'Открыть Mini App' : 'Open Mini App'}
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer dict={dict.footer} />
        </main>
    )
}
