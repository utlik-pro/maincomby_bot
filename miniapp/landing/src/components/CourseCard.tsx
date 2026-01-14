'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Lock,
    Star,
    BookOpen,
    Clock,
    Users,
    Play,
    ArrowRight,
    CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { CourseData } from '@/data/courses'

interface CourseCardProps {
    course: CourseData
    index: number
    locale: string
}

export function CourseCard({ course, index, locale }: CourseCardProps) {
    const Icon = course.icon
    const isRussian = locale === 'ru'
    const isAvailable = true // For now all courses are clickable/viewable as details

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--bg-card)] to-[#252525] border border-[var(--accent)]/10 hover:border-[var(--accent)]/50 transition-all duration-300 h-full flex flex-col`}
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="p-6 flex flex-col flex-1 relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg"
                        style={{ backgroundColor: `${course.color}20`, boxShadow: `0 0 20px ${course.color}10` }}
                    >
                        <Icon size={28} style={{ color: course.color }} />
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {/* Price badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${course.price === 0
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'
                            }`}>
                            {course.price === 0
                                ? (isRussian ? 'Бесплатно' : 'Free')
                                : `${course.price} ${course.currency}`}
                        </div>

                        {/* Difficulty badge */}
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                            {course.difficulty}
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {(isRussian ? course.tags : course.tagsEn).slice(0, 2).map((tag, i) => (
                        <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--accent)] transition-colors">
                    {isRussian ? course.title : course.titleEn}
                </h3>
                <p className="text-sm text-gray-400 mb-6 line-clamp-2 flex-1">
                    {isRussian ? course.description : course.descriptionEn}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-6 py-4 border-t border-white/5 border-b">
                    <div className="flex items-center gap-1.5">
                        <BookOpen size={14} className="text-gray-400" />
                        <span>{course.lessonsCount} {isRussian ? 'уроков' : 'lessons'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        <span>{course.duration} {isRussian ? 'мин' : 'min'}</span>
                    </div>
                </div>

                {/* CTA */}
                <Link
                    href={`/${locale}/learn/${course.slug}`}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-[var(--accent)] hover:text-black text-white font-medium py-3 rounded-xl transition-all duration-300 group/btn"
                >
                    <span>{isRussian ? 'Подробнее' : 'Details'}</span>
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </motion.div>
    )
}
