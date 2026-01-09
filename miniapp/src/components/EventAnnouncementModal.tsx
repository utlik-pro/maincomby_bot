import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, X, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Event } from '@/types'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface EventAnnouncementModalProps {
  isOpen: boolean
  event: Event | null
  onClose: () => void
  onViewDetails: () => void
}

// Generate Yandex Maps URL from location string
const generateMapUrl = (location: string, city?: string): string => {
  const searchQuery = city ? `${location}, ${city}` : location
  return `https://yandex.by/maps/?text=${encodeURIComponent(searchQuery)}`
}

// Get map URL - use location_url if exists, otherwise generate from location
const getMapUrl = (event: Event): string | null => {
  if (event.location_url) return event.location_url
  if (event.location) return generateMapUrl(event.location, event.city)
  return null
}

export const EventAnnouncementModal: React.FC<EventAnnouncementModalProps> = ({
  isOpen,
  event,
  onClose,
  onViewDetails,
}) => {
  const [showMapConfirm, setShowMapConfirm] = useState(false)

  if (!event) return null

  const eventDate = new Date(event.event_date)
  const formattedDate = format(eventDate, 'd MMMM', { locale: ru })
  const formattedTime = format(eventDate, 'HH:mm')
  const mapUrl = getMapUrl(event)

  const eventTypeLabels: Record<string, string> = {
    meetup: 'Митап',
    workshop: 'Воркшоп',
    conference: 'Конференция',
    hackathon: 'Хакатон',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Map confirmation dialog */}
          <ConfirmDialog
            isOpen={showMapConfirm}
            title="Открыть карту?"
            message="Вы покидаете мини-приложение. Откроется Яндекс.Карты с местоположением мероприятия."
            confirmText="Открыть"
            cancelText="Отмена"
            onConfirm={() => {
              if (mapUrl) window.open(mapUrl, '_blank')
              setShowMapConfirm(false)
            }}
            onCancel={() => setShowMapConfirm(false)}
          />

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
          >
            <div className="bg-bg-card rounded-2xl shadow-xl border border-white/10">
              {/* Content */}
              <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Calendar size={24} className="text-accent" />
                    </div>
                    <div>
                      <span className="text-xs text-accent font-medium">
                        {eventTypeLabels[event.event_type] || 'Мероприятие'}
                      </span>
                      <h3 className="text-lg font-bold">{event.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Subtitle */}
                <p className="text-gray-400 text-sm mb-4">
                  Приглашаем вас на мероприятие
                </p>

                {/* Event details */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Calendar size={18} className="text-accent" />
                    </div>
                    <span className="text-gray-200">{formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Clock size={18} className="text-accent" />
                    </div>
                    <span className="text-gray-200">{formattedTime}</span>
                  </div>

                  {event.location && (
                    <div
                      className={`flex items-center gap-3 text-sm ${mapUrl ? 'cursor-pointer active:opacity-80' : ''}`}
                      onClick={() => {
                        if (mapUrl) {
                          setShowMapConfirm(true)
                        }
                      }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <MapPin size={18} className="text-accent" />
                      </div>
                      <div>
                        <span className="text-gray-200">{event.location}</span>
                        {mapUrl && (
                          <div className="text-xs text-accent">Открыть карту</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors"
                  >
                    Позже
                  </button>
                  <button
                    onClick={onViewDetails}
                    className="flex-1 py-3 px-4 rounded-xl bg-accent text-bg font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-1"
                  >
                    Подробнее
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default EventAnnouncementModal
