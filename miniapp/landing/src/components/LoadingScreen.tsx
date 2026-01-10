'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingScreen() {
    const [phase, setPhase] = useState<'loading' | 'transitioning' | 'done'>('loading')
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                // Faster at start, slower near end
                const increment = prev < 70 ? 8 : prev < 90 ? 4 : 2
                return Math.min(prev + increment, 100)
            })
        }, 50)

        // Start transition phase (logo moves up)
        const transitionTimeout = setTimeout(() => {
            setPhase('transitioning')
        }, 1300)

        // Hide loading screen after logo animation
        const doneTimeout = setTimeout(() => {
            setPhase('done')
        }, 2000)

        return () => {
            clearInterval(interval)
            clearTimeout(transitionTimeout)
            clearTimeout(doneTimeout)
        }
    }, [])

    if (phase === 'done') return null

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === 'transitioning' ? 0 : 1 }}
            transition={{ duration: 0.5, delay: phase === 'transitioning' ? 0.3 : 0 }}
            className="fixed inset-0 z-[100] bg-[var(--background)]"
        >
            {/* Background glow */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent)]/20 rounded-full blur-[150px]"
                animate={{
                    opacity: phase === 'transitioning' ? 0 : 1,
                    scale: phase === 'transitioning' ? 0.5 : 1
                }}
                transition={{ duration: 0.5 }}
            />

            {/* Logo - animates from center to nav position */}
            <motion.div
                initial={{
                    top: '50%',
                    left: '50%',
                    x: '-50%',
                    y: '-50%',
                    scale: 1
                }}
                animate={{
                    top: phase === 'transitioning' ? '24px' : '50%',
                    left: '50%',
                    x: '-50%',
                    y: phase === 'transitioning' ? '0%' : '-50%',
                    scale: phase === 'transitioning' ? 0.5 : 1
                }}
                transition={{
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1]
                }}
                className="absolute z-10"
            >
                <Image
                    src="/logo.png"
                    alt="MAIN Logo"
                    width={128}
                    height={128}
                    className="w-28 h-28 sm:w-32 sm:h-32"
                    priority
                />
            </motion.div>

            {/* Brand name */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: phase === 'transitioning' ? 0 : 1,
                    y: phase === 'transitioning' ? -20 : 0
                }}
                transition={{ duration: 0.4 }}
                className="absolute top-[calc(50%+80px)] left-1/2 -translate-x-1/2 text-3xl sm:text-4xl font-bold text-white z-10 whitespace-nowrap"
            >
                MAIN <span className="text-[var(--accent)]">Platform</span>
            </motion.h1>

            {/* Loading bar container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: phase === 'transitioning' ? 0 : 1,
                    y: phase === 'transitioning' ? 20 : 0
                }}
                transition={{ duration: 0.4 }}
                className="absolute top-[calc(50%+140px)] left-1/2 -translate-x-1/2 w-64 sm:w-80 z-10"
            >
                {/* Background bar */}
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    {/* Progress bar */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                        className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--success)] rounded-full relative"
                    >
                        {/* Shine effect on progress bar */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </motion.div>
                </div>

                {/* Progress percentage */}
                <p className="text-center text-gray-500 text-sm mt-3">
                    {progress}%
                </p>
            </motion.div>
        </motion.div>
    )
}
