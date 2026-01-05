import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Search,
  ScanLine,
  Users,
  Check,
  X,
  Calendar,
  Clock,
  UserCheck,
  Loader2,
  Ticket,
  ChevronRight,
} from 'lucide-react'
import {
  getActiveEvents,
  getEventRegistrations,
  getEventCheckins,
  checkInByTicketCode,
} from '@/lib/supabase'
import { AvatarWithSkin, Card, Input, Button, Badge } from '@/components/ui'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback, showQrScanner, isQrScannerSupported } from '@/lib/telegram'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Event } from '@/types'

interface CheckInPanelProps {
  onClose: () => void
}

type ViewMode = 'events' | 'participants' | 'scanner'

const CheckInPanel: React.FC<CheckInPanelProps> = ({ onClose }) => {
  const { user } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [viewMode, setViewMode] = useState<ViewMode>('events')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const qrSupported = isQrScannerSupported()

  // Get active events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['activeEvents'],
    queryFn: getActiveEvents,
  })

  // Get registrations for selected event
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
    queryKey: ['eventRegistrations', selectedEvent?.id],
    queryFn: () => getEventRegistrations(selectedEvent!.id),
    enabled: !!selectedEvent,
  })

  // Get check-ins for selected event
  const { data: checkins = [], isLoading: checkinsLoading } = useQuery({
    queryKey: ['eventCheckins', selectedEvent?.id],
    queryFn: () => getEventCheckins(selectedEvent!.id),
    enabled: !!selectedEvent,
  })

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (ticketCode: string) => {
      if (!user) throw new Error('Пользователь не найден')
      return checkInByTicketCode(ticketCode, user.id)
    },
    onSuccess: (data) => {
      hapticFeedback.success()
      addToast(`${data.registration.user?.first_name || 'Гость'} отмечен!`, 'success')
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations'] })
      queryClient.invalidateQueries({ queryKey: ['eventCheckins'] })
      setManualCode('')
    },
    onError: (error: Error) => {
      hapticFeedback.error()
      addToast(error.message || 'Ошибка чек-ина', 'error')
    },
  })

  const handleScanQR = async () => {
    if (!qrSupported) {
      hapticFeedback.error()
      addToast('QR сканер не поддерживается', 'error')
      return
    }

    setIsScanning(true)
    hapticFeedback.medium()

    try {
      const qrData = await showQrScanner('Наведите камеру на QR-код билета')

      if (qrData) {
        hapticFeedback.success()
        checkInMutation.mutate(qrData)
      }
    } catch (error) {
      console.error('[QR Scanner] Error:', error)
      hapticFeedback.error()
    } finally {
      setIsScanning(false)
    }
  }

  const handleManualCheckIn = () => {
    if (!manualCode.trim()) {
      addToast('Введите код билета', 'error')
      return
    }
    checkInMutation.mutate(manualCode.trim())
  }

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
    setViewMode('participants')
    hapticFeedback.light()
  }

  // Filter registrations by search
  const filteredRegistrations = registrations.filter((reg: any) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const name = `${reg.user?.first_name || ''} ${reg.user?.last_name || ''}`.toLowerCase()
    const username = (reg.user?.username || '').toLowerCase()
    const code = (reg.ticket_code || '').toLowerCase()
    return name.includes(query) || username.includes(query) || code.includes(query)
  })

  const checkedInCount = registrations.filter((r: any) => r.status === 'attended').length
  const totalCount = registrations.length

  // Events list view
  if (viewMode === 'events') {
    return (
      <div className="min-h-screen bg-bg">
        {/* Header */}
        <div className="p-4 flex items-center gap-3 border-b border-bg-card">
          <button onClick={onClose} className="text-gray-400">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Чек-ин участников</h1>
            <p className="text-sm text-gray-400">Выберите мероприятие</p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {eventsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>Нет активных мероприятий</p>
            </div>
          ) : (
            events.map((event: Event) => (
              <Card
                key={event.id}
                onClick={() => handleSelectEvent(event)}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Calendar size={24} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Clock size={14} />
                    {format(new Date(event.start_date), 'd MMM, HH:mm', { locale: ru })}
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-500" />
              </Card>
            ))
          )}
        </div>
      </div>
    )
  }

  // Participants view
  if (viewMode === 'participants' && selectedEvent) {
    return (
      <div className="min-h-screen bg-bg">
        {/* Header */}
        <div className="p-4 flex items-center gap-3 border-b border-bg-card">
          <button onClick={() => setViewMode('events')} className="text-gray-400">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{selectedEvent.title}</h1>
            <p className="text-sm text-gray-400">
              {checkedInCount} / {totalCount} отмечено
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<ScanLine size={18} />}
            onClick={() => setViewMode('scanner')}
          >
            Скан
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <Input
            placeholder="Поиск по имени или коду..."
            icon={<Search size={20} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="px-4 pb-4 flex gap-2">
          <div className="flex-1 bg-bg-card rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-accent">{totalCount}</div>
            <div className="text-xs text-gray-400">Регистраций</div>
          </div>
          <div className="flex-1 bg-bg-card rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{checkedInCount}</div>
            <div className="text-xs text-gray-400">Пришло</div>
          </div>
          <div className="flex-1 bg-bg-card rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-gray-400">{totalCount - checkedInCount}</div>
            <div className="text-xs text-gray-400">Ждём</div>
          </div>
        </div>

        {/* Participants list */}
        <div className="px-4 pb-20 space-y-2">
          {registrationsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-accent" size={24} />
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchQuery ? 'Никого не найдено' : 'Нет регистраций'}
            </div>
          ) : (
            filteredRegistrations.map((reg: any) => {
              const isCheckedIn = reg.status === 'attended'
              return (
                <Card
                  key={reg.id}
                  className={`flex items-center gap-3 ${isCheckedIn ? 'opacity-60' : ''}`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-bg-card flex items-center justify-center border-2 border-gray-700">
                      <span className="text-sm font-bold">
                        {reg.user?.first_name?.[0] || '?'}
                      </span>
                    </div>
                    {isCheckedIn && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {reg.user?.first_name} {reg.user?.last_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      @{reg.user?.username || 'no username'} • {reg.ticket_code}
                    </div>
                  </div>
                  {isCheckedIn ? (
                    <Badge variant="success">Пришёл</Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => checkInMutation.mutate(reg.ticket_code)}
                      disabled={checkInMutation.isPending}
                    >
                      <UserCheck size={16} />
                    </Button>
                  )}
                </Card>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // Scanner view
  if (viewMode === 'scanner' && selectedEvent) {
    return (
      <div className="min-h-screen bg-bg">
        {/* Header */}
        <div className="p-4 flex items-center gap-3 border-b border-bg-card">
          <button onClick={() => setViewMode('participants')} className="text-gray-400">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Сканер билетов</h1>
            <p className="text-sm text-gray-400">{selectedEvent.title}</p>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* QR Scanner button */}
          <div className="text-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleScanQR}
              disabled={isScanning || !qrSupported}
              className={`
                w-40 h-40 mx-auto rounded-3xl flex flex-col items-center justify-center gap-3
                ${qrSupported ? 'bg-accent text-bg' : 'bg-gray-700 text-gray-400'}
                ${isScanning ? 'opacity-50' : ''}
              `}
            >
              {isScanning ? (
                <Loader2 size={48} className="animate-spin" />
              ) : (
                <ScanLine size={48} />
              )}
              <span className="font-semibold">
                {isScanning ? 'Сканирование...' : 'Сканировать QR'}
              </span>
            </motion.button>
            {!qrSupported && (
              <p className="text-sm text-gray-500 mt-2">
                QR сканер недоступен в этом браузере
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-sm">или введите код</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Manual code input */}
          <div className="space-y-3">
            <Input
              placeholder="MAIN-XXXXX-XXXX"
              icon={<Ticket size={20} />}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            />
            <Button
              fullWidth
              variant="secondary"
              onClick={handleManualCheckIn}
              disabled={!manualCode.trim() || checkInMutation.isPending}
              isLoading={checkInMutation.isPending}
            >
              Отметить по коду
            </Button>
          </div>

          {/* Recent check-ins */}
          {checkins.length > 0 && (
            <div>
              <h3 className="text-sm text-gray-400 mb-2">Последние отметки</h3>
              <div className="space-y-2">
                {checkins.slice(0, 5).map((checkin: any) => (
                  <div
                    key={checkin.id}
                    className="flex items-center gap-3 bg-bg-card rounded-xl p-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check size={16} className="text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {checkin.user?.first_name} {checkin.user?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {checkin.checked_in_at
                          ? format(new Date(checkin.checked_in_at), 'HH:mm', { locale: ru })
                          : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default CheckInPanel
