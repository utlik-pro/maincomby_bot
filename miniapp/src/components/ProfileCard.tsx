import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Shield, Star, Award, Medal, Trophy, Crown } from 'lucide-react'
import { User, UserProfile, UserCompany, UserLink, UserRank, RANK_LABELS, TEAM_BADGES, UserBadge, SubscriptionTier } from '@/types'
import { Avatar, Badge } from '@/components/ui'
import { CompanyInline } from '@/components/CompanyCard'
import { SocialLinks } from '@/components/SocialLinks'

// Icon mapping for ranks
const RANK_ICONS: Record<UserRank, React.ReactNode> = {
  private: <Shield size={14} className="text-gray-400" />,
  corporal: <Star size={14} className="text-yellow-400" />,
  sergeant: <Award size={14} className="text-yellow-500" />,
  sergeant_major: <Medal size={14} className="text-orange-400" />,
  lieutenant: <Medal size={14} className="text-blue-400" />,
  captain: <Trophy size={14} className="text-purple-400" />,
  major: <Crown size={14} className="text-accent" />,
  colonel: <Award size={14} className="text-red-500" />,
  general: <Crown size={14} className="text-yellow-300" />,
}

// Profile themes based on role/tier/badges
export type ProfileTheme = {
  headerGradient: string
  avatarRing: string
  avatarGlow: string
  accentColor: string
  badge?: { icon: React.ReactNode; label: string; color: string }
}

