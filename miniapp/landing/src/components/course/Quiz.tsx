'use client'

import { useState } from 'react'
import { CheckCircle, HelpCircle, XCircle } from 'lucide-react'
import type { QuizData } from './types'

interface QuizProps {
    data: QuizData
    isRussian: boolean
    onComplete?: () => void
}

export function Quiz({ data, isRussian, onComplete }: QuizProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)

    const handleSelect = (index: number) => {
        if (submitted) return
        setSelectedIndex(index)
    }

    const handleCheck = () => {
        if (selectedIndex === null) return

        const correct = data.options[selectedIndex].correct
        setIsCorrect(correct)
        setSubmitted(true)

        if (correct && onComplete) {
            onComplete()
        }
    }

    const handleReset = () => {
        setSelectedIndex(null)
        setSubmitted(false)
        setIsCorrect(false)
    }

    return (
        <div className="bg-[#151515] border border-white/10 rounded-xl p-6 my-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                    <HelpCircle size={20} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                    {isRussian ? 'Проверка понимания' : 'Knowledge Check'}
                </h3>
            </div>

            {/* Question */}
            <p className="text-gray-200 mb-4">
                {isRussian ? data.question : data.questionEn}
            </p>

            {/* Options */}
            <div className="space-y-3 mb-6">
                {data.options.map((option, index) => {
                    const isSelected = selectedIndex === index
                    const showCorrect = submitted && option.correct
                    const showWrong = submitted && isSelected && !option.correct

                    return (
                        <button
                            key={index}
                            onClick={() => handleSelect(index)}
                            disabled={submitted}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                                showCorrect
                                    ? 'border-green-500/50 bg-green-500/10'
                                    : showWrong
                                        ? 'border-red-500/50 bg-red-500/10'
                                        : isSelected
                                            ? 'border-[var(--accent)]/50 bg-[var(--accent)]/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20'
                            } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    showCorrect
                                        ? 'border-green-500 bg-green-500'
                                        : showWrong
                                            ? 'border-red-500 bg-red-500'
                                            : isSelected
                                                ? 'border-[var(--accent)] bg-[var(--accent)]'
                                                : 'border-gray-500'
                                }`}>
                                    {(showCorrect || (isSelected && !submitted)) && (
                                        <CheckCircle size={12} className="text-black" />
                                    )}
                                    {showWrong && (
                                        <XCircle size={12} className="text-white" />
                                    )}
                                </div>
                                <span className={`text-sm ${
                                    showCorrect ? 'text-green-400' : showWrong ? 'text-red-400' : 'text-gray-300'
                                }`}>
                                    {isRussian ? option.text : option.textEn}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Feedback */}
            {submitted && (
                <div className={`p-4 rounded-xl mb-4 ${
                    isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                }`}>
                    <p className={`text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect
                            ? (isRussian ? 'Правильно! Отличная работа.' : 'Correct! Great job.')
                            : (isRussian ? 'Неправильно. Попробуйте ещё раз.' : 'Incorrect. Try again.')
                        }
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                {!submitted ? (
                    <button
                        onClick={handleCheck}
                        disabled={selectedIndex === null}
                        className="px-6 py-2 bg-[var(--accent)] text-black font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                        {isRussian ? 'Проверить' : 'Check'}
                    </button>
                ) : !isCorrect ? (
                    <button
                        onClick={handleReset}
                        className="px-6 py-2 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
                    >
                        {isRussian ? 'Попробовать снова' : 'Try Again'}
                    </button>
                ) : null}
            </div>
        </div>
    )
}
