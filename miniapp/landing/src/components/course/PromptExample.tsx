'use client'

import { useState } from 'react'
import { Check, Copy, ThumbsDown, ThumbsUp } from 'lucide-react'

interface PromptExampleProps {
    label: string
    code: string
    good?: boolean
}

export function PromptExample({ label, code, good }: PromptExampleProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const borderColor = good === true ? 'border-green-500/30' : good === false ? 'border-red-500/30' : 'border-white/10'
    const headerBg = good === true ? 'bg-green-500/10' : good === false ? 'bg-red-500/10' : 'bg-white/5'

    return (
        <div className={`rounded-xl border ${borderColor} overflow-hidden my-4`}>
            <div className={`${headerBg} px-4 py-2 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    {good === true && <ThumbsUp size={16} className="text-green-400" />}
                    {good === false && <ThumbsDown size={16} className="text-red-400" />}
                    <span className="text-sm font-medium text-gray-300">{label}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-white transition-colors p-1"
                    title="Копировать"
                >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
            </div>
            <pre className="p-4 bg-[#0d0d0d] text-gray-300 text-sm overflow-x-auto whitespace-pre-wrap">
                {code}
            </pre>
        </div>
    )
}
