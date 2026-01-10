import React from 'react'
import { Crown, Star, Check, Sparkles } from 'lucide-react'
import { BottomSheet } from './BottomSheet'
import { Button, Badge, Card } from './ui'
import { hapticFeedback } from '@/lib/telegram'
import { useAppStore } from '@/lib/store'

type SubscriptionTier = 'free' | 'light' | 'pro'

interface Plan {
  tier: SubscriptionTier
  name: string
  price: string
  features: string[]
}

const plans: Plan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 'Бесплатно',
    features: ['5 свайпов в день', 'Базовый профиль', 'Доступ к событиям'],
  },
  {
    tier: 'light',
    name: 'Light',
    price: '$5/мес',
    features: ['20 свайпов в день', 'Видеть кто лайкнул', '1 суперлайк в день', 'Расширенные фильтры'],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$15/мес',
    features: [
      'Безлимит свайпов',
      'Видеть кто лайкнул',
      '5 суперлайков в день',
      'Приоритетный показ',
      'Эксклюзивные события',
      'VIP-поддержка',
    ],
  },
]

interface SubscriptionBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan?: (tier: SubscriptionTier) => void
}

export const SubscriptionBottomSheet: React.FC<SubscriptionBottomSheetProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const { user } = useAppStore()
  const currentTier = user?.subscription_tier || 'free'

  const handleSelectPlan = (tier: SubscriptionTier) => {
    hapticFeedback.medium()
    onSelectPlan?.(tier)
    // TODO: Integrate with Telegram payment system
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      height="full"
    >
      <div className="p-4 pb-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-1">Выберите план</h2>
          <p className="text-gray-400 text-sm">Расширьте возможности нетворкинга</p>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {plans.map((plan) => {
            const isCurrent = currentTier === plan.tier
            const isPro = plan.tier === 'pro'
            const isLight = plan.tier === 'light'

            return (
              <Card
                key={plan.tier}
                highlighted={isCurrent}
                className={`relative overflow-hidden ${
                  isPro ? 'bg-gradient-to-br from-accent/20 to-bg-card border-accent/30' : ''
                }`}
              >
                {/* Popular badge for Pro */}
                {isPro && (
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-accent text-bg text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                      ПОПУЛЯРНЫЙ
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{plan.name}</span>
                      {isPro && <Crown size={18} className="text-accent" />}
                      {isLight && <Star size={18} className="text-yellow-400" />}
                    </div>
                    <div className="text-accent font-semibold">{plan.price}</div>
                  </div>
                  {isCurrent && <Badge variant="accent">Текущий</Badge>}
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-accent flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {!isCurrent && plan.tier !== 'free' && (
                  <Button
                    fullWidth
                    variant={isPro ? 'primary' : 'secondary'}
                    onClick={() => handleSelectPlan(plan.tier)}
                  >
                    {isPro ? (
                      <>
                        <Crown size={16} />
                        Перейти на Pro
                      </>
                    ) : (
                      <>
                        <Star size={16} />
                        Выбрать Light
                      </>
                    )}
                  </Button>
                )}

                {isCurrent && plan.tier !== 'free' && (
                  <div className="text-center text-sm text-gray-400">
                    Ваш текущий план
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Подписки автоматически продлеваются. Отменить можно в любой момент.
        </p>
      </div>
    </BottomSheet>
  )
}

export default SubscriptionBottomSheet
