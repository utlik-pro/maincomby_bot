'use client'

import { motion } from 'framer-motion'

interface HowItWorksProps {
    dict: {
        title: string
        steps: Array<{
            number: string
            title: string
            description: string
        }>
    }
}

export function HowItWorks({ dict }: HowItWorksProps) {
    return (
        <section id="how-it-works" className="py-24 relative bg-gradient-to-b from-transparent via-[var(--accent)]/5 to-transparent">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connection line */}
                    <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[var(--accent)]/50 via-[var(--accent)] to-[var(--accent)]/50 -translate-y-1/2" />

                    {dict.steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="relative text-center"
                        >
                            <div className="relative z-10 mx-auto w-20 h-20 rounded-full bg-[var(--bg-card)] border-2 border-[var(--accent)] flex items-center justify-center mb-6">
                                <span className="text-3xl font-bold gradient-text">{step.number}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {step.title}
                            </h3>
                            <p className="text-gray-400 max-w-xs mx-auto">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
