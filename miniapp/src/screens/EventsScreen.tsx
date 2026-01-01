import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { format, isToday, isTomorrow, addHours, isBefore, isAfter } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  QrCode,
  ScanLine,
  Camera,
  Users,
  Check,
  X,
  Sparkles,
  Code,
  Wrench,
  Megaphone,
  Lightbulb,
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback } from '@/lib/telegram'
import {
  getActiveEvents,
  getUserRegistrations,
  createEventRegistration,
  checkInByTicketCode,
} from '@/lib/supabase'
import { Avatar, Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { Event, EventRegistration, XP_REWARDS } from '@/types'

// Event type icons
const eventTypeIcons: Record<string, React.ReactNode> = {
  workshop: <Code size={32} className="text-accent" />,
  meetup: <Users size={32} className="text-accent" />,
  conference: <Megaphone size={32} className="text-accent" />,
  hackathon: <Lightbulb size={32} className="text-accent" />,
  default: <Calendar size={32} className="text-accent" />,
}

// QR Scanner component
const QRScanner: React.FC<{ onScan: (code: string) => void; onClose: () => void }> = ({ onScan, onClose }) => {
  const [manualCode, setManualCode] = useState('')

  return (
    <div className="fixed inset-0 bg-bg z-50 p-4">
      <button onClick={onClose} className="text-gray-400 mb-4 flex items-center gap-2">
        <ArrowLeft size={20} />
        Закрыть сканер
      </button>

      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Camera size={24} className="text-accent" />
        Сканер билетов
      </h1>

      <Card className="mb-6">
        <div className="aspect-square bg-black rounded-xl flex items-center justify-center mb-4">
          <div className="text-center">
            <ScanLine size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">
              Камера будет здесь
              <br />
              (используй ручной ввод)
            </p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm">
          Наведите камеру на QR-код билета
        </p>
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">Ручной ввод кода</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="MAIN-XXXXX-XXXX"
            className="flex-1 bg-bg px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-accent"
          />
          <Button onClick={() => onScan(manualCode)} disabled={!manualCode}>
            <Check size={20} />
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Ticket view component
const TicketView: React.FC<{
  registration: EventRegistration
  event: Event
  onClose: () => void
}> = ({ registration, event, onClose }) => {
  const eventDate = new Date(event.event_date)
  const checkInStart = addHours(eventDate, -1)
  const canCheckIn = isAfter(new Date(), checkInStart) && isBefore(new Date(), eventDate)

  return (
    <div className="fixed inset-0 bg-bg z-50 p-4 overflow-y-auto">
      <button onClick={onClose} className="text-gray-400 mb-4 flex items-center gap-2">
        <ArrowLeft size={20} />
        Назад
      </button>

      <Card className="text-center p-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
          <Ticket size={32} className="text-accent" />
        </div>
        <h2 className="text-xl font-bold mb-2">{event.title}</h2>
        <p className="text-gray-400 mb-6">
          {format(eventDate, 'd MMMM yyyy, HH:mm', { locale: ru })}
          <br />
          {event.location}
        </p>

        {/* QR Code */}
        <div className="bg-white p-6 rounded-2xl inline-block mb-4">
          <QRCodeSVG
            value={registration.ticket_code}
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>

        <div className="font-mono text-lg font-bold text-accent mb-4">
          {registration.ticket_code}
        </div>

        {registration.status === 'attended' ? (
          <Badge variant="success" className="text-base px-4 py-2">
            <Check size={16} className="mr-1" />
            Вы на мероприятии
          </Badge>
        ) : canCheckIn ? (
          <div className="text-sm text-accent">
            Check-in открыт! Покажите QR волонтёру
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            Check-in откроется за 1 час до начала
          </div>
        )}
      </Card>

      <div className="mt-6 space-y-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <CalendarDays size={20} className="text-accent" />
            </div>
            <div>
              <div className="font-medium">
                {format(eventDate, 'd MMMM yyyy', { locale: ru })}
              </div>
              <div className="text-sm text-gray-400">
                {format(eventDate, 'EEEE, HH:mm', { locale: ru })}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <MapPin size={20} className="text-accent" />
            </div>
            <div>
              <div className="font-medium">{event.location}</div>
              <div className="text-sm text-accent">Открыть на карте</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Event detail view
const EventDetail: React.FC<{
  event: Event
  registration?: EventRegistration
  onClose: () => void
  onRegister: () => void
  onShowTicket: () => void
}> = ({ event, registration, onClose, onRegister, onShowTicket }) => {
  const eventDate = new Date(event.event_date)
  const IconComponent = eventTypeIcons[event.event_type || 'default'] || eventTypeIcons.default

  return (
    <div className="pb-6">
      <button onClick={onClose} className="p-4 text-gray-400 flex items-center gap-2">
        <ArrowLeft size={20} />
        Назад
      </button>

      {/* Hero */}
      <div className="h-44 bg-gradient-to-br from-accent/30 to-bg-card flex items-center justify-center">
        {IconComponent}
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-3">
          <Badge variant="accent">{event.event_type || 'event'}</Badge>
          {event.price === 0 ? (
            <Badge>Бесплатно</Badge>
          ) : (
            <Badge>{event.price} BYN</Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4">{event.title}</h1>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <CalendarDays size={20} className="text-accent" />
            </div>
            <div>
              <div className="font-medium">
                {format(eventDate, 'd MMMM yyyy', { locale: ru })}
              </div>
              <div className="text-sm text-gray-400">
                {format(eventDate, 'HH:mm', { locale: ru })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <MapPin size={20} className="text-accent" />
            </div>
            <div>
              <div className="font-medium">{event.location}</div>
              <div className="text-sm text-accent">Показать на карте</div>
            </div>
          </div>

          {event.max_participants && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Users size={20} className="text-accent" />
              </div>
              <div>
                <div className="font-medium">{event.max_participants} мест</div>
              </div>
            </div>
          )}
        </div>

        {event.description && (
          <Card className="mb-6">
            <h3 className="font-semibold mb-2">О мероприятии</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>
          </Card>
        )}

        {event.speakers && (
          <Card className="mb-6">
            <h3 className="font-semibold mb-2">Что вас ждёт</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{event.speakers}</p>
          </Card>
        )}

        {registration ? (
          <div>
            <Button fullWidth variant="secondary" onClick={onShowTicket}>
              <Ticket size={18} />
              Показать билет
            </Button>
            <button className="w-full text-danger text-sm py-3 mt-2 flex items-center justify-center gap-2">
              <X size={16} />
              Отменить регистрацию
            </button>
          </div>
        ) : (
          <Button fullWidth onClick={onRegister}>
            <Ticket size={18} />
            {event.price === 0 ? 'Зарегистрироваться' : `Купить билет — ${event.price} BYN`}
          </Button>
        )}
      </div>
    </div>
  )
}

const EventsScreen: React.FC = () => {
  const { user } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState<'all' | 'registered'>('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showTicket, setShowTicket] = useState<{ registration: EventRegistration; event: Event } | null>(null)
  const [showScanner, setShowScanner] = useState(false)

  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getActiveEvents,
  })

  // Fetch user registrations
  const { data: registrations } = useQuery({
    queryKey: ['registrations', user?.id],
    queryFn: () => (user ? getUserRegistrations(user.id) : []),
    enabled: !!user,
  })

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      if (!user) throw new Error('No user')
      return createEventRegistration(eventId, user.id)
    },
    onSuccess: () => {
      hapticFeedback.success()
      addToast(`+${XP_REWARDS.EVENT_REGISTER} XP за регистрацию!`, 'xp', XP_REWARDS.EVENT_REGISTER)
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      setSelectedEvent(null)
    },
    onError: () => {
      hapticFeedback.error()
      addToast('Ошибка регистрации', 'error')
    },
  })

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (ticketCode: string) => {
      if (!user) throw new Error('No user')
      return checkInByTicketCode(ticketCode, user.id)
    },
    onSuccess: () => {
      hapticFeedback.success()
      addToast('Чекин успешен!', 'success')
      setShowScanner(false)
    },
    onError: (error: any) => {
      hapticFeedback.error()
      addToast(error.message || 'Ошибка чекина', 'error')
    },
  })

  const getRegistrationForEvent = (eventId: number) => {
    return registrations?.find((r: any) => r.event_id === eventId && r.status !== 'cancelled')
  }

  const formatEventDate = (date: string) => {
    const d = new Date(date)
    if (isToday(d)) return 'Сегодня'
    if (isTomorrow(d)) return 'Завтра'
    return format(d, 'd MMM', { locale: ru })
  }

  if (showScanner) {
    return (
      <QRScanner
        onScan={(code) => checkInMutation.mutate(code)}
        onClose={() => setShowScanner(false)}
      />
    )
  }

  if (showTicket) {
    return (
      <TicketView
        registration={showTicket.registration}
        event={showTicket.event}
        onClose={() => setShowTicket(null)}
      />
    )
  }

  if (selectedEvent) {
    const registration = getRegistrationForEvent(selectedEvent.id)
    return (
      <EventDetail
        event={selectedEvent}
        registration={registration}
        onClose={() => setSelectedEvent(null)}
        onRegister={() => registerMutation.mutate(selectedEvent.id)}
        onShowTicket={() => setShowTicket({ registration: registration!, event: selectedEvent })}
      />
    )
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-2xl font-bold">Мероприятия</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowScanner(true)}
            className="bg-bg-card px-3 py-2 rounded-xl text-sm flex items-center gap-2"
          >
            <ScanLine size={16} />
            Скан
          </motion.button>
        </div>
        <p className="text-gray-400 text-sm">Учись, знакомься, развивайся</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto pb-2">
        {[
          { id: 'all' as const, label: 'Все', icon: Calendar },
          { id: 'registered' as const, label: 'Мои', icon: Ticket },
        ].map((f) => (
          <motion.button
            key={f.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-2
              ${filter === f.id ? 'bg-accent text-bg' : 'bg-bg-card text-white'}
            `}
          >
            <f.icon size={14} />
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* My Tickets */}
      {filter === 'registered' && registrations && registrations.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Ticket size={14} />
            Мои билеты
          </h3>
          {registrations
            .filter((r: any) => r.status !== 'cancelled')
            .map((reg: any) => (
              <Card
                key={reg.id}
                onClick={() => setShowTicket({ registration: reg, event: reg.event })}
                className="mb-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{reg.event?.title}</div>
                    <div className="text-sm text-gray-400">
                      {format(new Date(reg.event?.event_date), 'd MMM, HH:mm', { locale: ru })}
                    </div>
                  </div>
                  <Badge variant={reg.status === 'attended' ? 'success' : 'accent'}>
                    {reg.status === 'attended' ? <Check size={12} /> : 'Активен'}
                  </Badge>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Events List */}
      <div className="px-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event: Event) => {
              const registration = getRegistrationForEvent(event.id)

              if (filter === 'registered' && !registration) return null

              const IconComponent = eventTypeIcons[event.event_type || 'default'] || eventTypeIcons.default

              return (
                <Card
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  highlighted={!!registration}
                  className="flex gap-3"
                >
                  <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center flex-shrink-0">
                    {IconComponent}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold truncate pr-2">{event.title}</div>
                      {registration && <Check size={16} className="text-accent flex-shrink-0" />}
                    </div>
                    <div className="text-sm text-accent mb-1 flex items-center gap-1">
                      <Clock size={12} />
                      {formatEventDate(event.event_date)} • {format(new Date(event.event_date), 'HH:mm')}
                    </div>
                    <div className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <MapPin size={12} />
                      {event.location}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {event.price === 0 ? (
                        <Badge variant="accent">Free</Badge>
                      ) : (
                        <Badge>{event.price} BYN</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar size={48} className="text-gray-500" />}
            title="Нет мероприятий"
            description="Скоро появятся новые события"
          />
        )}
      </div>
    </div>
  )
}

export default EventsScreen
