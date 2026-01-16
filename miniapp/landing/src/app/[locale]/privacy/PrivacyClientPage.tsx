'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, ChevronRight, Clock, Database, Lock, Trash2, Globe, Mail, Phone } from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/sections/Footer'
import Link from 'next/link'

interface PrivacyClientPageProps {
    dict: any
    locale: string
}

export default function PrivacyClientPage({ dict, locale }: PrivacyClientPageProps) {
    const isRussian = locale === 'ru'

    const sections = isRussian ? [
        {
            icon: Database,
            title: 'Какие данные мы собираем',
            content: `При авторизации через Telegram мы получаем следующие данные:
• Telegram ID (уникальный идентификатор)
• Username (имя пользователя)
• Имя и фамилия (если указаны в профиле)

Эти данные необходимы исключительно для синхронизации доступа между Mini App и веб-сайтом.`
        },
        {
            icon: Clock,
            title: 'Срок хранения данных',
            content: `Данные хранятся только в течение активной сессии — 24 часа с момента авторизации.

После истечения сессии или при выходе из аккаунта все данные автоматически удаляются.`
        },
        {
            icon: Trash2,
            title: 'Удаление данных',
            content: `Ваши данные удаляются в следующих случаях:
• Автоматически через 24 часа после входа
• При нажатии кнопки «Выйти» на сайте
• При завершении сессии через Mini App

Мы не храним данные на постоянной основе — они существуют только для обеспечения текущей сессии.`
        },
        {
            icon: Lock,
            title: 'Безопасность данных',
            content: `• Данные передаются по защищённому протоколу HTTPS
• Мы не передаём данные третьим лицам
• Данные не используются для рекламы или аналитики
• Доступ к данным имеет только владелец аккаунта`
        },
        {
            icon: Globe,
            title: 'Соответствие законодательству',
            content: `Наша политика конфиденциальности соответствует:
• Законодательству Республики Беларусь о защите персональных данных
• Федеральному закону РФ №152-ФЗ «О персональных данных»
• Общему регламенту по защите данных (GDPR)
• Международным стандартам защиты персональных данных`
        }
    ] : [
        {
            icon: Database,
            title: 'What Data We Collect',
            content: `When you authorize via Telegram, we receive the following data:
• Telegram ID (unique identifier)
• Username
• First and last name (if specified in profile)

This data is needed exclusively for syncing access between Mini App and website.`
        },
        {
            icon: Clock,
            title: 'Data Retention Period',
            content: `Data is stored only during the active session — 24 hours from authorization.

After the session expires or when you log out, all data is automatically deleted.`
        },
        {
            icon: Trash2,
            title: 'Data Deletion',
            content: `Your data is deleted in the following cases:
• Automatically 24 hours after login
• When clicking "Log out" on the website
• When ending the session via Mini App

We do not store data permanently — it exists only to support the current session.`
        },
        {
            icon: Lock,
            title: 'Data Security',
            content: `• Data is transmitted via secure HTTPS protocol
• We do not share data with third parties
• Data is not used for advertising or analytics
• Only the account owner has access to the data`
        },
        {
            icon: Globe,
            title: 'Legal Compliance',
            content: `Our privacy policy complies with:
• Republic of Belarus personal data protection laws
• Russian Federal Law No. 152-FZ "On Personal Data"
• General Data Protection Regulation (GDPR)
• International personal data protection standards`
        }
    ]

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navigation dict={dict.nav} locale={locale} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 via-transparent to-transparent" />

                <div className="max-w-4xl mx-auto relative z-10">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm text-gray-500 mb-8"
                    >
                        <Link href={`/${locale}`} className="hover:text-[var(--accent)] transition-colors">
                            {isRussian ? 'Главная' : 'Home'}
                        </Link>
                        <ChevronRight size={14} />
                        <span className="text-[var(--accent)]">
                            {isRussian ? 'Политика конфиденциальности' : 'Privacy Policy'}
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="w-20 h-20 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-10 h-10 text-[var(--accent)]" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {isRussian ? 'Политика конфиденциальности' : 'Privacy Policy'}
                        </h1>
                        <p className="text-gray-400">
                            {isRussian
                                ? 'Последнее обновление: ' + new Date().toLocaleDateString('ru-RU')
                                : 'Last updated: ' + new Date().toLocaleDateString('en-US')}
                        </p>
                    </motion.div>

                    {/* Intro */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[var(--bg-card)] border border-white/5 rounded-2xl p-6 mb-8"
                    >
                        <p className="text-gray-300 leading-relaxed">
                            {isRussian
                                ? 'Мы ценим вашу конфиденциальность и стремимся к минимальному сбору данных. Наш сервис собирает только необходимую информацию для обеспечения авторизации и не хранит её дольше, чем требуется для работы сессии.'
                                : 'We value your privacy and strive for minimal data collection. Our service collects only the necessary information for authorization and does not store it longer than required for the session to work.'}
                        </p>
                    </motion.div>

                    {/* Sections */}
                    <div className="space-y-6">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="bg-[var(--bg-card)] border border-white/5 rounded-2xl p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                                        <section.icon className="w-5 h-5 text-[var(--accent)]" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                                </div>
                                <p className="text-gray-400 whitespace-pre-line leading-relaxed">
                                    {section.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 bg-gradient-to-br from-[var(--accent)]/10 to-purple-500/5 border border-[var(--accent)]/20 rounded-2xl p-6"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">
                            {isRussian ? 'Контакты для связи' : 'Contact Information'}
                        </h2>
                        <p className="text-gray-400 mb-4">
                            {isRussian
                                ? 'Если у вас есть вопросы о нашей политике конфиденциальности, свяжитесь с нами:'
                                : 'If you have questions about our privacy policy, contact us:'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="mailto:dev@utlik.pro"
                                className="flex items-center gap-2 text-[var(--accent)] hover:underline"
                            >
                                <Mail size={18} />
                                dev@utlik.pro
                            </a>
                            <a
                                href="tel:+375447554000"
                                className="flex items-center gap-2 text-[var(--accent)] hover:underline"
                            >
                                <Phone size={18} />
                                +375 44 755 40 00
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer dict={dict.footer} locale={locale} />
        </main>
    )
}
