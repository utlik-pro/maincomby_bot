'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, CreditCard, ShoppingCart } from 'lucide-react'
import { GlassCard } from '../GlassCard'

interface Plan {
    name: string
    price: string
    period: string
    description: string
    features: string[]
    cta: string
    popular?: boolean
}

interface IntegrationPricingProps {
    dict: {
        title: string
        subtitle: string
        tabs: {
            subscription: string
            purchase: string
        }
        subscriptionPlans: Plan[]
        purchasePlans: Plan[]
    }
}

export function IntegrationPricing({ dict }: IntegrationPricingProps) {
    const [activeTab, setActiveTab] = useState<'subscription' | 'purchase'>('subscription')

    const plans = activeTab === 'subscription' ? dict.subscriptionPlans : dict.purchasePlans

    return (
        <section id="integration" className="py-24 relative">
            {/* Neon glow effects */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--accent)]/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-[var(--accent)]/15 rounded-full blur-[100px] animate-pulse delay-700" />
            <div className="absolute top-1/2 right-0 w-72 h-72 bg-[var(--success)]/10 rounded-full blur-[80px] animate-pulse delay-300" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-[100px] animate-pulse delay-1000" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        {dict.title}
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                        {dict.subtitle}
                    </p>

                    {/* Tabs */}
                    <div className="inline-flex p-1 bg-[var(--bg-card)] rounded-2xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('subscription')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeTab === 'subscription'
                                    ? 'bg-[var(--accent)] text-black'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <CreditCard size={18} />
                            {dict.tabs.subscription}
                        </button>
                        <button
                            onClick={() => setActiveTab('purchase')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeTab === 'purchase'
                                    ? 'bg-[var(--accent)] text-black'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <ShoppingCart size={18} />
                            {dict.tabs.purchase}
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
                >
                    {plans.map((plan, index) => (
                        <div key={index} className="relative pt-4 h-full flex flex-col">
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
                                    <span className="bg-[var(--accent)] text-black px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                        <Star size={14} fill="currentColor" />
                                        Popular
                                    </span>
                                </div>
                            )}
                            <GlassCard
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.15 }}
                                className={`card-hover backdrop-blur-xl rounded-3xl p-8 border flex flex-col flex-grow shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ${
                                    plan.popular
                                        ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30 hover:bg-[var(--accent)]/15'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[var(--accent)]/30'
                                }`}
                            >
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {plan.name}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    {plan.description}
                                </p>

                                <div className="mb-6">
                                    {plan.price === 'Custom' ? (
                                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-bold text-white">${plan.price}</span>
                                            {plan.period && <span className="text-gray-400">/{plan.period}</span>}
                                        </>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check size={20} className="text-[var(--accent)] flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <a
                                    href="https://t.me/dmitryutlik"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`btn-shine block w-full py-3 px-6 rounded-xl font-medium text-center mt-auto ${
                                        plan.popular
                                            ? 'bg-[var(--accent)] text-black'
                                            : 'btn-shine-secondary bg-white/10 text-white border border-white/10'
                                    }`}
                                >
                                    {plan.cta}
                                </a>
                            </GlassCard>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
