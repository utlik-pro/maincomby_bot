// User subscription types
export type SubscriptionTier = 'free' | 'light' | 'pro'

// User ranks (military style)
export type UserRank =
  | 'private'      // Рядовой (0-100 XP)
  | 'corporal'     // Ефрейтор (100-300 XP)
  | 'sergeant'     // Сержант (300-600 XP)
  | 'sergeant_major' // Старшина (600-1000 XP)
  | 'lieutenant'   // Лейтенант (1000-2000 XP)
  | 'captain'      // Капитан (2000-5000 XP)
  | 'major'        // Майор (5000-10000 XP)
  | 'colonel'      // Полковник (10000-20000 XP)
  | 'general'      // Генерал (20000+ XP) - Super Admin

export const RANK_THRESHOLDS: Record<UserRank, number> = {
  private: 0,
  corporal: 100,
  sergeant: 300,
  sergeant_major: 600,
  lieutenant: 1000,
  captain: 2000,
  major: 5000,
  colonel: 10000,
  general: 20000,
}

export const RANK_LABELS: Record<UserRank, { ru: string; emoji: string }> = {
  private: { ru: 'Рядовой', emoji: '🔰' },
  corporal: { ru: 'Ефрейтор', emoji: '⭐' },
  sergeant: { ru: 'Сержант', emoji: '⭐⭐' },
  sergeant_major: { ru: 'Старшина', emoji: '🎖️' },
  lieutenant: { ru: 'Лейтенант', emoji: '🏅' },
  captain: { ru: 'Капитан', emoji: '🎗️' },
  major: { ru: 'Майор', emoji: '👑' },
  colonel: { ru: 'Полковник', emoji: '⭐⭐⭐' },
  general: { ru: 'Генерал', emoji: '🎖️👑' },
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

// Team roles/badges
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
  // Team role
  team_role: TeamRole
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
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}
