'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

interface PricingProps {
    dict: {
        title: string
        subtitle: string
        plans: Array<{
            name: string
            price: string
            period: string
            features: string[]
            cta: string
            popular?: boolean
        }>
    }
}

export function Pricing({ dict }: PricingProps) {
    return (
        <section id="pricing" className="py-24 relative">
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
                    <p className="text-gray-400 text-lg">
                        {dict.subtitle}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {dict.plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative card-hover rounded-3xl p-6 sm:p-8 border ${plan.popular
                                    ? 'bg-gradient-to-b from-[var(--accent)]/10 to-[var(--bg-card)] border-[var(--accent)]/30'
                                    : 'bg-[var(--bg-card)] border-white/5'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-4 py-1.5 bg-[var(--accent)] text-black text-sm font-semibold rounded-full">
                                    <Sparkles size={14} />
                                    Popular
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                                    <span className="text-gray-400">/{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={featureIndex} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
                                            <Check size={12} className="text-[var(--accent)]" />
                                        </div>
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="https://t.me/MainCommunityBot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`haptic block w-full py-3 rounded-xl font-semibold text-center transition-colors ${plan.popular
                                        ? 'bg-[var(--accent)] text-black hover:bg-[var(--accent-dark)]'
                                        : 'bg-[var(--bg-hover)] text-white hover:bg-white/10'
                                    }`}
                            >
                                {plan.cta}
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
