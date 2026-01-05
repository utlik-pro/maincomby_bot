'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

interface HeroProps {
    dict: {
        title: string
        titleHighlight: string
        subtitle: string
        cta: string
        ctaSecondary: string
    }
}

export function Hero({ dict }: HeroProps) {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 via-transparent to-transparent" />

            {/* Animated circles */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--success)]/10 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--accent)]/20 mb-8">
                        <Sparkles size={16} className="text-[var(--accent)]" />
                        <span className="text-sm text-gray-300">Telegram Mini App</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                        <span className="text-white">{dict.title}</span>
                        <br />
                        <span className="gradient-text">{dict.titleHighlight}</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        {dict.subtitle}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://t.me/MainCommunityBot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="haptic inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent)] text-black font-semibold rounded-2xl hover:bg-[var(--accent-dark)] transition-colors accent-glow"
                        >
                            {dict.cta}
                            <ArrowRight size={20} />
                        </a>
                        <a
                            href="#contact"
                            className="haptic inline-flex items-center gap-2 px-8 py-4 bg-[var(--bg-card)] text-white font-semibold rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
                        >
                            {dict.ctaSecondary}
                        </a>
                    </div>
                </motion.div>

                {/* Phone mockup placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-16 relative"
                >
                    <div className="mx-auto w-72 h-[500px] bg-[var(--bg-card)] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden relative">
                        {/* Phone notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />

                        {/* Screen content preview */}
                        <div className="p-4 pt-10">
                            <div className="bg-[var(--bg-hover)] rounded-2xl p-4 mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20" />
                                    <div>
                                        <div className="w-24 h-3 bg-white/20 rounded mb-2" />
                                        <div className="w-16 h-2 bg-white/10 rounded" />
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-[var(--accent)]/30 rounded-full">
                                    <div className="w-2/3 h-2 bg-[var(--accent)] rounded-full" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="aspect-square bg-[var(--bg-hover)] rounded-xl flex items-center justify-center">
                                        <div className="w-6 h-6 rounded-full bg-[var(--accent)]/30" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent pointer-events-none" />
                </motion.div>
            </div>
        </section>
    )
}
