import React from 'react'
import { motion } from 'framer-motion'
import {
  Flame,
  Calendar,
  Trophy,
  TrendingUp,
  Star,
  Rocket,
  PartyPopper,
  Zap,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Badge, Card, Progress } from '@/components/ui'
import { RANK_LABELS } from '@/types'
import { useTapEasterEgg } from '@/lib/easterEggs'

const HomeScreen: React.FC = () => {
  const { user, profile, setActiveTab, getRank, getRankProgress } = useAppStore()
  const { handleTap: handleLogoTap } = useTapEasterEgg('logo_taps', 6)

  const rank = getRank()
  const rankInfo = RANK_LABELS[rank]
  const { progress, next } = getRankProgress()
  const nextRankInfo = next ? RANK_LABELS[next] : null

  return (
    <div className="pb-6">
      {/* Header with centered logo */}
      <div className="pt-6 pb-4 flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogoTap}
          className="w-20 h-20 rounded-full bg-accent flex items-center justify-center"
        >
          <span className="text-bg font-bold text-4xl">M</span>
        </motion.button>
      </div>

      {/* XP Progress to next rank */}
      {nextRankInfo && (
        <div className="px-4 mb-6">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">До {nextRankInfo.ru}</span>
              <Star size={16} className="text-accent fill-accent" />
            </div>
            <Progress value={progress} />
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        <Card onClick={() => setActiveTab('network')} className="text-center py-4">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
            <Flame size={20} className="text-accent" />
          </div>
          <div className="text-xs font-semibold">Нетворкинг</div>
        </Card>
        <Card onClick={() => setActiveTab('events')} className="text-center py-4">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
            <Calendar size={20} className="text-accent" />
          </div>
          <div className="text-xs font-semibold">События</div>
        </Card>
        <Card onClick={() => setActiveTab('achievements')} className="text-center py-4">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-accent/10 flex items-center justify-center">
            <Trophy size={20} className="text-accent" />
          </div>
          <div className="text-xs font-semibold">Награды</div>
        </Card>
      </div>

      {/* Stats */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={20} className="text-accent" />
          Твоя статистика
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center py-3">
            <div className="text-2xl font-bold text-accent">0</div>
            <div className="text-xs text-gray-400">Событий</div>
          </Card>
          <Card className="text-center py-3">
            <div className="text-2xl font-bold text-success">0</div>
            <div className="text-xs text-gray-400">Матчей</div>
          </Card>
          <Card className="text-center py-3">
            <div className="text-2xl font-bold">0</div>
            <div className="text-xs text-gray-400">Медалей</div>
          </Card>
        </div>
      </div>

      {/* Subscription Banner */}
      {user?.subscription_tier === 'free' && (
        <div className="px-4 mb-6">
          <Card className="bg-gradient-to-r from-accent/20 to-success/20 border border-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Zap size={24} className="text-accent" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-accent">Получи Premium</div>
                <div className="text-xs text-gray-400">
                  Безлимит свайпов, суперлайки и многое другое
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-accent text-bg px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Pro
              </motion.button>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Activity / News */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Rocket size={20} className="text-accent" />
          Новости сообщества
        </h2>
        <Card className="mb-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <PartyPopper size={20} className="text-success" />
            </div>
            <div>
              <div className="font-medium mb-1">Добро пожаловать!</div>
              <div className="text-sm text-gray-400">
                Заполни профиль и начни знакомиться с участниками сообщества
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Calendar size={20} className="text-accent" />
            </div>
            <div>
              <div className="font-medium mb-1">Скоро мероприятие</div>
              <div className="text-sm text-gray-400">
                Следи за новыми событиями в разделе "События"
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default HomeScreen
