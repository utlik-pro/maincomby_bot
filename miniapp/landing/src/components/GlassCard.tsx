'use client'

import { useRef, useState } from 'react'
import { motion, type MotionProps } from 'framer-motion'

interface GlassCardProps extends Pick<MotionProps, 'initial' | 'whileInView' | 'viewport' | 'transition' | 'animate'> {
    children: React.ReactNode
    className?: string
}

export function GlassCard({
    children,
    className = '',
    initial,
    whileInView,
    viewport,
    transition,
    animate
}: GlassCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
    }

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={initial}
            whileInView={whileInView}
            viewport={viewport}
            transition={transition}
            animate={animate}
            className={`relative ${className}`}
        >
            {/* Flashlight effect - with overflow hidden to clip the glow */}
            <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none z-10">
                <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 212, 170, 0.15), transparent 40%)`
                    }}
                />
            </div>
            {/* Content */}
            <div className="relative z-20 flex flex-col flex-grow h-full">
                {children}
            </div>
        </motion.div>
    )
}
