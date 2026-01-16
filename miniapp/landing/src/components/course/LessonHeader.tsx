'use client'

import { Clock, Target } from 'lucide-react'

interface LessonHeaderProps {
    lessonNumber: number
    totalLessons: number
    title: string
    duration: string
    badge?: string
    objectives: string[]
    isRussian: boolean
}

export function LessonHeader({
    lessonNumber,
    totalLessons,
    title,
    duration,
    badge,
    objectives,
    isRussian
}: LessonHeaderProps) {
    return (
        <div className="mb-8">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-sm font-medium">
                    {isRussian ? `Урок ${lessonNumber}` : `Lesson ${lessonNumber}`} / {totalLessons}
                </span>
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                    <Clock size={14} />
                    {duration}
                </span>
                {badge && (
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm">
                        {badge}
                    </span>
                )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {title}
            </h1>

            {/* Objectives */}
            {objectives.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Target size={18} className="text-[var(--accent)]" />
                        <h4 className="font-semibold text-white">
                            {isRussian ? 'Цели урока' : 'Lesson Objectives'}
                        </h4>
                    </div>
                    <ul className="space-y-2">
                        {objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                                <span className="text-[var(--accent)] mt-0.5">•</span>
                                {obj}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
