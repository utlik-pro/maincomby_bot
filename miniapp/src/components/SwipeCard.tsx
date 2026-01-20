import React, { useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion'
import { MapPin, Briefcase, Info } from 'lucide-react'
import type { SwipeCardProfile } from '@/types'

interface SwipeCardProps {
  profile: SwipeCardProfile
  onSwipe: (direction: 'left' | 'right') => void
  onViewProfile: () => void
  isProcessing?: boolean
}

// Helper to get correct photo URL
const getPhotoUrl = (url?: string | null) => {
  if (!url) return 'https://placehold.co/600x800/1a1a1a/ffffff?text=No+Photo'
  if (url.startsWith('http')) return url
  return url
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile: cardData,
  onSwipe,
  onViewProfile,
  isProcessing = false
}) => {
  const { profile, user, photos = [] } = cardData
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // Motion values for drag
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  // Swipe indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  // Photo Navigation
  const allPhotos = photos.length > 0 ? photos.map(p => p.photo_url) : [profile.photo_url]
  const currentPhoto = allPhotos[currentPhotoIndex]

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentPhotoIndex < allPhotos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1)
    }
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1)
    }
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (isProcessing) return
    const threshold = 100
    if (info.offset.x > threshold) {
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      onSwipe('left')
    }
  }

  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Участник'

  // Use occupation from profile
  const role = profile.occupation || null
  const city = profile.city || null

  return (
    <motion.div
      className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/5 select-none"
      style={{ x, rotate, opacity }}
      drag={isProcessing ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Main Photo Container */}
      <div className="absolute inset-0 bg-black">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentPhoto || 'placeholder'}
            src={getPhotoUrl(currentPhoto)}
            alt="Profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        </AnimatePresence>

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

        {/* Navigation Touch Zones */}
        <div className="absolute inset-0 flex z-10 w-full h-full">
          <div className="w-1/2 h-full cursor-pointer" onClick={prevPhoto} />
          <div className="w-1/2 h-full cursor-pointer" onClick={nextPhoto} />
        </div>
      </div>

      {/* Top Indicators - only show when multiple photos */}
      {allPhotos.length > 1 && (
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-20 pointer-events-none">
          {allPhotos.map((_, idx) => (
            <div
              key={idx}
              className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                }`}
            />
          ))}
        </div>
      )}

      {/* Swipe Stamps */}
      <motion.div
        className="absolute top-10 left-6 px-4 py-2 border-4 border-green-500 rounded-lg rotate-[-20deg] z-30 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <span className="text-4xl font-black text-green-500 tracking-widest uppercase">LIKE</span>
      </motion.div>
      <motion.div
        className="absolute top-10 right-6 px-4 py-2 border-4 border-red-500 rounded-lg rotate-[20deg] z-30 pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        <span className="text-4xl font-black text-red-500 tracking-widest uppercase">NOPE</span>
      </motion.div>


      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pb-24 z-20 pointer-events-none">
        <div className="flex flex-col gap-2 text-white">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold shadow-black drop-shadow-md">
              {displayName}
            </h2>
          </div>

          {role && (
            <div className="flex items-center gap-2 text-white/90 text-sm font-medium drop-shadow-md">
              <Briefcase size={16} />
              <span>{role}</span>
            </div>
          )}

          {city && (
            <div className="flex items-center gap-2 text-white/80 text-sm drop-shadow-md">
              <MapPin size={16} />
              <span>{city}</span>
            </div>
          )}

          {profile.bio && (
            <p className="text-white/80 text-sm line-clamp-2 mt-1 drop-shadow-md max-w-[90%]">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Info Button */}
        <div className="absolute right-4 bottom-28 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile();
            }}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition shadow-lg"
          >
            <Info size={16} className="text-white" />
          </button>
        </div>
      </div>

    </motion.div>
  )
}

export default SwipeCard
