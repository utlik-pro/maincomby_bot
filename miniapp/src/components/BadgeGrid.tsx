import React from 'react'
import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import { UserBadge } from '@/types'
import { hapticFeedback } from '@/lib/telegram'

interface BadgeGridProps {
  badges: UserBadge[]
  title?: string
  maxDisplay?: number
  onBadgeClick?: (badge: UserBadge) => void
  showEmpty?: boolean
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({
  badges,
  title = 'Награды',
  maxDisplay = 8,
  onBadgeClick,
  showEmpty = true,
}) => {
  const displayBadges = badges.slice(0, maxDisplay)
  const hasMore = badges.length > maxDisplay

  const handleBadgeClick = (badge: UserBadge) => {
    hapticFeedback.light()
    onBadgeClick?.(badge)
  }

  if (badges.length === 0 && !showEmpty) {
    return null
  }

  return (
    <div className="bg-card rounded-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Award size={18} className="text-accent" />
        <span className="font-semibold">{title}</span>
        {badges.length > 0 && (
          <span className="text-xs text-gray-500 ml-auto">{badges.length}</span>
        )}
      </div>

      {badges.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-3">
          Пока нет наград
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {displayBadges.map((userBadge, index) => (
            <motion.button
              key={userBadge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleBadgeClick(userBadge)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95"
              style={{
                backgroundColor: `${userBadge.badge?.color || '#c8ff00'}20`,
                borderColor: userBadge.badge?.color || '#c8ff00',
                borderWidth: 1,
              }}
            >
              {userBadge.badge?.emoji && (
                <span className="text-base">{userBadge.badge.emoji}</span>
              )}
              <span style={{ color: userBadge.badge?.color || '#c8ff00' }}>
                {userBadge.badge?.name || 'Badge'}
              </span>
              {userBadge.is_featured && (
                <span className="text-yellow-400 text-xs">★</span>
              )}
            </motion.button>
          ))}
          {hasMore && (
            <span className="flex items-center px-3 py-1.5 text-sm text-gray-500">
              +{badges.length - maxDisplay}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Badge detail popup component
interface BadgeDetailProps {
  badge: UserBadge
  onClose: () => void
}

export const BadgeDetail: React.FC<BadgeDetailProps> = ({ badge, onClose }) => {
  const badgeData = badge.badge

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-card p-6 max-w-sm w-full text-center"
      >
        {/* Badge icon */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
          style={{ backgroundColor: `${badgeData?.color || '#c8ff00'}20` }}
        >
          {badgeData?.emoji || '🏆'}
        </div>

        {/* Badge name */}
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: badgeData?.color || '#c8ff00' }}
        >
          {badgeData?.name || 'Badge'}
        </h3>

        {/* Description */}
        {badgeData?.description && (
          <p className="text-gray-400 text-sm mb-4">{badgeData.description}</p>
        )}

        {/* Award info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            Получено:{' '}
            {new Date(badge.awarded_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          {badge.awarded_reason && <p>Причина: {badge.awarded_reason}</p>}
          {badge.expires_at && (
            <p className="text-yellow-500">
              Действует до:{' '}
              {new Date(badge.expires_at).toLocaleDateString('ru-RU')}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-bg rounded-button text-sm font-medium"
        >
          Закрыть
        </button>
      </motion.div>
    </motion.div>
  )
}
