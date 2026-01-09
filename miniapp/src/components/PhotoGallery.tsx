import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User } from 'lucide-react'
import type { ProfilePhoto } from '@/types'

interface PhotoGalleryProps {
  photos: ProfilePhoto[]
  fallbackUrl?: string | null
  userName?: string | null
  className?: string
  onTap?: () => void
  showIndicator?: boolean
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  fallbackUrl,
  userName,
  className = '',
  onTap,
  showIndicator = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get all available images (photos + fallback)
  const allPhotos = photos.length > 0
    ? photos
    : fallbackUrl
      ? [{ id: 'fallback', photo_url: fallbackUrl, position: 0 } as ProfilePhoto]
      : []

  const hasPhotos = allPhotos.length > 0
  const hasMultiplePhotos = allPhotos.length > 1

  const handleTapLeft = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleTapRight = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentIndex < allPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleCenterTap = () => {
    if (onTap) {
      onTap()
    }
  }

  // Get initials for fallback
  const initials = userName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Photo Display */}
      {hasPhotos ? (
        <AnimatePresence mode="wait">
          <motion.img
            key={allPhotos[currentIndex]?.id || currentIndex}
            src={allPhotos[currentIndex]?.photo_url}
            alt={userName || 'Profile photo'}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>
      ) : (
        // Fallback to initials
        <div className="w-full h-full bg-bg-card flex items-center justify-center">
          {initials ? (
            <span className="text-6xl font-bold text-accent">{initials}</span>
          ) : (
            <User size={80} className="text-gray-600" />
          )}
        </div>
      )}

      {/* Tap zones for navigation */}
      {hasMultiplePhotos && (
        <>
          {/* Left tap zone */}
          <div
            className="absolute left-0 top-0 w-1/3 h-full cursor-pointer"
            onClick={handleTapLeft}
          />
          {/* Right tap zone */}
          <div
            className="absolute right-0 top-0 w-1/3 h-full cursor-pointer"
            onClick={handleTapRight}
          />
        </>
      )}

      {/* Center tap zone for profile view */}
      <div
        className="absolute left-1/3 top-0 w-1/3 h-full cursor-pointer"
        onClick={handleCenterTap}
      />

      {/* Photo indicator dots */}
      {showIndicator && hasMultiplePhotos && (
        <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {allPhotos.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Gradient overlay at bottom for text readability */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
    </div>
  )
}

export default PhotoGallery
