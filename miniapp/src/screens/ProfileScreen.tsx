import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  Palette,
  Diamond,
  HeartHandshake,
  Mic2,
  Flame,
  Sprout,
  User,
  UserPlus,
  Wrench,
  Flag,
  GraduationCap,
  EyeOff,
  BookOpen,
  Share2,
  QrCode,
  Globe,
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { APP_VERSION } from '@/lib/version'
import { hapticFeedback, openTelegramLink, isHomeScreenSupported, addToHomeScreen, requestNotificationPermission, checkNotificationPermission, isCloudNotificationsSupported, backButton, shareUrl } from '@/lib/telegram'
import { updateProfile, createProfile, updateProfileVisibility, getUnreadNotificationsCount, getTeamMembers, getUserBadges, getUserCompany, getUserLinks, getUserStats, getUserAvailableSkins, setUserActiveSkin, getUserById, getProfilePhotos, uploadProfilePhoto, deleteProfilePhoto, addXP, hasReceivedXPBonus, checkProfileCompletionRewards, trackShare } from '@/lib/supabase'
import { Avatar, AvatarWithSkin, Badge, Button, Card, Input, SkinPreview } from '@/components/ui'
import { Crown as CrownIcon, Star as StarIcon, Shield as ShieldIcon, Gift as GiftIcon, Smartphone as SmartphoneIcon, MessageCircle as MessageCircleIcon, MoreVertical, Edit3 as Edit3Icon, Settings as SettingsIcon, LogOut, Bell as BellIcon, Users as UsersIcon, Eye, EyeOff as EyeOffIcon, Lock, Unlock, Zap, Trophy as TrophyIcon, Heart as HeartIcon, MapPin as MapPinIcon, Share as ShareIcon, Copy, Check as CheckIcon, X as XIcon, Search as SearchIcon, Dumbbell as DumbbellIcon, Palette as PaletteIcon, Diamond as DiamondIcon, HeartHandshake as HeartHandshakeIcon, Mic2 as Mic2Icon, Ticket as TicketIcon, BookOpen as BookOpenIcon, ChevronRight as ChevronRightIcon } from '@/components/Icons'
import { AdminSettingsPanel } from '@/components/AdminSettingsPanel'
import { SubscriptionBottomSheet } from '@/components/SubscriptionBottomSheet'
import { BadgeGrid, BadgeDetail } from '@/components/BadgeGrid'
import { CompanyCard, CompanyInline } from '@/components/CompanyCard'
import { CompanySelector } from '@/components/CompanySelector'
import { SocialLinks } from '@/components/SocialLinks'
import { SocialLinksEdit } from '@/components/SocialLinksEdit'
import { NetworkingGuide } from '@/components/NetworkingGuide'
import SkinAdminPanel from '@/components/SkinAdminPanel'
import { TagInput } from '@/components/TagInput'
import { PhotoUploader } from '@/components/PhotoUploader'
import { QRShareModal } from '@/components/QRShareModal'
import type { ProfilePhoto } from '@/types'
import { RANK_LABELS, SUBSCRIPTION_LIMITS, SubscriptionTier, UserRank, TEAM_BADGES, TeamRole, UserBadge, AvatarSkin, UserAvatarSkin, XP_REWARDS } from '@/types'
import { useTapEasterEgg, useSecretCode } from '@/lib/easterEggs'
import NotificationsScreen from './NotificationsScreen'
import WebLoginScreen from './WebLoginScreen'
import { ChangelogSheet } from '@/components/ChangelogSheet'
import { ProfilePreviewCard } from '@/components/ProfilePreviewCard'

