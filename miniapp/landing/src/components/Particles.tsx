'use client'

import { useEffect, useRef, useState } from 'react'

interface Particle {
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    opacity: number
}

export function Particles() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    // Delay rendering to avoid conflicts with loading screen
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 2500)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!isVisible) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d', { alpha: true })
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []
        let isRunning = true

        const resizeCanvas = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            canvas.width = window.innerWidth * dpr
            canvas.height = window.innerHeight * dpr
            canvas.style.width = `${window.innerWidth}px`
            canvas.style.height = `${window.innerHeight}px`
            ctx.scale(dpr, dpr)
        }

        const createParticles = () => {
            particles = []
            // Reduced particle count for better performance
            const particleCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 25000), 50)

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    size: Math.random() * 1.5 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.2,
                    speedY: (Math.random() - 0.5) * 0.2,
                    opacity: Math.random() * 0.3 + 0.1
                })
            }
        }

        let lastTime = 0
        const fps = 30 // Limit to 30 FPS for performance

        const drawParticles = (currentTime: number) => {
            if (!isRunning) return

            // Throttle to target FPS
            if (currentTime - lastTime < 1000 / fps) {
                animationFrameId = requestAnimationFrame(drawParticles)
                return
            }
            lastTime = currentTime

            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

            particles.forEach((particle) => {
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(200, 255, 0, ${particle.opacity})`
                ctx.fill()

                particle.x += particle.speedX
                particle.y += particle.speedY

                if (particle.x < 0) particle.x = window.innerWidth
                if (particle.x > window.innerWidth) particle.x = 0
                if (particle.y < 0) particle.y = window.innerHeight
                if (particle.y > window.innerHeight) particle.y = 0
            })

            // Simplified connections - only check nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < Math.min(i + 5, particles.length); j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const distance = dx * dx + dy * dy // Skip sqrt for performance

                    if (distance < 10000) { // 100px squared
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(200, 255, 0, ${0.08 * (1 - distance / 10000)})`
                        ctx.lineWidth = 0.5
                        ctx.stroke()
                    }
                }
            }

            animationFrameId = requestAnimationFrame(drawParticles)
        }

        resizeCanvas()
        createParticles()
        animationFrameId = requestAnimationFrame(drawParticles)

        const handleResize = () => {
            resizeCanvas()
            createParticles()
        }

        window.addEventListener('resize', handleResize)

        return () => {
            isRunning = false
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('resize', handleResize)
        }
    }, [isVisible])

    if (!isVisible) return null

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-40"
            style={{ willChange: 'auto' }}
        />
    )
}
