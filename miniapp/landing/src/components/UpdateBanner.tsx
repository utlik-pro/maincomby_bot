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
        const lastSeenVersion = localStorage.getItem(STORAGE_KEY)
        const releases = releasesData.releases

        if (releases.length > 0) {
            const latest = releases[0]
            setLatestRelease({
                version: latest.version,
                summary: latest.summary,
                highlights: latest.highlights,
            })

            if (lastSeenVersion !== latest.version) {
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
                        onClick={handleDismiss}
                        className="fixed inset-0 z-50 bg-black/80"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="relative w-full max-w-sm pointer-events-auto">
                            {/* Card */}
                            <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-6 shadow-2xl">
                                {/* Close button */}
                                <button
                                    onClick={handleDismiss}
                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X size={16} />
                                </button>

                                {/* Timeline style header */}
                                <div className="flex items-start gap-4 mb-4">
                                    {/* Pulsing dot like changelog */}
                                    <div className="relative flex items-center justify-center w-4 h-4 mt-1">
                                        <span className="absolute inline-flex h-4 w-4 rounded-full bg-[var(--accent)] opacity-75 animate-ping" />
                                        <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--accent)]" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Rocket size={18} className="text-[var(--accent)]" />
                                            <span className="font-semibold text-white">
                                                New Update
                                            </span>
                                        </div>
                                        <span className="text-sm font-mono text-[var(--accent)]">
                                            v{latestRelease.version}
                                        </span>
                                    </div>
                                </div>

                                {/* Summary */}
                                <p className="text-gray-400 text-sm mb-4 pl-8">
                                    {latestRelease.summary}
                                </p>

                                {/* Highlights */}
                                {latestRelease.highlights && latestRelease.highlights.length > 0 && (
                                    <div className="mb-5 pl-8">
                                        <div className="flex items-center gap-2 text-xs font-medium text-[var(--accent)] mb-2">
                                            <Sparkles size={12} />
                                            Highlights
                                        </div>
                                        <ul className="space-y-1">
                                            {latestRelease.highlights.slice(0, 3).map((h, i) => (
                                                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                                    <span className="text-white/30 mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                                                    {h}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pl-8">
                                    <button
                                        onClick={handleDismiss}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-gray-400 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        Later
                                    </button>
                                    <Link
                                        href="/changelog"
                                        onClick={handleDismiss}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-black text-sm font-medium hover:brightness-110 transition-all"
                                    >
                                        View
                                        <ArrowRight size={14} />
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
