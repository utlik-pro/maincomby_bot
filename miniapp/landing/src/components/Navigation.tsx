'use client'

import Link from 'next/link'
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

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={`/${locale}`} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                            <span className="text-black font-bold text-lg">M</span>
                        </div>
                        <span className="font-bold text-lg text-white">MAIN</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher locale={locale} />

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
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden glass border-t border-white/5">
                    <div className="px-4 py-4 space-y-3">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="block text-gray-300 hover:text-white transition-colors py-2"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}
