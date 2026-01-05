'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface LanguageSwitcherProps {
    locale: string
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
    const pathname = usePathname()

    const switchLocale = (newLocale: string) => {
        // Replace the locale in the pathname
        const segments = pathname.split('/')
        segments[1] = newLocale
        return segments.join('/')
    }

    return (
        <div className="flex items-center gap-1 bg-[var(--bg-card)] rounded-lg p-1">
            <Link
                href={switchLocale('ru')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${locale === 'ru'
                        ? 'bg-[var(--accent)] text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
            >
                RU
            </Link>
            <Link
                href={switchLocale('en')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${locale === 'en'
                        ? 'bg-[var(--accent)] text-black'
                        : 'text-gray-400 hover:text-white'
                    }`}
            >
                EN
            </Link>
        </div>
    )
}
