'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, X, ArrowRight } from 'lucide-react'
import { APP_VERSION } from '@/lib/version'

// Import releases data
import releasesData from '@/data/releases.json'

const STORAGE_KEY = 'main_last_seen_version'

export function UpdateBanner() {
    const [isVisible, setIsVisible] = useState(false)
    const [latestRelease, setLatestRelease] = useState<{
        version: string
        summary: string
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
            })

            // Show banner if user hasn't seen this version
            if (lastSeenVersion !== latest.version) {
                setIsVisible(true)
            }
        }
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        if (latestRelease) {
            localStorage.setItem(STORAGE_KEY, latestRelease.version)
        }
    }

    if (!isVisible || !latestRelease) return null

    return (
        <div className="fixed top-20 left-0 right-0 z-40 px-4 animate-slide-down">
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-[var(--accent)]/90 to-purple-600/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
                    <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="text-white" size={20} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-white">
                                    New Update Available
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                                    v{latestRelease.version}
                                </span>
                            </div>
                            <p className="text-sm text-white/80 truncate">
                                {latestRelease.summary}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                                href="/changelog"
                                onClick={handleDismiss}
                                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                            >
                                View Changes
                                <ArrowRight size={14} />
                            </Link>
                            <button
                                onClick={handleDismiss}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                                aria-label="Dismiss"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
