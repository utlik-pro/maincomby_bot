import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Send, Calendar, MapPin, Mic } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { StarRating } from './StarRating'
import { Button } from './ui'
import { createEventReview, fetchEventSpeakers } from '@/lib/supabase'
import { hapticFeedback } from '@/lib/telegram'
import { useToastStore } from '@/lib/store'
import { Event, EventSpeaker } from '@/types'

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

  // Speaker ratings state - map of speakerId to rating
  const [speakers, setSpeakers] = useState<EventSpeaker[]>([])
  const [speakerRatings, setSpeakerRatings] = useState<Record<string, number>>({})

  // Fetch speakers when event changes
  useEffect(() => {
    const loadSpeakers = async () => {
      if (event?.web_event_id) {
        const eventSpeakers = await fetchEventSpeakers(event.web_event_id)
        setSpeakers(eventSpeakers)
      }
    }
    if (isOpen && event) {
      loadSpeakers()
      // Reset form when opening
      setRating(0)
      setReviewText('')
      setSpeakerRatings({})
    }
  }, [isOpen, event])

  const handleSpeakerRating = (speakerId: string, newRating: number) => {
    setSpeakerRatings(prev => ({
      ...prev,
      [speakerId]: newRating
    }))
    hapticFeedback.light()
  }

  const handleSubmit = async () => {
    if (!event || rating === 0) return

    setIsSubmitting(true)
    try {
      // Convert speakerRatings object to array format
      const speakerRatingsArray = Object.entries(speakerRatings)
        .filter(([_, r]) => r > 0)
        .map(([speakerId, r]) => ({ speakerId, rating: r }))

      await createEventReview(
        event.id,
        userId,
        rating,
        reviewText,
        speakerRatingsArray.length > 0 ? speakerRatingsArray : undefined
      )
      hapticFeedback.success()
      addToast('Спасибо за отзыв! +20 XP', 'success')
      onSuccess?.()
      onClose()
      // Reset form
      setRating(0)
      setReviewText('')
      setSpeakerRatings({})
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
        <div className="bg-bg rounded-xl p-4 mb-4">
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

        {/* Event rating */}
        <div className="text-center mb-4">
          <div className="text-xs text-gray-400 mb-2">Оценка мероприятия</div>
          <div className="flex justify-center">
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
        </div>

        {/* All speakers ratings */}
        {speakers.length > 0 && (
          <div className="bg-bg rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Mic size={16} className="text-purple-500" />
              <span className="text-sm font-medium">Оцените спикеров</span>
              <span className="text-xs text-gray-500">(необязательно)</span>
            </div>

            {/* List of all speakers with individual ratings */}
            <div className="space-y-3">
              {speakers.map((s) => (
                <div
                  key={s.speaker_id}
                  className="flex items-center gap-3 p-3 bg-bg-card rounded-xl border border-border/50"
                >
                  {/* Speaker avatar */}
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {s.speaker.photo_url ? (
                      <img src={s.speaker.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Mic size={16} className="text-purple-500" />
                    )}
                  </div>

                  {/* Speaker info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.speaker.name}</div>
                    {s.speaker.title && (
                      <div className="text-xs text-gray-500 truncate">{s.speaker.title}</div>
                    )}
                  </div>

                  {/* Star rating for this speaker */}
                  <div className="flex-shrink-0">
                    <StarRating
                      rating={speakerRatings[s.speaker_id] || 0}
                      size="sm"
                      interactive
                      onChange={(r) => handleSpeakerRating(s.speaker_id, r)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review text */}
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Расскажите подробнее (необязательно)"
          className="w-full bg-bg rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent resize-none mb-4"
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
