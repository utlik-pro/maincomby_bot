'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'

interface NavigationProps {
    dict: {
        features: string
        howItWorks: string
        pricing: string
        faq: string
    }
    locale: string
}

export function Navigation({ dict, locale }: NavigationProps) {
    const [isOpen, setIsOpen] = useState(false)

    const links = [
        { href: '#features', label: dict.features },
        { href: '#how-it-works', label: dict.howItWorks },
        { href: '#pricing', label: dict.pricing },
        { href: '#faq', label: dict.faq },
    ]

    const leftLinks = links.slice(0, 2)
    const rightLinks = links.slice(2, 4)

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            {/* Glass background - behind everything */}
            <div className="absolute inset-0 glass border-b border-white/5 z-0" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex items-center justify-between h-14">
                    {/* Left Links */}
                    <div className="hidden md:flex items-center justify-end gap-6 flex-1">
                        {leftLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-gray-300 hover:text-[var(--accent)] transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Center Logo - extends beyond nav */}
                    <Link href={`/${locale}`} className="relative z-10 group flex-shrink-0 -my-2 md:mx-8 absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0">
                        <Image
                            src="/logo.png"
                            alt="MAIN Logo"
                            width={64}
                            height={64}
                            className="w-14 h-14 md:w-16 md:h-16 transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(200,255,0,0.6)] group-hover:scale-105"
                        />
                    </Link>

                    {/* Right Links */}
                    <div className="hidden md:flex items-center justify-start gap-6 flex-1">
                        {rightLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-gray-300 hover:text-[var(--accent)] transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Language Switcher - far right */}
                    <div className="hidden md:block absolute right-4">
                        <LanguageSwitcher locale={locale} />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-white p-2 absolute right-4"
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
                    <div className="px-4 py-4 space-y-1 relative z-50">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="block text-gray-300 hover:text-white hover:bg-white/5 transition-colors py-3 px-3 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        {/* Language Links */}
                        <div className="flex gap-2 pt-3 mt-3 border-t border-white/10">
                            <Link
                                href={`/ru`}
                                className={`flex-1 text-center py-2.5 rounded-lg transition-all ${
                                    locale === 'ru'
                                        ? 'bg-[var(--accent)] text-black font-medium'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                                onClick={() => setIsOpen(false)}
                            >
                                Русский
                            </Link>
                            <Link
                                href={`/en`}
                                className={`flex-1 text-center py-2.5 rounded-lg transition-all ${
                                    locale === 'en'
                                        ? 'bg-[var(--accent)] text-black font-medium'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                                onClick={() => setIsOpen(false)}
                            >
                                English
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
