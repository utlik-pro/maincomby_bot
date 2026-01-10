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

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24
        }
    }
}

const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
        scaleX: 1,
        transition: {
            duration: 0.8,
            delay: 0.3,
            ease: [0.25, 0.1, 0.25, 1] as const
        }
    }
}

export function HowItWorks({ dict }: HowItWorksProps) {
    return (
        <section id="how-it-works" className="py-24 relative bg-gradient-to-b from-transparent via-[var(--accent)]/5 to-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        {dict.title}
                    </h2>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
                >
                    {/* Animated connection line */}
                    <motion.div
                        variants={lineVariants}
                        className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-[var(--accent)]/50 via-[var(--accent)] to-[var(--accent)]/50 origin-left"
                    />

                    {dict.steps.map((step, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="relative text-center group"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                className="relative z-10 mx-auto w-20 h-20 rounded-full bg-[var(--bg-card)] border-2 border-[var(--accent)] flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(200,255,0,0.4)] transition-shadow duration-300"
                            >
                                <span className="text-3xl font-bold gradient-text">{step.number}</span>
                            </motion.div>
                            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[var(--accent)] transition-colors">
                                {step.title}
                            </h3>
                            <p className="text-gray-400 max-w-xs mx-auto">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
