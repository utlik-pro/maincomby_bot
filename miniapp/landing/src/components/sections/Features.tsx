'use client'

import { motion } from 'framer-motion'
import { Heart, Calendar, Trophy, Crown, User, Users } from 'lucide-react'

interface FeaturesProps {
    dict: {
        title: string
        items: Array<{
            title: string
            description: string
        }>
    }
}

const icons = [Heart, Calendar, Trophy, Crown, User, Users]

export function Features({ dict }: FeaturesProps) {
    return (
        <section id="features" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="card-hover bg-[var(--bg-card)] rounded-3xl p-6 border border-white/5"
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
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
