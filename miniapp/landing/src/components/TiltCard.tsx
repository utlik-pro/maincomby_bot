'use client'

import { useRef, useState, ReactNode } from 'react'

interface TiltCardProps {
    children: ReactNode
    className?: string
    tiltAmount?: number
    glareEnabled?: boolean
}

export function TiltCard({
    children,
    className = '',
    tiltAmount = 10,
    glareEnabled = true
}: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [transform, setTransform] = useState('')
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return

        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateX = ((y - centerY) / centerY) * -tiltAmount
        const rotateY = ((x - centerX) / centerX) * tiltAmount

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`)
        setGlarePosition({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100
        })
    }

    const handleMouseLeave = () => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
        setIsHovered(false)
    }

    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    return (
        <div
            ref={cardRef}
            className={`relative transition-transform duration-200 ease-out ${className}`}
            style={{ transform, transformStyle: 'preserve-3d' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
        >
            {children}
            {/* Glare effect */}
            {glareEnabled && isHovered && (
                <div
                    className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden"
                    style={{
                        background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                    }}
                />
            )}
        </div>
    )
}
