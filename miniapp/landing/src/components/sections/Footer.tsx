import Link from 'next/link'
import Image from 'next/image'
import { Send, Bot, Shield, Heart, FileText, Calendar, GraduationCap } from 'lucide-react'
import { APP_VERSION } from '@/lib/version'
import { CalButton } from '../CalButton'

interface FooterProps {
    dict: {
        description: string
        links: {
            telegram: string
            bot: string
            privacy: string
        }
        copyright: string
    }
    locale?: string
}

export function Footer({ dict, locale = 'ru' }: FooterProps) {
    return (
        <footer className="py-12 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Logo & Description */}
                    <div>
                        <div className="flex items-center gap-3 mb-4 group cursor-pointer">
                            <div className="relative">
                                {/* Glow effect behind logo */}
                                <div className="absolute inset-0 bg-[var(--accent)]/0 group-hover:bg-[var(--accent)]/40 rounded-full blur-xl transition-all duration-500 scale-150" />
                                <Image
                                    src="/logo.png"
                                    alt="MAIN Logo"
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 relative z-10 transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                            <span className="font-bold text-xl text-white">
                                MAIN PLATFORM
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            {dict.description}
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Ссылки</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="https://t.me/maincomby"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
                                >
                                    <Send size={14} />
                                    {dict.links.telegram}
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://t.me/maincomapp_bot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
                                >
                                    <Bot size={14} />
                                    {dict.links.bot}
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
                                >
                                    <Shield size={14} />
                                    {dict.links.privacy}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/changelog"
                                    className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
                                >
                                    <FileText size={14} />
                                    Changelog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/${locale}/learn`}
                                    className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
                                >
                                    <GraduationCap size={14} />
                                    {locale === 'ru' ? 'Курсы' : 'Courses'}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact CTA */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Связаться</h4>
                        <CalButton className="btn-shine haptic inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-black font-semibold rounded-xl cursor-pointer">
                            <Calendar size={16} />
                            Забронировать звонок
                        </CalButton>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 border-t border-white/5 text-center">
                    <p className="text-gray-500 text-sm inline-flex items-center justify-center gap-1 flex-wrap">
                        <span>© 2026 MAIN Platform. All rights reserved. Made with</span>
                        <Heart size={14} className="text-red-500 fill-red-500" />
                        <span>at</span>
                        <span className="font-bold italic text-gray-400">Utlik. Co</span>
                    </p>
                    <p className="text-gray-600 text-xs mt-2">
                        v{APP_VERSION}
                    </p>
                </div>
            </div>
        </footer>
    )
}