// Icon mapping for ranks
const RANK_ICONS: Record<UserRank, React.ReactNode> = {
  newcomer: <Sprout size={14} className="text-green-400" />,
  member: <User size={14} className="text-gray-400" />,
  activist: <UserPlus size={14} className="text-blue-400" />,
  enthusiast: <Flame size={14} className="text-orange-400" />,
  contributor: <Wrench size={14} className="text-purple-400" />,
  ambassador: <Flag size={14} className="text-pink-400" />,
  expert: <GraduationCap size={14} className="text-cyan-400" />,
  leader: <Star size={14} className="text-yellow-400" />,
  founder: <Crown size={14} className="text-accent" />,
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
  const { user, profile, getRank, getSubscriptionTier, setActiveTab, setProfile, setShowInvites, setUser, addPoints } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [isEditing, setIsEditing] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTeamSection, setShowTeamSection] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWebLogin, setShowWebLogin] = useState(false)
  const [showSkinSelector, setShowSkinSelector] = useState(false)
  const [showSkinAdmin, setShowSkinAdmin] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showNetworkingGuide, setShowNetworkingGuide] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [skinSaving, setSkinSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [uploadingPosition, setUploadingPosition] = useState<number | null>(null)
  const [showProfileQR, setShowProfileQR] = useState(false)

  // Determine which sub-screen is active for back button
  const activeSubScreen = showNotifications ? 'notifications' :
    showTeamSection ? 'team' :
    showSettings ? 'settings' :
    showWebLogin ? 'weblogin' :
    showSkinSelector ? 'skin' :
    showSkinAdmin ? 'skinAdmin' :
    showAdminPanel ? 'admin' :
    showNetworkingGuide ? 'guide' :
    showDebug ? 'debug' :
    isEditing ? 'editing' : null

  // Handle Telegram BackButton
  const handleBack = useCallback(() => {
    if (showNotifications) setShowNotifications(false)
    else if (showTeamSection) setShowTeamSection(false)
    else if (showSettings) setShowSettings(false)
    else if (showWebLogin) setShowWebLogin(false)
    else if (showSkinSelector) setShowSkinSelector(false)
    else if (showSkinAdmin) setShowSkinAdmin(false)
    else if (showAdminPanel) setShowAdminPanel(false)
    else if (showNetworkingGuide) setShowNetworkingGuide(false)
    else if (showDebug) setShowDebug(false)
    else if (isEditing) setIsEditing(false)
  }, [showNotifications, showTeamSection, showSettings, showWebLogin, showSkinSelector, showSkinAdmin, showAdminPanel, showNetworkingGuide, showDebug, isEditing])

  useEffect(() => {
    if (activeSubScreen) {
      backButton.show(handleBack)
    } else {
      backButton.hide()
    }
    return () => {
      backButton.hide()
    }
  }, [activeSubScreen, handleBack])

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

  // Fresh user data query to avoid stale store issues
  const { data: freshUser } = useQuery({
    queryKey: ['freshUser', user?.id],
    queryFn: () => (user ? getUserById(user.id) : null),
    enabled: !!user,
    staleTime: 30000,
  })

  // Synchronize store when fresh data arrives
  React.useEffect(() => {
    if (freshUser && (freshUser.team_role !== user?.team_role || freshUser.points !== user?.points || freshUser.subscription_tier !== user?.subscription_tier)) {
      setUser(freshUser as any)
    }
  }, [freshUser, user, setUser])

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

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => (user ? getUserStats(user.id) : null),
    enabled: !!user,
    staleTime: 60000,
  })

  // Fetch user's available skins
  const { data: userSkins = [], refetch: refetchSkins } = useQuery({
    queryKey: ['userSkins', user?.id],
    queryFn: () => (user ? getUserAvailableSkins(user.id) : []),
    enabled: !!user,
    staleTime: 60000,
  })

  // Fetch user's profile photos
  const { data: profilePhotos = [], refetch: refetchPhotos } = useQuery({
    queryKey: ['profilePhotos', user?.id],
    queryFn: () => (user ? getProfilePhotos(user.id) : []),
    enabled: !!user,
    staleTime: 30000,
  })

  // Get active skin from user's skins
  const activeSkin = userSkins.find(s => s.is_active_skin)?.skin || null

  // Selected badge for detail popup
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null)

  // Edit form state
  const [editForm, setEditForm] = useState({
    bio: profile?.bio || '',
    occupation: profile?.occupation || '',
    city: profile?.city || 'Минск',
    looking_for: profile?.looking_for || '',
    can_help_with: profile?.can_help_with || '',
    skills: profile?.skills || [],
    interests: profile?.interests || [],
  })

  // Secret code easter egg - triggers when user types "MAIN" in bio
  useSecretCode('MAIN', editForm.bio, () => {
    // Easter egg unlocked - toast is shown by the hook
  })

  // Validate profile fields before saving
  const validateProfileFields = (): string | null => {
    // Bio validation (max 500 chars)
    if (editForm.bio.length > 500) {
      return 'Био должно быть не более 500 символов'
    }

    // Occupation validation (max 100 chars)
    if (editForm.occupation.length > 100) {
      return 'Профессия должна быть не более 100 символов'
    }

    // Skills validation (max 10 tags, each max 30 chars)
    if (editForm.skills.length > 10) {
      return 'Максимум 10 навыков'
    }
    const invalidSkill = editForm.skills.find(s => s.length > 30)
    if (invalidSkill) {
      return 'Каждый навык не более 30 символов'
    }

    // Interests validation (max 10 tags, each max 30 chars)
    if (editForm.interests.length > 10) {
      return 'Максимум 10 интересов'
    }
    const invalidInterest = editForm.interests.find(i => i.length > 30)
    if (invalidInterest) {
      return 'Каждый интерес не более 30 символов'
    }

    return null
  }

  const handleSaveProfile = async () => {
    if (!user) return

    // Validate fields before saving
    const validationError = validateProfileFields()
    if (validationError) {
      hapticFeedback.error()
      addToast(validationError, 'error')
      return
    }

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

      // Check and award profile field completion XP (first time for each field)
      try {
        const { awarded } = await checkProfileCompletionRewards(user.id, editForm, profile)
        if (awarded.length > 0) {
          const totalXP = awarded.reduce((sum, a) => sum + a.xp, 0)
          addPoints(totalXP)

          // Show appropriate toast
          if (awarded.some(a => a.field === 'complete_bonus')) {
            addToast(`Полный профиль! +${totalXP} XP`, 'xp', totalXP)
          } else if (awarded.length === 1) {
            const fieldNames: Record<string, string> = {
              photo: 'Фото',
              bio: 'Био',
              occupation: 'Профессия',
              city: 'Город',
              linkedin: 'LinkedIn',
              skills: 'Навыки',
              interests: 'Интересы',
            }
            addToast(`${fieldNames[awarded[0].field] || 'Поле'} добавлено! +${awarded[0].xp} XP`, 'xp', awarded[0].xp)
          } else {
            addToast(`Профиль обновлён! +${totalXP} XP`, 'xp', totalXP)
          }
          return // Don't show regular success toast
        }
      } catch (e) {
        console.warn('Failed to check/award profile completion XP:', e)
      }

      addToast('Профиль сохранён!', 'success')
    } catch (error: any) {
      console.error('Profile save error:', error)
      const errorMsg = error?.message || error?.code || JSON.stringify(error)
      hapticFeedback.error()
      addToast(`Ошибка: ${errorMsg}`, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Photo upload handler
  const handlePhotoUpload = async (file: File, position: number) => {
    if (!user) return

    setIsUploadingPhoto(true)
    setUploadingPosition(position)

    try {
      hapticFeedback.medium()
      const result = await uploadProfilePhoto(user.id, file, position)

      if (result.success) {
        await refetchPhotos()
        // Update profile photo_url if this is primary
        if (position === 0 && result.photo) {
          setProfile({ ...profile!, photo_url: result.photo.photo_url })
        }
        hapticFeedback.success()
        addToast('Фото загружено!', 'success')
      } else {
        hapticFeedback.error()
        addToast(result.error || 'Ошибка загрузки', 'error')
      }
    } catch (error) {
      console.error('Photo upload error:', error)
      hapticFeedback.error()
      addToast('Ошибка загрузки фото', 'error')
    } finally {
      setIsUploadingPhoto(false)
      setUploadingPosition(null)
    }
  }

  // Photo delete handler
  const handlePhotoDelete = async (photoId: string) => {
    if (!user) return

    try {
      hapticFeedback.medium()
      const success = await deleteProfilePhoto(photoId)

      if (success) {
        await refetchPhotos()
        // Refresh profile to get updated photo_url
        const updatedPhotos = await getProfilePhotos(user.id)
        const primaryPhoto = updatedPhotos.find(p => p.is_primary)
        if (profile) {
          setProfile({ ...profile, photo_url: primaryPhoto?.photo_url || null })
        }
        hapticFeedback.success()
        addToast('Фото удалено', 'success')
      } else {
        hapticFeedback.error()
        addToast('Ошибка удаления', 'error')
      }
    } catch (error) {
      console.error('Photo delete error:', error)
      hapticFeedback.error()
      addToast('Ошибка удаления фото', 'error')
    }
  }

  const rank = getRank()
  const rankInfo = RANK_LABELS[rank]
  const tier = getSubscriptionTier()
  const limits = SUBSCRIPTION_LIMITS[tier]

  // Get profile theme based on role/tier/badges
  const theme = getProfileTheme(user?.team_role, tier, userBadges)

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

        {/* Photo Upload */}
        <div className="p-4">
          <PhotoUploader
            photos={profilePhotos}
            maxPhotos={3}
            onPhotoUpload={handlePhotoUpload}
            onPhotoDelete={handlePhotoDelete}
            isUploading={isUploadingPhoto}
            uploadingPosition={uploadingPosition}
          />
        </div>

        {/* Form */}
        <div className="px-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Профессия / Должность</label>
            <Input
              value={editForm.occupation}
              onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value.slice(0, 100) })}
              placeholder="Например: Founder & CEO"
              maxLength={100}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${editForm.occupation.length >= 90 ? 'text-yellow-400' : 'text-gray-500'} ${editForm.occupation.length >= 100 ? 'text-danger' : ''}`}>
                {editForm.occupation.length}/100
              </span>
            </div>
          </div>

          {/* Company Selector */}
          {user && (
            <CompanySelector
              userId={user.id}
              userCompany={userCompany || null}
              onCompanyChange={(updatedCompany) => {
                queryClient.setQueryData(['userCompany', user.id], updatedCompany)
              }}
            />
          )}

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
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value.slice(0, 500) })}
              placeholder="Расскажите о себе..."
              maxLength={500}
              className="w-full bg-bg-card rounded-xl p-3 text-white placeholder-gray-500 border border-transparent focus:border-accent focus:outline-none min-h-[100px] resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${editForm.bio.length >= 450 ? 'text-yellow-400' : 'text-gray-500'} ${editForm.bio.length >= 500 ? 'text-danger' : ''}`}>
                {editForm.bio.length}/500
              </span>
            </div>
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

          {/* Skills */}
          <TagInput
            tags={editForm.skills}
            onTagsChange={(skills) => setEditForm({ ...editForm, skills })}
            label="Навыки"
            placeholder="Добавить навык..."
            maxTags={10}
            maxTagLength={30}
          />

          {/* Interests */}
          <TagInput
            tags={editForm.interests}
            onTagsChange={(interests) => setEditForm({ ...editForm, interests })}
            label="Интересы"
            placeholder="Добавить интерес..."
            maxTags={10}
            maxTagLength={30}
          />

          {/* Social Links */}
          {user && (
            <SocialLinksEdit
              userId={user.id}
              links={userLinks}
              onLinksChange={(updatedLinks) => {
                queryClient.setQueryData(['userLinks', user.id], updatedLinks)
              }}
            />
          )}

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

  // Notifications Screen
  if (showNotifications) {
    return <NotificationsScreen onClose={() => setShowNotifications(false)} />
  }

  // Web Login Screen
  if (showWebLogin) {
    return <WebLoginScreen onBack={() => setShowWebLogin(false)} />
  }

  // Settings Screen
  // Networking Guide
  if (showNetworkingGuide) {
    return <NetworkingGuide onClose={() => setShowNetworkingGuide(false)} />
  }

  if (showAdminPanel) {
    return <AdminSettingsPanel onClose={() => setShowAdminPanel(false)} />
  }

  if (showSettings) {
    const handleEnableNotifications = async () => {
      setNotificationsLoading(true)
      hapticFeedback.medium()

      try {
        const granted = await requestNotificationPermission()
        if (granted) {
          setNotificationsEnabled(true)
          addToast('Уведомления включены!', 'success')
          hapticFeedback.success()
        } else {
          addToast('Не удалось включить уведомления', 'error')
          hapticFeedback.error()
        }
      } catch (error) {
        console.error('Failed to enable notifications:', error)
        addToast('Ошибка при включении уведомлений', 'error')
      } finally {
        setNotificationsLoading(false)
      }
    }

    return (
      <div className="pb-6">
        <div className="px-4 pt-4">
          {/* Themed Avatar and Name in Settings */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <AvatarWithSkin
                src={profile?.photo_url}
                name={user?.first_name || 'User'}
                size="xl"
                skin={activeSkin}
                role={user?.team_role}
                tier={user?.subscription_tier === 'pro' ? 'pro' : user?.subscription_tier === 'light' ? 'light' : null}
                className="mx-auto"
              />
            </div>
            <h2 className="text-xl font-bold mt-4">
              {user?.first_name} {user?.last_name}
            </h2>
            <p className="text-gray-400 text-sm mt-1">Настройки профиля</p>
          </div>

          {/* Notifications Section */}
          <Card className="mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Bell size={18} className="text-blue-400" />
              Push-уведомления
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Получайте уведомления о новых матчах, событиях и достижениях
            </p>

            {isCloudNotificationsSupported() ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-bg rounded-xl">
                  <div className="flex items-center gap-3">
                    <Heart size={18} className="text-pink-400" />
                    <span className="text-sm">Новые матчи</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full ${notificationsEnabled ? 'bg-accent' : 'bg-gray-600'} relative transition-colors`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notificationsEnabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-bg rounded-xl">
                  <div className="flex items-center gap-3">
                    <Ticket size={18} className="text-purple-400" />
                    <span className="text-sm">Напоминания о событиях</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full ${notificationsEnabled ? 'bg-accent' : 'bg-gray-600'} relative transition-colors`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notificationsEnabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-bg rounded-xl">
                  <div className="flex items-center gap-3">
                    <Trophy size={18} className="text-yellow-400" />
                    <span className="text-sm">Новые достижения</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full ${notificationsEnabled ? 'bg-accent' : 'bg-gray-600'} relative transition-colors`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notificationsEnabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                  </div>
                </div>

                {!notificationsEnabled && (
                  <Button
                    fullWidth
                    onClick={handleEnableNotifications}
                    isLoading={notificationsLoading}
                    className="mt-4"
                  >
                    <Bell size={18} />
                    Включить уведомления
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-4 bg-bg rounded-xl">
                <Bell size={32} className="mx-auto text-gray-500 mb-2" />
                <p className="text-sm text-gray-400">
                  Push-уведомления требуют Telegram 8.0+
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Обновите приложение Telegram
                </p>
              </div>
            )}
          </Card>

          {/* Networking Visibility */}
          <Card className="mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users size={18} className="text-accent" />
              Нетворкинг
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Управляйте видимостью вашего профиля в ленте свайпов
            </p>
            <div
              className="flex items-center justify-between p-3 bg-bg rounded-xl cursor-pointer"
              onClick={async () => {
                if (!user || !profile) return
                hapticFeedback.medium()
                try {
                  const newVisibility = !profile.is_visible
                  await updateProfileVisibility(user.id, newVisibility)
                  setProfile({ ...profile, is_visible: newVisibility })
                  addToast(newVisibility ? 'Профиль виден в свайпах' : 'Профиль скрыт из свайпов', 'success')
                  hapticFeedback.success()
                } catch (error) {
                  console.error('Failed to update visibility:', error)
                  addToast('Ошибка сохранения', 'error')
                  hapticFeedback.error()
                }
              }}
            >
              <div className="flex items-center gap-3">
                <EyeOff size={18} className="text-gray-400" />
                <div>
                  <span className="text-sm">Скрыть для нетворкинга</span>
                  <p className="text-xs text-gray-500">Профиль не будет показываться в свайпах</p>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full ${!profile?.is_visible ? 'bg-accent' : 'bg-gray-600'} relative transition-colors`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${!profile?.is_visible ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
              </div>
            </div>

            <button
              onClick={() => {
                hapticFeedback.light()
                setShowNetworkingGuide(true)
              }}
              className="w-full flex items-center justify-between p-3 bg-bg rounded-xl mt-3"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-accent" />
                <span className="text-sm">Как работает нетворкинг</span>
              </div>
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </Card>

          {/* Web Login */}
          <Card className="mb-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Globe size={18} className="text-blue-400" />
              Войти на сайт
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Подтвердите вход на maincombybot.vercel.app с помощью кода
            </p>
            <Button fullWidth variant="secondary" onClick={() => setShowWebLogin(true)}>
              <Globe size={18} />
              Ввести код
            </Button>
          </Card>

          {/* Add to Home Screen */}
          {isHomeScreenSupported() && (
            <Card className="mb-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Smartphone size={18} className="text-accent" />
                Быстрый доступ
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Добавьте приложение на главный экран для быстрого запуска
              </p>
              <Button fullWidth variant="secondary" onClick={addToHomeScreen}>
                <Smartphone size={18} />
                Добавить на экран
              </Button>
            </Card>
          )}

          {/* App Info */}
          <Card>
            <h3 className="font-semibold mb-3">О приложении</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <button
                onClick={() => setShowChangelog(true)}
                className="flex justify-between items-center w-full hover:text-white transition-colors"
              >
                <span>Версия</span>
                <span className="flex items-center gap-1">
                  {APP_VERSION}
                  <ChevronRight size={14} />
                </span>
              </button>
              <div className="flex justify-between">
                <span>Telegram версия</span>
                <span>{window.Telegram?.WebApp?.version || 'N/A'}</span>
              </div>
            </div>
          </Card>

          {/* Changelog Sheet */}
          <ChangelogSheet isOpen={showChangelog} onClose={() => setShowChangelog(false)} />
        </div>
      </div>
    )
  }

  // Team Section
  if (showTeamSection) {
    return (
      <div className="pb-6 pt-4">
        <div className="px-4">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Shield size={24} className="text-accent" />
            Команда MAIN
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
                const profileData = Array.isArray(member.profile) ? member.profile[0] : member.profile
                const skinData = Array.isArray(member.active_skin) ? member.active_skin[0] : member.active_skin
                const roleInfo = TEAM_BADGES[role]

                return (
                  <Card key={member.id} className="flex items-center gap-3">
                    <AvatarWithSkin
                      src={profileData?.photo_url}
                      name={member.first_name || 'User'}
                      size="md"
                      skin={skinData}
                      role={role}
                      tier={member.subscription_tier === 'pro' ? 'pro' : member.subscription_tier === 'light' ? 'light' : null}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {member.first_name} {member.last_name}
                      </div>
                      {profileData?.occupation && (
                        <div className="text-xs text-gray-400 truncate">{profileData.occupation}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${roleInfo?.color || 'bg-gray-500'} text-bg font-medium`}>
                        {roleInfo?.label || role}
                      </span>
                      {member.username && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openTelegramLink(`https://t.me/${member.username}`)}
                        >
                          <ExternalLink size={14} />
                        </Button>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Skin Admin Screen (core team only)
  if (showSkinAdmin) {
    return <SkinAdminPanel onClose={() => setShowSkinAdmin(false)} />
  }

  // Skin Selector Screen
  if (showSkinSelector) {
    const handleSkinSelect = async (skinId: string) => {
      if (!user) return
      setSkinSaving(true)
      hapticFeedback.medium()

      try {
        await setUserActiveSkin(user.id, skinId)
        await refetchSkins()
        hapticFeedback.success()
        addToast('Скин активирован!', 'success')
      } catch (error) {
        hapticFeedback.error()
        addToast('Ошибка при смене скина', 'error')
      } finally {
        setSkinSaving(false)
      }
    }

    const handleRemoveSkin = async () => {
      if (!user) return
      setSkinSaving(true)
      hapticFeedback.medium()

      try {
        await setUserActiveSkin(user.id, null)
        await refetchSkins()
        hapticFeedback.success()
        addToast('Скин снят', 'success')
      } catch (error) {
        hapticFeedback.error()
        addToast('Ошибка', 'error')
      } finally {
        setSkinSaving(false)
      }
    }

    return (
      <div className="pb-6">
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Palette size={24} className="text-accent" />
            Мой скин
          </h1>
          <p className="text-gray-400 text-sm mb-6">Выберите рамку для вашего аватара</p>

          {/* Current skin preview */}
          <Card className="mb-6 flex items-center gap-4">
            <AvatarWithSkin
              src={profile?.photo_url}
              name={user?.first_name || 'User'}
              size="xl"
              skin={activeSkin}
            />
            <div>
              <div className="text-sm text-gray-400">Текущий скин</div>
              <div className="font-semibold">
                {activeSkin ? activeSkin.name : 'Без скина'}
              </div>
              {activeSkin?.description && (
                <div className="text-xs text-gray-500 mt-1">{activeSkin.description}</div>
              )}
            </div>
          </Card>

          {/* Available skins */}
          {userSkins.length > 0 ? (
            <>
              <h3 className="text-sm text-gray-400 mb-3">Доступные скины ({userSkins.length})</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {userSkins.map((userSkin) => (
                  <SkinPreview
                    key={userSkin.id}
                    skin={userSkin.skin!}
                    isActive={userSkin.is_active_skin}
                    onClick={() => !skinSaving && handleSkinSelect(userSkin.skin_id)}
                    size="sm"
                  />
                ))}
              </div>

              {activeSkin && (
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={handleRemoveSkin}
                  disabled={skinSaving}
                >
                  Снять скин
                </Button>
              )}
            </>
          ) : (
            <Card className="text-center py-8">
              <Palette size={48} className="mx-auto text-gray-500 mb-3" />
              <p className="text-gray-400 font-medium mb-2">У вас пока нет скинов</p>
              <p className="text-sm text-gray-500">
                Скины выдаются за достижения, участие в событиях и другие активности
              </p>
            </Card>
          )}

          {/* How to get skins */}
          <Card className="mt-6 bg-bg-card/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Gift size={18} className="text-accent" />
              Как получить скины?
            </h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#c8ff00] flex items-center justify-center flex-shrink-0">
                  <Diamond size={14} className="text-bg" />
                </div>
                <span><b className="text-white">Core Team</b> — для членов команды MAIN</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <HeartHandshake size={14} className="text-bg" />
                </div>
                <span><b className="text-white">Volunteer</b> — за волонтёрство на событиях</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                  <Mic2 size={14} className="text-white" />
                </div>
                <span><b className="text-white">Speaker</b> — за выступление на событии</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                  <Trophy size={14} className="text-bg" />
                </div>
                <span><b className="text-white">Champion</b> — за топ-3 в лидерборде</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Crown size={14} className="text-bg" />
                </div>
                <span><b className="text-white">Pro Member</b> — с PRO подпиской</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const handleEditClick = () => {
    // Reset form with current profile data
    setEditForm({
      bio: profile?.bio || '',
      occupation: profile?.occupation || '',
      city: profile?.city || 'Минск',
      looking_for: profile?.looking_for || '',
      can_help_with: profile?.can_help_with || '',
      skills: profile?.skills || [],
      interests: profile?.interests || [],
    })
    setIsEditing(true)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Card Preview Section */}
      <div className="px-4 pt-4">
        <ProfilePreviewCard
          user={user}
          profile={profile}
          photos={profilePhotos}
          activeSkin={activeSkin}
          onEdit={handleEditClick}
        />
      </div>

      {/* Stats Row */}
      <div className="flex justify-center gap-6 py-4">
        <div className="text-center" onClick={handleRankTap}>
          <Badge variant="accent" className="text-xs flex items-center gap-1 justify-center cursor-pointer">
            {RANK_ICONS[rank]}
            {rankInfo.ru}
          </Badge>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{userStats?.events || 0}</div>
          <div className="text-xs text-gray-500">событий</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{userStats?.matches || 0}</div>
          <div className="text-xs text-gray-500">матчей</div>
        </div>
      </div>

      {/* Share Profile */}
      <div className="flex justify-center gap-3 pb-4">
        <button
          onClick={() => {
            hapticFeedback.light()
            const profileLink = `https://t.me/maincomapp_bot?startapp=profile_${user?.id}`
            if (user?.id) trackShare(user.id, 'profile', user.id, 'telegram')
            shareUrl(profileLink, `${user?.first_name || 'Мой профиль'} в MAIN Community`)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-bg-card rounded-full text-sm text-gray-300 active:scale-95 transition-transform"
        >
          <Share2 size={16} className="text-accent" />
          Поделиться
        </button>
        <button
          onClick={() => {
            hapticFeedback.light()
            if (user?.id) trackShare(user.id, 'profile', user.id, 'qr_view')
            setShowProfileQR(true)
          }}
          className="flex items-center justify-center w-10 h-10 bg-bg-card rounded-full active:scale-95 transition-transform"
        >
          <QrCode size={18} className="text-accent" />
        </button>
      </div>

      {/* Profile QR Modal */}
      <QRShareModal
        url={`https://t.me/maincomapp_bot?startapp=profile_${user?.id}`}
        title="Мой профиль"
        isOpen={showProfileQR}
        onClose={() => setShowProfileQR(false)}
      />

      {/* Debug Console (hidden, activated by 7 taps on version) */}
      {showDebug && (
        <div className="mx-4 mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-yellow-400 font-mono text-sm">Debug Console</span>
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

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        {/* Social links */}
        {userLinks.length > 0 && (
          <div className="flex justify-center mb-4">
            <SocialLinks links={userLinks} compact showEmpty={false} />
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { icon: <Bell size={22} />, label: 'Уведомления', badge: unreadCount, onClick: () => setShowNotifications(true), color: 'text-blue-400' },
            { icon: <Heart size={22} />, label: 'Матчи', badge: null, onClick: () => setActiveTab('network'), color: 'text-pink-400' },
            { icon: <Ticket size={22} />, label: 'Билеты', badge: null, onClick: () => setActiveTab('events'), color: 'text-purple-400' },
            { icon: <Trophy size={22} />, label: 'Награды', badge: null, onClick: () => setActiveTab('achievements'), color: 'text-yellow-400' },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
              className="relative flex flex-col items-center p-3 bg-bg-card rounded-xl"
            >
              <span className={item.color}>{item.icon}</span>
              <span className="text-xs text-gray-400 mt-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-bg text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Menu List */}
        <Card className="mb-4 p-0 overflow-hidden">
          {[
            { icon: <Users size={18} className="text-accent" />, label: 'Команда MAIN', onClick: () => setShowTeamSection(true) },
            { icon: <Palette size={18} className="text-orange-400" />, label: 'Мой скин', badge: userSkins.length > 0 ? userSkins.length : null, onClick: () => setShowSkinSelector(true) },
            ...(user?.team_role === 'core' ? [{ icon: <Shield size={18} className="text-red-400" />, label: 'Управление скинами', badge: null, onClick: () => setShowSkinAdmin(true) }] : []),
            { icon: <Settings size={18} className="text-gray-400" />, label: 'Настройки', onClick: () => setShowSettings(true) },
          ].map((item, i, arr) => (
            <motion.div
              key={item.label}
              whileTap={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={item.onClick}
              className={`
                flex items-center px-4 py-3 cursor-pointer
                ${i < arr.length - 1 ? 'border-b border-bg' : ''}
              `}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="flex-1 text-sm">{item.label}</span>
              {'badge' in item && item.badge && <Badge variant="accent" className="text-xs">{item.badge}</Badge>}
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
            <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center">
              {tier === 'pro' ? (
                <Crown size={20} className="text-accent" />
              ) : tier === 'light' ? (
                <Star size={20} className="text-yellow-400" />
              ) : (
                <Shield size={20} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className={`text-sm ${tier !== 'free' ? 'text-accent font-semibold' : 'font-semibold'}`}>
                {tier === 'pro' ? 'Pro Member' : tier === 'light' ? 'Light Member' : 'Free'}
              </div>
              <div className="text-xs text-gray-400">
                {tier === 'free' ? 'Улучшить подписку' : 'Управление подпиской'}
              </div>
            </div>
            {tier === 'free' && (
              <Button size="sm" variant="primary">
                PRO
              </Button>
            )}
          </div>
        </Card>

        {/* Invite Friends */}
        <Card className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
              <Gift size={20} className="text-pink-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Пригласи друга</div>
              <div className="text-xs text-gray-400">
                {user?.invites_remaining! > 0
                  ? `${user?.invites_remaining} инвайтов • +50 XP`
                  : 'Инвайты закончились'}
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => {
              hapticFeedback.medium()
              setShowInvites(true)
            }}>
              Открыть
            </Button>
          </div>
        </Card>

        {/* Superadmin Settings Button */}
        {['dmitryutlik', 'utlik_offer'].includes(user?.username || '') && (
          <button
            onClick={() => setShowAdminPanel(true)}
            className="w-full px-4 py-3 bg-red-500/10 text-red-400 rounded-xl text-sm font-bold border border-red-500/20 flex items-center justify-center gap-2 mb-4"
          >
            <Settings size={16} /> Superadmin Panel
          </button>
        )}

        {/* Support */}
        <button
          className="w-full text-center text-gray-500 py-3 flex items-center justify-center gap-2 text-sm"
          onClick={() => openTelegramLink('https://t.me/yana_martynen')}
        >
          <MessageCircle size={14} />
          Поддержка
        </button>

        {/* Version */}
        <p
          className="text-center text-gray-600 text-xs mt-2 cursor-pointer select-none"
          onClick={handleDebugTap}
        >
          v1.0.0
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

      {/* Subscription Bottom Sheet */}
      <SubscriptionBottomSheet
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
      />
    </div>
  )
}

export default ProfileScreen
