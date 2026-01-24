import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, X, Loader2, User, Camera, FileText, Briefcase, Crown, Clock, MessageCircle, RefreshCw } from 'lucide-react'
import { getProfileCompletionStats, ProfileCompletionUser, sendProfileCompletionReminder } from '@/lib/supabase'
import { hapticFeedback, backButton } from '@/lib/telegram'
import { Avatar } from '@/components/ui'

interface ProfileCompletionPanelProps {
  onClose: () => void
}

type FilterType = 'all' | 'ready' | 'incomplete' | 'awarded'

export const ProfileCompletionPanel: React.FC<ProfileCompletionPanelProps> = ({ onClose }) => {
  const [filter, setFilter] = useState<FilterType>('all')

  // Telegram BackButton handler
  useEffect(() => {
    backButton.show(onClose)
    return () => {
      backButton.hide()
    }
  }, [onClose])

  const { data: users = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['profileCompletionStats'],
    queryFn: getProfileCompletionStats,
  })

  // Filter users
  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true
    return user.status === filter
  })

  // Stats
  const readyCount = users.filter(u => u.status === 'ready').length
  const incompleteCount = users.filter(u => u.status === 'incomplete').length
  const awardedCount = users.filter(u => u.status === 'awarded').length

  const handleRefresh = () => {
    hapticFeedback.light()
    refetch()
  }

  const handleReminder = async (user: ProfileCompletionUser) => {
    hapticFeedback.medium()
    await sendProfileCompletionReminder(user.id)
    // Show feedback
    alert(`Напоминание отправлено @${user.username || user.first_name}`)
  }

  const StatusBadge: React.FC<{ status: ProfileCompletionUser['status'] }> = ({ status }) => {
    switch (status) {
      case 'awarded':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 flex items-center gap-1">
            <Crown size={12} />
            Получил PRO
          </span>
        )
      case 'ready':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 flex items-center gap-1">
            <Check size={12} />
            Готов к PRO
          </span>
        )
      case 'incomplete':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            Не заполнен
          </span>
        )
    }
  }

  const CheckMark: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
    <span className={`flex items-center gap-1 text-xs ${ok ? 'text-green-400' : 'text-red-400'}`}>
      {ok ? <Check size={12} /> : <X size={12} />}
      {label}
    </span>
  )

  return (
    <div className="fixed inset-0 z-50 bg-bg overflow-y-auto">
      {/* Top spacer for Telegram header */}
      <div className="h-24" />

      {/* Sticky Header */}
      <div className="sticky top-24 z-10 bg-bg border-b border-border">
        <div className="p-4 bg-amber-500/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-amber-500">
              <FileText size={20} />
              Статус профилей
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isRefetching}
              className="p-2 rounded-lg bg-amber-500/20 text-amber-400"
            >
              <RefreshCw size={18} className={isRefetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-3 grid grid-cols-4 gap-2 text-center text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`p-2 rounded-lg ${filter === 'all' ? 'bg-accent/20 text-accent' : 'bg-bg-card text-gray-400'}`}
          >
            <div className="font-bold text-lg">{users.length}</div>
            <div>Всего</div>
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`p-2 rounded-lg ${filter === 'ready' ? 'bg-amber-500/20 text-amber-400' : 'bg-bg-card text-gray-400'}`}
          >
            <div className="font-bold text-lg">{readyCount}</div>
            <div>Готовы</div>
          </button>
          <button
            onClick={() => setFilter('incomplete')}
            className={`p-2 rounded-lg ${filter === 'incomplete' ? 'bg-gray-500/20 text-gray-400' : 'bg-bg-card text-gray-400'}`}
          >
            <div className="font-bold text-lg">{incompleteCount}</div>
            <div>Неполные</div>
          </button>
          <button
            onClick={() => setFilter('awarded')}
            className={`p-2 rounded-lg ${filter === 'awarded' ? 'bg-green-500/20 text-green-400' : 'bg-bg-card text-gray-400'}`}
          >
            <div className="font-bold text-lg">{awardedCount}</div>
            <div>С PRO</div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            Нет пользователей
          </div>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user.id}
              className="p-3 rounded-xl bg-bg-card border border-border"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-2">
                <Avatar
                  src={user.photo_url}
                  name={user.first_name || 'User'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold truncate">
                      {user.first_name || 'Без имени'}
                    </span>
                    {user.username && (
                      <span className="text-xs text-gray-500">@{user.username}</span>
                    )}
                  </div>
                  <StatusBadge status={user.status} />
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>{user.points} XP</div>
                  <div className="capitalize">{user.subscription_tier}</div>
                </div>
              </div>

              {/* Checklist */}
              <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-border">
                <CheckMark ok={!!user.bio?.trim()} label="Bio" />
                <CheckMark ok={!!user.occupation?.trim()} label="Занятость" />
                <CheckMark ok={user.photo_count > 0} label={`Фото (${user.photo_count})`} />
              </div>

              {/* Details */}
              {user.status === 'awarded' && user.profile_completion_pro_awarded_at && (
                <div className="mt-2 text-xs text-green-400">
                  PRO получен: {new Date(user.profile_completion_pro_awarded_at).toLocaleDateString('ru-RU')}
                </div>
              )}

              {/* Actions */}
              {user.status === 'incomplete' && (
                <div className="mt-3 pt-2 border-t border-border">
                  <button
                    onClick={() => handleReminder(user)}
                    className="flex items-center gap-2 text-sm text-accent"
                  >
                    <MessageCircle size={14} />
                    Напомнить заполнить
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bottom spacer for navigation */}
      <div className="h-20" />
    </div>
  )
}
