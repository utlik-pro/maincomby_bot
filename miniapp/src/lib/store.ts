import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserProfile, SubscriptionTier, UserRank, RANK_THRESHOLDS } from '@/types'

// Onboarding version - increment this to show onboarding to all users again
export const CURRENT_ONBOARDING_VERSION = 3

// Calculate rank from XP
export function calculateRank(xp: number): UserRank {
  if (xp >= RANK_THRESHOLDS.founder) return 'founder'
  if (xp >= RANK_THRESHOLDS.leader) return 'leader'
  if (xp >= RANK_THRESHOLDS.expert) return 'expert'
  if (xp >= RANK_THRESHOLDS.ambassador) return 'ambassador'
  if (xp >= RANK_THRESHOLDS.contributor) return 'contributor'
  if (xp >= RANK_THRESHOLDS.enthusiast) return 'enthusiast'
  if (xp >= RANK_THRESHOLDS.activist) return 'activist'
  if (xp >= RANK_THRESHOLDS.member) return 'member'
  return 'newcomer'
}

// Calculate progress to next rank (0-100)
export function calculateRankProgress(xp: number): { current: UserRank; next: UserRank | null; progress: number } {
  const ranks: UserRank[] = ['newcomer', 'member', 'activist', 'enthusiast', 'contributor', 'ambassador', 'expert', 'leader', 'founder']
  const current = calculateRank(xp)
  const currentIndex = ranks.indexOf(current)

  if (currentIndex === ranks.length - 1) {
    return { current, next: null, progress: 100 }
  }

  const next = ranks[currentIndex + 1]
  const currentThreshold = RANK_THRESHOLDS[current]
  const nextThreshold = RANK_THRESHOLDS[next]
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100

  return { current, next, progress: Math.min(100, Math.max(0, progress)) }
}

interface AppState {
  // User data
  user: User | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean

  // UI state
  activeTab: 'home' | 'events' | 'network' | 'achievements' | 'profile'
  isVolunteerMode: boolean
  onboardingVersion: number
  lastSeenEventId: number | null
  lastDismissedAnnouncementEventId: number | null // For event announcement modal
  deepLinkTarget: string | null // For handling deep links like 'matches'
  // Invite system
  pendingInviteCode: string | null
  accessDenied: boolean
  inviteRequired: boolean

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setActiveTab: (tab: AppState['activeTab']) => void
  setDeepLinkTarget: (target: string | null) => void
  setPendingInviteCode: (code: string | null) => void
  setAccessDenied: (denied: boolean) => void
  setInviteRequired: (required: boolean) => void
  setVolunteerMode: (mode: boolean) => void
  completeOnboarding: () => void
  setLastSeenEventId: (eventId: number) => void
  dismissEventAnnouncement: (eventId: number) => void
  addPoints: (amount: number) => void
  logout: () => void

  // Computed
  shouldShowOnboarding: () => boolean

  // Computed
  getRank: () => UserRank
  getRankProgress: () => { current: UserRank; next: UserRank | null; progress: number }
  getSubscriptionTier: () => SubscriptionTier
  getDailySwipesRemaining: () => number
  canAccessScanner: () => boolean
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      activeTab: 'home',
      isVolunteerMode: false,
      onboardingVersion: 0,
      lastSeenEventId: null,
      lastDismissedAnnouncementEventId: null,
      deepLinkTarget: null,
      pendingInviteCode: null,
      accessDenied: false,
      inviteRequired: false,

      // Actions
      setDeepLinkTarget: (target) => set({ deepLinkTarget: target }),
      setPendingInviteCode: (pendingInviteCode) => set({ pendingInviteCode }),
      setAccessDenied: (accessDenied) => set({ accessDenied }),
      setInviteRequired: (inviteRequired) => set({ inviteRequired }),
      setUser: (user) => {
        // Ensure points are never negative in UI
        if (user && user.points < 0) {
          user = { ...user, points: 0 }
        }
        set({ user, isAuthenticated: !!user })
      },
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setVolunteerMode: (isVolunteerMode) => set({ isVolunteerMode }),
      completeOnboarding: () => set({ onboardingVersion: CURRENT_ONBOARDING_VERSION }),
      setLastSeenEventId: (lastSeenEventId) => set({ lastSeenEventId }),
      dismissEventAnnouncement: (eventId) => set({ lastDismissedAnnouncementEventId: eventId }),

      // Computed - check if onboarding should be shown
      shouldShowOnboarding: () => {
        const { onboardingVersion } = get()
        return onboardingVersion < CURRENT_ONBOARDING_VERSION
      },
      addPoints: (amount) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, points: Math.max(0, (user.points || 0) + amount) } })
        }
      },
      logout: () => set({ user: null, profile: null, isAuthenticated: false, onboardingVersion: 0, lastSeenEventId: null, lastDismissedAnnouncementEventId: null, deepLinkTarget: null }),

      // Computed
      getRank: () => {
        const { user } = get()
        return calculateRank(user?.points || 0)
      },
      getRankProgress: () => {
        const { user } = get()
        return calculateRankProgress(user?.points || 0)
      },
      getSubscriptionTier: () => {
        const { user } = get()
        if (!user) return 'free'
        if (user.subscription_expires_at && new Date(user.subscription_expires_at) < new Date()) {
          return 'free'
        }
        return user.subscription_tier || 'free'
      },
      getDailySwipesRemaining: () => {
        const { user } = get()
        if (!user) return 0

        const tier = get().getSubscriptionTier()
        const limits = {
          free: 5,
          light: 20,
          pro: Infinity,
        }

        const maxSwipes = limits[tier]
        const usedSwipes = user.daily_swipes_used || 0

        return Math.max(0, maxSwipes - usedSwipes)
      },
      // Check if user can access scanner (volunteers, core team)
      canAccessScanner: () => {
        const { user } = get()
        if (!user) return false
        // Allow: core team, volunteers, or anyone with volunteer mode enabled
        const allowedRoles = ['core', 'volunteer']
        return allowedRoles.includes(user.team_role || '') || get().isVolunteerMode
      },
    }),
    {
      name: 'main-community-app',
      partialize: (state) => ({
        activeTab: state.activeTab,
        isVolunteerMode: state.isVolunteerMode,
        onboardingVersion: state.onboardingVersion,
        lastSeenEventId: state.lastSeenEventId,
        lastDismissedAnnouncementEventId: state.lastDismissedAnnouncementEventId,
      }),
    }
  )
)

// Toast notifications store
interface ToastState {
  toasts: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'xp'
    xpAmount?: number
  }>
  addToast: (message: string, type?: 'success' | 'error' | 'info' | 'xp', xpAmount?: number) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info', xpAmount) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, xpAmount }],
    }))
    // Auto-remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 3000)
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
