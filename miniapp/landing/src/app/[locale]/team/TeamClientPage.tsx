'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Crown,
    Brain,
    Sparkles,
    Code,
    Server,
    Plug,
    ClipboardList,
    ArrowRight,
    Zap
} from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/sections/Footer'

interface TeamClientPageProps {
    dict: any
    locale: string
}

interface TeamMember {
    id: string
    role: string
    roleEn: string
    description: string
    descriptionEn: string
    icon: React.ElementType
    color: string
}

const teamData: TeamMember[] = [
    {
        id: 'founder',
        role: 'Основатель',
        roleEn: 'Founder',
        description: 'Стратегия развития, работа с ключевыми клиентами, определение вектора продуктов',
        descriptionEn: 'Development strategy, key client relations, product direction',
        icon: Crown,
        color: '#f59e0b' // Amber
    },
    {
        id: 'ai-architect',
        role: 'AI-архитектор',
        roleEn: 'AI Architect',
        description: 'Проектирование AI-систем, выбор моделей, оптимизация производительности',
        descriptionEn: 'AI system design, model selection, performance optimization',
        icon: Brain,
        color: '#8b5cf6' // Purple
    },
    {
        id: 'prompt-engineer',
        role: 'Prompt-инженер',
        roleEn: 'Prompt Engineer',
        description: 'Разработка промптов, тонкая настройка AI-агентов, контроль качества ответов',
        descriptionEn: 'Prompt development, AI agent fine-tuning, response quality control',
        icon: Sparkles,
        color: '#ec4899' // Pink
    },
    {
        id: 'fullstack',
        role: 'Full-stack разработчик',
        roleEn: 'Full-stack Developer',
        description: 'Веб-приложения, пользовательские интерфейсы, API и интеграции',
        descriptionEn: 'Web applications, user interfaces, APIs and integrations',
        icon: Code,
        color: '#3b82f6' // Blue
    },
    {
        id: 'backend',
        role: 'Backend-разработчик',
        roleEn: 'Backend Developer',
        description: 'Серверная логика, базы данных, масштабирование и безопасность',
        descriptionEn: 'Server logic, databases, scaling and security',
        icon: Server,
        color: '#10b981' // Emerald
    },
    {
        id: 'integrations',
        role: 'Интеграционный специалист',
        roleEn: 'Integration Specialist',
        description: 'Подключение 1С, Bitrix24, CRM-систем и внешних сервисов',
        descriptionEn: 'Connecting 1C, Bitrix24, CRM systems and external services',
        icon: Plug,
        color: '#f97316' // Orange
    },
    {
        id: 'pm',
        role: 'Проектный менеджер',
        roleEn: 'Project Manager',
        description: 'Координация команды, коммуникация с клиентами, контроль сроков',
        descriptionEn: 'Team coordination, client communication, deadline management',
        icon: ClipboardList,
        color: '#06b6d4' // Cyan
    }
]

export default function TeamClientPage({ dict, locale }: TeamClientPageProps) {
    const isRussian = locale === 'ru'

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navigation dict={dict.nav} locale={locale} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)] rounded-full blur-[150px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]" />
                </div>

                <div className="max-w-6xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
                    >
                        <Users size={16} className="text-[var(--accent)]" />
                        <span className="text-sm text-gray-300">
                            {isRussian ? '7 специалистов' : '7 specialists'}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        {isRussian ? 'Наша команда' : 'Our Team'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto"
                    >
                        {isRussian
                            ? 'Эксперты в AI, разработке и интеграциях, которые превращают идеи в работающие решения'
                            : 'Experts in AI, development and integrations who turn ideas into working solutions'}
                    </motion.p>
                </div>
            </section>

            {/* Team Grid */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teamData.map((member, index) => {
                            const IconComponent = member.icon
                            return (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                                >
                                    <div
                                        className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                                        style={{ backgroundColor: member.color }}
                                    >
                                        <IconComponent size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {isRussian ? member.role : member.roleEn}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {isRussian ? member.description : member.descriptionEn}
                                    </p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Why Us Section */}
            <section className="py-16 px-4 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold text-white mb-12"
                    >
                        {isRussian ? 'Почему мы?' : 'Why us?'}
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: isRussian ? 'Опыт' : 'Experience',
                                value: '50+',
                                desc: isRussian ? 'внедрённых AI-решений' : 'deployed AI solutions'
                            },
                            {
                                title: isRussian ? 'Скорость' : 'Speed',
                                value: '2-4',
                                desc: isRussian ? 'недели до запуска MVP' : 'weeks to MVP launch'
                            },
                            {
                                title: isRussian ? 'Поддержка' : 'Support',
                                value: '24/7',
                                desc: isRussian ? 'мониторинг и обновления' : 'monitoring and updates'
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl font-bold text-[var(--accent)] mb-2">
                                    {item.value}
                                </div>
                                <div className="text-white font-medium mb-1">{item.title}</div>
                                <div className="text-gray-500 text-sm">{item.desc}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass rounded-3xl p-12 border border-white/10"
                    >
                        <Zap className="w-12 h-12 text-[var(--accent)] mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4">
                            {isRussian ? 'Готовы обсудить проект?' : 'Ready to discuss your project?'}
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                            {isRussian
                                ? 'Расскажите о вашей задаче — мы подберём оптимальное решение'
                                : 'Tell us about your task — we\'ll find the optimal solution'}
                        </p>
                        <a
                            href="https://t.me/maincomapp_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-shine inline-flex items-center gap-2 bg-[var(--accent)] text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                        >
                            {isRussian ? 'Связаться с нами' : 'Contact us'}
                            <ArrowRight size={20} />
                        </a>
                    </motion.div>
                </div>
            </section>

            <Footer dict={dict.footer} />
        </main>
    )
}
