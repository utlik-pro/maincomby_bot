'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Rocket, LogOut, User } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { TelegramLoginWidget } from './TelegramLoginWidget'
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

export function Navigation({ dict, locale }: NavigationProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { user, login, logout, isLoading, devLogin } = useAuth()
    const isRussian = locale === 'ru'

    // Environment variable for bot username is needed
    // Assuming NEXT_PUBLIC_BOT_USERNAME is set in .env.local
    const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'maincomapp_bot'

    const links = [
        { href: `/${locale}/learn`, label: dict.courses },
        { href: '/#features', label: dict.features },
        { href: '/#pricing', label: dict.pricing },
        { href: '/#faq', label: dict.faq },
    ]

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

                    {/* Right Side: Language & Login */}
                    <div className="hidden md:flex items-center gap-4">
                        <LanguageSwitcher locale={locale} />

                        {!isLoading && (
                            user ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                                        {user.photo_url ? (
                                            <img src={user.photo_url} alt={user.first_name} className="w-6 h-6 rounded-full" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-black flex items-center justify-center text-xs font-bold">
                                                {user.first_name[0]}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-white max-w-[100px] truncate">{user.first_name}</span>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                        title={isRussian ? "Выйти" : "Logout"}
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {process.env.NODE_ENV === 'development' && (
                                        <button
                                            onClick={devLogin}
                                            className="text-[10px] text-gray-500 hover:text-white px-2 py-0.5 border border-white/5 hover:border-white/20 rounded transition-colors"
                                            title="Dev Login Bypass"
                                        >
                                            Dev
                                        </button>
                                    )}
                                    <div className="relative overflow-hidden rounded-full">
                                        <TelegramLoginWidget
                                            botUsername={botUsername}
                                            onAuth={login}
                                            buttonSize="medium"
                                            usePic={false}
                                            cornerRadius={20}
                                        />
                                    </div>
                                </div>
                            )
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
                                <div className="flex flex-col items-center w-full gap-3">
                                    <div className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5">
                                        {user.photo_url ? (
                                            <img src={user.photo_url} alt={user.first_name} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-black flex items-center justify-center font-bold">
                                                {user.first_name[0]}
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-white">{user.first_name} {user.last_name}</span>
                                            <span className="text-xs text-gray-400">@{user.username}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-300 py-3 rounded-xl transition-colors"
                                    >
                                        <LogOut size={18} />
                                        <span>{isRussian ? "Выйти" : "Logout"}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full flex justify-center py-2">
                                    <TelegramLoginWidget
                                        botUsername={botUsername}
                                        onAuth={login}
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
                                    className={`flex-1 text-center py-2.5 rounded-lg transition-all ${(locale === 'en' || locale === 'us') // handle potential US locale
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
