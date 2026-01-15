'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Rocket } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'

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
    const isRussian = locale === 'ru'

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

                    {/* Right Side: Language & CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <LanguageSwitcher locale={locale} />

                        <a
                            href="https://t.me/maincomapp_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-shine bg-[var(--accent)] text-black px-5 py-2 rounded-full font-semibold text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <Rocket size={16} />
                            {isRussian ? 'Войти через Telegram' : 'Enter via Telegram'}
                        </a>
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
                            <a
                                href="https://t.me/maincomapp_bot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full btn-shine bg-[var(--accent)] text-black py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2"
                                onClick={() => setIsOpen(false)}
                            >
                                <Rocket size={18} />
                                {isRussian ? 'Войти через Telegram' : 'Enter via Telegram'}
                            </a>

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
