import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronDown,
  BarChart3,
  Users,
  Calendar,
  CreditCard,
  Heart,
  Star,
  TrendingUp,
  UserCheck,
  UserPlus,
  Loader2,
  Crown,
  Zap,
  Trophy,
  Shield,
  Handshake,
  Gift,
  Hand,
  Mic,
  Share2,
  ArrowRight
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { getAllAnalytics, AllAnalytics, TopUser, TopReferrer, getUsersByRole } from '@/lib/analytics'
import { Card } from '@/components/ui'

interface AnalyticsPanelProps {
  onClose: () => void
}

type TabType = 'overview' | 'events' | 'subscriptions' | 'top' | 'matching' | 'team' | 'referrals'

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Обзор', icon: <BarChart3 size={16} /> },
  { id: 'events', label: 'События', icon: <Calendar size={16} /> },
  { id: 'subscriptions', label: 'Подписки', icon: <CreditCard size={16} /> },
  { id: 'top', label: 'Топ', icon: <Trophy size={16} /> },
  { id: 'matching', label: 'Matching', icon: <Heart size={16} /> },
  { id: 'referrals', label: 'Рефералы', icon: <Share2 size={16} /> },
  { id: 'team', label: 'Команда', icon: <Users size={16} /> },
]

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ onClose }) => {
  const { user } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [expandedRole, setExpandedRole] = useState<string | null>(null)
  const [roleUsers, setRoleUsers] = useState<TopUser[]>([])
  const [loadingRole, setLoadingRole] = useState(false)

  // Superadmin check
  const isSuperAdmin = ['dmitryutlik', 'utlik_offer'].includes(user?.username || '')

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAllAnalytics,
    enabled: isSuperAdmin,
    staleTime: 60000, // 1 minute
  })

  if (!isSuperAdmin) return null

  const handleRoleClick = async (role: string) => {
    if (expandedRole === role) {
      setExpandedRole(null)
      return
    }
    setExpandedRole(role)
    setLoadingRole(true)
    try {
      const users = await getUsersByRole(role)
      setRoleUsers(users)
    } catch (e) {
      console.error('Error loading role users:', e)
      setRoleUsers([])
    } finally {
      setLoadingRole(false)
    }
  }

  const renderStatCard = (
    value: number | string,
    label: string,
    icon: React.ReactNode,
    color: string = 'text-accent'
  ) => (
    <div className="bg-bg rounded-xl p-3 border border-border">
      <div className={`${color} mb-1`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )

  const renderUserRow = (user: TopUser, index: number, showValue?: string) => (
    <div key={user.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {user.first_name} {user.last_name}
        </div>
        <div className="text-xs text-gray-400">@{user.username || 'no_username'}</div>
      </div>
      {showValue && (
        <div className="text-accent font-semibold">{showValue}</div>
      )}
    </div>
  )

  const renderOverviewTab = (data: AllAnalytics) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {renderStatCard(data.overview.totalUsers, 'Всего пользователей', <Users size={20} />)}
        {renderStatCard(data.overview.newThisWeek, 'Новых за неделю', <UserPlus size={20} />, 'text-green-500')}
        {renderStatCard(data.overview.newThisMonth, 'Новых за месяц', <TrendingUp size={20} />, 'text-blue-500')}
        {renderStatCard(data.overview.activeUsers, 'Активных (30д)', <UserCheck size={20} />, 'text-purple-500')}
      </div>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={18} className="text-yellow-500" />
          <span className="font-semibold">Средний XP</span>
        </div>
        <div className="text-3xl font-bold text-accent">{data.overview.avgXP}</div>
      </Card>
    </div>
  )

  const renderEventsTab = (data: AllAnalytics) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {renderStatCard(data.events.total, 'Всего событий', <Calendar size={20} />)}
        {renderStatCard(data.events.active, 'Активных', <TrendingUp size={20} />, 'text-green-500')}
        {renderStatCard(data.events.totalRegistrations, 'Регистраций', <UserPlus size={20} />, 'text-blue-500')}
        {renderStatCard(data.events.totalCheckins, 'Check-in', <UserCheck size={20} />, 'text-purple-500')}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="text-xs text-gray-400 mb-1">Check-in Rate</div>
          <div className="text-2xl font-bold text-accent">{data.events.checkinRate}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-400 mb-1">Отменено</div>
          <div className="text-2xl font-bold text-red-500">{data.events.totalCancelled}</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Star size={18} className="text-yellow-500" />
          <span className="font-semibold">Средний рейтинг</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-accent">{data.events.avgRating}</span>
          <span className="text-gray-400">/ 5</span>
          <span className="text-xs text-gray-500 ml-2">({data.events.totalReviews} отзывов)</span>
        </div>
      </Card>
    </div>
  )

  const renderSubscriptionsTab = (data: AllAnalytics) => {
    const total = data.subscriptions.free + data.subscriptions.light + data.subscriptions.pro
    const paidPercent = total > 0
      ? Math.round(((data.subscriptions.light + data.subscriptions.pro) / total) * 100)
      : 0

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold">{data.subscriptions.free}</div>
            <div className="text-xs text-gray-400">Free</div>
          </Card>
          <Card className="p-3 text-center border-blue-500/30">
            <div className="text-2xl font-bold text-blue-500">{data.subscriptions.light}</div>
            <div className="text-xs text-gray-400">Light</div>
          </Card>
          <Card className="p-3 text-center border-accent/30">
            <div className="text-2xl font-bold text-accent">{data.subscriptions.pro}</div>
            <div className="text-xs text-gray-400">Pro</div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={18} className="text-accent" />
            <span className="font-semibold">Доход</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-accent">{data.subscriptions.totalRevenueStars}</span>
            <span className="text-gray-400">Stars</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-gray-400 mb-1">Конверсия в платные</div>
          <div className="text-2xl font-bold text-green-500">{paidPercent}%</div>
          <div className="mt-2 h-2 bg-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-accent"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
        </Card>
      </div>
    )
  }

  const renderTopTab = (data: AllAnalytics) => (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={18} className="text-yellow-500" />
          <span className="font-semibold">Топ по XP</span>
        </div>
        <div className="space-y-1">
          {data.topByXP.slice(0, 5).map((u, i) => renderUserRow(u, i, `${u.points} XP`))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={18} className="text-purple-500" />
          <span className="font-semibold">Топ по событиям</span>
        </div>
        <div className="space-y-1">
          {data.topByEvents.slice(0, 5).map((u, i) => renderUserRow(u, i, `${u.eventCount} событий`))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Crown size={18} className="text-accent" />
          <span className="font-semibold">Pro подписчики</span>
        </div>
        {data.proUsers.length > 0 ? (
          <div className="space-y-1">
            {data.proUsers.slice(0, 5).map((u, i) => renderUserRow(u, i))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Нет Pro подписчиков</div>
        )}
      </Card>
    </div>
  )

  const renderMatchingTab = (data: AllAnalytics) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {renderStatCard(data.matching.totalSwipes, 'Всего свайпов', <TrendingUp size={20} />)}
        {renderStatCard(data.matching.totalLikes, 'Лайков', <Heart size={20} />, 'text-red-500')}
        {renderStatCard(data.matching.totalMatches, 'Матчей', <Heart size={20} />, 'text-pink-500')}
        {renderStatCard(`${data.matching.matchRate}%`, 'Match Rate', <Zap size={20} />, 'text-accent')}
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={18} className="text-blue-500" />
          <span className="font-semibold">Профили</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-green-500">{data.matching.approvedProfiles}</div>
            <div className="text-xs text-gray-400">Одобренных</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">{data.matching.pendingProfiles}</div>
            <div className="text-xs text-gray-400">На модерации</div>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderReferralsTab = (data: AllAnalytics) => (
    <div className="space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        {renderStatCard(data.referrals.totalReferrals, 'Всего приглашено', <UserPlus size={20} />, 'text-green-500')}
        {renderStatCard(data.referrals.totalXPEarned, 'XP заработано', <Zap size={20} />, 'text-yellow-500')}
      </div>

      {/* Top referrers */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={18} className="text-accent" />
          <span className="font-semibold">Топ рефералов</span>
        </div>
        {data.topReferrers.length > 0 ? (
          <div className="space-y-1">
            {data.topReferrers.map((referrer: TopReferrer, index: number) => (
              <div key={referrer.user_id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                <div className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {referrer.first_name} {referrer.last_name}
                  </div>
                  <div className="text-xs text-gray-400">@{referrer.username || 'no_username'}</div>
                </div>
                <div className="flex items-center gap-1 text-green-500 font-semibold">
                  <UserPlus size={14} />
                  {referrer.referral_count}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-4">
            Пока нет приглашённых пользователей
          </div>
        )}
      </Card>

      {/* Info card */}
      <Card className="p-4 bg-accent/5 border-accent/20">
        <div className="flex items-start gap-3">
          <Share2 size={20} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm mb-1">Как это работает</div>
            <div className="text-xs text-gray-400">
              Когда пользователь переходит по инвайт-ссылке и регистрируется, его пригласивший получает +50 XP.
              Здесь отображаются все успешные приглашения.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderTeamTab = (data: AllAnalytics) => {
    const roleConfig = [
      { key: 'core', label: 'Core Team', icon: <Shield size={18} />, color: 'text-accent' },
      { key: 'partner', label: 'Partners', icon: <Handshake size={18} />, color: 'text-blue-500' },
      { key: 'sponsor', label: 'Sponsors', icon: <Gift size={18} />, color: 'text-yellow-500' },
      { key: 'volunteer', label: 'Volunteers', icon: <Hand size={18} />, color: 'text-green-500' },
      { key: 'speaker', label: 'Speakers', icon: <Mic size={18} />, color: 'text-purple-500' },
    ]

    return (
      <div className="space-y-3">
        {roleConfig.map(role => {
          const count = data.roles[role.key as keyof typeof data.roles]
          const isExpanded = expandedRole === role.key

          return (
            <Card key={role.key} className="overflow-hidden">
              <button
                onClick={() => count > 0 && handleRoleClick(role.key)}
                className={`w-full p-4 text-left ${count > 0 ? 'cursor-pointer active:bg-bg-card/50' : ''}`}
                disabled={count === 0}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={role.color}>{role.icon}</div>
                    <span className="font-medium">{role.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-2xl font-bold ${role.color}`}>{count}</div>
                    {count > 0 && (
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                      {loadingRole ? (
                        <div className="text-center text-gray-400 py-4">
                          <Loader2 size={20} className="animate-spin mx-auto" />
                        </div>
                      ) : roleUsers.length === 0 ? (
                        <div className="text-center text-gray-400 py-4">Нет пользователей</div>
                      ) : (
                        roleUsers.map((u, i) => (
                          <div key={u.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                            <div className="w-6 h-6 rounded-full bg-bg-card text-xs font-bold flex items-center justify-center text-gray-400">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate text-sm">
                                {u.first_name} {u.last_name}
                              </div>
                              <div className="text-xs text-gray-500">@{u.username || 'no_username'}</div>
                            </div>
                            <div className="text-xs text-accent">{u.points} XP</div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}

        <Card className="p-4 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-gray-500" />
              <span className="font-medium">Без роли</span>
            </div>
            <div className="text-2xl font-bold text-gray-500">{data.roles.none}</div>
          </div>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      )
    }

    if (error || !analytics) {
      return (
        <div className="text-center py-12 text-gray-400">
          Ошибка загрузки данных
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return renderOverviewTab(analytics)
      case 'events':
        return renderEventsTab(analytics)
      case 'subscriptions':
        return renderSubscriptionsTab(analytics)
      case 'top':
        return renderTopTab(analytics)
      case 'matching':
        return renderMatchingTab(analytics)
      case 'referrals':
        return renderReferralsTab(analytics)
      case 'team':
        return renderTeamTab(analytics)
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-y-auto">
      {/* Spacer for Telegram header - larger to account for notch/status bar */}
      <div className="h-28" />
      {/* Header */}
      <div className="sticky top-28 z-10 bg-bg border-b border-border">
        <div className="flex items-center gap-3 p-4 bg-purple-500/10">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-purple-500 flex items-center gap-2">
            <BarChart3 size={20} />
            Аналитика
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                transition-colors
                ${activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-bg-card'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-gray-600 font-mono">
        SUPERADMIN: {user?.username}
      </div>
    </div>
  )
}
