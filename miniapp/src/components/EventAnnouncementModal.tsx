import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Clock, X, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Event } from '@/types'

interface EventAnnouncementModalProps {
  isOpen: boolean
  event: Event | null
  onClose: () => void
  onViewDetails: () => void
}

export const EventAnnouncementModal: React.FC<EventAnnouncementModalProps> = ({
  isOpen,
  event,
  onClose,
  onViewDetails,
}) => {
  if (!event) return null

  const eventDate = new Date(event.event_date)
  const formattedDate = format(eventDate, 'd MMMM', { locale: ru })
  const formattedTime = format(eventDate, 'HH:mm')

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
            <div className="bg-bg-card rounded-2xl overflow-hidden shadow-xl border border-white/10">
              {/* Header with image or gradient */}
              <div className="relative h-32 bg-gradient-to-br from-accent/30 to-accent/10">
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white/80 hover:text-white"
                >
                  <X size={18} />
                </button>

                {/* Event type badge */}
                <div className="absolute bottom-3 left-4">
                  <span className="px-2 py-1 rounded-md bg-accent/90 text-bg text-xs font-semibold">
                    {eventTypeLabels[event.event_type] || event.event_type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Title */}
                <h3 className="text-xl font-bold mb-1">{event.title}</h3>

                {/* Subtitle */}
                <p className="text-gray-400 text-sm mb-4">
                  Приглашаем вас на мероприятие
                </p>

                {/* Event details */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Calendar size={16} className="text-accent" />
                    </div>
                    <span className="text-gray-300">{formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Clock size={16} className="text-accent" />
                    </div>
                    <span className="text-gray-300">{formattedTime}</span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <MapPin size={16} className="text-accent" />
                      </div>
                      <span className="text-gray-300 truncate">{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Description preview */}
                {event.description && (
                  <p className="text-gray-400 text-sm mb-5 line-clamp-2">
                    {event.description}
                  </p>
                )}

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
