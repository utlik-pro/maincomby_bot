import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  Flame,
  Calendar,
  Trophy,
  TrendingUp,
  Star,
  Rocket,
  PartyPopper,
  Zap,
  Crown,
  ChevronRight,
  MessageCircle,
  Gift,
  Users,
  Heart,
  GraduationCap,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Avatar, AvatarWithSkin, Badge, Card, Progress } from '@/components/ui'
import { RANK_LABELS, AvatarSkin } from '@/types'
import { useTapEasterEgg } from '@/lib/easterEggs'
import { getUnreadNotificationsCount, getLeaderboard, getUserStats, requestConsultation, getLatestEventForAnnouncement, getUserActiveSkin, getUserStreakStatus, DAILY_STREAK_REWARDS, getIncomingLikes, getUserMatches } from '@/lib/supabase'
import { useToastStore } from '@/lib/store'
import { openTelegramLink } from '@/lib/telegram'
import NotificationsScreen from './NotificationsScreen'
import EventAnnouncementModal from '@/components/EventAnnouncementModal'
import { SubscriptionBadge } from '@/components/SubscriptionBadge'
import { useTenantBlocks } from '@/hooks/useTenantBlocks'
import { DynamicBlockList } from '@/components/blocks'

// Legacy fallback - Avatar ring styles based on role/tier (used when skin system not available)
const getLegacyAvatarRing = (teamRole?: string | null, tier?: string) => {
  if (teamRole === 'core') return 'ring-4 ring-[#c8ff00] ring-offset-2 ring-offset-bg shadow-[0_0_20px_rgba(200,255,0,0.3)]'
  if (teamRole === 'speaker') return 'ring-4 ring-purple-400 ring-offset-2 ring-offset-bg'
  if (teamRole === 'partner') return 'ring-4 ring-teal-400 ring-offset-2 ring-offset-bg'
  if (teamRole === 'sponsor') return 'ring-4 ring-orange-400 ring-offset-2 ring-offset-bg'
  if (tier === 'pro') return 'ring-2 ring-accent ring-offset-1 ring-offset-bg'
  return ''
}

