import React, { useEffect } from 'react'
import { Shield, FileText, Mail } from 'lucide-react'
import { hapticFeedback, backButton, disableVerticalSwipes, enableVerticalSwipes, requestFullscreen, exitFullscreen } from '@/lib/telegram'
import { Card } from '@/components/ui'

type LegalType = 'privacy' | 'terms'

interface LegalScreenProps {
  type: LegalType
  onClose: () => void
}

const LEGAL_CONTENT: Record<LegalType, { title: string; icon: React.ReactNode; content: React.ReactNode }> = {
  privacy: {
    title: 'Политика конфиденциальности',
    icon: <Shield size={24} className="text-accent" />,
    content: (
      <div className="space-y-6">
        <section>
          <h3 className="font-semibold text-white mb-2">1. Общие положения</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Настоящая Политика разработана в соответствии с Законом Республики Беларусь
            «О защите персональных данных» от 07.05.2021 №99-З и определяет порядок обработки
            персональных данных пользователей приложения MAIN Community.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mt-2">
            <b className="text-white">Оператор:</b> MAIN Community
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">2. Персональные данные, которые мы собираем</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            При использовании приложения собираются следующие персональные данные:
          </p>
          <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
            <li>Telegram ID и имя пользователя</li>
            <li>Имя, фамилия, фотография профиля</li>
            <li>Город, профессия, навыки, интересы</li>
            <li>Данные о регистрациях на мероприятия</li>
            <li>История взаимодействий (свайпы, матчи)</li>
            <li>XP баллы и достижения в приложении</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">3. Цели обработки персональных данных</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Ваши данные обрабатываются в следующих целях:
          </p>
          <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
            <li>Предоставление функций приложения</li>
            <li>Обеспечение работы функции нетворкинга</li>
            <li>Отправка уведомлений о событиях и матчах</li>
            <li>Ведение статистики и лидербордов</li>
            <li>Улучшение качества сервиса</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">4. Правовые основания обработки</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Обработка персональных данных осуществляется на основании:
          </p>
          <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
            <li>Вашего согласия при использовании приложения</li>
            <li>Необходимости исполнения пользовательского соглашения</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">5. Хранение и защита данных</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Персональные данные хранятся на защищённых серверах Supabase (PostgreSQL)
            с применением технических и организационных мер защиты, включая шифрование
            и контроль доступа.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mt-2">
            <b className="text-white">Срок хранения:</b> до момента отзыва согласия или удаления аккаунта.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">6. Передача данных третьим лицам</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Мы не передаём ваши персональные данные третьим лицам без вашего согласия,
            за исключением случаев, предусмотренных законодательством Республики Беларусь.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">7. Ваши права</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            В соответствии с Законом №99-З вы имеете право:
          </p>
          <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
            <li>Отозвать согласие на обработку данных</li>
            <li>Получить информацию об обработке ваших данных</li>
            <li>Потребовать исправления неточных данных</li>
            <li>Потребовать удаления ваших данных</li>
            <li>Потребовать прекращения обработки данных</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">8. Контакты</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            По вопросам обработки персональных данных обращайтесь:
          </p>
          <p className="text-gray-400 text-sm mt-2">
            <b className="text-white">Email:</b> reflecta.by@gmail.com
          </p>
          <p className="text-gray-400 text-sm mt-1">
            <b className="text-white">Срок ответа:</b> 15 рабочих дней
          </p>
        </section>

        <section className="pt-4 border-t border-bg-card">
          <p className="text-gray-500 text-xs">
            Последнее обновление: январь 2025
          </p>
        </section>
      </div>
    ),
  },
  terms: {
    title: 'Пользовательское соглашение',
    icon: <FileText size={24} className="text-accent" />,
    content: (
      <div className="space-y-6">
        <section>
          <h3 className="font-semibold text-white mb-2">1. Предмет соглашения</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Настоящее Пользовательское соглашение регулирует отношения между MAIN Community
            (далее — «Оператор») и пользователем приложения (далее — «Пользователь»)
            при использовании мобильного приложения MAIN Community.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mt-2">
            Используя приложение, вы подтверждаете своё согласие с условиями настоящего соглашения.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">2. Регистрация и аккаунт</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Регистрация осуществляется через авторизацию в Telegram. Пользователь обязуется:
          </p>
          <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
            <li>Предоставлять достоверную информацию о себе</li>
            <li>Не создавать фиктивные аккаунты</li>
            <li>Не передавать доступ к аккаунту третьим лицам</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">3. Правила использования</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            При использовании приложения запрещается:
          </p>
          <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
            <li>Размещать оскорбительный, незаконный или вводящий в заблуждение контент</li>
            <li>Использовать сервис для спама или несанкционированной рекламы</li>
            <li>Нарушать права других пользователей</li>
            <li>Предпринимать действия, направленные на нарушение работы сервиса</li>
            <li>Использовать автоматизированные средства доступа без разрешения</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">4. Регистрация на мероприятия</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            При регистрации на мероприятия Пользователь:
          </p>
          <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
            <li>Обязуется посетить мероприятие или отменить регистрацию заблаговременно</li>
            <li>Принимает, что организаторы вправе отказать в участии без объяснения причин</li>
            <li>Соглашается с тем, что за систематические неявки доступ может быть ограничен</li>
          </ul>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">5. Нетворкинг</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Функция нетворкинга предназначена для профессиональных знакомств.
            Пользователь обязуется использовать её уважительно и по назначению.
            Оператор вправе ограничить доступ к функции при нарушении правил.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">6. Подписки и платежи</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Платные подписки предоставляют дополнительные функции. Оплата производится
            через Telegram Stars. Отмена подписки не влечёт возврат средств за текущий период.
            Оператор вправе изменять функционал подписок с уведомлением пользователей.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">7. Интеллектуальная собственность</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Все элементы приложения (дизайн, код, контент) являются интеллектуальной
            собственностью Оператора или используются на законных основаниях.
            Копирование, распространение или иное использование без разрешения запрещено.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">8. Ограничение ответственности</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Сервис предоставляется «как есть». Оператор не гарантирует бесперебойную работу
            приложения и не несёт ответственности за действия других пользователей.
            Использование сервиса осуществляется на риск Пользователя.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">9. Изменение условий</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Оператор вправе изменять условия настоящего соглашения. О существенных изменениях
            Пользователь будет уведомлён через приложение. Продолжение использования сервиса
            после изменений означает принятие обновлённых условий.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">10. Применимое право</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Настоящее соглашение регулируется законодательством Республики Беларусь.
            Все споры разрешаются путём переговоров, а при недостижении согласия —
            в судебном порядке в соответствии с законодательством РБ.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-white mb-2">11. Контакты</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            По вопросам использования сервиса обращайтесь:
          </p>
          <p className="text-gray-400 text-sm mt-2">
            <b className="text-white">Email:</b> reflecta.by@gmail.com
          </p>
        </section>

        <section className="pt-4 border-t border-bg-card">
          <p className="text-gray-500 text-xs">
            Последнее обновление: январь 2025
          </p>
        </section>
      </div>
    ),
  },
}

