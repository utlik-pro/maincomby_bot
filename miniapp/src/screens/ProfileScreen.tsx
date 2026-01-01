import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Crown,
  Star,
  Check,
  Edit3,
  Search,
  Dumbbell,
  Bell,
  Ticket,
  Heart,
  Trophy,
  Settings,
  Gift,
  MessageCircle,
  Shield,
  Award,
  Medal,
  ChevronRight,
  Save,
  X,
  Loader2,
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback, openTelegramLink } from '@/lib/telegram'
import { updateProfile, createProfile } from '@/lib/supabase'
import { Avatar, Badge, Button, Card, Input } from '@/components/ui'
import { RANK_LABELS, SUBSCRIPTION_LIMITS, SubscriptionTier, UserRank } from '@/types'

// Icon mapping for ranks
const RANK_ICONS: Record<UserRank, React.ReactNode> = {
  private: <Shield size={14} className="text-gray-400" />,
  corporal: <Star size={14} className="text-yellow-400" />,
  sergeant: <Award size={14} className="text-yellow-500" />,
  sergeant_major: <Medal size={14} className="text-orange-400" />,
  lieutenant: <Medal size={14} className="text-blue-400" />,
  captain: <Trophy size={14} className="text-purple-400" />,
  major: <Crown size={14} className="text-accent" />,
  colonel: <Award size={14} className="text-red-500" />,
  general: <Crown size={14} className="text-yellow-300" />,
}

