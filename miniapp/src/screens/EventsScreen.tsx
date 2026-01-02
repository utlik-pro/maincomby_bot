import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Html5Qrcode } from 'html5-qrcode'
import { format, isToday, isTomorrow, addHours, isBefore, isAfter } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Ticket,
  ScanLine,
  Camera,
  Users,
  Check,
  X,
  Code,
  Megaphone,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback, requestContact } from '@/lib/telegram'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { PhoneDialog } from '@/components/PhoneDialog'
import {
  getActiveEvents,
  getUserRegistrations,
  createEventRegistration,
  cancelEventRegistration,
  checkInByTicketCode,
  addXP,
  createOrUpdateUser,
  getUserByTelegramId,
} from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
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

// QR Scanner component with real camera
const QRScanner: React.FC<{ onScan: (code: string) => void; onClose: () => void }> = ({ onScan, onClose }) => {
  const [manualCode, setManualCode] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerId = 'qr-reader'

  useEffect(() => {
    // Start camera scanner
    const startScanner = async () => {
      try {
        setIsScanning(true)
        setCameraError(null)

        const scanner = new Html5Qrcode(containerId)
        scannerRef.current = scanner

        console.log('[QR Scanner] Starting camera...')

        // Попробовать заднюю камеру, если не получится - переднюю
        const cameraConfig = { facingMode: { ideal: 'environment' } }

        await scanner.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Success - QR code scanned
            hapticFeedback.success()

            // Показать белый overlay обработки
            setIsProcessing(true)

            // НЕМЕДЛЕННО скрыть камеру (ДО остановки)
            const qrDiv = document.getElementById(containerId)
            if (qrDiv) {
              qrDiv.style.display = 'none'
            }

            // Stop camera and call onScan (не await - чтобы не блокировать)
            scanner.stop().catch(() => {})

            // Небольшая задержка для плавности, затем закрыть
            setTimeout(() => {
              onScan(decodedText)
            }, 100)
          },
          () => {
            // Ignore scan errors (no QR found)
          }
        )

        console.log('[QR Scanner] Camera started successfully')
      } catch (err: any) {
        console.error('[QR Scanner] Camera error:', err)
        const errorMsg = err?.message || 'Не удалось запустить камеру'
        setCameraError(errorMsg)
        setIsScanning(false)

        // Показать toast с ошибкой
        console.error('Ошибка камеры:', errorMsg)
      }
    }

    startScanner()

    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [onScan])

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-bg z-50 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-bg-card px-4 py-3">
        <button onClick={handleClose} className="text-gray-400 flex items-center gap-2">
          <ArrowLeft size={20} />
          Закрыть сканер
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Camera size={24} className="text-accent" />
          Сканер билетов
        </h1>

      <Card className="mb-6">
        {/* Camera view */}
        <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
          <div
            id={containerId}
            className="w-full h-full bg-black"
          />

          {/* Loading overlay пока камера запускается */}
          {isScanning && !cameraError && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 size={32} className="animate-spin mx-auto mb-2" />
                <p className="text-sm">Запуск камеры...</p>
              </div>
            </div>
          )}
        </div>

        {isScanning && !cameraError && (
          <p className="text-center text-accent text-sm flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Наведите камеру на QR-код билета
          </p>
        )}

        {cameraError && (
          <div className="text-center">
            <p className="text-red-400 text-sm mb-3">{cameraError}</p>
            <p className="text-gray-400 text-xs">
              Используйте ручной ввод кода ниже
            </p>
          </div>
        )}
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
      </div>{/* End scrollable content */}

      {/* White processing overlay - покрывает ВЕСЬ экран поверх чёрного */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-accent mx-auto mb-4" />
            <p className="text-accent font-semibold text-lg">Проверка билета...</p>
          </div>
        </div>
      )}
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

  // Generate fallback ticket code if missing
  const ticketCode = registration.ticket_code || `MAIN-${registration.id}-${registration.event_id}`

  return (
    <div className="fixed inset-0 bg-bg z-50 flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-bg-card px-4 py-3">
        <button onClick={onClose} className="text-gray-400 flex items-center gap-2">
          <ArrowLeft size={20} />
          Назад
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
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
            value={ticketCode}
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>

        <div className="font-mono text-lg font-bold text-accent mb-4">
          {ticketCode}
        </div>

        <div className="text-xs text-gray-500 mb-4">
          Билет #{registration.id}
        </div>

        {registration.status === 'attended' ? (
          <Badge variant="success" className="text-base px-4 py-2">
            <Check size={16} />
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
      </div>{/* End scrollable content */}
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
  onCancelRegistration: () => void
}> = ({ event, registration, onClose, onRegister, onShowTicket, onCancelRegistration }) => {
  const eventDate = new Date(event.event_date)
  const IconComponent = eventTypeIcons[event.event_type || 'default'] || eventTypeIcons.default

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-bg-card">
        <button onClick={onClose} className="p-4 text-gray-400 flex items-center gap-2">
          <ArrowLeft size={20} />
          Назад
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-6">
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
            <button
              onClick={onCancelRegistration}
              className="w-full text-danger text-sm py-3 mt-2 flex items-center justify-center gap-2"
            >
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
      </div>{/* End scrollable content */}
    </div>
  )
}

const EventsScreen: React.FC = () => {
  const { user, setUser, addPoints, canAccessScanner } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState<'all' | 'registered'>('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showTicket, setShowTicket] = useState<{ registration: EventRegistration; event: Event } | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState<{ show: boolean; registrationId: number | null }>({
    show: false,
    registrationId: null,
  })
  const [phoneDialog, setPhoneDialog] = useState<{ show: boolean; eventId: number | null }>({
    show: false,
    eventId: null,
  })

  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getActiveEvents,
  })

  // Fetch user registrations
  const { data: registrations, error: registrationsError } = useQuery({
    queryKey: ['registrations', user?.id],
    queryFn: () => (user ? getUserRegistrations(user.id) : []),
    enabled: !!user,
  })

  // Real-time subscription for check-in notifications
  useEffect(() => {
    if (!user) return

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ndpkxustvcijykzxqxrn.supabase.co'
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

    if (!supabaseAnonKey) {
      console.warn('Supabase key not configured - real-time notifications disabled')
      return
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('[Realtime] Setting up subscription for user:', user.id)

    // Subscribe to changes on bot_registrations for this user
    const channel = supabase
      .channel(`checkin-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bot_registrations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('[Realtime] Received update:', payload)

          // Check if status changed to 'attended'
          if (payload.new?.status === 'attended' && payload.old?.status !== 'attended') {
            console.log('[Realtime] Check-in detected!')
            hapticFeedback.success()

            // Show success notification
            addToast('Вы успешно прошли чекин!', 'success')

            // Award XP
            addPoints(XP_REWARDS.EVENT_CHECKIN)
            addToast(`+${XP_REWARDS.EVENT_CHECKIN} XP за посещение!`, 'xp', XP_REWARDS.EVENT_CHECKIN)

            // Refresh registrations to update UI
            queryClient.invalidateQueries({ queryKey: ['registrations'] })
          }
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status)
      })

    // Cleanup subscription on unmount
    return () => {
      console.log('[Realtime] Cleaning up subscription')
      supabase.removeChannel(channel)
    }
  }, [user, addToast, addPoints, queryClient])

  // Fallback polling mechanism in case Realtime doesn't work
  useEffect(() => {
    if (!user) return

    // Poll registrations every 5 seconds when on events screen
    const pollInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
    }, 5000)

    return () => clearInterval(pollInterval)
  }, [user, queryClient])

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      if (!user) throw new Error('No user')

      const registration = await createEventRegistration(eventId, user.id)

      // Award XP for registration (database)
      try {
        await addXP(user.id, XP_REWARDS.EVENT_REGISTER, 'EVENT_REGISTER')
      } catch (e) {
        console.warn('XP award failed:', e)
      }
      return registration
    },
    onSuccess: () => {
      hapticFeedback.success()
      // Update local UI state
      addPoints(XP_REWARDS.EVENT_REGISTER)
      addToast(`+${XP_REWARDS.EVENT_REGISTER} XP за регистрацию!`, 'xp', XP_REWARDS.EVENT_REGISTER)
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      setSelectedEvent(null)
    },
    onError: (error: any) => {
      hapticFeedback.error()
      // Handle duplicate registration or sequence error
      const errorMsg = error?.message || ''
      const errorCode = error?.code || ''

      if (errorCode === '23505') {
        if (errorMsg.includes('pkey')) {
          addToast('Ошибка базы данных. Попробуйте позже.', 'error')
        } else {
          addToast('Вы уже зарегистрированы на это событие', 'info')
        }
        queryClient.invalidateQueries({ queryKey: ['registrations'] })
      } else {
        addToast('Ошибка регистрации', 'error')
      }
    },
  })

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (ticketCode: string) => {
      if (!user) throw new Error('No user')
      const result = await checkInByTicketCode(ticketCode, user.id)
      // Award XP for check-in (to the attendee, not volunteer)
      // Note: The user checking in might be a volunteer, XP goes to ticket owner
      return result
    },
    onSuccess: () => {
      hapticFeedback.success()
      addToast(`Чекин успешен! +${XP_REWARDS.EVENT_CHECKIN} XP`, 'success')
      setShowScanner(false)
    },
    onError: (error: any) => {
      hapticFeedback.error()
      addToast(error.message || 'Ошибка чекина', 'error')
    },
  })

  // Cancel registration mutation
  const cancelMutation = useMutation({
    mutationFn: async (registrationId: number) => {
      if (!user) throw new Error('No user')
      await cancelEventRegistration(registrationId, user.id)
    },
    onSuccess: () => {
      hapticFeedback.success()
      // Update local XP (deduct 10)
      addPoints(-10)
      addToast('Регистрация отменена. -10 XP', 'info')
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      setSelectedEvent(null)
    },
    onError: (error: any) => {
      hapticFeedback.error()
      addToast(error.message || 'Ошибка отмены', 'error')
    },
  })

  // Handle cancel - show custom dialog
  const handleCancelRegistration = (registrationId: number) => {
    setCancelConfirm({ show: true, registrationId })
  }

  // Confirm cancel
  const confirmCancel = () => {
    if (cancelConfirm.registrationId) {
      cancelMutation.mutate(cancelConfirm.registrationId)
    }
    setCancelConfirm({ show: false, registrationId: null })
  }

  // Handle registration - check phone first
  const handleRegister = (eventId: number) => {
    if (!user?.phone_number) {
      // Show phone dialog
      setPhoneDialog({ show: true, eventId })
    } else {
      // Proceed with registration
      registerMutation.mutate(eventId)
    }
  }

  // Handle phone from Telegram
  // Note: requestContact sends phone to BOT, not mini app
  // We need to wait for bot to save it, then refetch user
  const handlePhoneFromTelegram = async () => {
    try {
      const shared = await requestContact()
      if (shared) {
        // Phone was shared with bot - wait for bot to save it
        addToast('Сохраняем номер...', 'info')

        // Wait 2 seconds for bot to process
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Refetch user from database
        const updatedUser = await getUserByTelegramId(user!.tg_user_id)
        if (updatedUser?.phone_number) {
          setUser(updatedUser)
          setPhoneDialog({ show: false, eventId: null })
          // Continue registration
          if (phoneDialog.eventId) {
            registerMutation.mutate(phoneDialog.eventId)
          }
          return
        }

        // If still no phone, ask to enter manually
        addToast('Введите номер вручную', 'info')
      }
    } catch (e) {
      addToast('Не удалось получить номер', 'error')
    }
    setPhoneDialog({ show: false, eventId: null })
  }

  // Handle manual phone input
  const handlePhoneManual = async (phone: string) => {
    try {
      await createOrUpdateUser({
        tg_user_id: user!.tg_user_id,
        phone_number: phone,
      })
      setUser({ ...user!, phone_number: phone })
      // Continue registration
      if (phoneDialog.eventId) {
        registerMutation.mutate(phoneDialog.eventId)
      }
    } catch (e) {
      addToast('Ошибка сохранения номера', 'error')
    }
    setPhoneDialog({ show: false, eventId: null })
  }

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
        onScan={(code) => {
          // Закрыть сканер СРАЗУ (без задержки)
          setShowScanner(false)

          // Показать загрузку
          addToast('Проверка билета...', 'info')

          // Обработать чекин в фоне
          checkInMutation.mutate(code)
        }}
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
      <>
        {/* Cancel Confirmation Dialog - rendered above EventDetail */}
        <ConfirmDialog
          isOpen={cancelConfirm.show}
          title="Отменить регистрацию?"
          message="Вы уверены, что хотите отменить регистрацию? Вы потеряете 10 XP."
          confirmText="Да, отменить"
          cancelText="Назад"
          variant="danger"
          onConfirm={confirmCancel}
          onCancel={() => setCancelConfirm({ show: false, registrationId: null })}
        />
        {/* Phone Dialog - for registration */}
        <PhoneDialog
          isOpen={phoneDialog.show}
          onSubmit={handlePhoneManual}
          onCancel={() => setPhoneDialog({ show: false, eventId: null })}
          onUseTelegram={handlePhoneFromTelegram}
        />
        <EventDetail
          event={selectedEvent}
          registration={registration}
          onClose={() => setSelectedEvent(null)}
          onRegister={() => handleRegister(selectedEvent.id)}
          onShowTicket={() => setShowTicket({ registration: registration!, event: selectedEvent })}
          onCancelRegistration={() => registration && handleCancelRegistration(registration.id)}
        />
      </>
    )
  }

  return (
    <div className="pb-32">
      {/* Cancel Confirmation Dialog (fallback) */}
      <ConfirmDialog
        isOpen={cancelConfirm.show}
        title="Отменить регистрацию?"
        message="Вы уверены, что хотите отменить регистрацию? Вы потеряете 10 XP."
        confirmText="Отменить"
        cancelText="Назад"
        variant="danger"
        onConfirm={confirmCancel}
        onCancel={() => setCancelConfirm({ show: false, registrationId: null })}
      />

      {/* Header */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-2xl font-bold">Мероприятия</h1>
          {/* Scanner only for volunteers and core team */}
          {canAccessScanner() && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowScanner(true)}
              className="bg-bg-card px-3 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              <ScanLine size={16} />
              Скан
            </motion.button>
          )}
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
      {filter === 'registered' && (
        <div className="px-4 mb-6 pb-20">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            <Ticket size={14} />
            Мои билеты ({registrations?.length || 0})
          </h3>
          {registrationsError && (
            <Card className="mb-3 border-red-500/20">
              <div className="text-red-400 text-sm">
                Ошибка загрузки билетов: {String(registrationsError)}
              </div>
            </Card>
          )}
          {registrations && registrations.length > 0 ? (
            registrations
              .filter((r: any) => r.status !== 'cancelled')
              .map((reg: any) => (
                <Card
                  key={reg.id}
                  onClick={() => setShowTicket({ registration: reg, event: reg.event })}
                  className="mb-3"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{reg.event?.title || `Событие #${reg.event_id}`}</div>
                      <div className="text-sm text-gray-400">
                        {reg.event?.event_date
                          ? format(new Date(reg.event.event_date), 'd MMM, HH:mm', { locale: ru })
                          : 'Дата не указана'}
                      </div>
                    </div>
                    <Badge variant={reg.status === 'attended' ? 'success' : 'accent'}>
                      {reg.status === 'attended' ? <Check size={12} /> : 'Активен'}
                    </Badge>
                  </div>
                </Card>
              ))
          ) : !registrationsError ? (
            <Card className="mb-3">
              <div className="text-center text-gray-400 py-4">
                <Ticket size={24} className="mx-auto mb-2 opacity-50" />
                <div className="text-sm">Нет регистраций на события</div>
              </div>
            </Card>
          ) : null}
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
