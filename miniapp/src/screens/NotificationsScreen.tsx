import React from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Heart,
  Trophy,
  Star,
  Sparkles,
  Check,
  CheckCheck,
  Info,
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback } from '@/lib/telegram'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  AppNotification,
  NotificationType,
} from '@/lib/supabase'
import { Card, Button, Skeleton, EmptyState } from '@/components/ui'

// Icon mapping for notification types
const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  event_reminder: <Calendar size={20} className="text-blue-400" />,
  event_invitation: <Calendar size={20} className="text-accent" />,
  match: <Heart size={20} className="text-pink-400" />,
  achievement: <Trophy size={20} className="text-yellow-400" />,
  rank_up: <Star size={20} className="text-purple-400" />,
  xp: <Sparkles size={20} className="text-accent" />,
  system: <Info size={20} className="text-gray-400" />,
}

const TYPE_COLORS: Record<NotificationType, string> = {
  event_reminder: 'bg-blue-500/20',
  event_invitation: 'bg-accent/20',
  match: 'bg-pink-500/20',
  achievement: 'bg-yellow-500/20',
  rank_up: 'bg-purple-500/20',
  xp: 'bg-accent/20',
  system: 'bg-gray-500/20',
}

interface NotificationsScreenProps {
  onClose: () => void
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onClose }) => {
  const { user } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => (user ? getNotifications(user.id) : []),
    enabled: !!user,
  })

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: (notificationId: number) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    },
  })

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error('No user')
      return markAllNotificationsAsRead(user.id)
    },
    onSuccess: () => {
      hapticFeedback.success()
      addToast('Все уведомления прочитаны', 'success')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] })
    },
  })

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id)
    }
    hapticFeedback.light()

    // Handle navigation based on notification type
    // TODO: Navigate to relevant screen based on notification.data
  }

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0

  return (
    <div className="fixed inset-0 bg-bg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-bg-card">
        <button onClick={onClose} className="text-gray-400 flex items-center gap-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold flex items-center gap-2">
          <Bell size={18} />
          Уведомления
        </h1>
        {unreadCount > 0 ? (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="text-accent text-sm flex items-center gap-1"
          >
            <CheckCheck size={16} />
            Все
          </button>
        ) : (
          <div className="w-12" />
        )}
      </div>

      {/* Content */}
      <div className="h-[calc(100dvh-60px)] overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative ${!notification.is_read ? 'border-l-2 border-l-accent' : ''}`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        TYPE_COLORS[notification.type]
                      }`}
                    >
                      {TYPE_ICONS[notification.type]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium ${!notification.is_read ? 'text-white' : 'text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BellOff size={48} className="text-gray-500" />}
            title="Нет уведомлений"
            description="Здесь будут появляться уведомления о событиях, матчах и достижениях"
          />
        )}
      </div>
    </div>
  )
}

export default NotificationsScreen
