'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

type AnimationType = 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale' | 'fade'

interface AnimatedSectionProps {
    children: ReactNode
    className?: string
    animation?: AnimationType
    delay?: number
    duration?: number
    once?: boolean
}

const animations = {
    fadeUp: {
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0 }
    },
    fadeDown: {
        hidden: { opacity: 0, y: -60 },
        visible: { opacity: 1, y: 0 }
    },
    fadeLeft: {
        hidden: { opacity: 0, x: -60 },
        visible: { opacity: 1, x: 0 }
    },
    fadeRight: {
        hidden: { opacity: 0, x: 60 },
        visible: { opacity: 1, x: 0 }
    },
    scale: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 }
    },
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    }
}

export function AnimatedSection({
    children,
    className = '',
    animation = 'fadeUp',
    delay = 0,
    duration = 0.6,
    once = true
}: AnimatedSectionProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin: "-100px" }}
            variants={animations[animation]}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1] as const
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

// Staggered children animation
interface StaggerContainerProps {
    children: ReactNode
    className?: string
    staggerDelay?: number
}

export function StaggerContainer({
    children,
    className = '',
    staggerDelay = 0.1
}: StaggerContainerProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: staggerDelay
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({
    children,
    className = ''
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        type: 'spring' as const,
                        stiffness: 300,
                        damping: 24
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
