import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  MapPin,
  Crown,
  Star,
  Check,
  Edit3,
  Search,
  Dumbbell,
  Bell,
  Ticket,
  Heart,
  Trophy,
  Settings,
  Gift,
  MessageCircle,
  Shield,
  Award,
  Medal,
  ChevronRight,
  Save,
  X,
  Loader2,
  Smartphone,
  Users,
  ExternalLink,
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback, openTelegramLink, isHomeScreenSupported, addToHomeScreen } from '@/lib/telegram'
import { updateProfile, createProfile, getUnreadNotificationsCount, getTeamMembers, getUserBadges, getUserCompany, getUserLinks } from '@/lib/supabase'
import { Avatar, Badge, Button, Card, Input } from '@/components/ui'
import { BadgeGrid, BadgeDetail } from '@/components/BadgeGrid'
import { CompanyCard, CompanyInline } from '@/components/CompanyCard'
import { SocialLinks } from '@/components/SocialLinks'
import { RANK_LABELS, SUBSCRIPTION_LIMITS, SubscriptionTier, UserRank, TEAM_BADGES, TeamRole, UserBadge } from '@/types'
import { useTapEasterEgg, useSecretCode } from '@/lib/easterEggs'
import NotificationsScreen from './NotificationsScreen'

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
type ProfileTheme = {
  headerGradient: string
  avatarRing: string
  avatarGlow: string
  accentColor: string
  badge?: { icon: React.ReactNode; label: string; color: string }
}

