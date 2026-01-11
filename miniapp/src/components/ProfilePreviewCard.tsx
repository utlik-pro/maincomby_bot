import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Briefcase, Target, HandshakeIcon, Edit3, ChevronUp, ChevronDown } from 'lucide-react'
import { PhotoGallery } from './PhotoGallery'
import type { Profile, BotUser, ProfilePhoto, AvatarSkin } from '@/types'

interface ProfilePreviewCardProps {
  user: BotUser | null
  profile: Profile | null
  photos: ProfilePhoto[]
  activeSkin: AvatarSkin | null
  onEdit: () => void
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

export const ProfilePreviewCard: React.FC<ProfilePreviewCardProps> = ({
  user,
  profile,
  photos,
  activeSkin,
  onEdit
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Get display name
  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Participant'

  // Get badge to show (priority: skin > role > tier)
  const skinBadge = activeSkin ? { label: activeSkin.name, color: activeSkin.ring_color } : null
  const roleBadge = getRoleBadge(user?.team_role || null)
  const tierBadge = getTierBadge(user?.subscription_tier || null)
  const badge = skinBadge || roleBadge || tierBadge

  // Parse skills if available
  const skills = profile?.skills || []
  const displaySkills = skills.slice(0, 3)
  const remainingSkills = skills.length > 3 ? skills.length - 3 : 0

  // Check if profile is incomplete
  const isIncomplete = !profile?.photo_url && photos.length === 0

  return (
    <div className="relative w-full">
      {/* Main Card */}
      <motion.div
        className="relative w-full aspect-[3/4] max-h-[calc(100vh-180px)] rounded-3xl overflow-hidden bg-bg-card shadow-2xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Photo Gallery */}
        <PhotoGallery
          photos={photos}
          fallbackUrl={profile?.photo_url}
          userName={user?.first_name}
          className="absolute inset-0"
        />

        {/* Empty state overlay */}
        {isIncomplete && (
          <div className="absolute inset-0 bg-bg/80 flex flex-col items-center justify-center z-10">
            <div className="w-24 h-24 rounded-full bg-bg-card border-2 border-dashed border-gray-600 flex items-center justify-center mb-4">
              <Edit3 size={32} className="text-gray-500" />
            </div>
            <p className="text-gray-400 text-center px-8 mb-4">
              Добавьте фото, чтобы другие увидели вас в нетворкинге
            </p>
            <button
              onClick={onEdit}
              className="px-6 py-3 bg-accent text-bg font-semibold rounded-xl"
            >
              Заполнить профиль
            </button>
          </div>
        )}

        {/* "How others see you" label */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          <span className="px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white/80">
            Так видят тебя другие
          </span>
          <button
            onClick={onEdit}
            className="p-2.5 bg-black/50 backdrop-blur-sm rounded-full active:scale-95 transition-transform"
          >
            <Edit3 size={18} className="text-white" />
          </button>
        </div>

        {/* User Info Overlay - Expandable */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 z-10"
          animate={{ height: isExpanded ? 'auto' : 'auto' }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

          {/* Content */}
          <div className="relative p-4">
            {/* Name and Badge */}
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-white">{displayName}</h2>
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
              {profile?.occupation && (
                <span className="flex items-center gap-1">
                  <Briefcase size={14} />
                  {profile.occupation}
                </span>
              )}
              {profile?.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {profile.city}
                </span>
              )}
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className={`text-gray-300 text-sm mb-3 ${isExpanded ? '' : 'line-clamp-2'}`}>
                {profile.bio}
              </p>
            )}

            {/* Expandable content */}
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
              className="overflow-hidden"
            >
              {/* Looking for / Can help with */}
              {(profile?.looking_for || profile?.can_help_with) && (
                <div className="space-y-2 mb-3">
                  {profile?.looking_for && (
                    <div className="flex items-start gap-2 text-sm">
                      <Target size={14} className="text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{profile.looking_for}</span>
                    </div>
                  )}
                  {profile?.can_help_with && (
                    <div className="flex items-start gap-2 text-sm">
                      <HandshakeIcon size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{profile.can_help_with}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
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

            {/* Expand/Collapse button */}
            {(profile?.looking_for || profile?.can_help_with) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-center gap-1 w-full py-2 text-gray-400 text-sm"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    Свернуть
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Подробнее
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* XP indicator */}
      <div className="flex justify-center mt-4">
        <div className="px-4 py-2 bg-bg-card rounded-full flex items-center gap-2">
          <span className="text-accent font-bold">{user?.points || 0}</span>
          <span className="text-gray-400 text-sm">XP</span>
        </div>
      </div>
    </div>
  )
}

export default ProfilePreviewCard
