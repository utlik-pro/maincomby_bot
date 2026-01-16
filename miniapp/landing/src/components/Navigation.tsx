'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Rocket, LogOut, User, Crown } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { TelegramLoginWidget, TelegramUser } from './TelegramLoginWidget'
import { useAuth } from '@/context/AuthContext'

interface NavigationProps {
    dict: {
        features: string
        howItWorks: string
        pricing: string
        faq: string
        courses: string
    }
    locale: string
}

// Subscription tier display names
const TIER_LABELS: Record<string, { ru: string; en: string; color: string }> = {
    free: { ru: 'Free', en: 'Free', color: 'text-gray-400' },
    light: { ru: 'Light', en: 'Light', color: 'text-blue-400' },
    pro: { ru: 'Pro', en: 'Pro', color: 'text-purple-400' },
}

export function Navigation({ dict, locale }: NavigationProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const isRussian = locale === 'ru'
    const { user, login, logout, subscriptionTier, isLoading } = useAuth()

    const links = [
        { href: `/${locale}/learn`, label: dict.courses },
        { href: '/#features', label: dict.features },
        { href: '/#pricing', label: dict.pricing },
        { href: '/#faq', label: dict.faq },
    ]

    const handleTelegramAuth = async (telegramUser: TelegramUser) => {
        await login(telegramUser)
    }

    const tierInfo = TIER_LABELS[subscriptionTier] || TIER_LABELS.free

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            {/* Glass background - behind everything */}
            <div className="absolute inset-0 glass border-b border-white/5 z-0" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex-shrink-0 flex items-center gap-2 group">
                        <Image
                            src="/logo.png"
                            alt="MAIN Logo"
                            width={40}
                            height={40}
                            className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(200,255,0,0.5)]"
                        />
                        <span className="font-bold text-xl tracking-tight text-white hidden sm:block">MAIN</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-gray-300 hover:text-[var(--accent)] transition-colors text-sm font-medium"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side: Language & Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        <LanguageSwitcher locale={locale} />

                        {isLoading ? (
                            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                        ) : user ? (
                            /* Logged in - show user menu */
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    {user.photo_url ? (
                                        <img src={user.photo_url} alt="" className="w-7 h-7 rounded-full" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                                            <User size={14} className="text-[var(--accent)]" />
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-white max-w-[100px] truncate">
                                        {user.first_name}
                                    </span>
                                    <span className={`text-xs font-medium ${tierInfo.color} flex items-center gap-1`}>
                                        {subscriptionTier !== 'free' && <Crown size={12} />}
                                        {tierInfo[isRussian ? 'ru' : 'en']}
                                    </span>
                                </button>

                                {/* Dropdown menu */}
                                {showUserMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl">
                                        <a
                                            href="https://t.me/maincomapp_bot"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                                        >
                                            <Rocket size={16} />
                                            {isRussian ? 'Открыть Mini App' : 'Open Mini App'}
                                        </a>
                                        <button
                                            onClick={() => {
                                                logout()
                                                setShowUserMenu(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            {isRussian ? 'Выйти' : 'Logout'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Not logged in - show Telegram Login */
                            <TelegramLoginWidget
                                botUsername="maincomapp_bot"
                                onAuth={handleTelegramAuth}
                                buttonSize="medium"
                                cornerRadius={20}
                            />
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass border-t border-white/5 relative z-50">
                    <div className="px-4 py-4 space-y-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block text-gray-300 hover:text-white hover:bg-white/5 transition-colors py-3 px-3 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="pt-4 mt-2 border-t border-white/10 flex flex-col gap-4 items-center">
                            {user ? (
                                <>
                                    <div className="w-full flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl">
                                        {user.photo_url ? (
                                            <img src={user.photo_url} alt="" className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                                                <User size={20} className="text-[var(--accent)]" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="text-white font-medium">{user.first_name}</div>
                                            <div className={`text-xs ${tierInfo.color} flex items-center gap-1`}>
                                                {subscriptionTier !== 'free' && <Crown size={12} />}
                                                {tierInfo[isRussian ? 'ru' : 'en']}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { logout(); setIsOpen(false); }}
                                        className="w-full py-2 text-red-400 text-sm flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        {isRussian ? 'Выйти' : 'Logout'}
                                    </button>
                                </>
                            ) : (
                                <div className="w-full flex justify-center">
                                    <TelegramLoginWidget
                                        botUsername="maincomapp_bot"
                                        onAuth={handleTelegramAuth}
                                        buttonSize="large"
                                        cornerRadius={12}
                                    />
                                </div>
                            )}

                            <div className="flex gap-2 w-full">
                                <Link
                                    href={`/ru`}
                                    className={`flex-1 text-center py-2.5 rounded-lg transition-all ${locale === 'ru'
                                        ? 'bg-white/10 text-white font-medium'
                                        : 'bg-white/5 text-gray-400'
                                        }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    RU
                                </Link>
                                <Link
                                    href={`/en`}
                                    className={`flex-1 text-center py-2.5 rounded-lg transition-all ${(locale === 'en' || locale === 'us')
                                        ? 'bg-white/10 text-white font-medium'
                                        : 'bg-white/5 text-gray-400'
                                        }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    EN
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