const PROFILE_THEMES: Record<string, ProfileTheme> = {
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
function getProfileTheme(
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

const ProfileScreen: React.FC = () => {
  const { user, profile, getRank, getSubscriptionTier, setActiveTab, setProfile } = useAppStore()
  const { addToast } = useToastStore()

  const [isEditing, setIsEditing] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTeamSection, setShowTeamSection] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  // Easter eggs (tap-based)
  const { handleTap: handleAvatarTap } = useTapEasterEgg('avatar_taps', 5)
  const { handleTap: handleRankTap } = useTapEasterEgg('rank_taps', 10)
  const { handleTap: handleDebugTap, isUnlocked: debugUnlocked } = useTapEasterEgg('debug_console', 7, () => setShowDebug(true))

  // Fetch unread notifications count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount', user?.id],
    queryFn: () => (user ? getUnreadNotificationsCount(user.id) : 0),
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch team members
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembers,
    staleTime: 300000, // 5 minutes
  })

  // Fetch user badges
  const { data: userBadges = [] } = useQuery({
    queryKey: ['userBadges', user?.id],
    queryFn: () => (user ? getUserBadges(user.id) : []),
    enabled: !!user,
    staleTime: 60000,
  })

  // Fetch user company
  const { data: userCompany } = useQuery({
    queryKey: ['userCompany', user?.id],
    queryFn: () => (user ? getUserCompany(user.id) : null),
    enabled: !!user,
    staleTime: 60000,
  })

  // Fetch user links
  const { data: userLinks = [] } = useQuery({
    queryKey: ['userLinks', user?.id],
    queryFn: () => (user ? getUserLinks(user.id) : []),
    enabled: !!user,
    staleTime: 60000,
  })

  // Selected badge for detail popup
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null)

  // Edit form state
  const [editForm, setEditForm] = useState({
    bio: profile?.bio || '',
    occupation: profile?.occupation || '',
    city: profile?.city || 'Минск',
    looking_for: profile?.looking_for || '',
    can_help_with: profile?.can_help_with || '',
  })

  // Secret code easter egg - triggers when user types "MAIN" in bio
  useSecretCode('MAIN', editForm.bio, () => {
    // Easter egg unlocked - toast is shown by the hook
  })

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      hapticFeedback.medium()

      let updatedProfile
      if (profile) {
        // Update existing profile
        updatedProfile = await updateProfile(user.id, editForm)
      } else {
        // Create new profile
        updatedProfile = await createProfile(user.id, {
          ...editForm,
          city: editForm.city || 'Минск',
        })
      }

      setProfile(updatedProfile)
      setIsEditing(false)
      hapticFeedback.success()
      addToast('Профиль сохранён!', 'success')
    } catch (error) {
      console.error('Save profile error:', error)
      hapticFeedback.error()
      addToast('Ошибка сохранения', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const rank = getRank()
  const rankInfo = RANK_LABELS[rank]
  const tier = getSubscriptionTier()
  const limits = SUBSCRIPTION_LIMITS[tier]

  // Get profile theme based on role/tier/badges
  const theme = getProfileTheme(user?.team_role, tier, userBadges)

  // Subscription plans
  const plans: { tier: SubscriptionTier; name: string; price: string; features: string[] }[] = [
    {
      tier: 'free',
      name: 'Free',
      price: 'Бесплатно',
      features: ['5 свайпов в день', 'Базовый профиль', 'Доступ к событиям'],
    },
    {
      tier: 'light',
      name: 'Light',
      price: '$5/мес',
      features: ['20 свайпов в день', 'Видеть кто лайкнул', '1 суперлайк в день', 'Расширенные фильтры'],
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: '$15/мес',
      features: [
        'Безлимит свайпов',
        'Видеть кто лайкнул',
        '5 суперлайков в день',
        'Приоритет в ленте',
        'VIP бейдж',
        'Расширенные фильтры',
      ],
    },
  ]

  // Edit Profile Screen
  if (isEditing) {
    return (
      <div className="pb-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bg-card">
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-400 flex items-center gap-2"
          >
            <X size={20} />
          </button>
          <h1 className="font-semibold">Редактировать профиль</h1>
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="text-accent flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          </button>
        </div>

        {/* Photo */}
        <div className="p-6 text-center">
          <div className="relative inline-block">
            <Avatar
              src={profile?.photo_url}
              name={user?.first_name || 'User'}
              size="xl"
              className="mx-auto"
            />
            {profile?.photo_url && (
              <div className="absolute bottom-0 right-0 bg-accent text-bg p-1.5 rounded-full">
                <Check size={14} />
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Фото подтягивается из Telegram автоматически
          </p>
        </div>

        {/* Form */}
        <div className="px-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Профессия / Должность</label>
            <Input
              value={editForm.occupation}
              onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
              placeholder="Например: Founder & CEO"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Город</label>
            <Input
              value={editForm.city}
              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              placeholder="Минск"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">О себе</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Расскажите о себе..."
              className="w-full bg-bg-card rounded-xl p-3 text-white placeholder-gray-500 border border-transparent focus:border-accent focus:outline-none min-h-[100px] resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
              <Search size={14} />
              Что ищете
            </label>
            <textarea
              value={editForm.looking_for}
              onChange={(e) => setEditForm({ ...editForm, looking_for: e.target.value })}
              placeholder="Партнёры, инвесторы, клиенты..."
              className="w-full bg-bg-card rounded-xl p-3 text-white placeholder-gray-500 border border-transparent focus:border-accent focus:outline-none min-h-[80px] resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
              <Dumbbell size={14} />
              Чем можете помочь
            </label>
            <textarea
              value={editForm.can_help_with}
              onChange={(e) => setEditForm({ ...editForm, can_help_with: e.target.value })}
              placeholder="Ваши навыки и экспертиза..."
              className="w-full bg-bg-card rounded-xl p-3 text-white placeholder-gray-500 border border-transparent focus:border-accent focus:outline-none min-h-[80px] resize-none"
            />
          </div>

          <Button
            fullWidth
            onClick={handleSaveProfile}
            disabled={isSaving}
            icon={isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
    )
  }

  if (showSubscription) {
    return (
      <div className="pb-6">
        <button onClick={() => setShowSubscription(false)} className="p-4 text-gray-400 flex items-center gap-2">
          <ArrowLeft size={16} />
          Назад
        </button>

        <div className="px-4">
          <h1 className="text-2xl font-bold mb-2">Подписка</h1>
          <p className="text-gray-400 text-sm mb-6">Выберите план для расширения возможностей</p>

          <div className="space-y-4">
            {plans.map((plan) => (
              <Card
                key={plan.tier}
                highlighted={tier === plan.tier}
                className={plan.tier === 'pro' ? 'bg-gradient-to-br from-accent/20 to-bg-card' : ''}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{plan.name}</span>
                      {plan.tier === 'pro' && <Crown size={18} className="text-accent" />}
                      {plan.tier === 'light' && <Star size={18} className="text-yellow-400" />}
                    </div>
                    <div className="text-accent font-semibold">{plan.price}</div>
                  </div>
                  {tier === plan.tier && <Badge variant="accent">Текущий</Badge>}
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-accent" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier !== plan.tier && plan.tier !== 'free' && (
                  <Button fullWidth variant={plan.tier === 'pro' ? 'primary' : 'secondary'}>
                    Выбрать {plan.name}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Notifications Screen
  if (showNotifications) {
    return <NotificationsScreen onClose={() => setShowNotifications(false)} />
  }

  // Team Section
  if (showTeamSection) {
    return (
      <div className="pb-6">
        <button onClick={() => setShowTeamSection(false)} className="p-4 text-gray-400 flex items-center gap-2">
          <ArrowLeft size={16} />
          Назад
        </button>

        <div className="px-4">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            💎 Команда MAIN
          </h1>
          <p className="text-gray-400 text-sm mb-6">Люди, которые делают сообщество лучше</p>

          {teamMembers.length === 0 ? (
            <Card className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400">Команда ещё формируется</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member: any) => {
                const role = member.team_role as Exclude<TeamRole, null>
                const badge = TEAM_BADGES[role]
                const profileData = Array.isArray(member.profile) ? member.profile[0] : member.profile

                return (
                  <Card key={member.id} className="flex items-center gap-3">
                    <Avatar
                      src={profileData?.photo_url}
                      name={member.first_name || 'User'}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {member.first_name} {member.last_name}
                      </div>
                      {profileData?.occupation && (
                        <div className="text-sm text-gray-400 truncate">{profileData.occupation}</div>
                      )}
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${badge?.color || 'bg-gray-500'} text-white`}>
                        <span>{badge?.icon}</span>
                        <span>{badge?.label}</span>
                      </div>
                    </div>
                    {member.username && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openTelegramLink(`https://t.me/${member.username}`)}
                      >
                        <ExternalLink size={14} />
                      </Button>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Header with themed gradient background */}
      <div className={`${theme.headerGradient} p-6 text-center`}>
        {/* Avatar with themed ring and glow - tap 5 times for easter egg */}
        <div className="relative inline-block cursor-pointer" onClick={handleAvatarTap}>
          <div className={`rounded-full ${theme.avatarRing} ${theme.avatarGlow}`}>
            <Avatar
              src={profile?.photo_url}
              name={user?.first_name || 'User'}
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

        <h1 className="text-xl font-bold mt-4">
          {user?.first_name} {user?.last_name}
        </h1>

        {/* Team Badge (if different from theme badge) */}
        {user?.team_role && TEAM_BADGES[user.team_role] && !theme.badge && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mt-2 ${TEAM_BADGES[user.team_role].color} text-white`}>
            <span>{TEAM_BADGES[user.team_role].icon}</span>
            <span>{TEAM_BADGES[user.team_role].label}</span>
          </div>
        )}

        {profile?.occupation && <p className={`${theme.accentColor} mt-1`}>{profile.occupation}</p>}

        {/* Company inline */}
        {userCompany && <CompanyInline userCompany={userCompany} />}

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
            <div className="text-xl font-bold">{user?.points || 0}</div>
            <div className="text-xs text-gray-400">XP</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">0</div>
            <div className="text-xs text-gray-400">Событий</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">0</div>
            <div className="text-xs text-gray-400">Матчей</div>
          </div>
        </div>

        {/* Rank badge - tap 10 times for easter egg */}
        <div className="mt-4 cursor-pointer" onClick={handleRankTap}>
          <Badge variant="accent" className="text-sm flex items-center gap-1 justify-center">
            {RANK_ICONS[rank]}
            {rankInfo.ru}
          </Badge>
        </div>
      </div>

      {/* Debug Console (hidden, activated by 7 taps on version) */}
      {showDebug && (
        <div className="mx-4 mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-yellow-400 font-mono text-sm">🔧 Debug Console</span>
            <button onClick={() => setShowDebug(false)} className="text-gray-400">
              <X size={16} />
            </button>
          </div>
          <div className="text-xs text-gray-400 font-mono space-y-1">
            <div>user.id: {user?.id}</div>
            <div>tg_user_id: {user?.tg_user_id}</div>
            <div>username: @{user?.username}</div>
            <div>points: {user?.points}</div>
            <div>rank: {rank}</div>
            <div>tier: {tier}</div>
            <div>profile.id: {profile?.id}</div>
            <div>team_role: {user?.team_role || 'none'}</div>
          </div>
        </div>
      )}

      <div className="px-4">
        {/* Edit Profile Button */}
        <Button
          fullWidth
          variant="secondary"
          icon={<Edit3 size={16} />}
          className="mb-6"
          onClick={() => {
            // Reset form with current profile data
            setEditForm({
              bio: profile?.bio || '',
              occupation: profile?.occupation || '',
              city: profile?.city || 'Минск',
              looking_for: profile?.looking_for || '',
              can_help_with: profile?.can_help_with || '',
            })
            setIsEditing(true)
          }}
        >
          Редактировать профиль
        </Button>

        {/* Profile Info Cards */}
        {profile?.bio && (
          <Card className="mb-4">
            <h3 className="text-sm text-gray-400 mb-2">О себе</h3>
            <p>{profile.bio}</p>
          </Card>
        )}

        {profile?.looking_for && (
          <Card className="mb-4">
            <h3 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <Search size={14} />
              Ищу
            </h3>
            <p>{profile.looking_for}</p>
          </Card>
        )}

        {profile?.can_help_with && (
          <Card className="mb-4">
            <h3 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <Dumbbell size={14} />
              Могу помочь
            </h3>
            <p>{profile.can_help_with}</p>
          </Card>
        )}

        {/* Badges */}
        {userBadges.length > 0 && (
          <div className="mb-4">
            <BadgeGrid
              badges={userBadges}
              onBadgeClick={(badge) => setSelectedBadge(badge)}
            />
          </div>
        )}

        {/* Company card (full) */}
        {userCompany && (
          <div className="mb-4">
            <CompanyCard userCompany={userCompany} />
          </div>
        )}

        {/* Social links (full) */}
        {userLinks.length > 0 && (
          <div className="mb-4">
            <SocialLinks links={userLinks} />
          </div>
        )}

        {/* Menu */}
        <Card className="mb-4 p-0 overflow-hidden">
          {[
            { icon: <Bell size={20} className="text-blue-400" />, label: 'Уведомления', badge: unreadCount > 0 ? unreadCount : null, onClick: () => setShowNotifications(true) },
            { icon: <Users size={20} className="text-accent" />, label: 'Команда MAIN', badge: teamMembers.length > 0 ? teamMembers.length : null, onClick: () => setShowTeamSection(true) },
            { icon: <Ticket size={20} className="text-purple-400" />, label: 'Мои билеты', badge: null, onClick: () => setActiveTab('events') },
            { icon: <Heart size={20} className="text-pink-400" />, label: 'Мои матчи', badge: null, onClick: () => setActiveTab('network') },
            { icon: <Trophy size={20} className="text-yellow-400" />, label: 'Достижения', badge: null, onClick: () => setActiveTab('achievements') },
            { icon: <Settings size={20} className="text-gray-400" />, label: 'Настройки', badge: null, onClick: () => {} },
          ].map((item, i, arr) => (
            <motion.div
              key={item.label}
              whileTap={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={item.onClick}
              className={`
                flex items-center px-4 py-3.5 cursor-pointer
                ${i < arr.length - 1 ? 'border-b border-bg' : ''}
              `}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && <Badge variant="accent">{item.badge}</Badge>}
              <ChevronRight size={16} className="text-gray-500 ml-2" />
            </motion.div>
          ))}
        </Card>

        {/* Subscription Card */}
        <Card
          onClick={() => setShowSubscription(true)}
          className={`
            mb-4
            ${tier === 'pro' ? 'bg-gradient-to-r from-accent/20 to-success/20 border border-accent/30' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center">
              {tier === 'pro' ? (
                <Crown size={24} className="text-accent" />
              ) : tier === 'light' ? (
                <Star size={24} className="text-yellow-400" />
              ) : (
                <Shield size={24} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className={tier !== 'free' ? 'text-accent font-semibold' : 'font-semibold'}>
                {tier === 'pro' ? 'Pro Member' : tier === 'light' ? 'Light Member' : 'Free'}
              </div>
              <div className="text-xs text-gray-400">
                {tier === 'free' ? 'Обновите для больших возможностей' : 'Нажмите для управления'}
              </div>
            </div>
            {tier === 'free' && (
              <Button size="sm" variant="primary">
                Улучшить
              </Button>
            )}
          </div>
        </Card>

        {/* Invite Friends */}
        <Card className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
              <Gift size={24} className="text-pink-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Пригласи друга</div>
              <div className="text-xs text-gray-400">Получи +30 XP за каждого друга</div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => {
              hapticFeedback.medium()
              addToast('Ссылка скопирована!', 'success')
            }}>
              Поделиться
            </Button>
          </div>
        </Card>

        {/* Add to Home Screen */}
        {isHomeScreenSupported() && (
          <Card className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Smartphone size={24} className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Добавить на экран</div>
                <div className="text-xs text-gray-400">Быстрый доступ с главного экрана</div>
              </div>
              <Button size="sm" variant="primary" onClick={() => {
                hapticFeedback.medium()
                addToHomeScreen()
                addToast('Добавление на экран...', 'success')
              }}>
                Добавить
              </Button>
            </div>
          </Card>
        )}

        {/* Support */}
        <button
          className="w-full text-center text-gray-400 py-4 flex items-center justify-center gap-2"
          onClick={() => openTelegramLink('https://t.me/yana_martynen')}
        >
          <MessageCircle size={16} />
          Связаться с поддержкой
        </button>

        {/* Version - tap 7 times for debug console */}
        <p
          className="text-center text-gray-600 text-xs mt-4 cursor-pointer select-none"
          onClick={handleDebugTap}
        >
          MAIN Community v1.0.0
        </p>
      </div>

      {/* Badge detail popup */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeDetail
            badge={selectedBadge}
            onClose={() => setSelectedBadge(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfileScreen
