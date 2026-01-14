'use client'

import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Clock, Sparkles, ArrowRight } from 'lucide-react'
import { GlassCard } from '../GlassCard'
import { TiltCard } from '../TiltCard'

interface LearnProps {
    dict: {
        title: string
        subtitle: string
        courseTitle: string
        courseDescription: string
        lessons: string
        minutes: string
        cta: string
        comingSoon: string
    }
}

export function Learn({ dict }: LearnProps) {
    const handleOpenBot = () => {
        window.open('https://t.me/maincomapp_bot?startapp=learn', '_blank')
    }

    return (
        <section id="learn" className="py-24 relative overflow-hidden">
            {/* Neon glow effects */}
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-[var(--accent)]/15 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[var(--success)]/10 rounded-full blur-[120px] animate-pulse delay-700" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-full px-4 py-2 mb-6">
                        <GraduationCap size={18} className="text-[var(--accent)]" />
                        <span className="text-[var(--accent)] text-sm font-medium">
                            {dict.title}
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        {dict.subtitle}
                    </h2>
                </motion.div>

                {/* Courses grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Main course */}
                    <TiltCard tiltAmount={6}>
                        <GlassCard
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-[var(--accent)]/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)] h-full group hover:border-[var(--accent)]/50 transition-all duration-300"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/20 flex items-center justify-center">
                                    <Sparkles size={28} className="text-[var(--accent)]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-white mb-1">
                                        {dict.courseTitle}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <BookOpen size={14} />
                                            6 {dict.lessons}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            40 {dict.minutes}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 mb-6">
                                {dict.courseDescription}
                            </p>
                            <button
                                onClick={handleOpenBot}
                                className="w-full py-3 px-4 bg-[var(--accent)] text-black font-semibold rounded-xl flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(200,255,0,0.3)] transition-all duration-300"
                            >
                                {dict.cta}
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </GlassCard>
                    </TiltCard>

                    {/* Coming soon placeholder */}
                    <TiltCard tiltAmount={6}>
                        <GlassCard
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="backdrop-blur-xl bg-white/3 rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] h-full flex flex-col items-center justify-center text-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gray-700/30 flex items-center justify-center mb-4">
                                <BookOpen size={28} className="text-gray-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-500 mb-2">
                                {dict.comingSoon}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Новые курсы скоро появятся
                            </p>
                        </GlassCard>
                    </TiltCard>
                </div>
            </div>
        </section>
    )
}
