import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  FlaskConical,
  Loader2,
  Save,
  AlertCircle,
  ChevronDown,
  Megaphone,
  Check,
} from 'lucide-react'
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  createBroadcast,
  getBroadcastAudience,
  queueBroadcastRecipients,
  getBroadcastById,
} from '@/lib/supabase'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback, backButton } from '@/lib/telegram'
import { Event, BroadcastAudienceType } from '@/types'

interface EventAdminPanelProps {
  onClose: () => void
}

type TabView = 'list' | 'create' | 'edit'

const CITIES = ['Минск', 'Гродно', 'Гомель', 'Брест', 'Витебск', 'Могилёв']
const EVENT_TYPES: { value: Event['event_type']; label: string }[] = [
  { value: 'meetup', label: 'Митап' },
  { value: 'workshop', label: 'Воркшоп' },
  { value: 'conference', label: 'Конференция' },
  { value: 'hackathon', label: 'Хакатон' },
]

const defaultEventForm = {
  title: '',
  description: '',
  event_date: '',
  event_time: '19:00',
  city: 'Минск',
  location: '',
  location_url: '',
  speakers: '',
  max_participants: '',
  registration_deadline: '',
  is_test: false,
  is_active: true,
  event_type: 'meetup' as Event['event_type'],
  price: 0,
  image_url: '',
}

