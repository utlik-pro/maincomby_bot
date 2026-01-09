import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Image, Loader2 } from 'lucide-react'
import type { ProfilePhoto } from '@/types'
import { resizeImageForProfile, formatFileSize } from '@/lib/imageUtils'

interface PhotoUploaderProps {
  photos: ProfilePhoto[]
  maxPhotos?: number
  onPhotoUpload: (file: File, position: number) => Promise<void>
  onPhotoDelete: (photoId: string) => Promise<void>
  isUploading?: boolean
  uploadingPosition?: number | null
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  maxPhotos = 3,
  onPhotoUpload,
  onPhotoDelete,
  isUploading = false,
  uploadingPosition = null
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)

  // Create array of slots with photos or empty
  const slots: (ProfilePhoto | null)[] = Array.from({ length: maxPhotos }, (_, i) => {
    return photos.find(p => p.position === i) || null
  })

  const handleSlotClick = (position: number) => {
    if (isUploading) return

    const existingPhoto = slots[position]
    if (existingPhoto) {
      // Photo exists - do nothing (user should use delete button)
      return
    }

    // Open file picker for this position
    setSelectedPosition(position)
    fileInputRef.current?.click()
  }

  const [resizingStatus, setResizingStatus] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || selectedPosition === null) return

    try {
      // Show resizing status
      const originalSize = formatFileSize(file.size)
      setResizingStatus(`${originalSize}...`)

      // Resize image for optimal quality and size
      // 1200x1600 is ideal for 3:4 profile cards
      const resizedFile = await resizeImageForProfile(file, {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.85,
        format: 'jpeg'
      })

      const newSize = formatFileSize(resizedFile.size)
      console.log(`[PhotoUploader] Resized: ${originalSize} -> ${newSize}`)

      setResizingStatus(null)
      await onPhotoUpload(resizedFile, selectedPosition)
    } catch (error) {
      console.error('[PhotoUploader] Resize error:', error)
      setResizingStatus(null)
      // Fallback to original file if resize fails
      await onPhotoUpload(file, selectedPosition)
    }

    setSelectedPosition(null)

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation()
    if (isUploading) return
    await onPhotoDelete(photoId)
  }

  return (
    <div className="w-full">
      <p className="text-sm text-gray-400 mb-3">
        Добавьте до {maxPhotos} фото для профиля. Первое фото будет основным.
      </p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Photo slots grid */}
      <div className="grid grid-cols-3 gap-3">
        {slots.map((photo, index) => (
          <motion.div
            key={index}
            whileTap={!isUploading ? { scale: 0.95 } : undefined}
            onClick={() => handleSlotClick(index)}
            className={`
              relative aspect-[3/4] rounded-xl overflow-hidden
              ${photo ? 'bg-bg-card' : 'bg-bg-card border-2 border-dashed border-gray-600'}
              ${!photo && !isUploading ? 'cursor-pointer hover:border-accent' : ''}
              ${isUploading && uploadingPosition === index ? 'opacity-70' : ''}
              transition-colors
            `}
          >
            {photo ? (
              <>
                {/* Photo */}
                <img
                  src={photo.photo_url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-accent text-bg text-xs font-bold rounded-full">
                    Главное
                  </div>
                )}

                {/* Delete button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleDelete(e, photo.id)}
                  disabled={isUploading}
                  className="absolute top-2 right-2 w-7 h-7 bg-danger rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
                >
                  <X size={16} className="text-white" />
                </motion.button>
              </>
            ) : (
              <>
                {/* Empty slot */}
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  {(isUploading && uploadingPosition === index) || (resizingStatus && selectedPosition === index) ? (
                    <>
                      <Loader2 size={24} className="text-accent animate-spin" />
                      {resizingStatus && (
                        <span className="text-xs text-gray-400">{resizingStatus}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center">
                        <Plus size={20} className="text-gray-400" />
                      </div>
                      <span className="text-xs text-gray-500">
                        {index === 0 ? 'Главное' : `Фото ${index + 1}`}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-bg-card rounded-xl">
        <div className="flex items-start gap-2">
          <Image size={16} className="text-accent flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-400">
            <p className="mb-1">Рекомендации:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Формат: JPEG, PNG или WebP</li>
              <li>Максимальный размер: 10 MB</li>
              <li>Лучше использовать фото в портретной ориентации</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhotoUploader
