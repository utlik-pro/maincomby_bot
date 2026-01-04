import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { Event } from '@/types'

interface EventCalendarProps {
  events: Event[]
  onSelectDate: (date: Date, eventsOnDate: Event[]) => void
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export const EventCalendar: React.FC<EventCalendarProps> = ({ events, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const getEventsForDate = (date: Date): Event[] => {
    return events.filter((event) => {
      const eventDate = new Date(event.event_date)
      return isSameDay(eventDate, date)
    })
  }

  const handleDateClick = (date: Date) => {
    const eventsOnDate = getEventsForDate(date)
    setSelectedDate(date)
    onSelectDate(date, eventsOnDate)
  }

  const renderDays = () => {
    const days = []
    let day = startDate

    while (day <= endDate) {
      const currentDay = day
      const eventsOnDay = getEventsForDate(currentDay)
      const hasEvents = eventsOnDay.length > 0
      const isCurrentMonth = isSameMonth(currentDay, monthStart)
      const isSelected = selectedDate && isSameDay(currentDay, selectedDate)
      const isTodayDate = isToday(currentDay)

      days.push(
        <motion.button
          key={day.toString()}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDateClick(currentDay)}
          className={`
            relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium
            transition-colors
            ${!isCurrentMonth ? 'text-gray-600' : 'text-white'}
            ${isSelected ? 'bg-accent text-bg' : ''}
            ${isTodayDate && !isSelected ? 'ring-1 ring-accent' : ''}
            ${hasEvents && !isSelected ? 'bg-accent/20' : ''}
          `}
        >
          {format(currentDay, 'd')}
          {hasEvents && (
            <span
              className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                isSelected ? 'bg-bg' : 'bg-accent'
              }`}
            />
          )}
        </motion.button>
      )

      day = addDays(day, 1)
    }

    return days
  }

  return (
    <div className="bg-bg-card rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center"
        >
          <ChevronLeft size={18} />
        </motion.button>

        <h3 className="text-lg font-semibold capitalize">
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </h3>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-8 h-8 rounded-lg bg-bg flex items-center justify-center"
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="w-10 h-8 flex items-center justify-center text-xs text-gray-500 font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  )
}

export default EventCalendar
