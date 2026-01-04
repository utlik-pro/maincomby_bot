import React from 'react'
import { ArrowLeft, Users, Heart, Sparkles, Target, HandshakeIcon, Check, MessageCircle } from 'lucide-react'
import { Card } from '@/components/ui'

interface NetworkingGuideProps {
  onClose: () => void
}

export const NetworkingGuide: React.FC<NetworkingGuideProps> = ({ onClose }) => {
  return (
    <div className="pb-6">
      <button onClick={onClose} className="p-4 text-gray-400 flex items-center gap-2">
        <ArrowLeft size={16} />
        Назад
      </button>

      <div className="px-4">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Users size={24} className="text-accent" />
          Как работает нетворкинг
        </h1>
        <p className="text-gray-400 text-sm mb-6">Гид по поиску полезных контактов</p>

        {/* Intro */}
        <Card className="mb-4">
          <h3 className="font-semibold mb-3">Что такое нетворкинг в MAIN?</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Нетворкинг — это возможность найти единомышленников, партнёров и клиентов среди участников сообщества.
            Свайпайте профили, находите интересных людей и начинайте общение!
          </p>
        </Card>

        {/* How swipes work */}
        <Card className="mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Heart size={18} className="text-pink-400" />
            Как работают свайпы
          </h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Свайп вправо</strong> — вам интересен человек</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Свайп влево</strong> — пропустить</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={16} className="text-success flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Мэтч</strong> — когда оба свайпнули вправо, вы можете связаться</span>
            </li>
          </ul>
        </Card>

        {/* Why fill profile */}
        <Card className="mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-400" />
            Зачем заполнять профиль?
          </h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <Target size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <span>Другие поймут <strong className="text-white">что вы ищете</strong> — партнёров, клиентов, менторов</span>
            </li>
            <li className="flex items-start gap-2">
              <HandshakeIcon size={16} className="text-success flex-shrink-0 mt-0.5" />
              <span>Расскажите <strong className="text-white">чем можете помочь</strong> — экспертиза, ресурсы, связи</span>
            </li>
            <li className="flex items-start gap-2">
              <Users size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <span>Добавьте <strong className="text-white">навыки и интересы</strong> — вас найдут по тегам</span>
            </li>
          </ul>
        </Card>

        {/* Tips */}
        <Card className="mb-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MessageCircle size={18} className="text-blue-400" />
            Советы для успешного нетворкинга
          </h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">1.</span>
              <span>Добавьте <strong className="text-white">качественное фото</strong> — так вас запомнят</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">2.</span>
              <span>Напишите <strong className="text-white">конкретно что ищете</strong> — "ищу инвестора для SaaS"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">3.</span>
              <span>Укажите <strong className="text-white">чем можете помочь</strong> — это привлекает людей</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">4.</span>
              <span>Посещайте <strong className="text-white">события</strong> — там проще завязать разговор</span>
            </li>
          </ul>
        </Card>

        {/* Example good profile */}
        <Card className="border-accent/30 bg-accent/5">
          <h3 className="font-semibold mb-3 text-accent">Пример хорошего профиля</h3>
          <div className="space-y-2 text-sm">
            <p><strong className="text-gray-300">Профессия:</strong> <span className="text-gray-400">CEO в EdTech стартапе</span></p>
            <p><strong className="text-gray-300">Ищу:</strong> <span className="text-gray-400">Инвестора для seed-раунда, CTO с опытом в AI</span></p>
            <p><strong className="text-gray-300">Могу помочь:</strong> <span className="text-gray-400">Product-менеджмент, запуск продуктов, выход на рынок США</span></p>
            <p><strong className="text-gray-300">Навыки:</strong> <span className="text-gray-400">Product, Fundraising, Growth</span></p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default NetworkingGuide
