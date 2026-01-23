import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Send,
  History,
  FileText,
  Clock,
  Users,
  MapPin,
  Crown,
  Calendar,
  Loader2,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  Eye,
  Trash2,
  Play,
  Plus
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { Card, Button, Badge } from '@/components/ui'
import {
  getBroadcasts,
  getBroadcastAudienceCount,
  createBroadcast,
  getActiveEvents,
  getDistinctCities,
  cancelBroadcast,
  deleteBroadcast,
  getBroadcastRecipients,
  getBroadcastAudience,
  queueBroadcastRecipients,
  updateBroadcastStatus
} from '@/lib/supabase'
import { callEdgeFunction } from '@/lib/telegram'
import { hapticFeedback } from '@/lib/telegram'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type {
  Broadcast,
  BroadcastAudienceType,
  BroadcastAudienceConfig,
  BroadcastRecipient,
  Event,
  DEEP_LINK_SCREENS,
  AUDIENCE_TYPE_LABELS,
  BROADCAST_STATUS_CONFIG
} from '@/types'

interface BroadcastPanelProps {
  onClose: () => void
}

type TabType = 'compose' | 'history' | 'scheduled'

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'compose', label: 'Создать', icon: <Send size={16} /> },
  { id: 'history', label: 'История', icon: <History size={16} /> },
  { id: 'scheduled', label: 'Запланировано', icon: <Clock size={16} /> },
]

const audienceOptions: { value: BroadcastAudienceType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'Все пользователи', icon: <Users size={16} /> },
  { value: 'city', label: 'По городу', icon: <MapPin size={16} /> },
  { value: 'subscription', label: 'По подписке', icon: <Crown size={16} /> },
  { value: 'event_not_registered', label: 'Не зарегистрированы на событие', icon: <Calendar size={16} /> },
]

const deepLinkOptions = [
  { value: '', label: 'Без кнопки' },
  { value: 'home', label: 'Главная' },
  { value: 'events', label: 'События' },
  { value: 'network', label: 'Нетворкинг' },
  { value: 'matches', label: 'Контакты' },
  { value: 'achievements', label: 'Достижения' },
  { value: 'profile', label: 'Профиль' },
]

const subscriptionTiers = [
  { value: 'free', label: 'Free' },
  { value: 'light', label: 'Light' },
  { value: 'pro', label: 'Pro' },
]

