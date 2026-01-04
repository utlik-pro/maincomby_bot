// User subscription types
export type SubscriptionTier = 'free' | 'light' | 'pro'

// User ranks (community roles)
export type UserRank =
  | 'newcomer'     // Новичок (0-100 XP)
  | 'member'       // Участник (100-300 XP)
  | 'activist'     // Активист (300-600 XP)
  | 'enthusiast'   // Энтузиаст (600-1000 XP)
  | 'contributor'  // Контрибьютор (1000-2000 XP)
  | 'ambassador'   // Амбассадор (2000-5000 XP)
  | 'expert'       // Эксперт (5000-10000 XP)
  | 'leader'       // Лидер (10000-20000 XP)
  | 'founder'      // Основатель (20000+ XP)

export const RANK_THRESHOLDS: Record<UserRank, number> = {
  newcomer: 0,
  member: 100,
  activist: 300,
  enthusiast: 600,
  contributor: 1000,
  ambassador: 2000,
  expert: 5000,
  leader: 10000,
  founder: 20000,
}

export const RANK_LABELS: Record<UserRank, { ru: string }> = {
  newcomer: { ru: 'Новичок' },
  member: { ru: 'Участник' },
  activist: { ru: 'Активист' },
  enthusiast: { ru: 'Энтузиаст' },
  contributor: { ru: 'Контрибьютор' },
  ambassador: { ru: 'Амбассадор' },
  expert: { ru: 'Эксперт' },
  leader: { ru: 'Лидер' },
  founder: { ru: 'Основатель' },
}

// XP rewards
export const XP_REWARDS = {
  EVENT_REGISTER: 10,
  EVENT_CHECKIN: 50,
  FEEDBACK_SUBMIT: 20,
  MATCH_RECEIVED: 15,
  FRIEND_INVITE: 30,
  PROFILE_COMPLETE: 25,
  FIRST_SWIPE: 5,
}

// Achievement types
export type AchievementId =
  | 'first_step'       // Первый шаг - первое событие
  | 'on_fire'          // На волне - 3 события подряд
  | 'social_butterfly' // Душа компании - 10 матчей
  | 'critic'           // Критик - 5 фидбеков
  | 'sniper'           // Снайпер - 100% посещаемость (5+ событий)
  | 'veteran'          // Ветеран - 1 год в сообществе
  | 'networker'        // Нетворкер - 25 матчей
  | 'regular'          // Завсегдатай - 10 событий

export interface Achievement {
  id: AchievementId
  title: string
  description: string
  emoji: string
  xpReward: number
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'Первый шаг', description: 'Посетите первое событие', emoji: '🥇', xpReward: 50 },
  { id: 'on_fire', title: 'На волне', description: '3 события подряд', emoji: '🔥', xpReward: 100 },
  { id: 'social_butterfly', title: 'Душа компании', description: '10 матчей', emoji: '💕', xpReward: 150 },
  { id: 'critic', title: 'Критик', description: '5 фидбеков', emoji: '📝', xpReward: 75 },
  { id: 'sniper', title: 'Снайпер', description: '100% посещаемость (5+ событий)', emoji: '🎯', xpReward: 200 },
  { id: 'veteran', title: 'Ветеран', description: '1 год в сообществе', emoji: '👑', xpReward: 500 },
  { id: 'networker', title: 'Нетворкер', description: '25 матчей', emoji: '🤝', xpReward: 200 },
  { id: 'regular', title: 'Завсегдатай', description: '10 событий', emoji: '🏆', xpReward: 150 },
]

// Team roles/badges (legacy - kept for backwards compatibility)
export type TeamRole =
  | 'core'      // Ядро команды MAIN
  | 'partner'   // Партнёр
  | 'sponsor'   // Спонсор
  | 'volunteer' // Волонтёр
  | 'speaker'   // Спикер
  | null

export const TEAM_BADGES: Record<Exclude<TeamRole, null>, { label: string; color: string; icon: string }> = {
  core: { label: 'MAIN Team', color: 'bg-accent', icon: '💎' },
  partner: { label: 'Партнёр', color: 'bg-blue-500', icon: '🤝' },
  sponsor: { label: 'Спонсор', color: 'bg-yellow-500', icon: '⭐' },
  volunteer: { label: 'Волонтёр', color: 'bg-green-500', icon: '💚' },
  speaker: { label: 'Спикер', color: 'bg-purple-500', icon: '🎤' },
}

// ============================================
// Avatar Skins System
// ============================================

// Skin permission types
export type SkinPermission =
  | 'can_checkin_events'   // Volunteer can check in attendees
  | 'can_create_posts'     // Can create community posts
  | 'is_admin'             // Admin access
  | 'is_moderator'         // Moderation access
  | 'priority_matching'    // Priority in matching feed
  | 'unlimited_swipes'     // Bypass swipe limits

