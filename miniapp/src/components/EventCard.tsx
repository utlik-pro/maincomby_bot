import React from 'react'
import { Clock, MapPin, Check, Calendar, Code, Users, Megaphone, Lightbulb } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Card, Badge } from '@/components/ui'
import { Event } from '@/types'

// Event type icons
const eventTypeIcons: Record<string, React.ReactNode> = {
  workshop: <Code size={32} className="text-accent" />,
  meetup: <Users size={32} className="text-accent" />,
  conference: <Megaphone size={32} className="text-accent" />,
  hackathon: <Lightbulb size={32} className="text-accent" />,
  default: <Calendar size={32} className="text-accent" />,
}

interface EventCardProps {
  event: Event
  isRegistered?: boolean
  onClick?: () => void
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isRegistered = false,
  onClick,
}) => {
  const formatEventDate = (date: string) => {
    const d = new Date(date)
    if (isToday(d)) return 'Сегодня'
    if (isTomorrow(d)) return 'Завтра'
    return format(d, 'd MMM', { locale: ru })
  }

  const IconComponent = eventTypeIcons[event.event_type || 'default'] || eventTypeIcons.default

  return (
    <Card
      onClick={onClick}
      highlighted={isRegistered}
      className="flex gap-3"
    >
      <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center flex-shrink-0">
        {IconComponent}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div className="font-semibold truncate pr-2">{event.title}</div>
          {isRegistered && <Check size={16} className="text-accent flex-shrink-0" />}
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
}
