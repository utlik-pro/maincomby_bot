'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ArrowRight, Rocket } from 'lucide-react'

// Import releases data
import releasesData from '@/data/releases.json'

const STORAGE_KEY = 'main_last_seen_version'

export function UpdateBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [latestRelease, setLatestRelease] = useState<{
        version: string
        summary: string
        highlights?: string[]
    } | null>(null)

    useEffect(() => {
        // Check if user has seen the current version
        const lastSeenVersion = localStorage.getItem(STORAGE_KEY)
        const releases = releasesData.releases

        if (releases.length > 0) {
            const latest = releases[0]
            setLatestRelease({
                version: latest.version,
                summary: latest.summary,
                highlights: latest.highlights,
            })

            // Show modal if user hasn't seen this version
            if (lastSeenVersion !== latest.version) {
                // Small delay for better UX
                setTimeout(() => setIsVisible(true), 1000)
            }
        }
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        if (latestRelease) {
            localStorage.setItem(STORAGE_KEY, latestRelease.version)
        }
    }

    if (!latestRelease) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleDismiss}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="relative w-full max-w-md pointer-events-auto">
                            {/* Outer glow */}
                            <div className="absolute -inset-4 bg-[var(--accent)]/20 rounded-[40px] blur-3xl" />

                            {/* Glass card */}
                            <div className="relative">
                                {/* Gradient border effect */}
                                <div className="absolute -inset-[1px] bg-gradient-to-b from-white/30 via-white/10 to-white/5 rounded-3xl" />

                                {/* Main glass panel */}
                                <div className="relative backdrop-blur-2xl bg-gradient-to-b from-white/15 via-white/10 to-white/5 rounded-3xl overflow-hidden">
                                    {/* Top shine effect */}
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                                    {/* Inner top glow */}
                                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 to-transparent" />

                                    {/* Accent glow behind icon */}
                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 bg-[var(--accent)]/30 rounded-full blur-3xl" />

                                    {/* Content */}
                                    <div className="relative p-8">
                                        {/* Close button */}
                                        <button
                                            onClick={handleDismiss}
                                            className="absolute top-4 right-4 w-8 h-8 rounded-full backdrop-blur-sm bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                                            aria-label="Close"
                                        >
                                            <X size={16} />
                                        </button>

                                        {/* Icon */}
                                        <div className="flex justify-center mb-6">
                                            <motion.div
                                                animate={{
                                                    y: [0, -8, 0],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut'
                                                }}
                                                className="relative"
                                            >
                                                {/* Icon glow */}
                                                <div className="absolute inset-0 bg-[var(--accent)] rounded-2xl blur-xl opacity-50" />
                                                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] via-[var(--accent)] to-emerald-400 flex items-center justify-center shadow-2xl shadow-[var(--accent)]/40">
                                                    <Rocket className="text-black" size={28} />
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Title */}
                                        <div className="text-center mb-5">
                                            <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">
                                                New Update Available!
                                            </h2>
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-sm bg-[var(--accent)]/20 border border-[var(--accent)]/40">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                                                </span>
                                                <span className="text-sm font-mono font-semibold text-[var(--accent)]">
                                                    v{latestRelease.version}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        <p className="text-center text-white/70 mb-5 leading-relaxed">
                                            {latestRelease.summary}
                                        </p>

                                        {/* Highlights */}
                                        {latestRelease.highlights && latestRelease.highlights.length > 0 && (
                                            <div className="mb-6 p-4 rounded-2xl backdrop-blur-sm bg-white/5 border border-white/10">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)] mb-3">
                                                    <Sparkles size={14} />
                                                    Highlights
                                                </div>
                                                <ul className="space-y-2">
                                                    {latestRelease.highlights.slice(0, 3).map((h, i) => (
                                                        <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                                                            <span className="text-[var(--accent)] mt-0.5">•</span>
                                                            {h}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleDismiss}
                                                className="flex-1 px-4 py-3.5 rounded-xl backdrop-blur-sm bg-white/10 border border-white/10 text-white/80 text-sm font-medium hover:bg-white/15 hover:text-white transition-all"
                                            >
                                                Later
                                            </button>
                                            <Link
                                                href="/changelog"
                                                onClick={handleDismiss}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[var(--accent)] text-black text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-[var(--accent)]/30"
                                            >
                                                View Changes
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Bottom reflection */}
                                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
