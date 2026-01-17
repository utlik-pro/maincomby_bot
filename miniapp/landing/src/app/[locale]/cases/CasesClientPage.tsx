'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
    Building2,
    TrendingUp,
    Calendar,
    MessageSquare,
    Users,
    Zap,
    ArrowRight,
    CheckCircle,
    Bot,
    MapPin
} from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/sections/Footer'

interface CasesClientPageProps {
    dict: any
    locale: string
}

interface CaseStudy {
    id: string
    company: string
    companyEn: string
    logo: string
    industry: string
    industryEn: string
    description: string
    descriptionEn: string
    challenge: string
    challengeEn: string
    solution: string
    solutionEn: string
    results: {
        metric: string
        metricEn: string
        value: string
    }[]
    launchDate: string
    launchDateEn: string
    testimonial?: string
    testimonialEn?: string
    color: string
}

const casesData: CaseStudy[] = [
    {
        id: 'dana-holdings',
        company: 'Dana Holdings',
        companyEn: 'Dana Holdings',
        logo: '/cases/dana-holdings.png',
        industry: 'Недвижимость',
        industryEn: 'Real Estate',
        description: 'Головной агент по продажам квартир в жилом комплексе «МинскМир»',
        descriptionEn: 'Head sales agent for apartments in MinskMir residential complex',
        challenge: 'Автоматизация первичной консультации клиентов и квалификация лидов 24/7',
        challengeEn: 'Automating initial client consultations and lead qualification 24/7',
        solution: 'AI-агент в Telegram для консультации по квартирам, ценам и условиям покупки',
        solutionEn: 'AI agent in Telegram for consulting on apartments, prices and purchase conditions',
        results: [
            { metric: 'Продано квартир', metricEn: 'Apartments sold', value: '3' },
            { metric: 'Дней до первой продажи', metricEn: 'Days to first sale', value: '16' },
            { metric: 'Обработано запросов', metricEn: 'Requests processed', value: '500+' },
        ],
        launchDate: '30 декабря 2025',
        launchDateEn: 'December 30, 2025',
        testimonial: 'AI-агент полностью изменил наш подход к работе с клиентами. Теперь мы не упускаем ни одного запроса.',
        testimonialEn: 'AI agent completely changed our approach to working with clients. Now we don\'t miss a single request.',
        color: '#dc2626'
    },
    {
        id: 'dana-holdings-transcription',
        company: 'Dana Holdings',
        companyEn: 'Dana Holdings',
        logo: '/cases/dana-holdings.png',
        industry: 'Корпоративные процессы',
        industryEn: 'Corporate Processes',
        description: 'Автоматизация протоколирования встреч и совещаний',
        descriptionEn: 'Automation of meeting minutes and summarization',
        challenge: 'Высокие расходы на сторонний сервис Plaud ($10,000/мес) и риски утечки данных',
        challengeEn: 'High costs for third-party service Plaud ($10,000/mo) and data leakage risks',
        solution: 'Локальный AI-транскрибатор и саммаризатор на собственных серверах компании',
        solutionEn: 'Local AI transcription and summarization on company\'s own servers',
        results: [
            { metric: 'Расходы в месяц', metricEn: 'Monthly costs', value: '$1,000' },
            { metric: 'Экономия', metricEn: 'Savings', value: '10x' },
            { metric: 'Безопасность данных', metricEn: 'Data Security', value: '100%' },
        ],
        launchDate: 'Январь 2026',
        launchDateEn: 'January 2026',
        testimonial: 'Мы не только сократили расходы в 10 раз, но и получили полный контроль над конфиденциальными данными наших совещаний.',
        testimonialEn: 'We not only cut costs by 10x but also gained full control over confidential data from our meetings.',
        color: '#16a34a'
    },
    {
        id: 'a-100',
        company: 'АЗС А-100',
        companyEn: 'A-100 Gas Stations',
        logo: '/cases/a100.png',
        industry: 'Ритейл / АЗС',
        industryEn: 'Retail / Gas Stations',
        description: 'AI-ассистент для помощи сотрудникам в работе с корпоративной базой знаний и СЭД',
        descriptionEn: 'AI assistant to help employees work with corporate knowledge base and document management system',
        challenge: 'Долгая адаптация новых сотрудников (8 месяцев) и сложность поиска информации в регламентах',
        challengeEn: 'Long adaptation of new employees (8 months) and difficulty finding information in regulations',
        solution: 'Умный AI-поиск и ассистент, интегрированный с СЭД и внутренней базой знаний',
        solutionEn: 'Smart AI search and assistant integrated with DMS and internal knowledge base',
        results: [
            { metric: 'Срок адаптации', metricEn: 'Adaptation period', value: '6 мес' },
            { metric: 'Ускорение', metricEn: 'Speed up', value: '-25%' },
            { metric: 'Скорость ответа', metricEn: 'Response speed', value: '< 10 сек' },
        ],
        launchDate: 'Февраль 2026',
        launchDateEn: 'February 2026',
        testimonial: 'Ассистент помогает новичкам находить ответы на сложные вопросы по регламентам за секунды, а не часы.',
        testimonialEn: 'The assistant helps newcomers find answers to complex regulatory questions in seconds, not hours.',
        color: '#84cc16' // Lime green matching logo
    },
    {
        id: 'tourbot-crm',
        company: 'Авторские Экскурсии',
        companyEn: 'Bespoke Tours',
        logo: '',
        industry: 'Туризм',
        industryEn: 'Tourism',
        description: 'CRM-система для туроператора с автоматизацией заказов и управления гидами',
        descriptionEn: 'CRM system for tour operators with automated order processing and guide management',
        challenge: '10 сотрудников обрабатывали 150+ заказов в день вручную в Google-таблицах, хаос в коммуникации с гидами и туристами',
        challengeEn: '10 employees manually processed 150+ orders per day in Google Sheets, chaotic communication with guides and tourists',
        solution: 'AI-агенты полностью автоматизировали бизнес-процесс: синхронизация с Tripster, WhatsApp-уведомления, ответы на вопросы. Осталось 2 оператора для мониторинга',
        solutionEn: 'AI agents fully automated the business process: Tripster sync, WhatsApp notifications, answering questions. Only 2 operators left for monitoring',
        results: [
            { metric: 'Было сотрудников', metricEn: 'Staff before', value: '10' },
            { metric: 'Осталось операторов', metricEn: 'Operators now', value: '2' },
            { metric: 'Заказов в день', metricEn: 'Orders per day', value: '150+' },
        ],
        launchDate: 'Октябрь 2025',
        launchDateEn: 'October 2025',
        testimonial: 'Раньше у меня работало 10 человек на обработке заказов. Теперь AI-агенты делают всё сами, а 2 оператора только следят за процессом. Весь бизнес работает на автомате.',
        testimonialEn: 'I used to have 10 people processing orders. Now AI agents do everything automatically, and just 2 operators monitor the process. The entire business runs on autopilot.',
        color: '#0ea5e9' // Sky blue for tourism
    }
]

