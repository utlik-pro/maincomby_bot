/**
 * Leaderboard Block - Top users ranking
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Crown, ChevronRight } from 'lucide-react'
import { AvatarWithSkin, Card } from '@/components/ui'
import { useAppStore } from '@/lib/store'
import { getLeaderboard } from '@/lib/supabase'
import type { AppBlock, LeaderboardBlockConfig } from '@shared/types'

interface LeaderboardBlockProps {
  block: AppBlock<'leaderboard'>
}

export function LeaderboardBlock({ block }: LeaderboardBlockProps) {
  const config = block.config as LeaderboardBlockConfig
  const { setActiveTab, user } = useAppStore()
  const limit = config.limit || 5

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => getLeaderboard(limit),
  })

  if (leaderboard.length === 0) return null

  const title = block.title?.ru || 'Top'
  const medalColors = ['text-yellow-400', 'text-gray-300', 'text-orange-400']

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Crown size={20} className="text-yellow-400" />
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

      <Card>
        <div className="space-y-3">
          {leaderboard.map((member: any, index: number) => {
            const profileData = Array.isArray(member.profile) ? member.profile[0] : member.profile
            const skinData = Array.isArray(member.active_skin) ? member.active_skin[0] : member.active_skin
            const isCurrentUser = member.id === user?.id

            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 ${isCurrentUser ? 'bg-accent/10 -mx-3 px-3 py-2 rounded-lg' : ''}`}
              >
                <div className={`w-6 text-center font-bold ${medalColors[index] || 'text-gray-500'}`}>
                  {index + 1}
                </div>
                <AvatarWithSkin
                  src={profileData?.photo_url}
                  name={member.first_name}
                  size="sm"
                  skin={skinData}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {member.first_name}
                    {isCurrentUser && <span className="text-accent ml-1">(you)</span>}
                  </div>
                </div>
                <div className="text-accent font-semibold">{member.points} XP</div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
