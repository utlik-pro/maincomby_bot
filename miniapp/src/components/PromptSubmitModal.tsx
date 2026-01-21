import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ImagePlus, Loader2, CheckCircle, Camera, X } from 'lucide-react'
import { submitPrompt, uploadPromptImage } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { hapticFeedback, useBackButton } from '@/lib/telegram'
import { resizeImageForProfile, isValidImageFile } from '@/lib/imageUtils'

interface PromptSubmitScreenProps {
    onClose: () => void
    onSubmitted: () => void
}

export const PromptSubmitModal: React.FC<PromptSubmitScreenProps> = ({
    onClose,
    onSubmitted
}) => {
    const { user } = useAppStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [promptText, setPromptText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Use Telegram system back button
    useBackButton(onClose)

    const canSubmit = selectedFile && promptText.trim() && !isSubmitting && !isUploading

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file
        if (!isValidImageFile(file)) {
            setError('Неподдерживаемый формат. Используйте JPEG, PNG или WebP')
            hapticFeedback.error()
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Файл слишком большой (макс. 10MB)')
            hapticFeedback.error()
            return
        }

        setError(null)
        hapticFeedback.light()

        // Create preview
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        setSelectedFile(file)
    }

    const handleRemoveImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
        }
        setPreviewUrl(null)
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async () => {
        if (!user?.id || !selectedFile || !canSubmit) return

        setIsSubmitting(true)
        setIsUploading(true)
        setError(null)

        try {
            // Resize image before upload
            const resizedFile = await resizeImageForProfile(selectedFile, {
                maxWidth: 1600,
                maxHeight: 1600,
                quality: 0.9
            })

            // Upload image
            const uploadResult = await uploadPromptImage(user.id, resizedFile)
            setIsUploading(false)

            if (!uploadResult.success || !uploadResult.url) {
                throw new Error(uploadResult.error || 'Ошибка загрузки')
            }

            // Submit prompt
            const result = await submitPrompt(user.id, promptText.trim(), uploadResult.url)

            if (result) {
                hapticFeedback.success()
                setShowSuccess(true)
                setTimeout(() => {
                    onSubmitted()
                }, 2000)
            } else {
                throw new Error('Не удалось отправить промпт')
            }
        } catch (err) {
            console.error('Submit error:', err)
            setError(err instanceof Error ? err.message : 'Не удалось отправить. Попробуйте ещё раз.')
            hapticFeedback.error()
        } finally {
            setIsSubmitting(false)
            setIsUploading(false)
        }
    }

    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-50 bg-bg flex items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
                    <h3 className="text-2xl font-bold mb-3">Отправлено!</h3>
                    <p className="text-gray-400 text-lg">
                        Ваш промпт отправлен на модерацию.
                        <br />После одобрения он появится в галерее.
                    </p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 bg-bg flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 bg-bg/95 backdrop-blur-sm border-b border-border px-4 py-3 z-10">
                <div className="flex items-center justify-center">
                    <h1 className="text-lg font-bold">Добавить промпт</h1>
                </div>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-4 space-y-4 pb-24">
                    {/* Image upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Изображение
                        </label>

                        {previewUrl ? (
                            <div className="relative">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full rounded-xl object-cover max-h-72"
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-video bg-bg-card rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-gray-500 hover:border-accent/50 hover:text-gray-400 transition-colors"
                            >
                                <Camera size={48} className="mb-3 opacity-50" />
                                <span className="text-sm font-medium">Выбрать изображение</span>
                                <span className="text-xs text-gray-600 mt-1">JPEG, PNG, WebP до 10MB</span>
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Prompt text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Текст промпта
                        </label>
                        <textarea
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            placeholder="Опишите промпт, который использовали для генерации..."
                            rows={5}
                            className="w-full px-4 py-3 bg-bg-card rounded-xl border border-border focus:border-accent focus:outline-none text-white placeholder-gray-500 resize-none"
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
                </div>
            </div>

            {/* Footer with submit button */}
            <div className="flex-shrink-0 bg-bg border-t border-border p-4 pb-6">
                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                        canSubmit
                            ? 'bg-accent text-black hover:bg-accent/90'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isUploading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Загрузка...
                        </>
                    ) : isSubmitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Отправка...
                        </>
                    ) : (
                        'Отправить на модерацию'
                    )}
                </button>
            </div>
        </div>
    )
}

export default PromptSubmitModal
