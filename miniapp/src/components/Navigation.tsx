import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Home, Calendar, Trophy, User, GraduationCap, Flame, Heart, Users } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { hapticFeedback } from '@/lib/telegram'
import { getActiveEvents, getIncomingLikes, getUserMatches } from '@/lib/supabase'
import { useDoubleTapEasterEgg } from '@/lib/easterEggs'

// Regular tabs (left and right of the center button)
const leftTabs = [
  { id: 'home' as const, icon: Home, label: 'Главная' },
  { id: 'events' as const, icon: Calendar, label: 'События' },
]

// Note: 'learn' tab temporarily moved to HomeScreen card
const rightTabs = [
  { id: 'achievements' as const, icon: Trophy, label: 'Награды' },
  { id: 'profile' as const, icon: User, label: 'Профиль' },
]

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, lastSeenEventId, setLastSeenEventId, hideNavigation, user } = useAppStore()
  const isProcessingRef = useRef(false)

  // Double tap on profile tab = easter egg
  const { handleTap: handleDoubleTap, isUnlocked: doubleTapUnlocked } = useDoubleTapEasterEgg(300)

  // Fetch events to check for new ones
  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: getActiveEvents,
    staleTime: 60000, // 1 minute
  })

  // Fetch matches count (contacts) for network badge
  const { data: matchesData } = useQuery({
    queryKey: ['userMatches', user?.id],
    queryFn: () => (user ? getUserMatches(user.id) : []),
    enabled: !!user,
    staleTime: 60000,
  })
  const matchesCount = matchesData?.length || 0

  // Fetch incoming likes count for network badge
  const { data: likesData } = useQuery({
    queryKey: ['incomingLikes', user?.id],
    queryFn: () => (user ? getIncomingLikes(user.id) : { count: 0 }),
    enabled: !!user,
    staleTime: 60000,
  })
  const likesCount = likesData?.count || 0

  // Check if there are new events
  const latestEventId = events?.[0]?.id || 0
  const hasNewEvents = latestEventId > 0 && latestEventId > (lastSeenEventId || 0)

  const handleTabClick = (tabId: typeof activeTab) => {
    hapticFeedback.selection()
    setActiveTab(tabId)

    // Mark events as seen when opening events tab
    if (tabId === 'events' && latestEventId > 0) {
      setLastSeenEventId(latestEventId)
    }

    // Easter egg: double tap on profile tab (with protection against rapid taps)
    if (tabId === 'profile' && !doubleTapUnlocked && !isProcessingRef.current) {
      try {
        isProcessingRef.current = true
        handleDoubleTap()
        // Reset after short delay
        setTimeout(() => { isProcessingRef.current = false }, 100)
      } catch (e) {
        console.warn('Double tap easter egg error:', e)
        isProcessingRef.current = false
      }
    }
  }

  // Hide navigation when viewing lesson content
  if (hideNavigation) {
    return null
  }

  const isNetworkActive = activeTab === 'network'
  const totalNotifications = matchesCount + likesCount

  // Render a regular tab button
  const renderTab = (tab: { id: string; icon: React.ElementType; label: string }) => {
    const isActive = activeTab === tab.id
    const IconComponent = tab.icon
    const showEventBadge = tab.id === 'events' && hasNewEvents && !isActive

    return (
      <motion.button
        key={tab.id}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleTabClick(tab.id as typeof activeTab)}
        className="flex flex-col items-center gap-1 px-3 py-2 relative flex-1"
      >
        <div className="relative">
          <IconComponent
            size={22}
            className={`transition-all duration-200 ${isActive ? 'text-accent' : 'text-gray-500'}`}
          />
          {showEventBadge && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
          )}
        </div>
        <span className={`text-[10px] font-semibold transition-colors duration-200 ${isActive ? 'text-accent' : 'text-gray-500'}`}>
          {tab.label}
        </span>
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
          />
        )}
      </motion.button>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg border-t border-bg-card z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-end py-2 px-2">
        {/* Left tabs */}
        <div className="flex flex-1">
          {leftTabs.map(renderTab)}
        </div>

        {/* Center Network Button - Tinder style */}
        <div className="relative -mt-6 mx-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTabClick('network')}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center
              shadow-lg shadow-red-500/30
              ${isNetworkActive
                ? 'bg-gradient-to-br from-red-500 to-red-600'
                : 'bg-gradient-to-br from-red-500 to-red-600'
              }
            `}
          >
            <Flame
              size={28}
              className="text-white"
              strokeWidth={2.5}
              fill="white"
            />
          </motion.button>
          {/* Notification badge */}
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-white text-red-500 text-[11px] font-bold px-1.5 rounded-full flex items-center justify-center shadow-md">
              {totalNotifications > 99 ? '99+' : totalNotifications}
            </span>
          )}
        </div>

        {/* Right tabs */}
        <div className="flex flex-1">
          {rightTabs.map(renderTab)}
        </div>
      </div>
    </nav>
  )
}
