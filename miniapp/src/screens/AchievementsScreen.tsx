import React from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Shield,
  Star,
  Award,
  Medal,
  Crown,
  Trophy,
  Zap,
  FileText,
  Check,
  Users,
  UserPlus,
  User,
  Target,
  Flame,
  Heart,
  Handshake,
  Calendar,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getUserAchievements } from '@/lib/supabase'
import { Badge, Card, Progress } from '@/components/ui'
import { ACHIEVEMENTS, RANK_LABELS, RANK_THRESHOLDS, UserRank, AchievementId } from '@/types'

// Icon mapping for ranks
const RANK_ICONS: Record<UserRank, React.ReactNode> = {
  private: <Shield size={32} className="text-gray-400" />,
  corporal: <Star size={32} className="text-yellow-400" />,
  sergeant: <Award size={32} className="text-yellow-500" />,
  sergeant_major: <Medal size={32} className="text-orange-400" />,
  lieutenant: <Medal size={32} className="text-blue-400" />,
  captain: <Trophy size={32} className="text-purple-400" />,
  major: <Crown size={32} className="text-accent" />,
  colonel: <Award size={32} className="text-red-500" />,
  general: <Crown size={32} className="text-yellow-300" />,
}

// Icon mapping for achievements
const ACHIEVEMENT_ICONS: Record<AchievementId, React.ReactNode> = {
  first_step: <Medal size={32} className="text-yellow-400" />,
  on_fire: <Flame size={32} className="text-orange-500" />,
  social_butterfly: <Heart size={32} className="text-pink-500" />,
  critic: <FileText size={32} className="text-blue-400" />,
  sniper: <Target size={32} className="text-red-500" />,
  veteran: <Crown size={32} className="text-accent" />,
  networker: <Handshake size={32} className="text-green-400" />,
  regular: <Trophy size={32} className="text-purple-400" />,
}

const AchievementsScreen: React.FC = () => {
  const { user, profile, getRank, getRankProgress } = useAppStore()

  const rank = getRank()
  const rankInfo = RANK_LABELS[rank]
  const { progress, next } = getRankProgress()
  const nextRankInfo = next ? RANK_LABELS[next] : null

  // Fetch user achievements
  const { data: userAchievements } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: () => (user ? getUserAchievements(user.id) : []),
    enabled: !!user,
  })

  const unlockedIds = new Set(userAchievements?.map((a: any) => a.achievement_id) || [])

  // All ranks for display
  const allRanks: UserRank[] = ['private', 'corporal', 'sergeant', 'sergeant_major', 'lieutenant', 'captain', 'major', 'colonel', 'general']
  const currentRankIndex = allRanks.indexOf(rank)

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-1">Награды</h1>
        <p className="text-gray-400 text-sm">Твои достижения в сообществе</p>
      </div>

      {/* Current Rank Card */}
      <div className="px-4 mb-6">
        <Card className="bg-gradient-to-br from-accent/20 to-bg-card border border-accent/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center">
              {RANK_ICONS[rank]}
            </div>
            <div>
              <div className="text-2xl font-bold gradient-text">{rankInfo.ru}</div>
              <div className="text-gray-400">{user?.points || 0} XP</div>
            </div>
          </div>

          {nextRankInfo && next && (
            <div>
              <div className="flex justify-between text-sm mb-2 items-center">
                <span className="text-gray-400">До {nextRankInfo.ru}</span>
                <span className="text-accent">{React.cloneElement(RANK_ICONS[next] as React.ReactElement, { size: 16 })}</span>
              </div>
              <Progress value={progress} />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {Math.round(progress)}%
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Ranks Progression */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Medal size={20} className="text-accent" />
          Звания
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allRanks.map((r, index) => {
            const info = RANK_LABELS[r]
            const threshold = RANK_THRESHOLDS[r]
            const isUnlocked = index <= currentRankIndex
            const isCurrent = r === rank

            return (
              <motion.div
                key={r}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex-shrink-0 w-20 text-center p-3 rounded-xl
                  ${isCurrent ? 'bg-accent/20 border border-accent' : 'bg-bg-card'}
                  ${!isUnlocked && 'opacity-40'}
                `}
              >
                <div className="flex justify-center mb-1">
                  {React.cloneElement(RANK_ICONS[r] as React.ReactElement, { size: 24 })}
                </div>
                <div className="text-xs font-semibold truncate">{info.ru}</div>
                <div className="text-xs text-gray-500">{threshold} XP</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Trophy size={20} className="text-accent" />
          Достижения
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id)

            return (
              <Card
                key={achievement.id}
                className={`text-center ${!isUnlocked && 'opacity-40'}`}
              >
                <div className={`flex justify-center mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
                  {ACHIEVEMENT_ICONS[achievement.id]}
                </div>
                <div className="font-semibold text-sm mb-1">{achievement.title}</div>
                <div className="text-xs text-gray-400 mb-2">{achievement.description}</div>
                <Badge variant={isUnlocked ? 'accent' : 'default'}>
                  +{achievement.xpReward} XP
                </Badge>
              </Card>
            )
          })}
        </div>
      </div>

      {/* XP Guide */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Zap size={20} className="text-accent" />
          Как заработать XP
        </h2>
        <Card>
          <div className="space-y-3">
            {[
              { action: 'Регистрация на событие', xp: 10, icon: <Calendar size={20} className="text-blue-400" /> },
              { action: 'Check-in на событии', xp: 50, icon: <Check size={20} className="text-green-400" /> },
              { action: 'Оставить фидбек', xp: 20, icon: <FileText size={20} className="text-purple-400" /> },
              { action: 'Получить матч', xp: 15, icon: <Heart size={20} className="text-pink-400" /> },
              { action: 'Пригласить друга', xp: 30, icon: <UserPlus size={20} className="text-cyan-400" /> },
              { action: 'Заполнить профиль', xp: 25, icon: <User size={20} className="text-orange-400" /> },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm">{item.action}</span>
                </div>
                <Badge variant="accent">+{item.xp}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Leaderboard Preview */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Award size={20} className="text-accent" />
          Топ участников
        </h2>
        <Card>
          {[
            { rank: 1, name: 'Дмитрий', xp: 2450, color: 'text-yellow-400' },
            { rank: 2, name: 'Мария', xp: 1890, color: 'text-gray-300' },
            { rank: 3, name: 'Алексей', xp: 1650, color: 'text-orange-400' },
          ].map((item) => (
            <div
              key={item.rank}
              className="flex items-center gap-3 py-2 border-b border-bg last:border-0"
            >
              <div className={`w-8 flex justify-center ${item.color}`}>
                <Medal size={20} />
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
              </div>
              <div className="text-accent font-semibold">{item.xp} XP</div>
            </div>
          ))}
          <button className="w-full text-center text-accent text-sm mt-3">
            Показать весь рейтинг →
          </button>
        </Card>
      </div>
    </div>
  )
}

export default AchievementsScreen
