import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, User, Calendar, Check, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { hapticFeedback } from '@/lib/telegram'
import { Button } from '@/components/ui'

interface OnboardingSlide {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

const slides: OnboardingSlide[] = [
  {
    icon: <Rocket size={64} />,
    title: 'Добро пожаловать в MAIN Community!',
    description: 'Нетворкинг-сообщество для предпринимателей и профессионалов',
    color: 'text-accent',
  },
  {
    icon: <User size={64} />,
    title: 'Заполни профиль',
    description: 'Расскажи о себе, чтобы другие участники могли тебя найти',
    color: 'text-blue-400',
  },
  {
    icon: <Calendar size={64} />,
    title: 'Участвуй в событиях',
    description: 'Посещай мероприятия, знакомься с людьми и получай XP',
    color: 'text-purple-400',
  },
  {
    icon: <Check size={64} />,
    title: 'Готово!',
    description: 'Начни с заполнения профиля и регистрации на ближайшее событие',
    color: 'text-success',
  },
]

const OnboardingScreen: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { setOnboardingComplete, setActiveTab } = useAppStore()

  const isLastSlide = currentSlide === slides.length - 1

  const handleNext = () => {
    hapticFeedback.light()
    if (isLastSlide) {
      hapticFeedback.success()
      setOnboardingComplete(true)
      setActiveTab('profile') // Направляем на профиль после онбординга
    } else {
      setCurrentSlide((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    hapticFeedback.light()
    setOnboardingComplete(true)
  }

  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Skip button */}
      {!isLastSlide && (
        <div className="absolute top-4 right-4 z-10">
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
