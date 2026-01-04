import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore, useToastStore, calculateRank } from '@/lib/store'
import { initTelegramApp, getTelegramUser, isTelegramWebApp, getTelegramWebApp } from '@/lib/telegram'
import { getUserByTelegramId, createOrUpdateUser, getProfile, updateProfile, createProfile } from '@/lib/supabase'
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
  const { activeTab, isLoading, setLoading, setUser, setProfile, isAuthenticated, shouldShowOnboarding, profile, setActiveTab, setDeepLinkTarget } = useAppStore()
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

        // Get or create user in database
        let user = await getUserByTelegramId(userId)
        const isNewUser = !user

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
    </div>
  )
}

export default App
