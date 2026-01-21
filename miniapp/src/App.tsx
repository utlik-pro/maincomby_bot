import React, { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAppStore, useToastStore, calculateRank } from '@/lib/store'
import { CURRENT_APP_VERSION } from '@/lib/version'
import { initTelegramApp, getTelegramUser, isTelegramWebApp, getTelegramWebApp, validateInitData, getInitData } from '@/lib/telegram'
import { isPreviewMode } from '@/lib/tenant'
import { getUserByTelegramId, getUserById, createOrUpdateUser, getProfile, updateProfile, createProfile, isInviteRequired, checkUserAccess, getPendingReviewEvents, getEventById, checkAndUpdateDailyStreak, startSession, sessionHeartbeat, endSession, getShowFunnelForTeam, getPendingProGift, acknowledgeProGift, getIncomingLikes, updateLastAppOpen } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'
import { ToastContainer } from '@/components/ToastContainer'
import { LogoHeader } from '@/components/LogoHeader'
import { Skeleton } from '@/components/ui'
import { useSpeedRunner, useSwipePatternEasterEgg } from '@/lib/easterEggs'
import { Smartphone } from 'lucide-react'

import ErrorBoundary from '@/components/ErrorBoundary'

// Screen imports (lazy loaded)
const HomeScreen = React.lazy(() => import('@/screens/HomeScreen'))
const EventsScreen = React.lazy(() => import('@/screens/EventsScreen'))
const LearnScreen = React.lazy(() => import('@/screens/LearnScreen'))
const NetworkScreen = React.lazy(() => import('@/screens/NetworkScreen'))
const AchievementsScreen = React.lazy(() => import('@/screens/AchievementsScreen'))
const ProfileScreen = React.lazy(() => import('@/screens/ProfileScreen'))
const OnboardingScreen = React.lazy(() => import('@/screens/OnboardingScreen'))
const AccessGateScreen = React.lazy(() => import('@/screens/AccessGateScreen'))
const InviteBottomSheet = React.lazy(() => import('@/components/InviteBottomSheet').then(m => ({ default: m.InviteBottomSheet })))
const ChangelogSheet = React.lazy(() => import('@/components/ChangelogSheet'))
const ReviewBottomSheet = React.lazy(() => import('@/components/ReviewBottomSheet').then(m => ({ default: m.ReviewBottomSheet })))
const ProGiftModal = React.lazy(() => import('@/components/ProGiftModal').then(m => ({ default: m.ProGiftModal })))
const NetworkingPromoSheet = React.lazy(() => import('@/components/NetworkingPromoSheet').then(m => ({ default: m.NetworkingPromoSheet })))
const PromptsPromoSheet = React.lazy(() => import('@/components/PromptsPromoSheet').then(m => ({ default: m.PromptsPromoSheet })))
const PromptsGalleryScreen = React.lazy(() => import('@/screens/PromptsGalleryScreen'))

// Loading screen
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4">
    <img
      src="/logo.png"
      alt="MAIN Community"
      className="w-20 h-20 mb-4 animate-pulse"
    />
    <h1 className="text-xl font-bold gradient-text mb-2">MAIN Community</h1>
    <p className="text-gray-400 text-sm">Загрузка...</p>
    <div className="mt-8 space-y-3 w-full max-w-xs">
      <Skeleton className="h-4 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </div>
  </div>
)

// Error screen for non-Telegram access
const NotTelegramScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
    <Smartphone size={64} className="mb-4 text-accent" />
    <h1 className="text-xl font-bold mb-2">Откройте в Telegram</h1>
    <p className="text-gray-400 text-sm mb-6">
      Это приложение работает только внутри Telegram.
      <br />
      Откройте бота @maincomapp_bot и запустите Mini App.
    </p>
    <a
      href="https://t.me/maincomapp_bot"
      className="bg-accent text-bg px-6 py-3 rounded-button font-semibold"
    >
      Открыть бота
    </a>
  </div>
)

// Page transition wrapper with proper scrolling
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
    className="screen-scroll"
  >
    {children}
  </motion.div>
)