export const PROFILE_THEMES: Record<string, ProfileTheme> = {
  // Core team - MAIN branded gold/lime
  core: {
    headerGradient: 'bg-gradient-to-b from-[#c8ff00]/30 via-[#c8ff00]/10 to-transparent',
    avatarRing: 'ring-4 ring-[#c8ff00] ring-offset-2 ring-offset-bg',
    avatarGlow: 'shadow-[0_0_30px_rgba(200,255,0,0.4)]',
    accentColor: 'text-[#c8ff00]',
    badge: { icon: <Star size={12} />, label: 'CORE TEAM', color: 'bg-[#c8ff00] text-black' },
  },
  // VIP - Gold premium
  vip: {
    headerGradient: 'bg-gradient-to-b from-yellow-500/30 via-amber-500/10 to-transparent',
    avatarRing: 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-bg',
    avatarGlow: 'shadow-[0_0_30px_rgba(250,204,21,0.4)]',
    accentColor: 'text-yellow-400',
    badge: { icon: <Crown size={12} />, label: 'VIP', color: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' },
  },
  // Speaker - Purple
  speaker: {
    headerGradient: 'bg-gradient-to-b from-purple-500/30 via-purple-500/10 to-transparent',
    avatarRing: 'ring-4 ring-purple-400 ring-offset-2 ring-offset-bg',
    avatarGlow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    accentColor: 'text-purple-400',
    badge: { icon: <Award size={12} />, label: 'SPEAKER', color: 'bg-purple-500 text-white' },
  },
  // Partner - Teal
  partner: {
    headerGradient: 'bg-gradient-to-b from-teal-500/30 via-teal-500/10 to-transparent',
    avatarRing: 'ring-4 ring-teal-400 ring-offset-2 ring-offset-bg',
    avatarGlow: 'shadow-[0_0_30px_rgba(45,212,191,0.3)]',
    accentColor: 'text-teal-400',
    badge: { icon: <Medal size={12} />, label: 'PARTNER', color: 'bg-teal-500 text-white' },
  },
  // Sponsor - Orange/Gold
  sponsor: {
    headerGradient: 'bg-gradient-to-b from-orange-500/30 via-orange-500/10 to-transparent',
    avatarRing: 'ring-4 ring-orange-400 ring-offset-2 ring-offset-bg',
    avatarGlow: 'shadow-[0_0_30px_rgba(251,146,60,0.4)]',
    accentColor: 'text-orange-400',
    badge: { icon: <Trophy size={12} />, label: 'SPONSOR', color: 'bg-gradient-to-r from-orange-400 to-yellow-500 text-black' },
  },
  // Pro subscriber - Accent lime
  pro: {
    headerGradient: 'bg-gradient-to-b from-accent/20 via-accent/5 to-transparent',
    avatarRing: 'ring-2 ring-accent ring-offset-1 ring-offset-bg',
    avatarGlow: 'shadow-[0_0_20px_rgba(200,255,0,0.2)]',
    accentColor: 'text-accent',
    badge: { icon: <Crown size={12} />, label: 'PRO', color: 'bg-accent text-black' },
  },
  // Default - subtle
  default: {
    headerGradient: 'bg-gradient-to-b from-accent/10 to-transparent',
    avatarRing: '',
    avatarGlow: '',
    accentColor: 'text-accent',
  },
}

// Determine theme priority: core > vip badge > speaker > partner > sponsor > pro tier > default
export function getProfileTheme(
  teamRole: string | null | undefined,
  tier: SubscriptionTier,
  badges: UserBadge[]
): ProfileTheme {
  // Check team role first (highest priority)
  if (teamRole === 'core') return PROFILE_THEMES.core
  if (teamRole === 'speaker') return PROFILE_THEMES.speaker
  if (teamRole === 'partner') return PROFILE_THEMES.partner
  if (teamRole === 'sponsor') return PROFILE_THEMES.sponsor

  // Check for VIP badge
  const hasVipBadge = badges.some(b => b.badge?.slug === 'vip')
  if (hasVipBadge) return PROFILE_THEMES.vip

  // Check subscription tier
  if (tier === 'pro') return PROFILE_THEMES.pro

  return PROFILE_THEMES.default
}

interface UserStats {
  events: number
  matches: number
}

interface ProfileCardProps {
  user: User | null
  profile: UserProfile | null
  userCompany?: UserCompany | null
  userLinks?: UserLink[]
  userStats?: UserStats | null
  rank: UserRank
  theme: ProfileTheme
  onAvatarTap?: () => void
  onRankTap?: () => void
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  profile,
  userCompany,
  userLinks = [],
  userStats,
  rank,
  theme,
  onAvatarTap,
  onRankTap,
}) => {
  const rankInfo = RANK_LABELS[rank]

  if (!user) {
    return (
      <div className="bg-card rounded-card p-6 text-center">
        <p className="text-gray-500 text-sm">Профиль не найден</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${theme.headerGradient} p-6 text-center`}
    >
      {/* Avatar with themed ring and glow */}
      <div
        className="relative inline-block cursor-pointer"
        onClick={onAvatarTap}
        role={onAvatarTap ? 'button' : undefined}
        tabIndex={onAvatarTap ? 0 : undefined}
        onKeyDown={onAvatarTap ? (e) => e.key === 'Enter' && onAvatarTap() : undefined}
      >
        <div className={`rounded-full ${theme.avatarRing} ${theme.avatarGlow}`}>
          <Avatar
            src={profile?.photo_url}
            name={user.first_name || 'User'}
            size="xl"
            className="mx-auto"
          />
        </div>
        {/* Theme badge on avatar */}
        {theme.badge && (
          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${theme.badge.color} px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-bold whitespace-nowrap`}>
            {theme.badge.icon}
            {theme.badge.label}
          </div>
        )}
      </div>

      {/* User name */}
      <h1 className="text-xl font-bold mt-4">
        {user.first_name} {user.last_name}
      </h1>

      {/* Team Badge (if different from theme badge) */}
      {user.team_role && TEAM_BADGES[user.team_role] && !theme.badge && (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mt-2 ${TEAM_BADGES[user.team_role].color} text-white`}>
          <span>{TEAM_BADGES[user.team_role].icon}</span>
          <span>{TEAM_BADGES[user.team_role].label}</span>
        </div>
      )}

      {/* Occupation */}
      {profile?.occupation && (
        <p className={`${theme.accentColor} mt-1`}>{profile.occupation}</p>
      )}

      {/* Company inline */}
      {userCompany && <CompanyInline userCompany={userCompany} />}

      {/* City */}
      <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mt-1">
        <MapPin size={14} />
        {profile?.city || 'Не указан'}
      </p>

      {/* Social links inline */}
      {userLinks.length > 0 && (
        <div className="flex justify-center mt-3">
          <SocialLinks links={userLinks} compact showEmpty={false} />
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-center gap-8 mt-4">
        <div className="text-center">
          <div className="text-xl font-bold">{user.points || 0}</div>
          <div className="text-xs text-gray-400">XP</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{userStats?.events || 0}</div>
          <div className="text-xs text-gray-400">Событий</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{userStats?.matches || 0}</div>
          <div className="text-xs text-gray-400">Матчей</div>
        </div>
      </div>

      {/* Rank badge */}
      <div
        className="mt-4 cursor-pointer inline-block"
        onClick={onRankTap}
        role={onRankTap ? 'button' : undefined}
        tabIndex={onRankTap ? 0 : undefined}
        onKeyDown={onRankTap ? (e) => e.key === 'Enter' && onRankTap() : undefined}
      >
        <Badge variant="accent" className="text-sm flex items-center gap-1 justify-center">
          {RANK_ICONS[rank]}
          {rankInfo.ru}
        </Badge>
      </div>
    </motion.div>
  )
}

export default ProfileCard
