'use client'

import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import Image from 'next/image'

interface Testimonial {
    name: string
    role: string
    company: string
    avatar: string
    text: string
    rating: number
}

interface TestimonialsProps {
    dict: {
        title: string
        subtitle: string
        testimonials: Testimonial[]
    }
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

export function Testimonials({ dict }: TestimonialsProps) {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)]/10 rounded-full blur-[150px]" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
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

                {/* Testimonials grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {dict.testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative bg-[var(--bg-card)] border border-white/10 rounded-3xl p-6 hover:border-[var(--accent)]/30 transition-all duration-300">
                                {/* Quote icon */}
                                <Quote size={32} className="text-[var(--accent)]/30 mb-4" />

                                {/* Rating */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i < testimonial.rating ? 'text-[var(--accent)] fill-[var(--accent)]' : 'text-gray-600'}
                                        />
                                    ))}
                                </div>

                                {/* Text */}
                                <p className="text-gray-300 mb-6 leading-relaxed">
                                    "{testimonial.text}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 flex items-center justify-center text-[var(--accent)] font-bold text-lg">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {testimonial.role}, {testimonial.company}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
