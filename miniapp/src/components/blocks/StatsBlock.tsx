/**
 * Stats Block - User or community statistics
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui'
import { useAppStore } from '@/lib/store'
import { getUserStats } from '@/lib/supabase'
import type { AppBlock, StatsBlockConfig } from '@shared/types'

interface StatsBlockProps {
  block: AppBlock<'stats'>
}

export function StatsBlock({ block }: StatsBlockProps) {
  const config = block.config as StatsBlockConfig
  const { user } = useAppStore()
  const title = block.title?.ru || 'Stats'

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => (user ? getUserStats(user.id) : null),
    enabled: !!user,
  })

  const stats = [
    { key: 'events', label: 'Events', value: userStats?.events || 0, color: 'text-accent' },
    { key: 'matches', label: 'Matches', value: userStats?.matches || 0, color: 'text-success' },
    { key: 'achievements', label: 'Badges', value: userStats?.achievements || 0, color: 'text-white' },
  ]

  return (
    <div className="px-4 mb-6">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <TrendingUp size={20} className="text-accent" />
        {title}
      </h2>
      <div className={`grid ${config.layout === 'grid' ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
        {stats.map((stat) => (
          <Card key={stat.key} className="text-center py-3">
            <div className={`text-2xl font-bold ${stat.color}`}>
              {config.animated ? (
                <AnimatedNumber value={stat.value} />
              ) : (
                stat.value
              )}
            </div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Simple animated number component
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    const duration = 1000
    const steps = 20
    const increment = value / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(interval)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [value])

  return <>{displayValue}</>
}
