'use client'

import { motion } from 'framer-motion'
import { Building2, Users2, GraduationCap, Briefcase } from 'lucide-react'
import { GlassCard } from '../GlassCard'
import { TiltCard } from '../TiltCard'

interface TargetAudienceProps {
    dict: {
        title: string
        subtitle: string
        audiences: Array<{
            title: string
            description: string
            examples: string[]
        }>
    }
}

const icons = [Building2, Users2, GraduationCap, Briefcase]

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 20
        }
    }
}

export function TargetAudience({ dict }: TargetAudienceProps) {
    return (
        <section id="audience" className="py-24 relative">
            {/* Neon glow effects */}
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-[var(--accent)]/15 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[var(--accent)]/10 rounded-full blur-[100px] animate-pulse delay-700" />
            <div className="absolute top-0 left-0 w-72 h-72 bg-[var(--success)]/10 rounded-full blur-[80px] animate-pulse delay-500" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        {dict.title}
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {dict.subtitle}
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {dict.audiences.map((audience, index) => {
                        const Icon = icons[index]
                        return (
                            <motion.div key={index} variants={itemVariants}>
                                <TiltCard tiltAmount={6}>
                                    <GlassCard
                                        className="card-hover backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/10 hover:border-[var(--accent)]/30 transition-all duration-300 h-full"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: -5 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                            className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-6"
                                        >
                                            <Icon size={32} className="text-[var(--accent)]" />
                                        </motion.div>
                                        <h3 className="text-2xl font-semibold text-white mb-3">
                                            {audience.title}
                                        </h3>
                                        <p className="text-gray-400 mb-4">
                                            {audience.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {audience.examples.map((example, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 rounded-full text-sm bg-white/5 text-gray-300 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-colors cursor-default"
                                                >
                                                    {example}
                                                </span>
                                            ))}
                                        </div>
                                    </GlassCard>
                                </TiltCard>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </div>
        </section>
    )
}