export const LegalScreen: React.FC<LegalScreenProps> = ({ type, onClose }) => {
  const { title, icon, content } = LEGAL_CONTENT[type]

  // Handle Telegram BackButton, fullscreen, and disable swipes
  useEffect(() => {
    // Enter fullscreen to hide Telegram header (X, menu buttons)
    requestFullscreen()

    // Disable vertical swipes as backup
    disableVerticalSwipes()

    backButton.show(() => {
      hapticFeedback.light()
      onClose()
    })

    return () => {
      backButton.hide()
      enableVerticalSwipes()
      exitFullscreen()
    }
  }, [onClose])

  return (
    <div
      className="fixed left-0 right-0 bottom-0 z-50 bg-bg flex flex-col"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-bg flex items-center gap-3 px-4 py-3 border-b border-bg-card">
        <div className="flex items-center gap-2">
          {icon}
          <h1 className="font-semibold">{title}</h1>
        </div>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 py-4 pb-8">
          <Card className="bg-bg-card/50">
            {content}
          </Card>

          {/* Support button */}
          <a
            href="mailto:reflecta.by@gmail.com"
            className="w-full text-center text-gray-500 py-4 flex items-center justify-center gap-2 text-sm mt-4"
          >
            <Mail size={14} />
            Связаться с поддержкой
          </a>
        </div>
      </div>
    </div>
  )
}

export default LegalScreen
