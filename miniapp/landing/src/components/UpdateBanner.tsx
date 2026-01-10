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
                        transition={{ duration: 0.2 }}
                        onClick={handleDismiss}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 25
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="relative w-full max-w-md pointer-events-auto">
                            {/* Glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-emerald-500 rounded-3xl blur-xl opacity-30 animate-pulse" />

                            <div className="relative bg-[var(--bg-card)] border border-white/10 rounded-3xl p-6 shadow-2xl">
                                {/* Close button */}
                                <button
                                    onClick={handleDismiss}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={16} />
                                </button>

                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    <motion.div
                                        animate={{
                                            rotate: [0, 10, -10, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 1
                                        }}
                                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-emerald-500 flex items-center justify-center shadow-lg shadow-[var(--accent)]/30"
                                    >
                                        <Rocket className="text-black" size={32} />
                                    </motion.div>
                                </div>

                                {/* Title */}
                                <div className="text-center mb-4">
                                    <h2 className="text-xl font-bold text-white mb-2">
                                        New Update Available!
                                    </h2>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                                        </span>
                                        <span className="text-sm font-mono text-[var(--accent)]">
                                            v{latestRelease.version}
                                        </span>
                                    </div>
                                </div>

                                {/* Summary */}
                                <p className="text-center text-gray-400 mb-4">
                                    {latestRelease.summary}
                                </p>

                                {/* Highlights */}
                                {latestRelease.highlights && latestRelease.highlights.length > 0 && (
                                    <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent)] mb-2">
                                            <Sparkles size={14} />
                                            Highlights
                                        </div>
                                        <ul className="space-y-1">
                                            {latestRelease.highlights.slice(0, 3).map((h, i) => (
                                                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                    <span className="text-[var(--accent)] mt-1">•</span>
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
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors"
                                    >
                                        Later
                                    </button>
                                    <Link
                                        href="/changelog"
                                        onClick={handleDismiss}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--accent)] text-black text-sm font-medium hover:bg-[var(--accent)]/90 transition-colors"
                                    >
                                        View Changes
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