const App: React.FC = () => {
  const { activeTab, isLoading, setLoading, setUser, setProfile, isAuthenticated, shouldShowOnboarding, shouldShowWhatsNew, setLastSeenAppVersion, profile, setActiveTab, setDeepLinkTarget, accessDenied, setAccessDenied, setPendingInviteCode, setInviteRequired, showInvites, setShowInvites, setShowFunnelForTeam, hideNavigation, hideHeader } = useAppStore()
  const { addToast } = useToastStore()

  // What's New changelog sheet state
  const [showChangelog, setShowChangelog] = useState(false)

  // Review prompt state
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)
  const [pendingReviewEvent, setPendingReviewEvent] = useState<any>(null)

  // Session tracking state
  const [sessionId, setSessionId] = useState<number | null>(null)

  // Pending broadcast click to log when user loads
  const pendingBroadcastClick = useRef<number | null>(null)

  // PRO gift notification state
  const [showProGiftModal, setShowProGiftModal] = useState(false)
  const [proGiftData, setProGiftData] = useState<{
    id: number
    adminName: string
    adminUsername: string
    adminAvatarUrl?: string
    durationDays: number
  } | null>(null)

  // Networking promo state
  const [showNetworkingPromo, setShowNetworkingPromo] = useState(false)
  const [networkingLikesCount, setNetworkingLikesCount] = useState(0)

  // Prompts promo state
  const [showPromptsPromo, setShowPromptsPromo] = useState(false)

  // Check if should show What's New after loading
  useEffect(() => {
    if (!isLoading && isAuthenticated && !shouldShowOnboarding() && shouldShowWhatsNew()) {
      // Show changelog sheet when there's an update
      setShowChangelog(true)
    }
  }, [isLoading, isAuthenticated])

  // Check for pending event reviews
  const { user } = useAppStore()
  useEffect(() => {
    const checkPendingReviews = async () => {
      if (!user?.id || isLoading || showChangelog) return

      try {
        const pendingEvents = await getPendingReviewEvents(user.id)
        if (pendingEvents.length > 0) {
          // Show review prompt for the most recent event
          setPendingReviewEvent(pendingEvents[0])
          // Delay to not conflict with other modals
          setTimeout(() => setShowReviewPrompt(true), 1000)
        }
      } catch (e) {
        console.warn('Failed to check pending reviews:', e)
      }
    }

    checkPendingReviews()
  }, [user?.id, isLoading, showChangelog])

  // Check for pending PRO gift notifications
  useEffect(() => {
    const checkProGift = async () => {
      if (!user?.id || isLoading || showChangelog || showReviewPrompt) return

      try {
        const gift = await getPendingProGift(user.id)
        if (gift) {
          setProGiftData(gift)
          setTimeout(() => setShowProGiftModal(true), 500)
        }
      } catch (e) {
        console.warn('Failed to check PRO gift:', e)
      }
    }

    checkProGift()
  }, [user?.id, isLoading, showChangelog, showReviewPrompt])

  // Check for incoming likes to show networking promo
  useEffect(() => {
    const checkLikesForPromo = async () => {
      if (!user?.id || isLoading || showChangelog || showReviewPrompt || showProGiftModal) return

      try {
        const likesData = await getIncomingLikes(user.id)
        if (likesData?.count && likesData.count > 0) {
          // Check if we already showed today
          const lastShown = localStorage.getItem('networkingPromoLastShown')
          const today = new Date().toDateString()
          if (lastShown !== today) {
            setNetworkingLikesCount(likesData.count)
            setTimeout(() => setShowNetworkingPromo(true), 1500)
          }
        }
      } catch (e) {
        console.warn('Failed to check likes for promo:', e)
      }
    }

    checkLikesForPromo()
  }, [user?.id, isLoading, showChangelog, showReviewPrompt, showProGiftModal])

  // Check if should show prompts promo for new users
  useEffect(() => {
    // Don't show if other modals are active or conditions not met
    if (!user?.id || isLoading || showChangelog || showReviewPrompt || showProGiftModal || showNetworkingPromo) return

    // Check if user has already seen prompts promo
    const hasSeenPromo = localStorage.getItem('promptsPromoSeen')
    if (hasSeenPromo) return

    // Show promo with delay (after other modal checks have completed)
    const timeoutId = setTimeout(() => {
      setShowPromptsPromo(true)
    }, 2500)

    return () => clearTimeout(timeoutId)
  }, [user?.id, isLoading, showChangelog, showReviewPrompt, showProGiftModal, showNetworkingPromo])

  // Global user data refresh - sync team_role and other critical fields
  const { data: freshUserData } = useQuery({
    queryKey: ['globalUserRefresh', user?.id],
    queryFn: () => user?.id ? getUserById(user.id) : null,
    enabled: !!user?.id && !isLoading,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  })

  // Sync store when critical fields change (team_role, subscription_tier, etc.)
  useEffect(() => {
    if (freshUserData && user) {
      const needsUpdate =
        freshUserData.team_role !== user.team_role ||
        freshUserData.subscription_tier !== user.subscription_tier ||
        freshUserData.points !== user.points

      if (needsUpdate) {
        setUser(freshUserData as any)
      }
    }
  }, [freshUserData, user, setUser])

  // Easter eggs - speed runner (visit all tabs quickly)
  const { recordTabVisit } = useSpeedRunner(['home', 'events', 'network', 'achievements', 'profile'], 10000)

  // Easter eggs - swipe pattern (swipe left-right-left for bonus)
  const { handlers: swipeHandlers } = useSwipePatternEasterEgg(
    ['left', 'right', 'left'],
    () => console.log('[EasterEgg] Swipe pattern completed!')
  )

  // Record tab visits for speed runner
  useEffect(() => {
    if (activeTab) {
      recordTabVisit(activeTab)
    }
  }, [activeTab, recordTabVisit])

  // Initialize app
  useEffect(() => {
    const init = async () => {
      try {
        // Initialize Telegram WebApp
        initTelegramApp()

        // Check if running in Telegram (skip for development)
        const isDev = import.meta.env.DEV
        if (!isDev && !isTelegramWebApp()) {
          setLoading(false)
          return
        }

        // Validate initData on server (security: verify Telegram signature)
        const initData = getInitData()
        if (initData && !isDev) {
          try {
            const validation = await validateInitData()
            if (!validation.valid) {
              console.error('[Security] Invalid Telegram initData:', validation.error)
              // Continue with degraded mode but log the security event
            }
          } catch (e) {
            console.warn('[Security] initData validation failed, continuing with client data:', e)
          }
        }

        // Get Telegram user
        const tgUser = getTelegramUser()

        // Use real Supabase if key is configured, otherwise mock
        const hasSupabase = !!import.meta.env.VITE_SUPABASE_ANON_KEY

        if (isDev && !hasSupabase) {
          // Mock data only if no Supabase configured
          const mockUser = {
            id: 1,
            tg_user_id: tgUser?.id || 12345678,
            username: tgUser?.username || 'admin',
            first_name: tgUser?.first_name || 'Super',
            last_name: tgUser?.last_name || 'Admin',
            phone_number: null,
            first_seen_at: new Date().toISOString(),
            points: 25000,
            warns: 0,
            banned: false,
            source: 'miniapp',
            subscription_tier: 'pro' as const,
            subscription_expires_at: '2025-12-31T23:59:59Z',
            daily_swipes_used: 0,
            daily_swipes_reset_at: null,
            daily_superlikes_used: 0,
            daily_superlikes_reset_at: null,
            team_role: 'core' as const,
            active_skin_id: null,
            invites_remaining: 5,
            invited_by: null,
            invite_code_used: null,
            last_active_at: new Date().toISOString(),
            last_daily_reward_at: null,
            last_weekly_reward_at: null,
            last_monthly_reward_at: null,
            last_referral_reward_at: null,
            referral_count: 0,
            referral_points_earned: 0,
            total_points_earned: 25000,
            total_points_spent: 0,
            total_points_withdrawn: 0,
            total_points_donated: 0,
            total_points_received: 0,
            total_points_refunded: 0,
            total_points_adjusted: 0,
            total_points_expired: 0,
            total_points_burned: 0,
            total_points_minted: 0,
            total_points_staked: 0,
            total_points_unstaked: 0,
            total_points_locked: 0,
            total_points_unlocked: 0,
            total_points_claimed: 0,
            total_points_unclaimed: 0,
            total_points_pending: 0,
            total_points_available: 25000,
            total_points_frozen: 0,
            total_points_redeemed: 0,
            total_points_gifted: 0,
            total_points_bounty: 0,
            total_points_airdrop: 0,
            total_points_referral: 0,
            total_points_event: 0,
            total_points_achievement: 0,
            total_points_quest: 0,
            total_points_task: 0,
            total_points_challenge: 0,
            total_points_game: 0,
            total_points_quiz: 0,
            total_points_poll: 0,
            total_points_survey: 0,
            total_points_content: 0,
            total_points_social: 0,
            total_points_community: 0,
            total_points_moderation: 0,
            total_points_feedback: 0,
            total_points_bug_report: 0,
            total_points_suggestion: 0,
            total_points_contribution: 0,
            total_points_participation: 0,
            total_points_engagement: 0,
            total_points_activity: 0,
            total_points_login: 0,
            total_points_daily: 0,
            total_points_weekly: 0,
            total_points_monthly: 0,
            total_points_yearly: 0,
            total_points_lifetime: 25000,
            total_points_current: 25000,
            total_points_rank: 1,
            total_points_level: 1,
            total_points_tier: 'bronze',
            total_points_badge: 'newbie',
            total_points_status: 'active',
            total_points_streak: 0,
            total_points_multiplier: 1,
            total_points_bonus: 0,
            total_points_penalty: 0,
            total_points_adjustment: 0,
            total_points_net: 25000,
            total_points_gross: 25000,
            total_points_balance: 25000,
            total_points_history: [],
            total_points_transactions: [],
            total_points_rewards: [],
            total_points_achievements: [],
            total_points_quests: [],
            total_points_tasks: [],
            total_points_challenges: [],
            total_points_games: [],
            total_points_quizzes: [],
            total_points_polls: [],
            total_points_surveys: [],
            total_points_content_created: 0,
            total_points_content_viewed: 0,
            total_points_content_liked: 0,
            total_points_content_shared: 0,
            total_points_content_commented: 0,
            total_points_social_followers: 0,
            total_points_social_following: 0,
            total_points_social_posts: 0,
            total_points_social_likes: 0,
            total_points_social_comments: 0,
            total_points_social_shares: 0,
            total_points_community_events_attended: 0,
            total_points_community_events_hosted: 0,
            total_points_community_groups_joined: 0,
            total_points_community_groups_created: 0,
            total_points_moderation_actions: 0,
            total_points_feedback_submitted: 0,
            total_points_bug_reports_submitted: 0,
            total_points_suggestions_submitted: 0,
            total_points_contributions_made: 0,
            total_points_participations_made: 0,
            total_points_engagements_made: 0,
            total_points_activities_made: 0,
            total_points_logins_made: 0,
            total_points_daily_rewards_claimed: 0,
            total_points_weekly_rewards_claimed: 0,
            total_points_monthly_rewards_claimed: 0,
            total_points_yearly_rewards_claimed: 0,
            total_points_lifetime_rewards_claimed: 0,
            total_points_current_rewards_claimed: 0,
            total_points_rank_achieved: 0,
            total_points_level_achieved: 0,
            total_points_tier_achieved: '',
            total_points_badge_achieved: '',
            total_points_status_achieved: '',
            total_points_streak_achieved: 0,
            total_points_multiplier_achieved: 0,
            total_points_bonus_achieved: 0,
            total_points_penalty_incurred: 0,
            total_points_adjustment_made: 0,
            total_points_net_change: 0,
            total_points_gross_change: 0,
            total_points_balance_change: 0,
            total_points_history_count: 0,
            total_points_transactions_count: 0,
            total_points_rewards_count: 0,
            total_points_achievements_count: 0,
            total_points_quests_count: 0,
            total_points_tasks_count: 0,
            total_points_challenges_count: 0,
            total_points_games_count: 0,
            total_points_quizzes_count: 0,
            total_points_polls_count: 0,
            total_points_surveys_count: 0,
            total_points_content_created_count: 0,
            total_points_content_viewed_count: 0,
            total_points_content_liked_count: 0,
            total_points_content_shared_count: 0,
            total_points_content_commented_count: 0,
            total_points_social_followers_count: 0,
            total_points_social_following_count: 0,
            total_points_social_posts_count: 0,
            total_points_social_likes_count: 0,
            total_points_social_comments_count: 0,
            total_points_social_shares_count: 0,
            total_points_community_events_attended_count: 0,
            total_points_community_events_hosted_count: 0,
            total_points_community_groups_joined_count: 0,
            total_points_community_groups_created_count: 0,
            total_points_moderation_actions_count: 0,
            total_points_feedback_submitted_count: 0,
            total_points_bug_reports_submitted_count: 0,
            total_points_suggestions_submitted_count: 0,
            total_points_contributions_made_count: 0,
            total_points_participations_made_count: 0,
            total_points_engagements_made_count: 0,
            total_points_activities_made_count: 0,
            total_points_logins_made_count: 0,
            total_points_daily_rewards_claimed_count: 0,
            total_points_weekly_rewards_claimed_count: 0,
            total_points_monthly_rewards_claimed_count: 0,
            total_points_yearly_rewards_claimed_count: 0,
            total_points_lifetime_rewards_claimed_count: 0,
            total_points_current_rewards_claimed_count: 0,
            total_points_rank_achieved_count: 0,
            total_points_level_achieved_count: 0,
            total_points_tier_achieved_count: 0,
            total_points_badge_achieved_count: 0,
            total_points_status_achieved_count: 0,
            total_points_streak_achieved_count: 0,
            total_points_multiplier_achieved_count: 0,
            total_points_bonus_achieved_count: 0,
            total_points_penalty_incurred_count: 0,
            total_points_adjustment_made_count: 0,
            total_points_net_change_count: 0,
            total_points_gross_change_count: 0,
            total_points_balance_change_count: 0,
            total_points_history_total: 0,
            total_points_transactions_total: 0,
            total_points_rewards_total: 0,
            total_points_achievements_total: 0,
            total_points_quests_total: 0,
            total_points_tasks_total: 0,
            total_points_challenges_total: 0,
            total_points_games_total: 0,
            total_points_quizzes_total: 0,
            total_points_polls_total: 0,
            total_points_surveys_total: 0,
            total_points_content_created_total: 0,
            total_points_content_viewed_total: 0,
            total_points_content_liked_total: 0,
            total_points_content_shared_total: 0,
            total_points_content_commented_total: 0,
            total_points_social_followers_total: 0,
            total_points_social_following_total: 0,
            total_points_social_posts_total: 0,
            total_points_social_likes_total: 0,
            total_points_social_comments_total: 0,
            total_points_social_shares_total: 0,
            total_points_community_events_attended_total: 0,
            total_points_community_events_hosted_total: 0,
            total_points_community_groups_joined_total: 0,
            total_points_community_groups_created_total: 0,
            total_points_moderation_actions_total: 0,
            total_points_feedback_submitted_total: 0,
            total_points_bug_reports_submitted_total: 0,
            total_points_suggestions_submitted_total: 0,
            total_points_contributions_made_total: 0,
            total_points_participations_made_total: 0,
            total_points_engagements_made_total: 0,
            total_points_activities_made_total: 0,
            total_points_logins_made_total: 0,
            total_points_daily_rewards_claimed_total: 0,
            total_points_weekly_rewards_claimed_total: 0,
            total_points_monthly_rewards_claimed_total: 0,
            total_points_yearly_rewards_claimed_total: 0,
            total_points_lifetime_rewards_claimed_total: 0,
            total_points_current_rewards_claimed_total: 0,
            total_points_rank_achieved_total: 0,
            total_points_level_achieved_total: 0,
            total_points_tier_achieved_total: 0,
            total_points_badge_achieved_total: 0,
            total_points_status_achieved_total: 0,
            total_points_streak_achieved_total: 0,
            total_points_multiplier_achieved_total: 0,
            total_points_bonus_achieved_total: 0,
            total_points_penalty_incurred_total: 0,
            total_points_adjustment_made_total: 0,
            total_points_net_change_total: 0,
            total_points_gross_change_total: 0,
            total_points_balance_change_total: 0,
            total_points_history_sum: 0,
            total_points_transactions_sum: 0,
            total_points_rewards_sum: 0,
            total_points_achievements_sum: 0,
            total_points_quests_sum: 0,
            total_points_tasks_sum: 0,
            total_points_challenges_sum: 0,
            total_points_games_sum: 0,
            total_points_quizzes_sum: 0,
            total_points_polls_sum: 0,
            total_points_surveys_sum: 0,
            total_points_content_created_sum: 0,
            total_points_content_viewed_sum: 0,
            total_points_content_liked_sum: 0,
            total_points_content_shared_sum: 0,
            total_points_content_commented_sum: 0,
            total_points_social_followers_sum: 0,
            total_points_social_following_sum: 0,
            total_points_social_posts_sum: 0,
            total_points_social_likes_sum: 0,
            total_points_social_comments_sum: 0,
            total_points_social_shares_sum: 0,
            total_points_community_events_attended_sum: 0,
            total_points_community_events_hosted_sum: 0,
            total_points_community_groups_joined_sum: 0,
            total_points_community_groups_created_sum: 0,
            total_points_moderation_actions_sum: 0,
            total_points_feedback_submitted_sum: 0,
            total_points_bug_reports_submitted_sum: 0,
            total_points_suggestions_submitted_sum: 0,
            total_points_contributions_made_sum: 0,
            total_points_participations_made_sum: 0,
            total_points_engagements_made_sum: 0,
            total_points_activities_made_sum: 0,
            total_points_logins_made_sum: 0,
            total_points_daily_rewards_claimed_sum: 0,
            total_points_weekly_rewards_claimed_sum: 0,
            total_points_monthly_rewards_claimed_sum: 0,
            total_points_yearly_rewards_claimed_sum: 0,
            total_points_lifetime_rewards_claimed_sum: 0,
            total_points_current_rewards_claimed_sum: 0,
            total_points_rank_achieved_sum: 0,
            total_points_level_achieved_sum: 0,
            total_points_tier_achieved_sum: 0,
            total_points_badge_achieved_sum: 0,
            total_points_status_achieved_sum: 0,
            total_points_streak_achieved_sum: 0,
            total_points_multiplier_achieved_sum: 0,
            total_points_bonus_achieved_sum: 0,
            total_points_penalty_incurred_sum: 0,
            total_points_adjustment_made_sum: 0,
            total_points_net_change_sum: 0,
            total_points_gross_change_sum: 0,
            total_points_balance_change_sum: 0,
          }
          setUser(mockUser)

          const mockProfile = {
            id: 1,
            user_id: 1,
            bio: 'Основатель MAIN Community.',
            occupation: 'Founder & CEO',
            looking_for: 'Партнёры, инвесторы',
            can_help_with: 'Бизнес-стратегия, нетворкинг',
            needs_help_with: null,
            photo_file_id: null,
            photo_url: null,
            city: 'Минск',
            moderation_status: 'approved' as const,
            is_visible: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skills: ['business', 'networking'],
            interests: ['entrepreneurship', 'tech'],
            telegram_username: 'admin',
            linkedin_url: null,
          }
          setProfile(mockProfile)
          setLoading(false)
          return
        }

        // For dev with Supabase - use test user ID
        const userId = tgUser?.id || 1379584180 // Your TG ID for dev

        // 1. Check if invite system is enabled
        const inviteRequired = await isInviteRequired()
        setInviteRequired(inviteRequired)

        // 2. Parse invite code from start_param
        const webApp = getTelegramWebApp()
        // @ts-ignore
        const startParam = webApp?.initDataUnsafe?.start_param
        let inviteCode: string | null = null
        if (startParam?.startsWith('invite_')) {
          inviteCode = startParam.replace('invite_', '')
          setPendingInviteCode(inviteCode)
        }

        // 3. User Access Check (if invite required)
        let hasAccess = true
        let isExistingUser = false

        if (inviteRequired) {
          const access = await checkUserAccess(userId)
          hasAccess = access.hasAccess
          isExistingUser = access.isExistingUser

          // If user doesn't have access and no invite code trying to use - DENY
          if (!hasAccess && !inviteCode) {
            setAccessDenied(true)
            // Set basic user data for UI even if denied
            setUser({
              id: 0, // Placeholder
              tg_user_id: userId,
              username: tgUser?.username || null,
              first_name: tgUser?.first_name || 'Guest',
              last_name: tgUser?.last_name || null,
              // @ts-ignore
              points: 0
            } as any)
            setLoading(false)
            return
          }
        }

        // Get or create user in database (Normal Flow)
        let user = await getUserByTelegramId(userId)
        const isNewUser = !user

        // If invite required and user not found, and we have invite code -> continue to AccessGate to redeem
        if (inviteRequired && !user && inviteCode) {
          setAccessDenied(true) // Show access gate in "invite mode"
          setUser({
            id: 0, // Placeholder
            tg_user_id: userId,
            username: tgUser?.username || null,
            first_name: tgUser?.first_name || 'Guest',
            last_name: tgUser?.last_name || null,
            // @ts-ignore
            points: 0
          } as any)
          setLoading(false)
          return
        }

        // Normal flow continued...
        isExistingUser = !!user

        // Always update user data from Telegram (or create if new)
        if (tgUser) {
          user = await createOrUpdateUser({
            tg_user_id: tgUser.id,
            username: tgUser.username,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
          })
          if (isNewUser) {
            addToast('Добро пожаловать в MAIN Community!', 'success')
          }
        }

        if (!user) {
          throw new Error('User not found')
        }

        setUser(user)

        // Fetch app settings (show_funnel_for_team)
        try {
          const funnelSetting = await getShowFunnelForTeam()
          setShowFunnelForTeam(funnelSetting)
        } catch (e) {
          console.warn('Failed to fetch app settings:', e)
        }

        // Check and update daily streak
        try {
          const streakResult = await checkAndUpdateDailyStreak(user.id)
          if (streakResult.reward) {
            addToast(`🔥 ${streakResult.streak} дней подряд! Pro на ${streakResult.reward.proAwarded} дн.`, 'success')
          } else if (!streakResult.alreadyCheckedToday) {
            // Show streak for any day (including day 1)
            addToast(`🔥 День ${streakResult.streak}! Заходи каждый день для награды`, 'success')
          }
        } catch (e) {
          console.warn('Failed to update daily streak:', e)
        }

        // Start session tracking
        try {
          const newSessionId = await startSession(user.id)
          if (newSessionId) {
            setSessionId(newSessionId)
          }
        } catch (e) {
          console.warn('Failed to start session:', e)
        }

        // Update last app open for engagement notifications
        updateLastAppOpen(user.id)

        // Get profile if exists
        const profile = await getProfile(user.id)
        const tgPhotoUrl = tgUser?.photo_url

        if (profile) {
          // Update photo from Telegram if available and different
          if (tgPhotoUrl && tgPhotoUrl !== profile.photo_url) {
            try {
              const updatedProfile = await updateProfile(user.id, { photo_url: tgPhotoUrl })
              setProfile(updatedProfile)
            } catch {
              // If update fails, use existing profile
              setProfile(profile)
            }
          } else {
            setProfile(profile)
          }
        } else {
          // No profile - create one with Telegram photo and basic data
          try {
            const newProfile = await createProfile(user.id, {
              city: 'Минск', // Default city
              photo_url: tgPhotoUrl || null,
              bio: null,
              occupation: null,
            })
            setProfile(newProfile)
          } catch (e) {
            console.warn('Failed to create profile:', e)
          }
        }
      } catch (error) {
        console.error('Init error:', error)
        addToast('Ошибка загрузки', 'error')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [setLoading, setUser, setProfile, addToast])

  // Session heartbeat - ping every 30 seconds
  useEffect(() => {
    if (!sessionId) return

    const interval = setInterval(() => {
      sessionHeartbeat(sessionId).catch(console.warn)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [sessionId])

  // Session visibility tracking - end session when app goes to background
  useEffect(() => {
    if (!sessionId || !user?.id) return

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // App went to background - end session
        await endSession(sessionId, user.id).catch(console.warn)
        setSessionId(null)
      } else {
        // App came back - start new session
        const newSessionId = await startSession(user.id).catch(() => null)
        if (newSessionId) {
          setSessionId(newSessionId)
        }
      }
    }

    const handleBeforeUnload = () => {
      // Try to end session on page close (unreliable on mobile)
      if (sessionId && user?.id) {
        // Use sendBeacon for more reliable delivery
        navigator.sendBeacon?.('/api/end-session', JSON.stringify({ sessionId, userId: user.id }))
        // Also try normal end (may not complete)
        endSession(sessionId, user.id).catch(() => { })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [sessionId, user?.id])

  // Capture broadcast click immediately (before user loads)
  useEffect(() => {
    const webApp = getTelegramWebApp()
    // @ts-ignore - start_param might not be in types
    const startParam = webApp?.initDataUnsafe?.start_param
    const urlParams = new URLSearchParams(window.location.search)
    const screenParam = urlParams.get('screen')
    const deepLinkValue = startParam || screenParam

    if (deepLinkValue) {
      const broadcastMatch = deepLinkValue.match(/^(.+)_b(\d+)$/)
      if (broadcastMatch) {
        const broadcastId = parseInt(broadcastMatch[2], 10)
        if (!isNaN(broadcastId)) {
          pendingBroadcastClick.current = broadcastId
        }
      }
    }
  }, []) // Run once on mount

  // Log pending broadcast click when user loads
  useEffect(() => {
    if (user?.id && pendingBroadcastClick.current !== null) {
      const broadcastId = pendingBroadcastClick.current
      pendingBroadcastClick.current = null // Clear to prevent duplicate logs

      fetch('/api/send-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'log_click', broadcastId, userId: user.id })
      }).catch(console.warn)
    }
  }, [user?.id])

  // Handle deep links (startapp parameter or URL query params)
  useEffect(() => {
    if (isLoading || !user?.id) return

    const webApp = getTelegramWebApp()
    // @ts-ignore - start_param might not be in types
    const startParam = webApp?.initDataUnsafe?.start_param

    // Also check URL query parameters (for web_app button links)
    const urlParams = new URLSearchParams(window.location.search)
    const screenParam = urlParams.get('screen')

    let deepLinkValue = startParam || screenParam

    if (deepLinkValue) {
      // Check for broadcast tracking suffix: screen_b{broadcastId}
      const broadcastMatch = deepLinkValue.match(/^(.+)_b(\d+)$/)
      if (broadcastMatch) {
        const [, actualScreen] = broadcastMatch
        // Click already logged in separate effect, just extract screen
        deepLinkValue = actualScreen
      }

      // Handle review deep link: review_{eventId}
      if (deepLinkValue.startsWith('review_')) {
        const eventId = parseInt(deepLinkValue.replace('review_', ''), 10)
        if (!isNaN(eventId)) {
          // Fetch event and show review modal
          getEventById(eventId).then((event) => {
            if (event) {
              setPendingReviewEvent(event)
              setShowReviewPrompt(true)
              // Navigate to events tab
              setActiveTab('events')
            }
          }).catch(console.warn)
          return
        }
      }

      // Handle event deep link: event_{eventId}
      if (deepLinkValue.startsWith('event_')) {
        const eventId = parseInt(deepLinkValue.replace('event_', ''), 10)
        if (!isNaN(eventId)) {
          setActiveTab('events')
          setDeepLinkTarget(`event_${eventId}`)
          return
        }
      }

      // Handle profile deep link: profile_{userId}
      if (deepLinkValue.startsWith('profile_')) {
        const profileUserId = parseInt(deepLinkValue.replace('profile_', ''), 10)
        if (!isNaN(profileUserId)) {
          setActiveTab('profile')
          setDeepLinkTarget(`profile_${profileUserId}`)
          return
        }
      }

      // Handle course deep link: course_{courseId}
      if (deepLinkValue.startsWith('course_')) {
        setActiveTab('learn')
        setDeepLinkTarget(deepLinkValue)
        return
      }

      // Handle ticket deep link: ticket or ticket_{eventId}
      if (deepLinkValue === 'ticket' || deepLinkValue.startsWith('ticket_')) {
        setActiveTab('events')
        setDeepLinkTarget(deepLinkValue)
        return
      }

      // Map parameter to tab
      const screenMap: Record<string, typeof activeTab> = {
        'home': 'home',
        'events': 'events',
        'network': 'network',
        'matches': 'network', // matches is part of network screen
        'achievements': 'achievements',
        'profile': 'profile',
        'notifications': 'home', // notifications shown on home
      }

      const targetTab = screenMap[deepLinkValue]
      if (targetTab) {
        setActiveTab(targetTab)
        // Set deep link target for specific sub-screens
        if (deepLinkValue === 'matches' || deepLinkValue === 'notifications') {
          setDeepLinkTarget(deepLinkValue)
        }
      }
    }
  }, [isLoading, user?.id, setActiveTab, setDeepLinkTarget])

  // Listen for postMessage navigation commands from admin builder (preview mode)
  useEffect(() => {
    if (!isPreviewMode()) return

    const handleMessage = (event: MessageEvent) => {
      // Accept messages with NAVIGATE type
      if (event.data?.type === 'NAVIGATE' && event.data?.screen) {
        const screenMap: Record<string, typeof activeTab> = {
          'home': 'home',
          'events': 'events',
          'learn': 'learn',
          'network': 'network',
          'achievements': 'achievements',
          'profile': 'profile',
        }
        const targetTab = screenMap[event.data.screen]
        if (targetTab) {
          console.log('[Preview] Navigate to:', targetTab)
          setActiveTab(targetTab)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [setActiveTab])

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />
  }

  // Show non-Telegram screen (only in production)
  if (!import.meta.env.DEV && !isTelegramWebApp()) {
    return <NotTelegramScreen />
  }

  // Show access gate if denied
  if (accessDenied) {
    return (
      <div className="bg-bg min-h-screen text-white max-w-lg mx-auto">
        <React.Suspense fallback={<LoadingScreen />}>
          <AccessGateScreen />
        </React.Suspense>
      </div>
    )
  }

  // Show onboarding for users who haven't seen current version
  if (shouldShowOnboarding()) {
    return (
      <div className="bg-bg min-h-screen text-white max-w-lg mx-auto">
        <React.Suspense fallback={<LoadingScreen />}>
          <OnboardingScreen />
        </React.Suspense>
      </div>
    )
  }

  // Render active screen
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />
      case 'events':
        return <EventsScreen />
      case 'learn':
        return <LearnScreen />
      case 'network':
        return <NetworkScreen />
      case 'achievements':
        return <AchievementsScreen />
      case 'profile':
        return <ProfileScreen />
      case 'prompts':
        return <PromptsGalleryScreen onBack={() => setActiveTab('home')} />
      default:
        return <HomeScreen />
    }
  }

  const isFixedScreen = activeTab === 'network'

  return (
    <div
      className="bg-bg text-white max-w-lg mx-auto flex flex-col h-full overflow-hidden select-none"
      {...swipeHandlers}
    >
      {!hideHeader && <LogoHeader />}
      <ToastContainer />

      <div
        key={activeTab}
        className={`flex-1 w-full relative ${!hideHeader ? 'pt-[90px]' : ''
          } ${!hideNavigation && !isFixedScreen ? 'pb-[90px]' : ''
          } ${isFixedScreen ? 'overflow-hidden' : 'overflow-y-auto overscroll-contain'}`}
      >
        <React.Suspense fallback={<LoadingScreen />}>
          {renderScreen()}
        </React.Suspense>
      </div>

      {!hideNavigation && <Navigation />}

      {/* Global Invite Bottom Sheet */}
      <AnimatePresence>
        {showInvites && (
          <React.Suspense fallback={null}>
            <InviteBottomSheet onClose={() => setShowInvites(false)} />
          </React.Suspense>
        )}
      </AnimatePresence>

      {/* What's New Changelog Sheet */}
      <React.Suspense fallback={null}>
        <ChangelogSheet
          isOpen={showChangelog}
          onClose={() => {
            setShowChangelog(false)
            setLastSeenAppVersion(CURRENT_APP_VERSION)
          }}
        />
      </React.Suspense>

      {/* Event Review Prompt */}
      <React.Suspense fallback={null}>
        {pendingReviewEvent && user && (
          <ReviewBottomSheet
            isOpen={showReviewPrompt}
            onClose={() => {
              setShowReviewPrompt(false)
              setPendingReviewEvent(null)
            }}
            event={pendingReviewEvent}
            userId={user.id}
            onSuccess={() => {
              // Could refresh data or show next pending review
            }}
          />
        )}
      </React.Suspense>

      {/* PRO Gift Notification Modal */}
      <React.Suspense fallback={null}>
        {proGiftData && (
          <ProGiftModal
            isOpen={showProGiftModal}
            onClose={() => {
              setShowProGiftModal(false)
              acknowledgeProGift(proGiftData.id)
              setProGiftData(null)
            }}
            adminName={proGiftData.adminName}
            adminUsername={proGiftData.adminUsername}
            adminAvatarUrl={proGiftData.adminAvatarUrl}
            durationDays={proGiftData.durationDays}
          />
        )}
      </React.Suspense>

      {/* Networking Promo Sheet */}
      <React.Suspense fallback={null}>
        <NetworkingPromoSheet
          isOpen={showNetworkingPromo}
          onClose={() => {
            setShowNetworkingPromo(false)
            localStorage.setItem('networkingPromoLastShown', new Date().toDateString())
          }}
          likesCount={networkingLikesCount}
          onOpenNetwork={() => {
            setShowNetworkingPromo(false)
            localStorage.setItem('networkingPromoLastShown', new Date().toDateString())
            setActiveTab('network')
          }}
        />
      </React.Suspense>

      {/* Prompts Promo Sheet */}
      <React.Suspense fallback={null}>
        <PromptsPromoSheet
          isOpen={showPromptsPromo}
          onClose={() => {
            setShowPromptsPromo(false)
            localStorage.setItem('promptsPromoSeen', 'true')
          }}
          onOpenPrompts={() => {
            setShowPromptsPromo(false)
            localStorage.setItem('promptsPromoSeen', 'true')
            setActiveTab('prompts')
          }}
        />
      </React.Suspense>
    </div>

  )
}

export default App