export const BroadcastPanel: React.FC<BroadcastPanelProps> = ({ onClose }) => {
  const { user } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('compose')

  // Compose form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [audienceType, setAudienceType] = useState<BroadcastAudienceType>('all')
  const [audienceConfig, setAudienceConfig] = useState<BroadcastAudienceConfig>({})
  const [deepLinkScreen, setDeepLinkScreen] = useState('')
  const [deepLinkButtonText, setDeepLinkButtonText] = useState('Открыть')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Modal state
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null)
  const [showRecipientsModal, setShowRecipientsModal] = useState(false)
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'delivered' | 'failed'>('all')

  // Superadmin check
  const isSuperAdmin = ['dmitryutlik', 'utlik_offer'].includes(user?.username || '')

  // Fetch cities for dropdown
  const { data: cities = [] } = useQuery({
    queryKey: ['distinctCities'],
    queryFn: getDistinctCities,
    enabled: isSuperAdmin && audienceType === 'city',
  })

  // Fetch events for dropdown (admins see all events including test ones)
  const { data: events = [] } = useQuery({
    queryKey: ['activeEvents', user?.tg_user_id],
    queryFn: () => getActiveEvents(user?.tg_user_id),
    enabled: isSuperAdmin && audienceType === 'event_not_registered',
  })

  // Fetch audience count (preview)
  const { data: audienceCount = 0, isLoading: isLoadingCount } = useQuery({
    queryKey: ['audienceCount', audienceType, audienceConfig],
    queryFn: () => getBroadcastAudienceCount(audienceType, audienceConfig, true),
    enabled: isSuperAdmin,
  })

  // Fetch broadcast history
  const { data: broadcasts = [], isLoading: isLoadingBroadcasts, refetch: refetchBroadcasts } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => getBroadcasts(50),
    enabled: isSuperAdmin,
  })

  // Fetch recipients for modal
  const { data: recipients = [], isLoading: isLoadingRecipients } = useQuery({
    queryKey: ['broadcastRecipients', selectedBroadcast?.id],
    queryFn: () => selectedBroadcast ? getBroadcastRecipients(selectedBroadcast.id, undefined, 1000) : [],
    enabled: isSuperAdmin && showRecipientsModal && !!selectedBroadcast,
  })

  // Filtered broadcasts for tabs
  const historyBroadcasts = broadcasts.filter(b => ['completed', 'failed', 'cancelled'].includes(b.status))
  const scheduledBroadcasts = broadcasts.filter(b => b.status === 'scheduled')
  const sendingBroadcasts = broadcasts.filter(b => b.status === 'sending')

  // Filtered recipients and counts
  const filteredRecipients = useMemo(() => {
    if (recipientFilter === 'all') return recipients
    if (recipientFilter === 'delivered') return recipients.filter(r => r.status === 'delivered')
    return recipients.filter(r => r.status === 'failed')
  }, [recipients, recipientFilter])

  const deliveredCount = recipients.filter(r => r.status === 'delivered').length
  const failedCount = recipients.filter(r => r.status === 'failed').length

  // Reset audience config when type changes
  useEffect(() => {
    setAudienceConfig({})
  }, [audienceType])

  // Handle send broadcast
  const handleSend = async () => {
    if (!user) return

    if (!title.trim() || !message.trim()) {
      addToast('Заполните заголовок и сообщение', 'error')
      return
    }

    if (audienceCount === 0) {
      addToast('Нет получателей для выбранной аудитории', 'error')
      return
    }

    setIsSending(true)
    hapticFeedback.light()

    try {
      let scheduledAt: string | null = null
      if (isScheduled && scheduledDate && scheduledTime) {
        scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      }

      // Create broadcast record
      const broadcast = await createBroadcast({
        title: title.trim(),
        message: message.trim(),
        audience_type: audienceType,
        audience_config: audienceConfig,
        deep_link_screen: deepLinkScreen || null,
        deep_link_button_text: deepLinkScreen ? deepLinkButtonText : null,
        scheduled_at: scheduledAt,
        created_by: user.id,
      })

      if (scheduledAt) {
        // Scheduled - just save and notify
        addToast(`Рассылка запланирована на ${format(new Date(scheduledAt), 'dd MMM HH:mm', { locale: ru })}`, 'success')
      } else {
        // Immediate send - start the broadcast
        const audience = await getBroadcastAudience(audienceType, audienceConfig, true)
        await queueBroadcastRecipients(broadcast.id, audience)
        await updateBroadcastStatus(broadcast.id, 'sending', { started_at: new Date().toISOString() })

        // Call API to process first batch
        await fetch('/api/send-broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ broadcastId: broadcast.id, action: 'process_batch' }),
        })

        addToast(`Рассылка запущена для ${audience.length} получателей`, 'success')

        // Start polling for remaining batches
        pollBroadcast(broadcast.id)
      }

      // Reset form
      setTitle('')
      setMessage('')
      setAudienceType('all')
      setAudienceConfig({})
      setDeepLinkScreen('')
      setIsScheduled(false)
      setScheduledDate('')
      setScheduledTime('')

      // Refresh list
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] })

      hapticFeedback.success()
    } catch (error) {
      console.error('Send broadcast error:', error)
      addToast('Ошибка отправки рассылки', 'error')
      hapticFeedback.error()
    } finally {
      setIsSending(false)
    }
  }

  // Poll for broadcast completion
  const pollBroadcast = async (broadcastId: number) => {
    let hasMore = true
    while (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 1500)) // Wait 1.5 sec between batches

      try {
        const response = await fetch('/api/send-broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ broadcastId, action: 'process_batch' }),
        })
        const result = await response.json()
        hasMore = result.hasMore
      } catch (error) {
        console.error('Poll error:', error)
        hasMore = false
      }
    }

    // Refresh when done
    queryClient.invalidateQueries({ queryKey: ['broadcasts'] })
  }

  // Handle cancel broadcast
  const handleCancel = async (broadcastId: number) => {
    try {
      await cancelBroadcast(broadcastId)
      addToast('Рассылка отменена', 'success')
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] })
    } catch (error) {
      addToast('Ошибка отмены', 'error')
    }
  }

  // Handle delete broadcast
  const handleDelete = async (broadcastId: number) => {
    try {
      await deleteBroadcast(broadcastId)
      addToast('Рассылка удалена', 'success')
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] })
    } catch (error) {
      addToast('Ошибка удаления', 'error')
    }
  }

  if (!isSuperAdmin) return null

  const renderComposeTab = () => (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Заголовок</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок сообщения"
          className="w-full bg-[#1a1a1a] border border-border rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent"
          maxLength={100}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">{title.length}/100</div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Сообщение</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Текст рассылки..."
          className="w-full bg-[#1a1a1a] border border-border rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-accent min-h-[120px] resize-none"
          maxLength={1000}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">{message.length}/1000</div>
      </div>

      {/* Audience Type */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Аудитория</label>
        <div className="grid grid-cols-2 gap-2">
          {audienceOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setAudienceType(option.value)}
              className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
                audienceType === option.value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                  : 'border-border bg-bg-secondary text-gray-400 hover:border-gray-600'
              }`}
            >
              {option.icon}
              <span className="text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Audience Config based on type */}
      {audienceType === 'city' && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Город</label>
          <select
            value={audienceConfig.city || ''}
            onChange={(e) => setAudienceConfig({ city: e.target.value })}
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Выберите город</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      )}

      {audienceType === 'subscription' && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Подписки</label>
          <div className="flex gap-2 flex-wrap">
            {subscriptionTiers.map(tier => (
              <button
                key={tier.value}
                onClick={() => {
                  const tiers = audienceConfig.tiers || []
                  const newTiers = tiers.includes(tier.value as any)
                    ? tiers.filter(t => t !== tier.value)
                    : [...tiers, tier.value as any]
                  setAudienceConfig({ tiers: newTiers })
                }}
                className={`px-4 py-2 rounded-xl border transition-colors ${
                  (audienceConfig.tiers || []).includes(tier.value as any)
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-border bg-bg-secondary text-gray-400'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {audienceType === 'event_not_registered' && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Событие</label>
          <select
            value={audienceConfig.event_id || ''}
            onChange={(e) => setAudienceConfig({ event_id: Number(e.target.value) })}
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Выберите событие</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title} ({format(new Date(event.event_date), 'dd MMM', { locale: ru })})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Audience Preview */}
      <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-xl border border-border">
        <div className="flex items-center gap-2 text-gray-400">
          <Users size={16} />
          <span className="text-sm">Получателей:</span>
        </div>
        {isLoadingCount ? (
          <Loader2 size={16} className="animate-spin text-blue-500" />
        ) : (
          <span className="font-bold text-white">{audienceCount.toLocaleString()}</span>
        )}
      </div>

      {/* Deep Link */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Кнопка действия</label>
        <select
          value={deepLinkScreen}
          onChange={(e) => setDeepLinkScreen(e.target.value)}
          className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
        >
          {deepLinkOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {deepLinkScreen && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Текст кнопки</label>
          <input
            type="text"
            value={deepLinkButtonText}
            onChange={(e) => setDeepLinkButtonText(e.target.value)}
            placeholder="Открыть"
            className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            maxLength={30}
          />
        </div>
      )}

      {/* Schedule Toggle */}
      <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-xl border border-border">
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={16} />
          <span className="text-sm">Запланировать</span>
        </div>
        <button
          onClick={() => setIsScheduled(!isScheduled)}
          className={`w-12 h-6 rounded-full transition-colors ${
            isScheduled ? 'bg-blue-500' : 'bg-gray-600'
          }`}
        >
          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
            isScheduled ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {isScheduled && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Дата</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Время</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={isSending || !title.trim() || !message.trim() || audienceCount === 0}
        className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSending ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Send size={20} />
        )}
        {isScheduled ? 'Запланировать' : 'Отправить'}
      </button>
    </div>
  )

  const renderBroadcastCard = (broadcast: Broadcast) => {
    const statusConfig = {
      draft: { label: 'Черновик', color: 'bg-gray-500' },
      scheduled: { label: 'Запланировано', color: 'bg-blue-500' },
      sending: { label: 'Отправляется', color: 'bg-yellow-500' },
      completed: { label: 'Завершено', color: 'bg-green-500' },
      cancelled: { label: 'Отменено', color: 'bg-gray-500' },
      failed: { label: 'Ошибка', color: 'bg-red-500' },
    }

    const status = statusConfig[broadcast.status as keyof typeof statusConfig] || statusConfig.draft
    const deliveryRate = broadcast.total_recipients > 0
      ? Math.round((broadcast.delivered_count / broadcast.total_recipients) * 100)
      : 0

    return (
      <div key={broadcast.id} className="p-4 bg-bg-secondary rounded-xl border border-border">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-white">{broadcast.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-1">{broadcast.message}</p>
          </div>
          <Badge className={status.color}>{status.label}</Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          <span>{format(new Date(broadcast.created_at), 'dd MMM HH:mm', { locale: ru })}</span>
          {broadcast.scheduled_at && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {format(new Date(broadcast.scheduled_at), 'dd MMM HH:mm', { locale: ru })}
            </span>
          )}
        </div>

        {/* Stats */}
        {broadcast.status !== 'draft' && broadcast.status !== 'scheduled' && (
          <div className="grid grid-cols-5 gap-2 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{broadcast.total_recipients}</div>
              <div className="text-xs text-gray-500">Всего</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">{broadcast.delivered_count}</div>
              <div className="text-xs text-gray-500">Доставлено</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-accent">{broadcast.clicked_count || 0}</div>
              <div className="text-xs text-gray-500">Кликов</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-500">{broadcast.failed_count}</div>
              <div className="text-xs text-gray-500">Ошибок</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-500">
                {broadcast.delivered_count > 0
                  ? ((broadcast.clicked_count || 0) / broadcast.delivered_count * 100).toFixed(1)
                  : 0}%
              </div>
              <div className="text-xs text-gray-500">CTR</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {broadcast.status === 'completed' && (
            <button
              onClick={() => {
                setSelectedBroadcast(broadcast)
                setShowRecipientsModal(true)
              }}
              className="flex-1 py-2 rounded-lg bg-bg border border-border text-gray-400 text-sm flex items-center justify-center gap-1"
            >
              <Eye size={14} />
              Получатели
            </button>
          )}
          {broadcast.status === 'scheduled' && (
            <button
              onClick={() => handleCancel(broadcast.id)}
              className="flex-1 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm flex items-center justify-center gap-1"
            >
              <X size={14} />
              Отменить
            </button>
          )}
          {['cancelled', 'failed'].includes(broadcast.status) && (
            <button
              onClick={() => handleDelete(broadcast.id)}
              className="flex-1 py-2 rounded-lg bg-bg border border-border text-gray-400 text-sm flex items-center justify-center gap-1"
            >
              <Trash2 size={14} />
              Удалить
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderHistoryTab = () => (
    <div className="space-y-3">
      {isLoadingBroadcasts ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      ) : historyBroadcasts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <History size={32} className="mx-auto mb-2 opacity-50" />
          <p>Нет отправленных рассылок</p>
        </div>
      ) : (
        historyBroadcasts.map(renderBroadcastCard)
      )}
    </div>
  )

  const renderScheduledTab = () => (
    <div className="space-y-3">
      {/* Sending broadcasts (in progress) */}
      {sendingBroadcasts.length > 0 && (
        <>
          <div className="text-sm text-gray-400 font-medium">Отправляются сейчас</div>
          {sendingBroadcasts.map(renderBroadcastCard)}
        </>
      )}

      {/* Scheduled broadcasts */}
      {scheduledBroadcasts.length > 0 ? (
        <>
          <div className="text-sm text-gray-400 font-medium">Запланированы</div>
          {scheduledBroadcasts.map(renderBroadcastCard)}
        </>
      ) : sendingBroadcasts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p>Нет запланированных рассылок</p>
        </div>
      ) : null}
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'compose':
        return renderComposeTab()
      case 'history':
        return renderHistoryTab()
      case 'scheduled':
        return renderScheduledTab()
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-y-auto">
      {/* Spacer for Telegram header */}
      <div className="h-28" />

      {/* Header */}
      <div className="sticky top-28 z-10 bg-bg border-b border-border">
        <div className="flex items-center gap-3 p-4 bg-blue-500/10">
          <button onClick={onClose} className="text-blue-500">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-blue-500 flex items-center gap-2">
            <Send size={20} />
            Рассылка
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-bg-secondary text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="text-sm">{tab.label}</span>
              {tab.id === 'scheduled' && scheduledBroadcasts.length > 0 && (
                <Badge className="bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full">
                  {scheduledBroadcasts.length}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>

      {/* Recipients Modal */}
      <AnimatePresence>
        {showRecipientsModal && selectedBroadcast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowRecipientsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-secondary rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white">Получатели ({selectedBroadcast.total_recipients})</h3>
                  <button onClick={() => setShowRecipientsModal(false)} className="text-gray-400">
                    <X size={20} />
                  </button>
                </div>
                {/* Filter tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setRecipientFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      recipientFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-bg text-gray-400'
                    }`}
                  >
                    Все ({recipients.length})
                  </button>
                  <button
                    onClick={() => setRecipientFilter('delivered')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      recipientFilter === 'delivered' ? 'bg-green-600 text-white' : 'bg-bg text-gray-400'
                    }`}
                  >
                    Доставлено ({deliveredCount})
                  </button>
                  <button
                    onClick={() => setRecipientFilter('failed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      recipientFilter === 'failed' ? 'bg-red-600 text-white' : 'bg-bg text-gray-400'
                    }`}
                  >
                    Ошибки ({failedCount})
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-4">
                {isLoadingRecipients ? (
                  <div className="flex justify-center py-4">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                  </div>
                ) : filteredRecipients.length === 0 ? (
                  <p className="text-center text-gray-400">Нет данных</p>
                ) : (
                  <div className="space-y-2">
                    {filteredRecipients.map(recipient => (
                      <div key={recipient.id} className="flex items-center justify-between p-3 bg-bg rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm">
                            {recipient.user?.first_name || 'Пользователь'} {recipient.user?.last_name || ''}
                          </div>
                          {recipient.user?.username ? (
                            <a
                              href={`https://t.me/${recipient.user.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent text-xs hover:underline"
                            >
                              @{recipient.user.username}
                            </a>
                          ) : (
                            <span className="text-gray-600 text-xs">без username</span>
                          )}
                          {recipient.status === 'failed' && recipient.error_message && (
                            <div className="text-red-400 text-xs mt-1 truncate">
                              {recipient.error_message}
                            </div>
                          )}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ml-2 shrink-0 ${
                          recipient.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                          recipient.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {recipient.status === 'delivered' ? '✓' :
                           recipient.status === 'failed' ? '✗' : '...'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacer */}
      <div className="h-20" />
    </div>
  )
}
