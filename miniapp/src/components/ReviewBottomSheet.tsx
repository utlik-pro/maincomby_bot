import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Send, Calendar, MapPin, Mic, ChevronDown } from 'lucide-react'
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

  // Speaker rating state
  const [speakers, setSpeakers] = useState<EventSpeaker[]>([])
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null)
  const [speakerRating, setSpeakerRating] = useState(0)
  const [showSpeakerSelect, setShowSpeakerSelect] = useState(false)

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
    }
  }, [isOpen, event])

  const selectedSpeaker = speakers.find(s => s.speaker_id === selectedSpeakerId)

  const handleSubmit = async () => {
    if (!event || rating === 0) return

    setIsSubmitting(true)
    try {
      await createEventReview(
        event.id,
        userId,
        rating,
        reviewText,
        selectedSpeakerId || undefined,
        speakerRating > 0 ? speakerRating : undefined
      )
      hapticFeedback.success()
      addToast('Спасибо за отзыв! +20 XP', 'success')
      onSuccess?.()
      onClose()
      // Reset form
      setRating(0)
      setReviewText('')
      setSelectedSpeakerId(null)
      setSpeakerRating(0)
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

        {/* Speaker rating (if speakers exist) */}
        {speakers.length > 0 && (
          <div className="bg-bg rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Mic size={16} className="text-purple-500" />
              <span className="text-sm font-medium">Оцените спикера</span>
              <span className="text-xs text-gray-500">(необязательно)</span>
            </div>

            {/* Speaker selector */}
            <div className="relative mb-3">
              <button
                onClick={() => setShowSpeakerSelect(!showSpeakerSelect)}
                className="w-full flex items-center justify-between p-3 bg-bg-card rounded-xl border border-border"
              >
                {selectedSpeaker ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden">
                      {selectedSpeaker.speaker.photo_url ? (
                        <img src={selectedSpeaker.speaker.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Mic size={12} className="text-purple-500" />
                      )}
                    </div>
                    <span className="text-sm">{selectedSpeaker.speaker.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Выберите спикера...</span>
                )}
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showSpeakerSelect ? 'rotate-180' : ''}`} />
              </button>

              {showSpeakerSelect && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-bg-card rounded-xl border border-border shadow-xl max-h-48 overflow-y-auto">
                  {speakers.map((s) => (
                    <button
                      key={s.speaker_id}
                      onClick={() => {
                        setSelectedSpeakerId(s.speaker_id)
                        setShowSpeakerSelect(false)
                        hapticFeedback.light()
                      }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-bg transition-colors border-b border-border/50 last:border-0 ${
                        selectedSpeakerId === s.speaker_id ? 'bg-purple-500/10' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {s.speaker.photo_url ? (
                          <img src={s.speaker.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Mic size={14} className="text-purple-500" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">{s.speaker.name}</div>
                        {s.speaker.title && (
                          <div className="text-xs text-gray-500">{s.speaker.title}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Speaker star rating */}
            {selectedSpeakerId && (
              <div className="flex justify-center">
                <StarRating
                  rating={speakerRating}
                  size="md"
                  interactive
                  onChange={(r) => {
                    setSpeakerRating(r)
                    hapticFeedback.light()
                  }}
                />
              </div>
            )}
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
