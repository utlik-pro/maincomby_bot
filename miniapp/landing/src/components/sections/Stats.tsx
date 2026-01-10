'use client'

import { motion } from 'framer-motion'
import { AnimatedCounter } from '../AnimatedCounter'

interface StatsProps {
    dict: {
        items: Array<{
            value: string
            label: string
        }>
    }
}

// Parse value like "500+" or "1000+" into number and suffix
function parseValue(value: string): { number: number; suffix: string } {
    const match = value.match(/^(\d+)(.*)$/)
    if (match) {
        return { number: parseInt(match[1], 10), suffix: match[2] }
    }
    return { number: 0, suffix: value }
}

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20
        }
    }
}

export function Stats({ dict }: StatsProps) {
    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }}
                    className="bg-[var(--bg-card)] rounded-3xl border border-white/5 p-8 sm:p-12 relative overflow-hidden"
                >
                    {/* Subtle glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[var(--accent)]/10 rounded-full blur-[80px]" />

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10"
                    >
                        {dict.items.map((stat, index) => {
                            const { number, suffix } = parseValue(stat.value)
                            return (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05 }}
                                    className="text-center group cursor-default"
                                >
                                    <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2 group-hover:drop-shadow-[0_0_20px_rgba(200,255,0,0.5)] transition-all duration-300">
                                        <AnimatedCounter
                                            end={number}
                                            suffix={suffix}
                                            duration={2000}
                                        />
                                    </div>
                                    <div className="text-gray-400 text-lg group-hover:text-gray-300 transition-colors">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
