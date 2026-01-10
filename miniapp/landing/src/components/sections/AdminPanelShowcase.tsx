'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AdminPhoneMockup } from '../AdminPhoneMockup'
import { GlassCard } from '../GlassCard'
import {
    Users,
    UserPlus,
    UserCheck,
    UserX,
    Shield,
    Calendar,
    CalendarPlus,
    Ticket,
    QrCode,
    BarChart3,
    TrendingUp,
    PieChart,
    Download,
    DollarSign,
    CreditCard,
    Receipt,
    Percent,
    Bell,
    Mail,
    MessageSquare,
    Megaphone,
    Settings,
    Lock,
    Key,
    Webhook,
    Palette,
    Globe,
    Search,
    Filter,
    Tag,
    Star,
    Award,
    Zap
} from 'lucide-react'

interface AdminPanelShowcaseProps {
    dict: {
        title: string
        subtitle: string
        badge: string
        categories: Array<{
            name: string
            features: Array<{
                title: string
                description: string
            }>
        }>
        screens: {
            dashboard: string
            members: string
            events: string
            analytics: string
        }
    }
}

const categoryIcons: Record<string, any[]> = {
    members: [Users, UserPlus, UserCheck, UserX, Shield, Search, Filter, Tag],
    events: [Calendar, CalendarPlus, Ticket, QrCode, Award, Star],
    analytics: [BarChart3, TrendingUp, PieChart, Download],
    monetization: [DollarSign, CreditCard, Receipt, Percent],
    communication: [Bell, Mail, MessageSquare, Megaphone],
    settings: [Settings, Lock, Key, Webhook, Palette, Globe, Zap]
}

export function AdminPanelShowcase({ dict }: AdminPanelShowcaseProps) {
    const [activeTab, setActiveTab] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [activeCategory, setActiveCategory] = useState(0)

    useEffect(() => {
        if (isPaused) return
        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % 4)
        }, 5000)
        return () => clearInterval(interval)
    }, [isPaused])

    const handleTabChange = (tab: number) => {
        setActiveTab(tab)
        setIsPaused(true)
        setTimeout(() => setIsPaused(false), 15000)
    }

    const screenLabels = [
        dict.screens.dashboard,
        dict.screens.members,
        dict.screens.events,
        dict.screens.analytics
    ]

    return (
        <section id="admin-showcase" className="py-24 relative">
            {/* Neon glow effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 via-transparent to-transparent" />
            <div className="absolute top-1/3 right-0 w-96 h-96 bg-[var(--accent)]/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[var(--accent)]/15 rounded-full blur-[120px] animate-pulse delay-500" />
            <div className="absolute top-1/2 left-0 w-72 h-72 bg-[var(--success)]/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            <div className="absolute top-0 right-1/3 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-[80px] animate-pulse delay-300" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--accent)]/20 mb-6">
                        <Settings size={16} className="text-[var(--accent)]" />
                        <span className="text-sm text-gray-300">{dict.badge}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                        {dict.title}
                    </h2>
                    <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                        {dict.subtitle}
                    </p>
                </motion.div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                    {/* Left: Features List */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1"
                    >
                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {dict.categories.map((category, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveCategory(index)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        activeCategory === index
                                            ? 'bg-[var(--accent)] text-black'
                                            : 'bg-[var(--bg-card)] text-gray-400 hover:text-white border border-white/5'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        {/* Features Grid */}
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="grid gap-3"
                        >
                            {dict.categories[activeCategory]?.features.map((feature, index) => {
                                const categoryKey = Object.keys(categoryIcons)[activeCategory] || 'members'
                                const icons = categoryIcons[categoryKey] || categoryIcons.members
                                const Icon = icons[index % icons.length]

                                return (
                                    <GlassCard
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="flex gap-4 p-4 backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/10 hover:border-[var(--accent)]/30 transition-all duration-300 group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--accent)]/20 transition-colors">
                                            <Icon size={20} className="text-[var(--accent)]" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">
                                                {feature.title}
                                            </h4>
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </GlassCard>
                                )
                            })}
                        </motion.div>

                        {/* Feature Count */}
                        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                            <Zap size={16} className="text-[var(--accent)]" />
                            <span>
                                {dict.categories.reduce((acc, cat) => acc + cat.features.length, 0)}+ features
                            </span>
                        </div>
                    </motion.div>

                    {/* Right: Phone Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="order-1 lg:order-2 flex flex-col items-center"
                    >
                        <AdminPhoneMockup
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                        />

                        {/* Screen Indicator */}
                        <div className="mt-6 flex gap-2">
                            {screenLabels.map((label, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTabChange(index)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        activeTab === index
                                            ? 'bg-[var(--accent)] text-black'
                                            : 'bg-[var(--bg-card)] text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Progress dots */}
                        <div className="mt-4 flex gap-2">
                            {[0, 1, 2, 3].map((index) => (
                                <div
                                    key={index}
                                    className={`h-1 rounded-full transition-all duration-300 ${
                                        activeTab === index
                                            ? 'w-8 bg-[var(--accent)]'
                                            : 'w-2 bg-white/20'
                                    }`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
