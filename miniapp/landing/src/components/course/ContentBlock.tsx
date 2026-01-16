'use client'

import { Alert } from './Alert'
import { PromptExample } from './PromptExample'
import { Comparison } from './Comparison'
import type { ContentBlock as ContentBlockType } from './types'

interface ContentBlockProps {
    block: ContentBlockType
    isRussian: boolean
}

export function ContentBlock({ block, isRussian }: ContentBlockProps) {
    switch (block.type) {
        case 'heading':
            return (
                <h2 className="text-xl md:text-2xl font-bold text-white mt-8 mb-4">
                    {isRussian ? block.text : block.textEn}
                </h2>
            )

        case 'text':
            return (
                <p className="text-gray-300 leading-relaxed mb-4">
                    {isRussian ? block.text : block.textEn}
                </p>
            )

        case 'alert':
            return (
                <Alert
                    variant={block.variant}
                    title={isRussian ? block.title : block.titleEn}
                >
                    {isRussian ? block.text : block.textEn}
                </Alert>
            )

        case 'prompt-example':
            return (
                <PromptExample
                    label={isRussian ? block.label : block.labelEn}
                    code={block.code}
                    good={block.good}
                />
            )

        case 'comparison':
            return (
                <Comparison
                    bad={{
                        label: isRussian ? block.bad.label : block.bad.labelEn,
                        text: isRussian ? block.bad.text : block.bad.textEn
                    }}
                    good={{
                        label: isRussian ? block.good.label : block.good.labelEn,
                        text: isRussian ? block.good.text : block.good.textEn
                    }}
                />
            )

        case 'list':
            const items = isRussian ? block.items : block.itemsEn
            return (
                <div className="my-4">
                    {(block.title || block.titleEn) && (
                        <h4 className="font-semibold text-white mb-2">
                            {isRussian ? block.title : block.titleEn}
                        </h4>
                    )}
                    <ul className="space-y-2">
                        {items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-300">
                                <span className="text-[var(--accent)] mt-1">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )

        case 'table':
            const headers = isRussian ? block.headers : block.headersEn
            const rows = isRussian ? block.rows : block.rowsEn
            return (
                <div className="my-6 overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                {headers.map((header, i) => (
                                    <th
                                        key={i}
                                        className="text-left px-4 py-3 border-b border-white/10 text-white font-semibold text-sm"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i} className="hover:bg-white/5">
                                    {row.map((cell, j) => (
                                        <td
                                            key={j}
                                            className="px-4 py-3 border-b border-white/5 text-gray-300 text-sm"
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )

        case 'card':
            return (
                <div
                    className="bg-[#151515] border border-white/10 rounded-xl p-5 my-4"
                    style={block.color ? { borderLeftColor: block.color, borderLeftWidth: '4px' } : undefined}
                >
                    {(block.title || block.titleEn) && (
                        <h4 className="font-semibold text-white mb-3">
                            {isRussian ? block.title : block.titleEn}
                        </h4>
                    )}
                    {block.children.map((child, i) => (
                        <ContentBlock key={i} block={child} isRussian={isRussian} />
                    ))}
                </div>
            )

        case 'code':
            return (
                <pre className="bg-[#0d0d0d] border border-white/10 rounded-xl p-4 my-4 overflow-x-auto">
                    <code className="text-gray-300 text-sm">{block.code}</code>
                </pre>
            )

        default:
            return null
    }
}
