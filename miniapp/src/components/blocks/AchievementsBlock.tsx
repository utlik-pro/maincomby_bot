/**
 * Achievements Block - User badges/achievements
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Trophy, ChevronRight, Lock } from 'lucide-react'
import { Card } from '@/components/ui'
import { useAppStore } from '@/lib/store'
import { getUserAchievements } from '@/lib/supabase'
import { ACHIEVEMENTS } from '@/types'
import type { AppBlock, AchievementsBlockConfig } from '@shared/types'

interface AchievementsBlockProps {
  block: AppBlock<'achievements'>
}

export function AchievementsBlock({ block }: AchievementsBlockProps) {
  const config = block.config as AchievementsBlockConfig
  const { setActiveTab, user } = useAppStore()
  const limit = config.limit || 6

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['userAchievements', user?.id],
    queryFn: () => (user ? getUserAchievements(user.id) : []),
    enabled: !!user,
  })

  const title = block.title?.ru || 'Achievements'
  const earnedIds = new Set(userAchievements.map((a: any) => a.achievement_id))

  // Get achievements to display
  let displayAchievements = ACHIEVEMENTS.slice(0, limit)
  if (!config.showLocked) {
    displayAchievements = ACHIEVEMENTS.filter(a => earnedIds.has(a.id)).slice(0, limit)
  }

  if (displayAchievements.length === 0) return null

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Trophy size={20} className="text-accent" />
          {title}
        </h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('achievements')}
          className="text-accent text-sm flex items-center gap-1"
        >
          All <ChevronRight size={16} />
        </motion.button>
      </div>

      <div className={config.layout === 'grid' ? 'grid grid-cols-4 gap-2' : 'space-y-2'}>
        {displayAchievements.map((achievement) => {
          const isEarned = earnedIds.has(achievement.id)

          if (config.layout === 'grid') {
            return (
              <div
                key={achievement.id}
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${
                  isEarned ? 'bg-accent/20' : 'bg-bg-card opacity-50'
                }`}
              >
                {isEarned ? <Trophy size={20} className="text-accent" /> : <Lock size={16} className="text-gray-600" />}
              </div>
            )
          }

          return (
            <Card
              key={achievement.id}
              className={!isEarned ? 'opacity-50' : ''}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  isEarned ? 'bg-accent/20' : 'bg-bg-card'
                }`}>
                  {isEarned ? <Trophy size={18} className="text-accent" /> : <Lock size={16} className="text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{achievement.title}</div>
                  <div className="text-xs text-gray-500 truncate">{achievement.description}</div>
                </div>
                {isEarned && (
                  <span className="text-accent text-xs font-medium">+{achievement.xpReward} XP</span>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
