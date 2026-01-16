'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface LessonNavProps {
    locale: string
    courseSlug: string
    prevLesson?: {
        id: number
        title: string
    }
    nextLesson?: {
        id: number
        title: string
    }
    isRussian: boolean
}

export function LessonNav({ locale, courseSlug, prevLesson, nextLesson, isRussian }: LessonNavProps) {
    return (
        <div className="flex items-stretch gap-4 mt-12 pt-8 border-t border-white/10">
            {/* Previous */}
            <div className="flex-1">
                {prevLesson && (
                    <Link
                        href={`/${locale}/learn/${courseSlug}/${prevLesson.id}`}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--accent)]/30 transition-colors group"
                    >
                        <ArrowLeft size={20} className="text-gray-400 group-hover:text-[var(--accent)] transition-colors" />
                        <div className="text-left">
                            <div className="text-xs text-gray-500 mb-1">
                                {isRussian ? 'Назад' : 'Previous'}
                            </div>
                            <div className="text-sm text-white font-medium group-hover:text-[var(--accent)] transition-colors">
                                {prevLesson.title}
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {/* Next */}
            <div className="flex-1">
                {nextLesson && (
                    <Link
                        href={`/${locale}/learn/${courseSlug}/${nextLesson.id}`}
                        className="flex items-center justify-end gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--accent)]/30 transition-colors group"
                    >
                        <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">
                                {isRussian ? 'Далее' : 'Next'}
                            </div>
                            <div className="text-sm text-white font-medium group-hover:text-[var(--accent)] transition-colors">
                                {nextLesson.title}
                            </div>
                        </div>
                        <ArrowRight size={20} className="text-gray-400 group-hover:text-[var(--accent)] transition-colors" />
                    </Link>
                )}
            </div>
        </div>
    )
}
