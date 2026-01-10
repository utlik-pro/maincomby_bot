'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { PhoneMockup } from '../PhoneMockup'
import { ScreenDescriptions } from '../ScreenDescriptions'

interface HeroProps {
    dict: {
        title: string
        titleHighlight: string
        rotatingWords: string[]
        subtitle: string
        cta: string
        ctaSecondary: string
    }
    locale?: string
}

export function Hero({ dict, locale = 'ru' }: HeroProps) {
    const [activeTab, setActiveTab] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [wordIndex, setWordIndex] = useState(0)

    // Auto-rotate screens every 4 seconds unless paused
    useEffect(() => {
        if (isPaused) return

        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % 4)
        }, 4000)

        return () => clearInterval(interval)
    }, [isPaused])

    // Rotate words every 2.5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % dict.rotatingWords.length)
        }, 2500)

        return () => clearInterval(interval)
    }, [dict.rotatingWords.length])

    const handleTabChange = (tab: number) => {
        setActiveTab(tab)
        setIsPaused(true)
        // Resume auto-rotation after 10 seconds
        setTimeout(() => setIsPaused(false), 10000)
    }

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-16">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 via-transparent to-transparent" />

            {/* Neon glow effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--accent)]/15 rounded-full blur-[120px] animate-pulse delay-1000" />
            <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-[var(--success)]/15 rounded-full blur-[80px] animate-pulse delay-500" />
            <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-[var(--accent)]/25 rounded-full blur-[100px] animate-pulse delay-300" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent)]/10 rounded-full blur-[150px] animate-pulse delay-700" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--accent)]/20 mb-6">
                        <Sparkles size={16} className="text-[var(--accent)]" />
                        <span className="text-sm text-gray-300">Telegram Mini App</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
                        <span className="text-white">{dict.title}</span>
                        <br />
                        <span className="text-white">{dict.titleHighlight} </span>
                        <span className="relative inline-block min-w-[200px] sm:min-w-[280px] text-left">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={wordIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="inline-block text-[var(--accent)] font-extrabold drop-shadow-[0_0_25px_rgba(0,212,170,0.7)] [text-shadow:0_0_40px_rgba(0,212,170,0.5),0_0_80px_rgba(0,212,170,0.3)]"
                                >
                                    {dict.rotatingWords[wordIndex]}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                        {dict.subtitle}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://t.me/dmitryutlik"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-shine haptic inline-flex items-center gap-2 px-8 py-4 bg-[var(--accent)] text-black font-semibold rounded-2xl hover:bg-[var(--accent-dark)]"
                        >
                            {dict.cta}
                            <ArrowRight size={20} />
                        </a>
                        <a
                            href="https://t.me/maincomapp_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-shine btn-shine-secondary haptic inline-flex items-center gap-2 px-8 py-4 bg-[var(--bg-card)] text-white font-semibold rounded-2xl border border-white/10"
                        >
                            {dict.ctaSecondary}
                        </a>
                    </div>
                </motion.div>

                {/* Interactive Demo Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                >
                    {/* Phone mockup */}
                    <div className="flex justify-center lg:justify-end order-1 lg:order-1">
                        <PhoneMockup
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                        />
                    </div>

                    {/* Screen descriptions */}
                    <div className="order-2 lg:order-2 min-h-[300px] lg:min-h-[400px]">
                        <ScreenDescriptions
                            activeScreen={activeTab}
                            locale={locale}
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
