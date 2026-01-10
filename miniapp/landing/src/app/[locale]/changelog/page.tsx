import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Tag, Calendar, Sparkles, Bug, Zap, AlertTriangle } from 'lucide-react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/sections/Footer'
import { getDictionary, Locale } from '@/lib/i18n'
import { APP_VERSION } from '@/lib/version'

// Import releases data
import releasesData from '@/data/releases.json'

export const metadata: Metadata = {
    title: 'Changelog - MAIN Platform',
    description: 'История изменений и обновлений MAIN Platform',
}

interface Change {
    description: string
    commit?: string
    scope?: 'bot' | 'miniapp' | 'landing' | 'all'
}

interface Release {
    version: string
    date: string
    tag?: string
    type: 'major' | 'minor' | 'patch'
    summary: string
    highlights?: string[]
    features?: Change[]
    fixes?: Change[]
    improvements?: Change[]
    breaking?: Change[]
}

const typeColors = {
    major: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    minor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    patch: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const typeLabels = {
    major: 'Major',
    minor: 'Minor',
    patch: 'Patch',
}

const scopeColors = {
    bot: 'bg-yellow-500/20 text-yellow-400',
    miniapp: 'bg-cyan-500/20 text-cyan-400',
    landing: 'bg-pink-500/20 text-pink-400',
    all: 'bg-gray-500/20 text-gray-400',
}

function ChangeItem({ change, icon: Icon }: { change: Change; icon: React.ElementType }) {
    return (
        <li className="flex items-start gap-3 text-gray-300">
            <Icon size={16} className="mt-1 flex-shrink-0 text-gray-500" />
            <div className="flex-1">
                <span>{change.description}</span>
                {change.scope && change.scope !== 'all' && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${scopeColors[change.scope]}`}>
                        {change.scope}
                    </span>
                )}
            </div>
        </li>
    )
}

function ReleaseCard({ release, isFirst }: { release: Release; isFirst: boolean }) {
    const isLatest = release.version === APP_VERSION

    return (
        <article className="relative">
            {/* Timeline dot - pulsing for the first/latest release */}
            {isFirst ? (
                <div className="absolute left-0 top-0 flex items-center justify-center w-3 h-3">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75 animate-ping" />
                    <span className="absolute inline-flex h-3 w-3 rounded-full bg-[var(--accent)]" />
                    <span className="absolute inline-flex h-5 w-5 rounded-full ring-4 ring-[var(--accent)]/20" />
                </div>
            ) : (
                <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-white/30 ring-4 ring-white/10" />
            )}

            <div className={`ml-8 p-6 rounded-2xl border ${isLatest ? 'bg-[var(--accent)]/5 border-[var(--accent)]/30' : 'bg-white/5 border-white/10'}`}>
                {/* Header */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Tag size={18} className="text-[var(--accent)]" />
                        v{release.version}
                    </h2>
                    <span className={`text-xs px-2 py-1 rounded-full border ${typeColors[release.type]}`}>
                        {typeLabels[release.type]}
                    </span>
                    {isLatest && (
                        <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30">
                            Latest
                        </span>
                    )}
                    <span className="text-sm text-gray-500 flex items-center gap-1 ml-auto">
                        <Calendar size={14} />
                        {release.date}
                    </span>
                </div>

                {/* Summary */}
                <p className="text-gray-400 mb-4">{release.summary}</p>

                {/* Highlights */}
                {release.highlights && release.highlights.length > 0 && (
                    <div className="mb-4 p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                        <h3 className="text-sm font-semibold text-[var(--accent)] mb-2 flex items-center gap-2">
                            <Sparkles size={14} />
                            Highlights
                        </h3>
                        <ul className="space-y-1">
                            {release.highlights.map((h, i) => (
                                <li key={i} className="text-gray-300 text-sm">- {h}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Features */}
                {release.features && release.features.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                            <Sparkles size={14} />
                            New Features
                        </h3>
                        <ul className="space-y-2">
                            {release.features.map((f, i) => (
                                <ChangeItem key={i} change={f} icon={Sparkles} />
                            ))}
                        </ul>
                    </div>
                )}

                {/* Fixes */}
                {release.fixes && release.fixes.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                            <Bug size={14} />
                            Bug Fixes
                        </h3>
                        <ul className="space-y-2">
                            {release.fixes.map((f, i) => (
                                <ChangeItem key={i} change={f} icon={Bug} />
                            ))}
                        </ul>
                    </div>
                )}

                {/* Improvements */}
                {release.improvements && release.improvements.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                            <Zap size={14} />
                            Improvements
                        </h3>
                        <ul className="space-y-2">
                            {release.improvements.map((f, i) => (
                                <ChangeItem key={i} change={f} icon={Zap} />
                            ))}
                        </ul>
                    </div>
                )}

                {/* Breaking Changes */}
                {release.breaking && release.breaking.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                            <AlertTriangle size={14} />
                            Breaking Changes
                        </h3>
                        <ul className="space-y-2">
                            {release.breaking.map((f, i) => (
                                <ChangeItem key={i} change={f} icon={AlertTriangle} />
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </article>
    )
}

export default async function ChangelogPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale as Locale)
    const releases = releasesData.releases as Release[]

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navigation dict={dict.nav} locale={locale} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                {/* Back link */}
                <Link
                    href={`/${locale}`}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Changelog
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Track all updates, new features, and improvements to MAIN Platform.
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <span className="text-gray-500">Current version:</span>
                        <span className="px-3 py-1 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] font-mono">
                            v{APP_VERSION}
                        </span>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-1.5 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--accent)] via-white/20 to-transparent" />

                    {/* Releases */}
                    <div className="space-y-8">
                        {releases.map((release, index) => (
                            <ReleaseCard key={release.version} release={release} isFirst={index === 0} />
                        ))}
                    </div>
                </div>

                {/* Empty state */}
                {releases.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No releases yet.</p>
                    </div>
                )}
            </div>

            <Footer dict={dict.footer} />
        </main>
    )
}
