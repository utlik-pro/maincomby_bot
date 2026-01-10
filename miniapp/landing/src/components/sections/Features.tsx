'use client'

import { motion } from 'framer-motion'
import { Users, Calendar, DollarSign, Trophy, Palette, BarChart3 } from 'lucide-react'
import { GlassCard } from '../GlassCard'
import { TiltCard } from '../TiltCard'

interface FeaturesProps {
    dict: {
        title: string
        items: Array<{
            title: string
            description: string
        }>
    }
}

const icons = [Users, Calendar, DollarSign, Trophy, Palette, BarChart3]

export function Features({ dict }: FeaturesProps) {
    return (
        <section id="features" className="py-24 relative">
            {/* Neon glow effects */}
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-[var(--accent)]/15 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[120px] animate-pulse delay-700" />
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-[var(--success)]/10 rounded-full blur-[80px] animate-pulse delay-1000" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        {dict.title}
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dict.items.map((item, index) => {
                        const Icon = icons[index]
                        return (
                            <TiltCard key={index} tiltAmount={8}>
                                <GlassCard
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="card-hover backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/10 hover:border-[var(--accent)]/30 transition-all duration-300 h-full"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                                        <Icon size={28} className="text-[var(--accent)]" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-400">
                                        {item.description}
                                    </p>
                                </GlassCard>
                            </TiltCard>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
