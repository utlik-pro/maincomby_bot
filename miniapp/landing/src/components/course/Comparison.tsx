'use client'

import { ThumbsDown, ThumbsUp } from 'lucide-react'

interface ComparisonItem {
    label: string
    text: string
}

interface ComparisonProps {
    bad: ComparisonItem
    good: ComparisonItem
}

export function Comparison({ bad, good }: ComparisonProps) {
    return (
        <div className="grid md:grid-cols-2 gap-4 my-6">
            {/* Bad example */}
            <div className="rounded-xl border border-red-500/30 overflow-hidden">
                <div className="bg-red-500/10 px-4 py-2 flex items-center gap-2">
                    <ThumbsDown size={16} className="text-red-400" />
                    <span className="text-sm font-medium text-red-400">{bad.label}</span>
                </div>
                <div className="p-4 bg-[#151515]">
                    <p className="text-gray-300 text-sm">{bad.text}</p>
                </div>
            </div>

            {/* Good example */}
            <div className="rounded-xl border border-green-500/30 overflow-hidden">
                <div className="bg-green-500/10 px-4 py-2 flex items-center gap-2">
                    <ThumbsUp size={16} className="text-green-400" />
                    <span className="text-sm font-medium text-green-400">{good.label}</span>
                </div>
                <div className="p-4 bg-[#151515]">
                    <p className="text-gray-300 text-sm">{good.text}</p>
                </div>
            </div>
        </div>
    )
}
