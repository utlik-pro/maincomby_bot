import React from 'react'
import { motion } from 'framer-motion'
import { Home, Calendar, Trophy, User } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { hapticFeedback } from '@/lib/telegram'

// MVP v1.0: Network tab hidden until critical mass of profiles
const tabs = [
  { id: 'home' as const, icon: Home, label: 'Главная' },
  { id: 'events' as const, icon: Calendar, label: 'События' },
  // { id: 'network' as const, icon: Flame, label: 'Нетворк' }, // Coming in v2
  { id: 'achievements' as const, icon: Trophy, label: 'Награды' },
  { id: 'profile' as const, icon: User, label: 'Профиль' },
]

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore()

  const handleTabClick = (tabId: typeof activeTab) => {
    hapticFeedback.selection()
    setActiveTab(tabId)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg border-t border-bg-card z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const IconComponent = tab.icon

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTabClick(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-2 relative"
            >
              <IconComponent
                size={22}
                className={`transition-all duration-200 ${
                  isActive ? 'text-accent' : 'text-gray-500'
                }`}
              />
              <span
                className={`text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-accent' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