// Skin grant types
export type SkinGrantType =
  | 'manual'        // Manually awarded by admin
  | 'achievement'   // Auto-awarded for achievement
  | 'subscription'  // Auto-awarded for subscription tier
  | 'event'         // Auto-awarded for event participation
  | 'auto'          // Auto-awarded by system rules

// Avatar skin from database
export interface AvatarSkin {
  id: string
  slug: string
  name: string
  description: string | null
  ring_color: string
  ring_width: number
  ring_offset: number
  glow_enabled: boolean
  glow_color: string | null
  glow_intensity: number | null
  css_class: string | null
  icon_emoji: string | null
  grant_type: SkinGrantType
  grant_config: Record<string, any>
  permissions: SkinPermission[]
  priority: number
  is_active: boolean
  is_premium: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// User's awarded skin
export interface UserAvatarSkin {
  id: string
  user_id: number
  skin_id: string
  awarded_by: number | null
  awarded_reason: string | null
  awarded_at: string
  expires_at: string | null
  // Joined skin data
  skin?: AvatarSkin
  is_active_skin?: boolean
}

// Skin style for rendering
export interface SkinStyle {
  ringColor: string
  ringWidth: number
  ringOffset: number
  glowEnabled: boolean
  glowColor?: string
  glowIntensity?: number
  cssClass?: string
}

// Helper to convert AvatarSkin to CSS classes
export function getSkinClasses(skin: AvatarSkin | null): string {
  if (!skin) return ''

  const classes: string[] = []

  // Ring width classes
  const ringWidthMap: Record<number, string> = {
    2: 'ring-2',
    3: 'ring-[3px]',
    4: 'ring-4',
  }
  classes.push(ringWidthMap[skin.ring_width] || 'ring-4')

  // Ring offset
  const offsetMap: Record<number, string> = {
    1: 'ring-offset-1',
    2: 'ring-offset-2',
  }
  classes.push(offsetMap[skin.ring_offset] || 'ring-offset-2')
  classes.push('ring-offset-bg')

  // Custom CSS class
  if (skin.css_class) {
    classes.push(skin.css_class)
  }

  return classes.join(' ')
}

// Helper to get inline styles for skin
export function getSkinStyles(skin: AvatarSkin | null): React.CSSProperties {
  if (!skin) return {}

  const styles: React.CSSProperties = {
    '--tw-ring-color': skin.ring_color,
  } as React.CSSProperties

  if (skin.glow_enabled && skin.glow_color) {
    styles.boxShadow = `0 0 ${skin.glow_intensity || 20}px ${skin.glow_color}`
  }

  return styles
}

// Database types
export interface User {
  id: number
  tg_user_id: number
  username: string | null
  first_name: string | null
  last_name: string | null
  phone_number: string | null
  first_seen_at: string
  points: number
  warns: number
  banned: boolean
  source: string | null
  // Mini App specific
  subscription_tier: SubscriptionTier
  subscription_expires_at: string | null
  daily_swipes_used: number
  daily_swipes_reset_at: string | null
  // Team role (legacy)
  team_role: TeamRole
  // Avatar skin
  active_skin_id: string | null
  active_skin?: AvatarSkin | null
}

export interface UserProfile {
  id: number
  user_id: number
  bio: string | null
  occupation: string | null
  looking_for: string | null
  can_help_with: string | null
  needs_help_with: string | null
  photo_file_id: string | null
  photo_url: string | null // For Mini App
  city: string
  moderation_status: 'pending' | 'approved' | 'rejected'
  is_visible: boolean
  created_at: string
  updated_at: string
  // Extended for Mini App
  skills: string[] | null
  interests: string[] | null
  telegram_username: string | null
  linkedin_url: string | null
}

export interface Event {
  id: number
  title: string
  description: string | null
  event_date: string
  city: string
  location: string | null
  location_url: string | null
  speakers: string | null
  max_participants: number | null
  registration_deadline: string | null
  is_active: boolean
  created_at: string
  // Extended
  image_url: string | null
  event_type: 'meetup' | 'workshop' | 'conference' | 'hackathon'
  price: number
}

export interface EventRegistration {
  id: number
  event_id: number
  user_id: number
  registered_at: string
  status: 'registered' | 'cancelled' | 'attended'
  notes: string | null
  confirmed: boolean
  // QR ticket
  ticket_code: string
  checked_in_at: string | null
  checked_in_by: number | null // volunteer user_id
}

export interface Match {
  id: number
  user1_id: number
  user2_id: number
  matched_at: string
  is_active: boolean
}

export interface Swipe {
  id: number
  swiper_id: number
  swiped_id: number
  action: 'like' | 'skip' | 'superlike'
  swiped_at: string
}

export interface UserAchievement {
  id: number
  user_id: number
  achievement_id: AchievementId
  unlocked_at: string
}

export interface XPTransaction {
  id: number
  user_id: number
  amount: number
  reason: string
  created_at: string
}

// ============================================
// Extended Profile System Types
// ============================================

// Social link types
export type LinkType =
  | 'linkedin'
  | 'github'
  | 'gitlab'
  | 'behance'
  | 'dribbble'
  | 'instagram'
  | 'telegram_channel'
  | 'portfolio'
  | 'website'

export const LINK_TYPE_CONFIG: Record<LinkType, { label: string; icon: string; placeholder: string; color: string }> = {
  linkedin: { label: 'LinkedIn', icon: 'Linkedin', placeholder: 'linkedin.com/in/username', color: '#0A66C2' },
  github: { label: 'GitHub', icon: 'Github', placeholder: 'github.com/username', color: '#181717' },
  gitlab: { label: 'GitLab', icon: 'Gitlab', placeholder: 'gitlab.com/username', color: '#FC6D26' },
  behance: { label: 'Behance', icon: 'Palette', placeholder: 'behance.net/username', color: '#1769FF' },
  dribbble: { label: 'Dribbble', icon: 'Dribbble', placeholder: 'dribbble.com/username', color: '#EA4C89' },
  instagram: { label: 'Instagram', icon: 'Instagram', placeholder: 'instagram.com/username', color: '#E4405F' },
  telegram_channel: { label: 'Telegram', icon: 'Send', placeholder: 't.me/channel', color: '#26A5E4' },
  portfolio: { label: 'Portfolio', icon: 'Briefcase', placeholder: 'portfolio.com', color: '#c8ff00' },
  website: { label: 'Website', icon: 'Globe', placeholder: 'example.com', color: '#6B7280' },
}

// Custom badge (created by admin)
export interface CustomBadge {
  id: string
  slug: string
  name: string
  description: string | null
  emoji: string | null
  color: string
  xp_reward: number
  is_active: boolean
  sort_order: number
  created_at: string
}

// User's awarded badge
export interface UserBadge {
  id: string
  user_id: number
  badge_id: string
  awarded_by: number | null
  awarded_reason: string | null
  awarded_at: string
  expires_at: string | null
  is_featured: boolean
  // Joined badge data
  badge?: CustomBadge
}

// Company (created by admin)
export interface Company {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  description: string | null
  industry: string | null
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// Industry options
export type Industry =
  | 'IT'
  | 'Marketing'
  | 'Finance'
  | 'Education'
  | 'Healthcare'
  | 'Retail'
  | 'Manufacturing'
  | 'Consulting'
  | 'Media'
  | 'Other'

export const INDUSTRY_LABELS: Record<Industry, string> = {
  IT: 'IT / Технологии',
  Marketing: 'Маркетинг',
  Finance: 'Финансы',
  Education: 'Образование',
  Healthcare: 'Здоровье',
  Retail: 'Ритейл',
  Manufacturing: 'Производство',
  Consulting: 'Консалтинг',
  Media: 'Медиа',
  Other: 'Другое',
}

// User-Company relationship
export interface UserCompany {
  id: string
  user_id: number
  company_id: string
  role: string | null
  is_primary: boolean
  joined_at: string
  // Joined company data
  company?: Company
}

// User social/portfolio link
export interface UserLink {
  id: string
  user_id: number
  link_type: LinkType
  url: string
  title: string | null
  is_public: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// Extended profile with all relations
export interface ExtendedProfile extends UserProfile {
  badges?: UserBadge[]
  company?: UserCompany
  links?: UserLink[]
}

// Subscription limits
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, {
  dailySwipes: number
  canSeeWhoLiked: boolean
  canSuperlike: boolean
  superlikesPerDay: number
  priorityInFeed: boolean
  advancedFilters: boolean
  badge: string | null
}> = {
  free: {
    dailySwipes: 5,
    canSeeWhoLiked: false,
    canSuperlike: false,
    superlikesPerDay: 0,
    priorityInFeed: false,
    advancedFilters: false,
    badge: null,
  },
  light: {
    dailySwipes: 20,
    canSeeWhoLiked: true,
    canSuperlike: true,
    superlikesPerDay: 1,
    priorityInFeed: false,
    advancedFilters: true,
    badge: '⭐',
  },
  pro: {
    dailySwipes: Infinity,
    canSeeWhoLiked: true,
    canSuperlike: true,
    superlikesPerDay: 5,
    priorityInFeed: true,
    advancedFilters: true,
    badge: '👑',
  },
}

// Telegram WebApp types
export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
  allows_write_to_pm?: boolean
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    auth_date: number
    hash: string
    query_id?: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  ready: () => void
  expand: () => void
  close: () => void
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
  }
  BackButton: {
    isVisible: boolean
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
  showPopup: (params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }, callback?: (buttonId: string) => void) => void
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void
  openTelegramLink: (url: string) => void
  sendData: (data: string) => void
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void
  requestContact: (callback: (shared: boolean) => void) => void
  requestWriteAccess: (callback: (access: boolean) => void) => void
  showScanQrPopup: (params: { text?: string }, callback?: (text: string) => boolean) => void
  closeScanQrPopup: () => void
  isFullscreen: boolean
  requestFullscreen: () => void
  exitFullscreen: () => void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}
