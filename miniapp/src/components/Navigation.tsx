import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Home, Calendar, Trophy, User, GraduationCap, Flame, Heart, Users } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { hapticFeedback } from '@/lib/telegram'
import { getActiveEvents, getIncomingLikes, getUserMatches } from '@/lib/supabase'
import { useDoubleTapEasterEgg } from '@/lib/easterEggs'

// MVP v1.0: Network tab enabled with red accent
const tabs = [
  { id: 'home' as const, icon: Home, label: 'Главная', isNetwork: false },
  { id: 'events' as const, icon: Calendar, label: 'События', isNetwork: false },
  { id: 'learn' as const, icon: GraduationCap, label: 'Обучение', isNetwork: false },
  { id: 'network' as const, icon: Flame, label: 'Нетворк', isNetwork: true },
  { id: 'achievements' as const, icon: Trophy, label: 'Награды', isNetwork: false },
  { id: 'profile' as const, icon: User, label: 'Профиль', isNetwork: false },
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg border-t border-bg-card z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const IconComponent = tab.icon
          const showEventBadge = tab.id === 'events' && hasNewEvents && !isActive
          const isNetworkTab = tab.isNetwork

          // Color classes - red for network tab, accent for others
          const activeColor = isNetworkTab ? 'text-red-500' : 'text-accent'
          const indicatorColor = isNetworkTab ? 'bg-red-500' : 'bg-accent'

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTabClick(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-2 relative"
            >
              <div className="relative">
                <IconComponent
                  size={22}
                  className={`transition-all duration-200 ${
                    isActive ? activeColor : 'text-gray-500'
                  }`}
                />
                {/* New events badge */}
                {showEventBadge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                )}
                {/* Network tab badges - contacts left, likes right */}
                {isNetworkTab && (matchesCount > 0 || likesCount > 0) && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    {matchesCount > 0 && (
                      <span className="flex items-center gap-0.5 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                        <Users size={8} />
                        {matchesCount}
                      </span>
                    )}
                    {likesCount > 0 && (
                      <span className="flex items-center gap-0.5 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">
                        <Heart size={8} className="fill-white" />
                        {likesCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? activeColor : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${indicatorColor}`}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