export default function CasesClientPage({ dict, locale }: CasesClientPageProps) {
    const isRussian = locale === 'ru'

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navigation dict={dict.nav} locale={locale} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)] rounded-full blur-[150px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px]" />
                </div>

                <div className="max-w-6xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
                    >
                        <Building2 size={16} className="text-[var(--accent)]" />
                        <span className="text-sm text-gray-300">
                            {isRussian ? 'Реальные результаты' : 'Real Results'}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        {isRussian ? 'Кейсы внедрения' : 'Case Studies'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto"
                    >
                        {isRussian
                            ? 'Как бизнес использует AI-агентов для автоматизации продаж и поддержки клиентов'
                            : 'How businesses use AI agents to automate sales and customer support'}
                    </motion.p>
                </div>
            </section>

            {/* Partners Marquee */}
            <section className="py-10 border-y border-white/5 bg-white/[0.02] overflow-hidden mb-8">
                <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">
                        {isRussian ? 'Нам доверяют лидеры рынка' : 'Trusted by market leaders'}
                    </p>
                </div>

                <div className="relative flex overflow-x-hidden group">
                    <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
                        {[
                            { name: 'Belaz', logo: '/partners/belaz.png', h: 35 },
                            { name: 'BelHard', logo: '/partners/belhard.png', h: 40 },
                            { name: 'Na Svyazi', logo: '/partners/nasvyazi.png', h: 30 },
                            { name: 'Zborka Labs', logo: '/partners/zborka.png', h: 35 },
                            { name: 'Sky Cross', logo: '/partners/skycross.png', h: 55 },
                        ].map((partner, i) => (
                            <div
                                key={i}
                                className="relative grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-105 cursor-pointer filter"
                            >
                                <Image
                                    src={partner.logo}
                                    alt={partner.name}
                                    height={partner.h}
                                    width={140}
                                    className="object-contain w-auto h-auto max-h-12"
                                />
                            </div>
                        ))}
                        {/* Duplicate for loop */}
                        {[
                            { name: 'Belaz', logo: '/partners/belaz.png', h: 35 },
                            { name: 'BelHard', logo: '/partners/belhard.png', h: 40 },
                            { name: 'Na Svyazi', logo: '/partners/nasvyazi.png', h: 30 },
                            { name: 'Zborka Labs', logo: '/partners/zborka.png', h: 35 },
                            { name: 'Sky Cross', logo: '/partners/skycross.png', h: 55 },
                        ].map((partner, i) => (
                            <div
                                key={`dup-${i}`}
                                className="relative grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-105 cursor-pointer filter"
                            >
                                <Image
                                    src={partner.logo}
                                    alt={partner.name}
                                    height={partner.h}
                                    width={140}
                                    className="object-contain w-auto h-auto max-h-12"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cases Grid */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    {casesData.map((caseStudy, index) => (
                        <motion.div
                            key={caseStudy.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="mb-16"
                        >
                            <div className="glass rounded-3xl overflow-hidden border border-white/10">
                                {/* Header */}
                                <div className="p-8 pb-0 flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div
                                        className="w-20 h-20 rounded-2xl flex items-center justify-center p-2 flex-shrink-0"
                                        style={{ backgroundColor: caseStudy.logo ? 'white' : caseStudy.color }}
                                    >
                                        {caseStudy.logo ? (
                                            <Image
                                                src={caseStudy.logo}
                                                alt={caseStudy.company}
                                                width={64}
                                                height={64}
                                                className="object-contain"
                                            />
                                        ) : (
                                            <MapPin size={40} className="text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                                {caseStudy.company}
                                            </h2>
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-medium"
                                                style={{ backgroundColor: `${caseStudy.color}20`, color: caseStudy.color }}
                                            >
                                                {isRussian ? caseStudy.industry : caseStudy.industryEn}
                                            </span>
                                        </div>
                                        <p className="text-gray-400">
                                            {isRussian ? caseStudy.description : caseStudy.descriptionEn}
                                        </p>
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="p-8 grid md:grid-cols-2 gap-8">
                                    {/* Challenge & Solution */}
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wider mb-2">
                                                <MessageSquare size={14} />
                                                {isRussian ? 'Задача' : 'Challenge'}
                                            </div>
                                            <p className="text-gray-300">
                                                {isRussian ? caseStudy.challenge : caseStudy.challengeEn}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wider mb-2">
                                                <Bot size={14} />
                                                {isRussian ? 'Решение' : 'Solution'}
                                            </div>
                                            <p className="text-gray-300">
                                                {isRussian ? caseStudy.solution : caseStudy.solutionEn}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wider mb-2">
                                                <Calendar size={14} />
                                                {isRussian ? 'Запуск' : 'Launch'}
                                            </div>
                                            <p className="text-[var(--accent)] font-medium">
                                                {isRussian ? caseStudy.launchDate : caseStudy.launchDateEn}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Results */}
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 uppercase tracking-wider mb-4">
                                            <TrendingUp size={14} />
                                            {isRussian ? 'Результаты' : 'Results'}
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {caseStudy.results.map((result, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-white/5 rounded-xl p-4 border border-white/5"
                                                >
                                                    <div className="text-3xl font-bold text-[var(--accent)] mb-1">
                                                        {result.value}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {isRussian ? result.metric : result.metricEn}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Testimonial */}
                                {caseStudy.testimonial && (
                                    <div className="px-8 pb-8">
                                        <div className="bg-gradient-to-r from-white/5 to-transparent rounded-2xl p-6 border-l-4 border-[var(--accent)]">
                                            <p className="text-gray-300 italic text-lg">
                                                "{isRussian ? caseStudy.testimonial : caseStudy.testimonialEn}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass rounded-3xl p-12 border border-white/10"
                    >
                        <Zap className="w-12 h-12 text-[var(--accent)] mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-4">
                            {isRussian ? 'Хотите такие же результаты?' : 'Want similar results?'}
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                            {isRussian
                                ? 'Запустите AI-агента для вашего бизнеса за 2 недели'
                                : 'Launch an AI agent for your business in 2 weeks'}
                        </p>
                        <a
                            href="https://t.me/maincomapp_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-shine inline-flex items-center gap-2 bg-[var(--accent)] text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                        >
                            {isRussian ? 'Обсудить проект' : 'Discuss Project'}
                            <ArrowRight size={20} />
                        </a>
                    </motion.div>
                </div>
            </section>

            <Footer dict={dict.footer} />
        </main>
    )
}
