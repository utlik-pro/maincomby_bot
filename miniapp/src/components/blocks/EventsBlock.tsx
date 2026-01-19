/**
 * Events Block - Upcoming events list
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight, MapPin, Users } from 'lucide-react'
import { Card } from '@/components/ui'
import { useAppStore } from '@/lib/store'
import { getActiveEvents } from '@/lib/supabase'
import type { AppBlock, EventsBlockConfig } from '@shared/types'

interface EventsBlockProps {
  block: AppBlock<'events'>
}

export function EventsBlock({ block }: EventsBlockProps) {
  const config = block.config as EventsBlockConfig
  const { setActiveTab } = useAppStore()
  const limit = config.limit || 3

  const { data: events = [] } = useQuery({
    queryKey: ['events', 'upcoming', limit],
    queryFn: getActiveEvents,
  })

  if (events.length === 0) return null

  const title = block.title?.ru || 'Events'

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar size={20} className="text-accent" />
          {title}
        </h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('events')}
          className="text-accent text-sm flex items-center gap-1"
        >
          All <ChevronRight size={16} />
        </motion.button>
      </div>

      <div className="space-y-3">
        {events.slice(0, limit).map((event: any) => (
          <Card
            key={event.id}
            onClick={() => setActiveTab('events')}
            className="cursor-pointer"
          >
            <div className="flex gap-3">
              {event.cover_image && (
                <div
                  className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${event.cover_image})` }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{event.title}</div>
                <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                  <Calendar size={12} />
                  {new Date(event.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
                {event.location && (
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {event.location}
                  </div>
                )}
              </div>
              {config.showRegistrationButton && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="bg-accent/10 text-accent px-3 py-1 rounded-lg text-sm font-medium self-center"
                >
                  Join
                </motion.button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
