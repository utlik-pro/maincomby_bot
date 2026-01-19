import React from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { MapPin, Briefcase, Target, HandshakeIcon } from 'lucide-react'
import { PhotoGallery } from './PhotoGallery'
import { Badge } from '@/components/ui'
import type { SwipeCardProfile, AvatarSkin } from '@/types'

interface SwipeCardProps {
  profile: SwipeCardProfile
  onSwipe: (direction: 'left' | 'right') => void
  onViewProfile: () => void
  isProcessing?: boolean
  fullscreen?: boolean
}

// Get badge config for team role
const getRoleBadge = (role: string | null) => {
  const config: Record<string, { label: string; color: string }> = {
    core: { label: 'MAIN Team', color: '#c8ff00' },
    partner: { label: 'Partner', color: '#3b82f6' },
    sponsor: { label: 'Sponsor', color: '#eab308' },
    volunteer: { label: 'Volunteer', color: '#22c55e' },
    speaker: { label: 'Speaker', color: '#a855f7' },
  }
  return role ? config[role] : null
}

// Get badge for subscription tier
const getTierBadge = (tier: string | null) => {
  if (tier === 'pro') return { label: 'PRO', color: '#f59e0b' }
  if (tier === 'light') return { label: 'LIGHT', color: '#10b981' }
  return null
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile: cardData,
  onSwipe,
  onViewProfile,
  isProcessing = false,
  fullscreen = false
}) => {
  const { profile, user, photos = [], activeSkin } = cardData

  // Motion values for drag
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  // Swipe indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (isProcessing) return

    const threshold = 100
    if (info.offset.x > threshold) {
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      onSwipe('left')
    }
  }

  // Get display name
  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Participant'

  // Get badge to show (priority: skin > role > tier)
  const skinBadge = activeSkin ? { label: activeSkin.name, color: activeSkin.ring_color } : null
  const roleBadge = getRoleBadge(user?.team_role)
  const tierBadge = getTierBadge(user?.subscription_tier)
  const badge = skinBadge || roleBadge || tierBadge

  // Parse skills if available
  const skills = profile.skills || []
  const displaySkills = skills.slice(0, 2)
  const remainingSkills = skills.length > 2 ? skills.length - 2 : 0

  // Container styles based on mode
  const containerClass = fullscreen
    ? "relative w-full h-full overflow-hidden bg-black cursor-grab active:cursor-grabbing"
    : "relative w-full aspect-[3/4] max-h-[calc(100vh-220px)] rounded-card overflow-hidden bg-bg-card cursor-grab active:cursor-grabbing"

  return (
    <motion.div
      className={containerClass}
      style={{ x, rotate, opacity }}
      drag={isProcessing ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* Photo Gallery */}
      <PhotoGallery
        photos={photos}
        fallbackUrl={profile.photo_url}
        userName={user?.first_name}
        className="absolute inset-0"
        onTap={onViewProfile}
      />

      {/* Swipe Indicators */}
      <motion.div
        className="absolute top-8 left-6 px-4 py-2 border-4 border-success rounded-lg rotate-[-20deg] z-20"
        style={{ opacity: likeOpacity }}
      >
        <span className="text-2xl font-bold text-success">LIKE</span>
      </motion.div>
      <motion.div
        className="absolute top-8 right-6 px-4 py-2 border-4 border-danger rounded-lg rotate-[20deg] z-20"
        style={{ opacity: nopeOpacity }}
      >
        <span className="text-2xl font-bold text-danger">NOPE</span>
      </motion.div>

      {/* User Info Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 ${
        fullscreen
          ? 'p-5 pb-28 bg-gradient-to-t from-black via-black/80 to-transparent'
          : 'p-4'
      }`}>
        {/* Name and Badge */}
        <div className="flex items-center gap-2 mb-1">
          <h2 className={`font-bold text-white ${fullscreen ? 'text-3xl' : 'text-2xl'}`}>{displayName}</h2>
          {badge && (
            <span
              className="px-2 py-0.5 text-xs font-bold rounded-full"
              style={{
                backgroundColor: badge.color,
                color: badge.color === '#c8ff00' || badge.color === '#eab308' ? '#000' : '#fff'
              }}
            >
              {badge.label}
            </span>
          )}
        </div>

        {/* Occupation and City */}
        <div className="flex items-center gap-3 text-gray-300 text-sm mb-2">
          {profile.occupation && (
            <span className="flex items-center gap-1">
              <Briefcase size={14} />
              {profile.occupation}
            </span>
          )}
          {profile.city && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {profile.city}
            </span>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-gray-300 text-sm line-clamp-2 mb-3">
            {profile.bio}
          </p>
        )}

        {/* Looking for / Can help with */}
        {(profile.looking_for || profile.can_help_with) && (
          <div className="space-y-1 mb-3">
            {profile.looking_for && (
              <div className="flex items-start gap-2 text-sm">
                <Target size={14} className="text-accent flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 line-clamp-1">{profile.looking_for}</span>
              </div>
            )}
            {profile.can_help_with && (
              <div className="flex items-start gap-2 text-sm">
                <HandshakeIcon size={14} className="text-success flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 line-clamp-1">{profile.can_help_with}</span>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {displaySkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white"
              >
                {skill}
              </span>
            ))}
            {remainingSkills > 0 && (
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white">
                +{remainingSkills}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default SwipeCard
