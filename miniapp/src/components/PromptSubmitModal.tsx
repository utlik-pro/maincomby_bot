import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, ImagePlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { submitPrompt } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { hapticFeedback } from '@/lib/telegram'

interface PromptSubmitModalProps {
    onClose: () => void
    onSubmitted: () => void
}

export const PromptSubmitModal: React.FC<PromptSubmitModalProps> = ({
    onClose,
    onSubmitted
}) => {
    const { user } = useAppStore()
    const [imageUrl, setImageUrl] = useState('')
    const [promptText, setPromptText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageError, setImageError] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    const isValidUrl = (url: string) => {
        try {
            new URL(url)
            return url.startsWith('http://') || url.startsWith('https://')
        } catch {
            return false
        }
    }

    const canSubmit = imageUrl.trim() && promptText.trim() && isValidUrl(imageUrl) && !imageError && imageLoaded

    const handleSubmit = async () => {
        if (!user?.id || !canSubmit || isSubmitting) return

        setIsSubmitting(true)
        setError(null)

        try {
            const result = await submitPrompt(user.id, promptText.trim(), imageUrl.trim())

            if (result) {
                hapticFeedback.success()
                setShowSuccess(true)
                setTimeout(() => {
                    onSubmitted()
                }, 2000)
            } else {
                throw new Error('Failed to submit')
            }
        } catch (err) {
            console.error('Submit error:', err)
            setError('Не удалось отправить. Попробуйте ещё раз.')
            hapticFeedback.error()
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImageUrlChange = (url: string) => {
        setImageUrl(url)
        setImageError(false)
        setImageLoaded(false)
    }

    if (showSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-bg-card rounded-2xl p-8 text-center max-w-sm w-full"
                >
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Отправлено!</h3>
                    <p className="text-gray-400">
                        Ваш промпт отправлен на модерацию. После одобрения он появится в галерее.
                    </p>
                </motion.div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="bg-bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-bg-card border-b border-border p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">Добавить промпт</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Image URL input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Ссылка на изображение
                        </label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => handleImageUrlChange(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-4 py-3 bg-bg rounded-xl border border-border focus:border-accent focus:outline-none text-white placeholder-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Вставьте прямую ссылку на изображение (jpg, png, webp)
                        </p>
                    </div>

                    {/* Image preview */}
                    {imageUrl && isValidUrl(imageUrl) && (
                        <div className="relative">
                            {!imageLoaded && !imageError && (
                                <div className="aspect-square bg-bg rounded-xl flex items-center justify-center">
                                    <Loader2 size={32} className="animate-spin text-accent" />
                                </div>
                            )}
                            {imageError && (
                                <div className="aspect-square bg-bg rounded-xl flex flex-col items-center justify-center text-red-400">
                                    <AlertCircle size={32} className="mb-2" />
                                    <span className="text-sm">Не удалось загрузить изображение</span>
                                </div>
                            )}
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className={`w-full rounded-xl object-cover max-h-64 ${imageLoaded && !imageError ? 'block' : 'hidden'}`}
                                onLoad={() => {
                                    setImageLoaded(true)
                                    setImageError(false)
                                }}
                                onError={() => {
                                    setImageError(true)
                                    setImageLoaded(false)
                                }}
                            />
                        </div>
                    )}

                    {/* Empty state for image */}
                    {!imageUrl && (
                        <div className="aspect-video bg-bg rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-gray-500">
                            <ImagePlus size={48} className="mb-2 opacity-50" />
                            <span className="text-sm">Превью изображения</span>
                        </div>
                    )}

                    {/* Prompt text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Текст промпта
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            placeholder="Опишите промпт, который использовали для генерации..."
                            rows={4}
                            className="w-full px-4 py-3 bg-bg rounded-xl border border-border focus:border-accent focus:outline-none text-white placeholder-gray-500 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {promptText.length} / 2000
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Info */}
                    <div className="p-3 bg-accent/10 rounded-xl text-sm text-accent/80">
                        После отправки ваш промпт будет проверен модератором перед публикацией.
                    </div>

                    {/* Submit button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                            canSubmit && !isSubmitting
                                ? 'bg-accent text-black hover:bg-accent/90'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Отправка...
                            </>
                        ) : (
                            'Отправить на модерацию'
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default PromptSubmitModal
