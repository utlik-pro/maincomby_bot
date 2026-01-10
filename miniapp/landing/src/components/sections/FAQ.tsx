'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { GlassCard } from '../GlassCard'

interface FAQProps {
    dict: {
        title: string
        items: Array<{
            question: string
            answer: string
        }>
    }
}

export function FAQ({ dict }: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section id="faq" className="py-24 relative">
            {/* Neon glow effects */}
            <div className="absolute top-1/3 left-0 w-80 h-80 bg-[var(--accent)]/15 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[120px] animate-pulse delay-500" />
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-[var(--success)]/10 rounded-full blur-[80px] animate-pulse delay-1000" />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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

                <div className="space-y-4">
                    {dict.items.map((item, index) => {
                        const isOpen = openIndex === index
                        return (
                            <GlassCard
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`backdrop-blur-xl bg-white/5 rounded-2xl border shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ${
                                    isOpen
                                        ? 'border-[var(--accent)]/50 bg-[var(--accent)]/5 shadow-[0_0_20px_rgba(200,255,0,0.15)]'
                                        : 'border-white/10 hover:bg-white/10 hover:border-[var(--accent)]/30'
                                }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                                >
                                    <span className={`font-medium pr-4 transition-colors duration-300 ${isOpen ? 'text-[var(--accent)]' : 'text-white'}`}>
                                        {item.question}
                                    </span>
                                    <motion.div
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    >
                                        <ChevronDown
                                            size={20}
                                            className={`flex-shrink-0 transition-colors duration-300 ${isOpen ? 'text-[var(--accent)]' : 'text-gray-400'}`}
                                        />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 30,
                                                opacity: { duration: 0.2 }
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-5 text-gray-300">
                                                {item.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </GlassCard>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