const HomeScreen: React.FC = () => {
  const { user, profile, setActiveTab, getRank, getRankProgress, getSubscriptionTier, lastDismissedAnnouncementEventId, dismissEventAnnouncement, setShowInvites } = useAppStore()
  const { addToast } = useToastStore()
  const { handleTap: handleLogoTap } = useTapEasterEgg('logo_taps', 6)
  const tier = getSubscriptionTier()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showEventAnnouncement, setShowEventAnnouncement] = useState(false)

  // Dynamic blocks from tenant
  const { blocks, isMultiTenant } = useTenantBlocks()

  // Handle consultation request
  const handleConsultation = async () => {
    if (!user) return

    try {
      // Send notification to Dmitry
      await requestConsultation(user.id, user.first_name || 'User', user.username)
      addToast('Дмитрий получил уведомление!', 'success')

      // Open Telegram chat with Dmitry
      openTelegramLink('https://t.me/dmitryutlik')
    } catch (err) {
      console.error('Consultation request failed:', err)
      // Still open the link even if notification failed
      openTelegramLink('https://t.me/dmitryutlik')
    }
  }

  // Fetch unread notifications count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unreadCount', user?.id],
    queryFn: () => (user ? getUnreadNotificationsCount(user.id) : 0),
    enabled: !!user,
  })

  // Fetch leaderboard (top 3 for home screen)
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard(3),
  })

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => (user ? getUserStats(user.id) : null),
    enabled: !!user,
  })

  // Fetch user's active skin
  const { data: userActiveSkin } = useQuery({
    queryKey: ['userActiveSkin', user?.id],
    queryFn: () => (user ? getUserActiveSkin(user.id) : null),
    enabled: !!user,
    staleTime: 60000,
  })

  // Fetch user's streak status
  const { data: streakStatus } = useQuery({
    queryKey: ['streakStatus', user?.id],
    queryFn: () => (user ? getUserStreakStatus(user.id) : null),
    enabled: !!user,
    staleTime: 60000,
  })

  // Fetch matches count (contacts) for networking badge
  const { data: matchesData } = useQuery({
    queryKey: ['userMatches', user?.id],
    queryFn: () => (user ? getUserMatches(user.id) : []),
    enabled: !!user,
    staleTime: 60000,
  })
  const matchesCount = matchesData?.length || 0

  // Fetch incoming likes count for networking badge
  const { data: likesData } = useQuery({
    queryKey: ['incomingLikes', user?.id],
    queryFn: () => (user ? getIncomingLikes(user.id) : { count: 0 }),
    enabled: !!user,
    staleTime: 60000,
  })
  const likesCount = likesData?.count || 0

  // Fetch latest event for announcement
  const { data: announcementEvent } = useQuery({
    queryKey: ['eventAnnouncement', lastDismissedAnnouncementEventId],
    queryFn: () => getLatestEventForAnnouncement(lastDismissedAnnouncementEventId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Show announcement modal when new event is available
  React.useEffect(() => {
    if (announcementEvent && announcementEvent.id !== lastDismissedAnnouncementEventId) {
      setShowEventAnnouncement(true)
    }
  }, [announcementEvent, lastDismissedAnnouncementEventId])

  // Handle dismissing event announcement
  const handleDismissAnnouncement = () => {
    if (announcementEvent) {
      dismissEventAnnouncement(announcementEvent.id)
    }
    setShowEventAnnouncement(false)
  }

  // Handle viewing event details
  const handleViewEventDetails = () => {
    if (announcementEvent) {
      dismissEventAnnouncement(announcementEvent.id)
    }
    setShowEventAnnouncement(false)
    setActiveTab('events')
  }

  // Show notifications screen
  if (showNotifications) {
    return <NotificationsScreen onClose={() => setShowNotifications(false)} />
  }

  const rank = getRank()
  const rankInfo = RANK_LABELS[rank]
  const { progress, next } = getRankProgress()
  const nextRankInfo = next ? RANK_LABELS[next] : null

  // If tenant has dynamic blocks configured, render them instead
  if (isMultiTenant && blocks.length > 0) {
    return (
      <div className="pb-6">
        {/* Notifications header - always show */}
        <div className="p-4 flex items-center justify-end">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications(true)}
            className="w-10 h-10 rounded-xl bg-bg-card flex items-center justify-center relative"
          >
            <Bell size={20} className="text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* Dynamic blocks */}
        <DynamicBlockList blocks={blocks} />

        {/* Event Announcement Modal */}
        <EventAnnouncementModal
          isOpen={showEventAnnouncement}
          event={announcementEvent || null}
          onClose={handleDismissAnnouncement}
          onViewDetails={handleViewEventDetails}
        />
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Header with Profile */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with skin - uses new skin system, falls back to legacy ring if no skin */}
          <AvatarWithSkin
            src={profile?.photo_url}
            name={user?.first_name || 'User'}
            size="lg"
            skin={userActiveSkin}
            role={user?.team_role}
            tier={user?.subscription_tier === 'pro' ? 'pro' : user?.subscription_tier === 'light' ? 'light' : null}
          />
          <div>
            <div className="font-semibold text-lg">{user?.first_name || 'Пользователь'}</div>
            <div className="flex items-center gap-2">
              <span className="text-accent text-sm font-medium flex items-center gap-1">
                <Star size={14} className="fill-accent" />
                {rankInfo.ru}
              </span>
              <span className="text-gray-500 text-sm">{user?.points || 0} XP</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Subscription tier badge - tap 6 times for easter egg */}
          <SubscriptionBadge
            tier={getSubscriptionTier()}
            onClick={handleLogoTap}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications(true)}
            className="w-10 h-10 rounded-xl bg-bg-card flex items-center justify-center relative"
          >
            <Bell size={20} className="text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>
        </div>
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

      {/* Networking Banner */}
      <div className="px-4 mb-6">
        <Card
          onClick={() => setActiveTab('network')}
          className="!p-3 bg-gradient-to-r from-red-500/20 to-red-500/5 border border-red-500/20 cursor-pointer overflow-hidden relative"
        >
          <div className="flex items-center gap-3 relative z-10">
            {/* Icon with notification badges */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Flame className="text-red-500" size={20} />
              </div>
              {/* Notification badges */}
              {(matchesCount > 0 || likesCount > 0) && (
                <div className="absolute -top-1.5 -right-1.5 flex items-center">
                  {likesCount > 0 && (
                    <span className="flex items-center gap-0.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                      <Heart size={9} className="fill-white" />
                      {likesCount}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm">Networking</div>
              <div className="text-[11px] text-gray-400 leading-tight">
                Знакомься и находи единомышленников
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-500 shrink-0" />
          </div>
        </Card>
      </div>

      {/* Daily Streak Card - временно отключен */}
      {/* {streakStatus && (
        <div className="px-4 mb-6">
          <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/10 border border-orange-500/20">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">
                <Flame className="text-orange-500" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-orange-400">
                    {streakStatus.dailyStreak} {streakStatus.dailyStreak === 1 ? 'день' : streakStatus.dailyStreak < 5 ? 'дня' : 'дней'}
                  </span>
                  <span className="text-xs text-gray-400">подряд</span>
                </div>
                {streakStatus.nextDailyMilestone && (
                  <div className="text-xs text-gray-400">
                    До Pro: <span className="text-orange-400 font-medium">{streakStatus.nextDailyMilestone - streakStatus.dailyStreak} дн.</span>
                  </div>
                )}
                {!streakStatus.nextDailyMilestone && streakStatus.dailyStreak >= 30 && (
                  <div className="text-xs text-green-400">Все награды получены!</div>
                )}
              </div>
            </div>
            {/* 7 Day Dots */}
            {/* <div className="flex items-center justify-between">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => {
                const isActive = streakStatus.weekActivity?.includes(i)
                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <div className={`w-4 h-4 rounded-full transition-colors ${isActive ? 'bg-orange-500' : 'bg-gray-700'}`} />
                    <span className="text-[10px] text-gray-500">{day}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )} */}

      {/* Learning Section */}
      <div className="px-4 mb-6">
        <Card
          onClick={() => setActiveTab('learn')}
          className="bg-gradient-to-r from-purple-500/20 to-purple-500/5 border border-purple-500/20 cursor-pointer overflow-hidden relative"
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <GraduationCap className="text-purple-400" size={24} />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white mb-0.5">Обучение</div>
              <div className="text-xs text-gray-400">
                Курсы и материалы для развития
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-500" />
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
            <GraduationCap size={80} className="text-purple-400" />
          </div>
        </Card>
      </div>

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
            <div className="text-2xl font-bold text-accent">{userStats?.events || 0}</div>
            <div className="text-xs text-gray-400">Событий</div>
          </Card>
          <Card className="text-center py-3 relative">
            <div className="absolute -top-2 -right-2 bg-accent text-bg text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              NEW
            </div>
            <div className="text-2xl font-bold text-success">{userStats?.matches || 0}</div>
            <div className="text-xs text-gray-400">Матчей</div>
          </Card>
          <Card className="text-center py-3">
            <div className="text-2xl font-bold">{userStats?.achievements || 0}</div>
            <div className="text-xs text-gray-400">Медалей</div>
          </Card>
        </div>
      </div>

      {/* Top Participants */}
      {leaderboard.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Crown size={20} className="text-yellow-400" />
              Топ участников
            </h2>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('achievements')}
              className="text-accent text-sm flex items-center gap-1"
            >
              Все <ChevronRight size={16} />
            </motion.button>
          </div>
          <Card>
            <div className="space-y-3">
              {leaderboard.map((member: any, index: number) => {
                const profileData = Array.isArray(member.profile) ? member.profile[0] : member.profile
                const skinData = Array.isArray(member.active_skin) ? member.active_skin[0] : member.active_skin
                const medalColors = ['text-yellow-400', 'text-gray-300', 'text-orange-400']
                return (
                  <div key={member.id} className="flex items-center gap-3">
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
                      <div className="font-medium truncate">{member.first_name}</div>
                    </div>
                    <div className="text-accent font-semibold">{member.points} XP</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Consultation Banner */}
      <div className="px-4 mb-6">
        <Card
          onClick={handleConsultation}
          className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <MessageCircle size={24} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-purple-300">Консультация от главы MAIN</div>
              <div className="text-xs text-gray-400">
                Дмитрий Утлик — задай вопрос лично
              </div>
            </div>
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="bg-purple-500 text-white px-3 py-2 rounded-xl text-sm font-semibold"
            >
              Написать
            </motion.div>
          </div>
        </Card>
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

      {/* Event Announcement Modal */}
      <EventAnnouncementModal
        isOpen={showEventAnnouncement}
        event={announcementEvent || null}
        onClose={handleDismissAnnouncement}
        onViewDetails={handleViewEventDetails}
      />
    </div>
  )
}

export default HomeScreen
