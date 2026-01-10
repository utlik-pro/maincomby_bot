import React, { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Star, Send, Calendar, MapPin } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { StarRating } from './StarRating'
import { Button } from './ui'
import { createEventReview } from '@/lib/supabase'
import { hapticFeedback } from '@/lib/telegram'
import { useToastStore } from '@/lib/store'
import { Event } from '@/types'

interface ReviewBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
  userId: number
  onSuccess?: () => void
}

export const ReviewBottomSheet: React.FC<ReviewBottomSheetProps> = ({
  isOpen,
  onClose,
  event,
  userId,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addToast } = useToastStore()

  const handleSubmit = async () => {
    if (!event || rating === 0) return

    setIsSubmitting(true)
    try {
      await createEventReview(event.id, userId, rating, reviewText)
      hapticFeedback.success()
      addToast('Спасибо за отзыв! +20 XP', 'success')
      onSuccess?.()
      onClose()
      // Reset form
      setRating(0)
      setReviewText('')
    } catch (error: any) {
      hapticFeedback.error()
      if (error?.message?.includes('cannot review')) {
        addToast('Вы уже оставили отзыв', 'info')
      } else {
        addToast(error?.message || 'Ошибка отправки', 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    hapticFeedback.light()
    onClose()
  }

  if (!event) return null

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
    >
      <div className="p-6">
        {/* Header with emoji */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">
            {rating === 0 ? '🎉' : rating <= 2 ? '😕' : rating <= 3 ? '🙂' : rating <= 4 ? '😊' : '🤩'}
          </div>
          <h2 className="text-xl font-bold mb-1">Как вам мероприятие?</h2>
          <p className="text-gray-400 text-sm">Ваш отзыв поможет нам стать лучше</p>
        </div>

        {/* Event info card */}
        <div className="bg-bg rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-2">{event.title}</h3>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(new Date(event.event_date), 'd MMMM', { locale: ru })}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {event.location}
              </span>
            )}
          </div>
        </div>

        {/* Star rating */}
        <div className="flex justify-center mb-6">
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onChange={(r) => {
              setRating(r)
              hapticFeedback.light()
            }}
          />
        </div>

        {/* Review text */}
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Расскажите подробнее (необязательно)"
          className="w-full bg-bg rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent resize-none mb-6"
          rows={3}
        />

        {/* Actions */}
        <div className="space-y-3">
          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            isLoading={isSubmitting}
          >
            <Send size={18} />
            Отправить отзыв
            <span className="text-xs opacity-70 ml-1">(+20 XP)</span>
          </Button>

          <button
            onClick={handleSkip}
            className="w-full py-3 text-gray-400 text-sm hover:text-white transition-colors"
          >
            Позже
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}

export default ReviewBottomSheet