const ProfileScreen: React.FC = () => {
  const { user, profile, getRank, getSubscriptionTier, setActiveTab, setProfile } = useAppStore()
  const { addToast } = useToastStore()

  const [isEditing, setIsEditing] = useState(false)
  const [showSubscription, setShowSubscription] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    bio: profile?.bio || '',
    occupation: profile?.occupation || '',
    city: profile?.city || 'Минск',
    looking_for: profile?.looking_for || '',
    can_help_with: profile?.can_help_with || '',
  })

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      hapticFeedback.medium()

      let updatedProfile
      if (profile) {
        // Update existing profile
        updatedProfile = await updateProfile(user.id, editForm)
      } else {
        // Create new profile
        updatedProfile = await createProfile(user.id, {
          ...editForm,
          city: editForm.city || 'Минск',
        })
      }

      setProfile(updatedProfile)
      setIsEditing(false)
      hapticFeedback.success()
      addToast('Профиль сохранён!', 'success')
    } catch (error) {
      console.error('Save profile error:', error)
      hapticFeedback.error()
      addToast('Ошибка сохранения', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const rank = getRank()
  const rankInfo = RANK_LABELS[rank]
  const tier = getSubscriptionTier()
  const limits = SUBSCRIPTION_LIMITS[tier]

  // Subscription plans
  const plans: { tier: SubscriptionTier; name: string; price: string; features: string[] }[] = [
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
        'Приоритет в ленте',
        'VIP бейдж',
        'Расширенные фильтры',
      ],
    },
  ]

  // Edit Profile Screen
  if (isEditing) {
    return (
      <div className="pb-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bg-card">
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-400 flex items-center gap-2"
          >
            <X size={20} />
          </button>
          <h1 className="font-semibold">Редактировать профиль</h1>
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="text-accent flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          </button>
        </div>

        {/* Photo */}
        <div className="p-6 text-center">
          <div className="relative inline-block">
            <Avatar
              src={profile?.photo_url}
              name={user?.first_name || 'User'}
              size="xl"
              className="mx-auto"
            />
            {profile?.photo_url && (
              <div className="absolute bottom-0 right-0 bg-accent text-bg p-1.5 rounded-full">
                <Check size={14} />
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Фото подтягивается из Telegram автоматически
          </p>
        </div>

        {/* Form */}
        <div className="px-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Профессия / Должность</label>
            <Input
              value={editForm.occupation}
              onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
              placeholder="Например: Founder & CEO"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Город</label>
            <Input
              value={editForm.city}
              onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              placeholder="Минск"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">О себе</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Расскажите о себе..."
              className="w-full bg-bg-card rounded-xl p-3 text-white placeholder-gray-500 border border-transparent focus:border-accent focus:outline-none min-h-[100px] resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
              <Search size={14} />
              Что ищете
            </label>
            <textarea
              value={editForm.looking_for}
              onChange={(e) => setEditForm({ ...editForm, looking_for: e.target.value })}
              placeholder="Партнёры, инвесторы, клиенты..."
              className="w-full bg-bg-card rounded-xl p-3 text-white placeholder-gray-500 border border-transparent focus:border-accent focus:outline-none min-h-[80px] resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
              <Dumbbell size={14} />
              Чем можете помочь
            </label>
            <textarea
              value={editForm.can_help_with}
              onChange={(e) => setEditForm({ ...editForm, can_help_with: e.target.value })}
              placeholder="Ваши навыки и экспертиза..."
              className="w-full bg-bg-card rounded-xl p-3 text-white placeholder-gray-500 border border-transparent focus:border-accent focus:outline-none min-h-[80px] resize-none"
            />
          </div>

          <Button
            fullWidth
            onClick={handleSaveProfile}
            disabled={isSaving}
            icon={isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
    )
  }

  if (showSubscription) {
    return (
      <div className="pb-6">
        <button onClick={() => setShowSubscription(false)} className="p-4 text-gray-400 flex items-center gap-2">
          <ArrowLeft size={16} />
          Назад
        </button>

        <div className="px-4">
          <h1 className="text-2xl font-bold mb-2">Подписка</h1>
          <p className="text-gray-400 text-sm mb-6">Выберите план для расширения возможностей</p>

          <div className="space-y-4">
            {plans.map((plan) => (
              <Card
                key={plan.tier}
                highlighted={tier === plan.tier}
                className={plan.tier === 'pro' ? 'bg-gradient-to-br from-accent/20 to-bg-card' : ''}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{plan.name}</span>
                      {plan.tier === 'pro' && <Crown size={18} className="text-accent" />}
                      {plan.tier === 'light' && <Star size={18} className="text-yellow-400" />}
                    </div>
                    <div className="text-accent font-semibold">{plan.price}</div>
                  </div>
                  {tier === plan.tier && <Badge variant="accent">Текущий</Badge>}
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-accent" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier !== plan.tier && plan.tier !== 'free' && (
                  <Button fullWidth variant={plan.tier === 'pro' ? 'primary' : 'secondary'}>
                    Выбрать {plan.name}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-b from-accent/10 to-transparent p-6 text-center">
        <div className="relative inline-block">
          <Avatar
            src={profile?.photo_url}
            name={user?.first_name || 'User'}
            size="xl"
            className="mx-auto mb-4"
          />
          {tier !== 'free' && (
            <div className="absolute -bottom-1 -right-1 bg-accent text-bg p-1 rounded-full">
              {tier === 'pro' ? <Crown size={14} /> : <Star size={14} />}
            </div>
          )}
        </div>

        <h1 className="text-xl font-bold">
          {user?.first_name} {user?.last_name}
        </h1>

        {profile?.occupation && <p className="text-accent">{profile.occupation}</p>}

        <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
          <MapPin size={14} />
          {profile?.city || 'Не указан'}
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <div className="text-xl font-bold">{user?.points || 0}</div>
            <div className="text-xs text-gray-400">XP</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">0</div>
            <div className="text-xs text-gray-400">Событий</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">0</div>
            <div className="text-xs text-gray-400">Матчей</div>
          </div>
        </div>

        {/* Rank badge */}
        <div className="mt-4">
          <Badge variant="accent" className="text-sm flex items-center gap-1 justify-center">
            {RANK_ICONS[rank]}
            {rankInfo.ru}
          </Badge>
        </div>
      </div>

      <div className="px-4">
        {/* Edit Profile Button */}
        <Button
          fullWidth
          variant="secondary"
          icon={<Edit3 size={16} />}
          className="mb-6"
          onClick={() => {
            // Reset form with current profile data
            setEditForm({
              bio: profile?.bio || '',
              occupation: profile?.occupation || '',
              city: profile?.city || 'Минск',
              looking_for: profile?.looking_for || '',
              can_help_with: profile?.can_help_with || '',
            })
            setIsEditing(true)
          }}
        >
          Редактировать профиль
        </Button>

        {/* Profile Info Cards */}
        {profile?.bio && (
          <Card className="mb-4">
            <h3 className="text-sm text-gray-400 mb-2">О себе</h3>
            <p>{profile.bio}</p>
          </Card>
        )}

        {profile?.looking_for && (
          <Card className="mb-4">
            <h3 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <Search size={14} />
              Ищу
            </h3>
            <p>{profile.looking_for}</p>
          </Card>
        )}

        {profile?.can_help_with && (
          <Card className="mb-4">
            <h3 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <Dumbbell size={14} />
              Могу помочь
            </h3>
            <p>{profile.can_help_with}</p>
          </Card>
        )}

        {/* Menu */}
        <Card className="mb-4 p-0 overflow-hidden">
          {[
            { icon: <Bell size={20} className="text-blue-400" />, label: 'Уведомления', badge: null, onClick: () => {} },
            { icon: <Ticket size={20} className="text-purple-400" />, label: 'Мои билеты', badge: null, onClick: () => setActiveTab('events') },
            { icon: <Heart size={20} className="text-pink-400" />, label: 'Мои матчи', badge: null, onClick: () => setActiveTab('network') },
            { icon: <Trophy size={20} className="text-yellow-400" />, label: 'Достижения', badge: null, onClick: () => setActiveTab('achievements') },
            { icon: <Settings size={20} className="text-gray-400" />, label: 'Настройки', badge: null, onClick: () => {} },
          ].map((item, i, arr) => (
            <motion.div
              key={item.label}
              whileTap={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={item.onClick}
              className={`
                flex items-center px-4 py-3.5 cursor-pointer
                ${i < arr.length - 1 ? 'border-b border-bg' : ''}
              `}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && <Badge variant="accent">{item.badge}</Badge>}
              <ChevronRight size={16} className="text-gray-500 ml-2" />
            </motion.div>
          ))}
        </Card>

        {/* Subscription Card */}
        <Card
          onClick={() => setShowSubscription(true)}
          className={`
            mb-4
            ${tier === 'pro' ? 'bg-gradient-to-r from-accent/20 to-success/20 border border-accent/30' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center">
              {tier === 'pro' ? (
                <Crown size={24} className="text-accent" />
              ) : tier === 'light' ? (
                <Star size={24} className="text-yellow-400" />
              ) : (
                <Shield size={24} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className={tier !== 'free' ? 'text-accent font-semibold' : 'font-semibold'}>
                {tier === 'pro' ? 'Pro Member' : tier === 'light' ? 'Light Member' : 'Free'}
              </div>
              <div className="text-xs text-gray-400">
                {tier === 'free' ? 'Обновите для больших возможностей' : 'Нажмите для управления'}
              </div>
            </div>
            {tier === 'free' && (
              <Button size="sm" variant="primary">
                Улучшить
              </Button>
            )}
          </div>
        </Card>

        {/* Invite Friends */}
        <Card className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
              <Gift size={24} className="text-pink-400" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Пригласи друга</div>
              <div className="text-xs text-gray-400">Получи +30 XP за каждого друга</div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => {
              hapticFeedback.medium()
              addToast('Ссылка скопирована!', 'success')
            }}>
              Поделиться
            </Button>
          </div>
        </Card>

        {/* Support */}
        <button
          className="w-full text-center text-gray-400 py-4 flex items-center justify-center gap-2"
          onClick={() => openTelegramLink('https://t.me/yana_martynen')}
        >
          <MessageCircle size={16} />
          Связаться с поддержкой
        </button>

        {/* Version */}
        <p className="text-center text-gray-600 text-xs mt-4">
          MAIN Community v1.0.0
        </p>
      </div>
    </div>
  )
}

export default ProfileScreen
