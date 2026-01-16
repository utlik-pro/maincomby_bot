'use client'

import { Sparkles } from 'lucide-react'

interface SummaryCardProps {
    items: string[]
    isRussian: boolean
}

export function SummaryCard({ items, isRussian }: SummaryCardProps) {
    const title = isRussian ? 'Ключевые выводы' : 'Key Takeaways'

    return (
        <div className="bg-gradient-to-br from-[var(--accent)]/10 to-transparent border border-[var(--accent)]/30 rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
                <Sparkles size={20} className="text-[var(--accent)]" />
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <ul className="space-y-3">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <span className="text-[var(--accent)] mt-1">•</span>
                        <span className="text-gray-300">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
