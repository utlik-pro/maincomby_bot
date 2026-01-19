/**
 * Profile Block - User profile card with stats
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { AvatarWithSkin, Card, Progress } from '@/components/ui'
import { RANK_LABELS } from '@/types'
import { getUserActiveSkin } from '@/lib/supabase'
import { SubscriptionBadge } from '@/components/SubscriptionBadge'
import type { AppBlock, ProfileBlockConfig } from '@shared/types'

interface ProfileBlockProps {
  block: AppBlock<'profile'>
}

export function ProfileBlock({ block }: ProfileBlockProps) {
  const config = block.config as ProfileBlockConfig
  const { user, profile, getRank, getRankProgress, getSubscriptionTier } = useAppStore()

  // Fetch user's active skin
  const { data: userActiveSkin } = useQuery({
    queryKey: ['userActiveSkin', user?.id],
    queryFn: () => (user ? getUserActiveSkin(user.id) : null),
    enabled: !!user,
    staleTime: 60000,
  })

  const rank = getRank()
  const rankInfo = RANK_LABELS[rank]
  const { progress, next } = getRankProgress()
  const nextRankInfo = next ? RANK_LABELS[next] : null

  if (config.compactMode) {
    return (
      <div className="px-4 py-2 flex items-center justify-between bg-bg-card rounded-xl mx-4 mb-4">
        <div className="flex items-center gap-3">
          <AvatarWithSkin
            src={profile?.photo_url}
            name={user?.first_name || 'User'}
            size="sm"
            skin={userActiveSkin}
            role={user?.team_role}
            tier={user?.subscription_tier === 'pro' ? 'pro' : user?.subscription_tier === 'light' ? 'light' : null}
          />
          <div>
            <div className="font-medium text-sm">{user?.first_name || 'User'}</div>
            <div className="text-accent text-xs">{user?.points || 0} XP</div>
          </div>
        </div>
        <SubscriptionBadge tier={getSubscriptionTier()} />
      </div>
    )
  }

  return (
    <div className="px-4 mb-4">
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <AvatarWithSkin
            src={profile?.photo_url}
            name={user?.first_name || 'User'}
            size="lg"
            skin={userActiveSkin}
            role={user?.team_role}
            tier={user?.subscription_tier === 'pro' ? 'pro' : user?.subscription_tier === 'light' ? 'light' : null}
          />
          <div className="flex-1">
            <div className="font-semibold text-lg">{user?.first_name || 'User'}</div>
            <div className="flex items-center gap-2">
              <span className="text-accent text-sm font-medium flex items-center gap-1">
                <Star size={14} className="fill-accent" />
                {rankInfo.ru}
              </span>
              <span className="text-gray-500 text-sm">{user?.points || 0} XP</span>
            </div>
          </div>
          <SubscriptionBadge tier={getSubscriptionTier()} />
        </div>

        {config.showLevel && nextRankInfo && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">
                {block.title?.ru || `До ${nextRankInfo.ru}`}
              </span>
              <Star size={16} className="text-accent fill-accent" />
            </div>
            <Progress value={progress} />
          </div>
        )}
      </Card>
    </div>
  )
}
