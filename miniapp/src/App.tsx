import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore, useToastStore, calculateRank } from '@/lib/store'
import { initTelegramApp, getTelegramUser, isTelegramWebApp, getTelegramWebApp } from '@/lib/telegram'
import { getUserByTelegramId, createOrUpdateUser, getProfile, updateProfile, createProfile, isInviteRequired, checkUserAccess } from '@/lib/supabase'
import { Navigation } from '@/components/Navigation'
import { ToastContainer } from '@/components/ToastContainer'
import { LogoHeader } from '@/components/LogoHeader'
import { Skeleton } from '@/components/ui'
import { useSpeedRunner } from '@/lib/easterEggs'

// Screen imports (lazy loaded)
const HomeScreen = React.lazy(() => import('@/screens/HomeScreen'))
const EventsScreen = React.lazy(() => import('@/screens/EventsScreen'))
const NetworkScreen = React.lazy(() => import('@/screens/NetworkScreen'))
const AchievementsScreen = React.lazy(() => import('@/screens/AchievementsScreen'))
const ProfileScreen = React.lazy(() => import('@/screens/ProfileScreen'))
const OnboardingScreen = React.lazy(() => import('@/screens/OnboardingScreen'))
const AccessGateScreen = React.lazy(() => import('@/screens/AccessGateScreen'))
const InviteBottomSheet = React.lazy(() => import('@/components/InviteBottomSheet').then(m => ({ default: m.InviteBottomSheet })))

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
    <div className="text-6xl mb-4">📱</div>
    <h1 className="text-xl font-bold mb-2">Откройте в Telegram</h1>
    <p className="text-gray-400 text-sm mb-6">
      Это приложение работает только внутри Telegram.
      <br />
      Откройте бота @MainCommunityBot и запустите Mini App.
    </p>
    <a
      href="https://t.me/MainCommunityBot"
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
  const { activeTab, isLoading, setLoading, setUser, setProfile, isAuthenticated, shouldShowOnboarding, profile, setActiveTab, setDeepLinkTarget, accessDenied, setAccessDenied, setPendingInviteCode, setInviteRequired, showInvites, setShowInvites } = useAppStore()
  const { addToast } = useToastStore()

  // Easter eggs - speed runner (visit all tabs quickly)
  const { recordTabVisit } = useSpeedRunner(['home', 'events', 'network', 'achievements', 'profile'], 10000)

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

  // Handle deep links (startapp parameter)
  useEffect(() => {
    if (isLoading) return

    const webApp = getTelegramWebApp()
    // @ts-ignore - start_param might not be in types
    const startParam = webApp?.initDataUnsafe?.start_param

    if (startParam) {
      // Map startapp parameter to tab
      const screenMap: Record<string, typeof activeTab> = {
        'home': 'home',
        'events': 'events',
        'network': 'network',
        'matches': 'network', // matches is part of network screen
        'achievements': 'achievements',
        'profile': 'profile',
        'notifications': 'home', // notifications shown on home
      }

      const targetTab = screenMap[startParam]
      if (targetTab) {
        setActiveTab(targetTab)
        // Set deep link target for specific sub-screens
        if (startParam === 'matches' || startParam === 'notifications') {
          setDeepLinkTarget(startParam)
        }
      }
    }
  }, [isLoading, setActiveTab, setDeepLinkTarget])

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
      case 'network':
        return <NetworkScreen />
      case 'achievements':
        return <AchievementsScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div className="bg-bg min-h-screen text-white max-w-lg mx-auto">
      <LogoHeader />
      <ToastContainer />

      <AnimatePresence mode="popLayout">
        <PageTransition key={activeTab}>
          <React.Suspense fallback={<LoadingScreen />}>
            {renderScreen()}
          </React.Suspense>
        </PageTransition>
      </AnimatePresence>

      <Navigation />

      {/* Global Invite Bottom Sheet */}
      <AnimatePresence>
        {showInvites && (
          <React.Suspense fallback={null}>
            <InviteBottomSheet onClose={() => setShowInvites(false)} />
          </React.Suspense>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
