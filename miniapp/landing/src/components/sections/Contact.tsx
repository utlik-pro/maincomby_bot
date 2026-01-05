'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ContactProps {
    dict: {
        title: string
        subtitle: string
        form: {
            name: string
            telegram: string
            email: string
            type: string
            types: string[]
            message: string
            submit: string
        }
    }
}

export function Contact({ dict }: ContactProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setSubmitted(true)
    }

    return (
        <section id="contact" className="py-24 relative">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <p className="text-gray-400 text-lg">
                        {dict.subtitle}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-[var(--bg-card)] rounded-3xl border border-white/5 p-6 sm:p-8"
                >
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-[var(--success)]/20 flex items-center justify-center mx-auto mb-4">
                                <Send size={28} className="text-[var(--success)]" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Сообщение отправлено!
                            </h3>
                            <p className="text-gray-400">
                                Мы свяжемся с вами в ближайшее время.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        {dict.form.name}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                                        placeholder="Иван"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        {dict.form.telegram}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                                        placeholder="@username"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        {dict.form.email}
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        {dict.form.type}
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-white/5 rounded-xl text-white focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                                    >
                                        {dict.form.types.map((type, index) => (
                                            <option key={index} value={type} className="bg-[var(--bg-card)]">
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    {dict.form.message}
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--accent)]/50 transition-colors resize-none"
                                    placeholder="Ваше сообщение..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="haptic w-full py-4 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-dark)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        {dict.form.submit}
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </section>
    )
}
