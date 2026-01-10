'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Globe } from 'lucide-react'

interface LanguageSwitcherProps {
    locale: string
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    const switchLocale = (newLocale: string) => {
        const segments = pathname.split('/')
        segments[1] = newLocale
        return segments.join('/')
    }

    const languages = [
        { code: 'ru', label: 'Русский' },
        { code: 'en', label: 'English' },
    ]

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Globe Icon Button - larger hit area */}
            <button
                className="p-3 -m-1 transition-all duration-300 group"
                aria-label="Change language"
            >
                <Globe
                    size={20}
                    className={`transition-all duration-300 ${
                        isOpen
                            ? 'text-[var(--accent)] scale-110 animate-pulse'
                            : 'text-gray-300 group-hover:text-[var(--accent)] group-hover:scale-110'
                    }`}
                />
                {isOpen && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="w-8 h-8 bg-[var(--accent)]/20 rounded-full animate-ping" />
                    </span>
                )}
            </button>

            {/* Invisible bridge to dropdown */}
            <div className="absolute top-full left-0 right-0 h-3" />

            {/* Dropdown Menu */}
            <div
                className={`absolute top-[calc(100%+8px)] right-0 py-2 min-w-[130px] bg-[var(--bg-card)]/95 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl transition-all duration-200 origin-top-right ${
                    isOpen
                        ? 'opacity-100 scale-100 visible'
                        : 'opacity-0 scale-95 invisible'
                }`}
            >
                {languages.map((lang) => (
                    <Link
                        key={lang.code}
                        href={switchLocale(lang.code)}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm transition-all hover:bg-white/10 ${
                            locale === lang.code
                                ? 'text-[var(--accent)] font-medium'
                                : 'text-gray-300 hover:text-white'
                        }`}
                    >
                        <span>{lang.label}</span>
                        {locale === lang.code && (
                            <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
                        )}
                    </Link>
                ))}
            </div>
        </div>
    )
}
