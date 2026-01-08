'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Home, Users, Calendar, User, Sparkles, Heart, Trophy, Zap } from 'lucide-react'

interface ScreenDescriptionsProps {
    activeScreen: number
    locale?: string
}

const screenData = {
    ru: [
        {
            id: 'home',
            icon: Home,
            title: 'Главная',
            description: 'Твой личный дашборд: статистика участия, достижения, уведомления и быстрый доступ ко всем функциям сообщества.',
            features: [
                { icon: Trophy, text: 'XP и уровень участника' },
                { icon: Calendar, text: 'Статистика событий' },
                { icon: Sparkles, text: 'Достижения и медали' },
                { icon: Zap, text: 'Быстрые действия' }
            ]
        },
        {
            id: 'network',
            icon: Users,
            title: 'Нетворкинг',
            description: 'Знакомься с участниками сообщества в формате свайпов. Найди единомышленников, партнёров или друзей.',
            features: [
                { icon: User, text: 'Подробные профили' },
                { icon: Sparkles, text: 'Интересы и навыки' },
                { icon: Heart, text: 'Match система' },
                { icon: Zap, text: 'Чат после match' }
            ]
        },
        {
            id: 'events',
            icon: Calendar,
            title: 'Мероприятия',
            description: 'Все события сообщества в одном месте. Регистрируйся, получай напоминания и копи XP за участие.',
            features: [
                { icon: Calendar, text: 'Календарь событий' },
                { icon: Users, text: 'Митапы и воркшопы' },
                { icon: Zap, text: 'Онлайн регистрация' },
                { icon: Trophy, text: 'XP за посещение' }
            ]
        },
        {
            id: 'profile',
            icon: User,
            title: 'Профиль',
            description: 'Управляй своим профилем, подпиской и настройками. Открой дополнительные возможности с Pro подпиской.',
            features: [
                { icon: User, text: 'Редактирование профиля' },
                { icon: Sparkles, text: 'Подписки Light/Pro' },
                { icon: Trophy, text: 'Статистика активности' },
                { icon: Zap, text: 'Персональные настройки' }
            ]
        }
    ],
    en: [
        {
            id: 'home',
            icon: Home,
            title: 'Home',
            description: 'Your personal dashboard: participation stats, achievements, notifications and quick access to all community features.',
            features: [
                { icon: Trophy, text: 'XP and member level' },
                { icon: Calendar, text: 'Event statistics' },
                { icon: Sparkles, text: 'Achievements & medals' },
                { icon: Zap, text: 'Quick actions' }
            ]
        },
        {
            id: 'network',
            icon: Users,
            title: 'Networking',
            description: 'Connect with community members through swipes. Find like-minded people, partners or friends.',
            features: [
                { icon: User, text: 'Detailed profiles' },
                { icon: Sparkles, text: 'Interests & skills' },
                { icon: Heart, text: 'Match system' },
                { icon: Zap, text: 'Chat after match' }
            ]
        },
        {
            id: 'events',
            icon: Calendar,
            title: 'Events',
            description: 'All community events in one place. Register, get reminders and earn XP for participation.',
            features: [
                { icon: Calendar, text: 'Event calendar' },
                { icon: Users, text: 'Meetups & workshops' },
                { icon: Zap, text: 'Online registration' },
                { icon: Trophy, text: 'XP for attendance' }
            ]
        },
        {
            id: 'profile',
            icon: User,
            title: 'Profile',
            description: 'Manage your profile, subscription and settings. Unlock additional features with Pro subscription.',
            features: [
                { icon: User, text: 'Edit profile' },
                { icon: Sparkles, text: 'Light/Pro plans' },
                { icon: Trophy, text: 'Activity stats' },
                { icon: Zap, text: 'Personal settings' }
            ]
        }
    ]
}

export function ScreenDescriptions({ activeScreen, locale = 'ru' }: ScreenDescriptionsProps) {
    const data = screenData[locale as keyof typeof screenData] || screenData.ru
    const screen = data[activeScreen]
    const IconComponent = screen.icon

    return (
        <div className="h-full flex flex-col justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeScreen}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {/* Screen indicator */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">
                            <IconComponent size={24} className="text-[var(--accent)]" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400 uppercase tracking-wider">Экран</div>
                            <h3 className="text-2xl font-bold text-white">{screen.title}</h3>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-lg leading-relaxed">
                        {screen.description}
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3">
                        {screen.features.map((feature, index) => {
                            const FeatureIcon = feature.icon
                            return (
                                <motion.div
                                    key={feature.text}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-3 bg-[var(--bg-card)] p-3 rounded-xl border border-white/5"
                                >
                                    <FeatureIcon size={18} className="text-[var(--accent)] shrink-0" />
                                    <span className="text-sm text-gray-300">{feature.text}</span>
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Screen dots indicator */}
                    <div className="flex gap-2 pt-4">
                        {data.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === activeScreen
                                        ? 'w-8 bg-[var(--accent)]'
                                        : 'w-1.5 bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
