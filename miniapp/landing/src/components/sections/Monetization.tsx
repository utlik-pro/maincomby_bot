'use client'

import { motion } from 'framer-motion'
import { Coins, Ticket, Crown, Megaphone } from 'lucide-react'
import { GlassCard } from '../GlassCard'

interface MonetizationProps {
    dict: {
        title: string
        subtitle: string
        streams: Array<{
            title: string
            description: string
            percentage: string
        }>
    }
}

const icons = [Crown, Ticket, Megaphone, Coins]

export function Monetization({ dict }: MonetizationProps) {
    return (
        <section id="monetization" className="py-24 relative">
            {/* Neon glow effects */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-[var(--accent)]/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--accent)]/15 rounded-full blur-[100px] animate-pulse delay-500" />
            <div className="absolute top-1/2 right-0 w-72 h-72 bg-[var(--success)]/10 rounded-full blur-[80px] animate-pulse delay-1000" />

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
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {dict.subtitle}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dict.streams.map((stream, index) => {
                        const Icon = icons[index]
                        return (
                            <GlassCard
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="card-hover backdrop-blur-xl bg-white/5 rounded-3xl p-6 border border-white/10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/10 hover:border-[var(--accent)]/30 transition-all duration-300"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-4 mx-auto">
                                    <Icon size={28} className="text-[var(--accent)]" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {stream.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    {stream.description}
                                </p>
                                <div className="text-2xl font-bold text-[var(--accent)]">
                                    {stream.percentage}
                                </div>
                            </GlassCard>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