export const EventAdminPanel: React.FC<EventAdminPanelProps> = ({ onClose }) => {
  const { user } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [tab, setTab] = useState<TabView>('list')
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [form, setForm] = useState(defaultEventForm)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  // Announcement states
  const [sendAnnouncement, setSendAnnouncement] = useState(false)
  const [announcementStatus, setAnnouncementStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [announcementStats, setAnnouncementStats] = useState<{ sent: number; failed: number } | null>(null)
  const [announcingEventId, setAnnouncingEventId] = useState<number | null>(null)

  // Telegram BackButton handler
  useEffect(() => {
    const handleBack = () => {
      if (tab === 'create' || tab === 'edit') {
        resetForm()
        setTab('list')
      } else {
        onClose()
      }
    }

    backButton.show(handleBack)

    return () => {
      backButton.hide()
    }
  }, [tab, onClose])

  // Query events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['allEvents', user?.tg_user_id],
    queryFn: () => getAllEvents(user?.tg_user_id),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (eventData: Omit<Event, 'id' | 'created_at'>) => createEvent(eventData),
    onSuccess: () => {
      hapticFeedback.success()
      addToast('Событие создано', 'success')
      queryClient.invalidateQueries({ queryKey: ['allEvents'] })
      queryClient.invalidateQueries({ queryKey: ['activeEvents'] })
      resetForm()
      setTab('list')
    },
    onError: (error: Error) => {
      hapticFeedback.error()
      addToast(error.message || 'Ошибка создания', 'error')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Event> }) => updateEvent(id, data),
    onSuccess: () => {
      hapticFeedback.success()
      addToast('Событие обновлено', 'success')
      queryClient.invalidateQueries({ queryKey: ['allEvents'] })
      queryClient.invalidateQueries({ queryKey: ['activeEvents'] })
      resetForm()
      setTab('list')
    },
    onError: (error: Error) => {
      hapticFeedback.error()
      addToast(error.message || 'Ошибка обновления', 'error')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (eventId: number) => deleteEvent(eventId),
    onSuccess: () => {
      hapticFeedback.success()
      addToast('Событие удалено', 'success')
      queryClient.invalidateQueries({ queryKey: ['allEvents'] })
      queryClient.invalidateQueries({ queryKey: ['activeEvents'] })
      setDeleteConfirm(null)
    },
    onError: (error: Error) => {
      hapticFeedback.error()
      addToast(error.message || 'Ошибка удаления', 'error')
    },
  })

  const resetForm = () => {
    setForm(defaultEventForm)
    setEditingEvent(null)
    setSendAnnouncement(false)
    setAnnouncementStatus('idle')
    setAnnouncementStats(null)
  }

  // Format event message for announcement
  const formatEventMessage = (event: Event): string => {
    const date = new Date(event.event_date)
    const dateStr = date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    const timeStr = date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })

    let message = `📅 *${dateStr}* в *${timeStr}*\n`
    message += `📍 ${event.city}`
    if (event.location) message += ` • ${event.location}`
    message += '\n\n'
    if (event.description) message += `${event.description}\n\n`
    if (event.speakers) message += `🎤 Спикеры: ${event.speakers}\n`
    if (event.price > 0) message += `💰 Цена: ${event.price} BYN\n`
    message += '\nЖдём тебя! 🚀'

    return message
  }

  // Send event announcement
  const sendEventAnnouncement = async (event: Event): Promise<{ sent: number; failed: number }> => {
    const audienceType: BroadcastAudienceType = event.is_test ? 'testers' : 'all'
    const testBadge = event.is_test ? '🧪 [TEST] ' : ''

    const broadcast = await createBroadcast({
      title: `${testBadge}🎉 ${event.title}`,
      message: formatEventMessage(event),
      message_type: 'markdown',
      deep_link_screen: 'events',
      deep_link_button_text: 'Зарегистрироваться',
      audience_type: audienceType,
      audience_config: {},
      exclude_banned: true,
      scheduled_at: null,
      created_by: user!.id,
    })

    const audience = await getBroadcastAudience(audienceType, {})
    if (audience.length === 0) {
      return { sent: 0, failed: 0 }
    }

    await queueBroadcastRecipients(broadcast.id, audience)

    let hasMore = true
    while (hasMore) {
      const response = await fetch(`/api/send-broadcast?action=process_batch&broadcastId=${broadcast.id}`)
      const result = await response.json()
      hasMore = result.hasMore
      if (hasMore) {
        await new Promise((r) => setTimeout(r, 1500))
      }
    }

    const finalBroadcast = await getBroadcastById(broadcast.id)
    return {
      sent: finalBroadcast?.delivered_count || 0,
      failed: finalBroadcast?.failed_count || 0,
    }
  }

  const handleAnnounceEvent = async (event: Event) => {
    setAnnouncingEventId(event.id)
    setAnnouncementStatus('sending')
    hapticFeedback.medium()

    try {
      const stats = await sendEventAnnouncement(event)
      setAnnouncementStats(stats)
      setAnnouncementStatus('success')
      hapticFeedback.success()
    } catch (e) {
      console.error('Announcement error:', e)
      setAnnouncementStatus('error')
      hapticFeedback.error()
      addToast('Ошибка отправки анонса', 'error')
    }
  }

  const handleEditEvent = (event: Event) => {
    const eventDate = new Date(event.event_date)
    setForm({
      title: event.title,
      description: event.description || '',
      event_date: eventDate.toISOString().split('T')[0],
      event_time: eventDate.toTimeString().slice(0, 5),
      city: event.city,
      location: event.location || '',
      location_url: event.location_url || '',
      speakers: event.speakers || '',
      max_participants: event.max_participants?.toString() || '',
      registration_deadline: event.registration_deadline?.split('T')[0] || '',
      is_test: event.is_test || false,
      is_active: event.is_active,
      event_type: event.event_type,
      price: event.price,
      image_url: event.image_url || '',
    })
    setEditingEvent(event)
    setTab('edit')
    hapticFeedback.light()
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      addToast('Введите название', 'error')
      return
    }
    if (!form.event_date) {
      addToast('Выберите дату', 'error')
      return
    }

    const eventDateTime = new Date(`${form.event_date}T${form.event_time}:00`)

    const eventData: Omit<Event, 'id' | 'created_at'> = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_date: eventDateTime.toISOString(),
      city: form.city,
      location: form.location.trim() || null,
      location_url: form.location_url.trim() || null,
      speakers: form.speakers.trim() || null,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      registration_deadline: form.registration_deadline ? new Date(form.registration_deadline).toISOString() : null,
      is_test: form.is_test,
      is_active: form.is_active,
      event_type: form.event_type,
      price: form.price,
      image_url: form.image_url.trim() || null,
    }

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: eventData })
    } else {
      try {
        const newEvent = await createEvent(eventData)
        hapticFeedback.success()
        addToast('Событие создано', 'success')

        queryClient.invalidateQueries({ queryKey: ['allEvents'] })
        queryClient.invalidateQueries({ queryKey: ['activeEvents'] })

        if (sendAnnouncement) {
          setAnnouncementStatus('sending')
          try {
            const stats = await sendEventAnnouncement(newEvent)
            setAnnouncementStats(stats)
            setAnnouncementStatus('success')
          } catch (e) {
            console.error('Announcement error:', e)
            setAnnouncementStatus('error')
            addToast('Событие создано, но ошибка отправки анонса', 'error')
          }
        } else {
          resetForm()
          setTab('list')
        }
      } catch (error: any) {
        hapticFeedback.error()
        addToast(error.message || 'Ошибка создания', 'error')
      }
    }
  }

  const handleToggleActive = (event: Event) => {
    hapticFeedback.light()
    updateMutation.mutate({ id: event.id, data: { is_active: !event.is_active } })
  }

  const handleDelete = (eventId: number) => {
    if (deleteConfirm === eventId) {
      deleteMutation.mutate(eventId)
    } else {
      setDeleteConfirm(eventId)
      hapticFeedback.warning()
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending || announcementStatus === 'sending'

  // Form view (create or edit)
  if (tab === 'create' || tab === 'edit') {
    return (
      <div className="fixed inset-0 z-[60] bg-bg overflow-y-auto">
        {/* Top spacer for Telegram header */}
        <div className="h-14" />

        {/* Sticky Header */}
        <div className="sticky top-14 z-10 bg-bg border-b border-border">
          <div className="p-4 bg-green-500/10">
            <h1 className="text-xl font-bold text-green-500">
              {editingEvent ? 'Редактирование' : 'Новое событие'}
            </h1>
            {editingEvent && (
              <p className="text-sm text-gray-400">ID: {editingEvent.id}</p>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Название *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="AI Meetup #25"
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Описание мероприятия..."
              rows={3}
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none resize-none"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Дата *</label>
              <input
                type="date"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Время *</label>
              <input
                type="time"
                value={form.event_time}
                onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none"
              />
            </div>
          </div>

          {/* City and Event Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Город *</label>
              <div className="relative">
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none appearance-none"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Тип</label>
              <div className="relative">
                <select
                  value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value as Event['event_type'] })}
                  className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none appearance-none"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Место проведения</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="ПВТ, офис 215"
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none"
            />
          </div>

          {/* Location URL */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Ссылка на карту</label>
            <input
              type="url"
              value={form.location_url}
              onChange={(e) => setForm({ ...form, location_url: e.target.value })}
              placeholder="https://maps.google.com/..."
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none"
            />
          </div>

          {/* Speakers */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Спикеры</label>
            <input
              type="text"
              value={form.speakers}
              onChange={(e) => setForm({ ...form, speakers: e.target.value })}
              placeholder="Иван Иванов, Пётр Петров"
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none"
            />
          </div>

          {/* Max Participants and Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Макс. участников</label>
              <input
                type="number"
                value={form.max_participants}
                onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
                placeholder="50"
                className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Цена (BYN)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none"
              />
            </div>
          </div>

          {/* Registration Deadline */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Дедлайн регистрации</label>
            <input
              type="date"
              value={form.registration_deadline}
              onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })}
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">URL обложки</label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl focus:border-accent outline-none"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2">
            {/* Is Test */}
            <button
              type="button"
              onClick={() => setForm({ ...form, is_test: !form.is_test })}
              className={`w-full p-4 rounded-xl border flex items-center justify-between ${
                form.is_test ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-bg-card border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <FlaskConical size={20} className={form.is_test ? 'text-yellow-500' : 'text-gray-400'} />
                <div className="text-left">
                  <div className="font-medium">Тестовое событие</div>
                  <div className="text-xs text-gray-400">Видно только тестировщикам</div>
                </div>
              </div>
              {form.is_test ? <ToggleRight size={28} className="text-yellow-500" /> : <ToggleLeft size={28} className="text-gray-500" />}
            </button>

            {/* Is Active */}
            <button
              type="button"
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`w-full p-4 rounded-xl border flex items-center justify-between ${
                form.is_active ? 'bg-green-500/10 border-green-500/50' : 'bg-bg-card border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={20} className={form.is_active ? 'text-green-500' : 'text-gray-400'} />
                <div className="text-left">
                  <div className="font-medium">Активно</div>
                  <div className="text-xs text-gray-400">Событие видно пользователям</div>
                </div>
              </div>
              {form.is_active ? <ToggleRight size={28} className="text-green-500" /> : <ToggleLeft size={28} className="text-gray-500" />}
            </button>

            {/* Send Announcement (only for new events) */}
            {!editingEvent && (
              <button
                type="button"
                onClick={() => setSendAnnouncement(!sendAnnouncement)}
                className={`w-full p-4 rounded-xl border flex items-center justify-between ${
                  sendAnnouncement ? 'bg-blue-500/10 border-blue-500/50' : 'bg-bg-card border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={20} className={sendAnnouncement ? 'text-blue-500' : 'text-gray-400'} />
                  <div className="text-left">
                    <div className="font-medium">Отправить анонс</div>
                    <div className="text-xs text-gray-400">
                      {form.is_test ? 'Только тестировщикам' : 'Всем пользователям'}
                    </div>
                  </div>
                </div>
                {sendAnnouncement ? <ToggleRight size={28} className="text-blue-500" /> : <ToggleLeft size={28} className="text-gray-500" />}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Action */}
        <div className="p-4">
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-4 bg-accent text-bg font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {announcementStatus === 'sending' ? 'Отправка анонса...' : editingEvent ? 'Сохранить' : 'Создать событие'}
          </button>
        </div>

        {/* Bottom spacer for navigation */}
        <div className="h-20" />

        {/* Announcement Success Modal */}
        {announcementStatus === 'success' && announcementStats && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" onClick={() => { setAnnouncementStatus('idle'); resetForm(); setTab('list') }} />
            <div className="relative bg-bg-card p-6 rounded-2xl text-center max-w-sm w-full">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Анонс отправлен!</h3>
              <p className="text-gray-400 text-sm mb-4">Событие создано и анонс разослан</p>
              <div className="space-y-2 text-sm bg-bg rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Доставлено:</span>
                  <span className="text-green-400 font-semibold">{announcementStats.sent}</span>
                </div>
                {announcementStats.failed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ошибки:</span>
                    <span className="text-red-400 font-semibold">{announcementStats.failed}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => { setAnnouncementStatus('idle'); resetForm(); setTab('list') }}
                className="mt-4 w-full py-3 bg-accent text-bg rounded-xl font-bold"
              >
                Готово
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // List view
  return (
    <div className="fixed inset-0 z-[60] bg-bg overflow-y-auto">
      {/* Top spacer for Telegram header */}
      <div className="h-14" />

      {/* Sticky Header */}
      <div className="sticky top-14 z-10 bg-bg border-b border-border">
        <div className="p-4 flex items-center gap-3 bg-green-500/10">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-green-500">Управление событиями</h1>
            <p className="text-sm text-gray-400">{events.length} событий</p>
          </div>
          <button
            onClick={() => { resetForm(); setTab('create'); hapticFeedback.light() }}
            className="w-12 h-12 rounded-xl bg-accent text-bg flex items-center justify-center shadow-lg"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-accent" size={32} />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>Нет событий</p>
            <button onClick={() => { resetForm(); setTab('create') }} className="mt-4 text-accent">
              Создать первое
            </button>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-xl bg-bg-card border ${!event.is_active ? 'border-gray-700 opacity-60' : 'border-border'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  event.is_test ? 'bg-yellow-500/20 text-yellow-500' : 'bg-accent/20 text-accent'
                }`}>
                  {event.is_test ? <FlaskConical size={24} /> : <Calendar size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{event.title}</span>
                    {event.is_test && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">TEST</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                    <Clock size={14} />
                    {new Date(event.event_date).toLocaleDateString('ru-RU', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {event.city}{event.location && ` • ${event.location}`}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                <button
                  onClick={() => handleEditEvent(event)}
                  className="flex-1 py-2 px-3 bg-bg rounded-lg text-sm flex items-center justify-center gap-2 text-gray-300 hover:bg-gray-700/50"
                >
                  <Pencil size={16} /> Изменить
                </button>
                <button
                  onClick={() => handleAnnounceEvent(event)}
                  disabled={announcingEventId === event.id && announcementStatus === 'sending'}
                  className="py-2 px-3 rounded-lg text-sm flex items-center justify-center bg-blue-500/20 text-blue-500"
                  title="Анонсировать"
                >
                  {announcingEventId === event.id && announcementStatus === 'sending' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Megaphone size={18} />
                  )}
                </button>
                <button
                  onClick={() => handleToggleActive(event)}
                  disabled={updateMutation.isPending}
                  className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2 ${
                    event.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-700/50 text-gray-400'
                  }`}
                >
                  {event.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={deleteMutation.isPending}
                  className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center ${
                    deleteConfirm === event.id ? 'bg-red-500 text-white' : 'bg-red-500/20 text-red-500'
                  }`}
                >
                  {deleteConfirm === event.id ? <AlertCircle size={18} /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom spacer for navigation */}
      <div className="h-20" />

      {/* Announcement Success Modal */}
      {announcementStatus === 'success' && announcementStats && announcingEventId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => { setAnnouncementStatus('idle'); setAnnouncementStats(null); setAnnouncingEventId(null) }} />
          <div className="relative bg-bg-card p-6 rounded-2xl text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Анонс отправлен!</h3>
            <div className="space-y-2 text-sm bg-bg rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Доставлено:</span>
                <span className="text-green-400 font-semibold">{announcementStats.sent}</span>
              </div>
              {announcementStats.failed > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Ошибки:</span>
                  <span className="text-red-400 font-semibold">{announcementStats.failed}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => { setAnnouncementStatus('idle'); setAnnouncementStats(null); setAnnouncingEventId(null) }}
              className="mt-4 w-full py-3 bg-accent text-bg rounded-xl font-bold"
            >
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
