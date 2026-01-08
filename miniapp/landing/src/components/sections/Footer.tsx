import Link from 'next/link'
import Image from 'next/image'
import { Send } from 'lucide-react'

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
}

export function Footer({ dict }: FooterProps) {
    return (
        <footer className="py-12 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Logo & Description */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Image
                                src="/logo.png"
                                alt="MAIN Logo"
                                width={32}
                                height={32}
                                className="w-8 h-8"
                            />
                            <span className="font-bold text-lg text-white">MAIN Community</span>
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
                                    href="https://t.me/main_community"
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
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    {dict.links.bot}
                                </a>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-gray-400 hover:text-white transition-colors text-sm"
                                >
                                    {dict.links.privacy}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact CTA */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Присоединяйся</h4>
                        <a
                            href="https://t.me/maincomapp_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="haptic inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-black font-semibold rounded-xl hover:bg-[var(--accent-dark)] transition-colors"
                        >
                            Открыть в Telegram
                        </a>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 border-t border-white/5 text-center">
                    <p className="text-gray-500 text-sm">
                        {dict.copyright}
                    </p>
                </div>
            </div>
        </footer>
    )
}
