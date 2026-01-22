import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Users, Sparkles, Calendar, Check, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { hapticFeedback } from '@/lib/telegram'
import { Button } from '@/components/ui'

interface OnboardingSlide {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  bullets?: string[]
}

const slides: OnboardingSlide[] = [
  {
    icon: <Rocket size={64} />,
    title: 'Добро пожаловать в MAIN Community!',
    description: 'Нетворкинг-сообщество для предпринимателей и профессионалов',
    color: 'text-accent',
  },
  {
    icon: <Users size={64} />,
    title: 'Находи полезные контакты',
    description: 'Свайпай профили и находи единомышленников для сотрудничества',
    color: 'text-blue-400',
  },
  {
    icon: <Sparkles size={64} />,
    title: 'Зачем заполнять профиль?',
    description: 'Чем подробнее профиль — тем больше шансов найти нужных людей',
    color: 'text-yellow-400',
    bullets: [
      'Тебя найдут по навыкам и интересам',
      'Другие поймут чем ты можешь помочь',
      'Больше мэтчей с релевантными людьми',
    ],
  },
  {
    icon: <Calendar size={64} />,
    title: 'Участвуй в событиях',
    description: 'Посещай мероприятия и получай XP за активность',
    color: 'text-purple-400',
  },
  {
    icon: <Check size={64} />,
    title: 'Готово!',
    description: 'Заполни профиль и начни нетворкинг прямо сейчас',
    color: 'text-success',
  },
]

const OnboardingScreen: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { completeOnboarding, setActiveTab } = useAppStore()

  const isLastSlide = currentSlide === slides.length - 1

  const handleNext = () => {
    hapticFeedback.light()
    if (isLastSlide) {
      hapticFeedback.success()
      completeOnboarding()
      setActiveTab('profile') // Направляем на профиль после онбординга
    } else {
      setCurrentSlide((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    hapticFeedback.light()
    completeOnboarding()
  }

  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen flex flex-col bg-bg" style={{ overscrollBehavior: 'none' }}>
      {/* Skip button - positioned below Telegram header */}
      {!isLastSlide && (
        <div className="absolute top-[100px] right-4 z-10">
          <button
            onClick={handleSkip}
            className="text-gray-500 text-sm px-3 py-1"
          >
            Пропустить
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`mb-8 ${slide.color} flex items-center justify-center`}
            >
              {slide.icon}
            </motion.div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-4">{slide.title}</h1>

            {/* Description */}
            <p className="text-gray-400 text-base max-w-xs mx-auto">
              {slide.description}
            </p>

            {/* Bullets (if any) */}
            {slide.bullets && (
              <ul className="mt-4 text-left max-w-xs mx-auto space-y-2">
                {slide.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <div className="p-6 pb-10">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-accent' : 'bg-gray-600'
              }`}
              animate={{ scale: index === currentSlide ? 1.2 : 1 }}
            />
          ))}
        </div>

        {/* Button */}
        <Button
          fullWidth
          onClick={handleNext}
          icon={isLastSlide ? <Check size={18} /> : <ChevronRight size={18} />}
        >
          {isLastSlide ? 'Начать' : 'Далее'}
        </Button>
      </div>
    </div>
  )
}

export default OnboardingScreen
