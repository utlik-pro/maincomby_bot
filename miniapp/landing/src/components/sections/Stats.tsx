'use client'

import { motion } from 'framer-motion'

interface StatsProps {
    dict: {
        items: Array<{
            value: string
            label: string
        }>
    }
}

export function Stats({ dict }: StatsProps) {
    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[var(--bg-card)] rounded-3xl border border-white/5 p-8 sm:p-12">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {dict.items.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-gray-400 text-lg">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
