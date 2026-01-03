import React, { useState, useCallback } from 'react'
import { motion, PanInfo, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Heart,
  X,
  User,
  ArrowLeft,
  MapPin,
  Search,
  Briefcase,
  Target,
  HandshakeIcon,
  MessageCircle,
  Coffee,
  Sparkles,
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback } from '@/lib/telegram'
import {
  getApprovedProfiles,
  createSwipe,
  checkMutualLike,
  createMatch,
  getUserMatches,
} from '@/lib/supabase'
import { Avatar, Badge, Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { SUBSCRIPTION_LIMITS, UserProfile, User as UserType } from '@/types'

type ProfileWithUser = UserProfile & { user: UserType }
type SwipeDirection = 'left' | 'right' | null

const NetworkScreen: React.FC = () => {
  const { user, getSubscriptionTier, getDailySwipesRemaining, profile } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null)
  const [showMatches, setShowMatches] = useState(false)
  const [showProfileDetail, setShowProfileDetail] = useState<ProfileWithUser | null>(null)

  const tier = getSubscriptionTier()
  const limits = SUBSCRIPTION_LIMITS[tier]
  const swipesRemaining = getDailySwipesRemaining()

  // Fetch profiles to swipe (показываем всех, рандомизируем порядок)
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['swipeProfiles', user?.id],
    queryFn: async () => {
      if (!user) return []
      const allProfiles = await getApprovedProfiles(user.id, profile?.city)
      // Shuffle array для рандомного порядка
      return allProfiles.sort(() => Math.random() - 0.5)
    },
    enabled: !!user,
    staleTime: 60000, // Кешируем на 1 минуту чтобы не перемешивать при каждом свайпе
  })

  // Fetch matches
  const { data: matches } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: () => (user ? getUserMatches(user.id) : []),
    enabled: !!user,
  })

  // Swipe mutation
  const swipeMutation = useMutation({
    mutationFn: async ({ targetUserId, action }: { targetUserId: number; action: 'like' | 'skip' | 'superlike' }) => {
      if (!user) throw new Error('No user')

      await createSwipe(user.id, targetUserId, action)

      if (action === 'like' || action === 'superlike') {
        const isMutual = await checkMutualLike(user.id, targetUserId)
        if (isMutual) {
          await createMatch(user.id, targetUserId)
          return { match: true }
        }
      }

      return { match: false }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['swipeProfiles'] })

      if (result.match) {
        hapticFeedback.success()
        addToast('У вас новый матч!', 'success')
        queryClient.invalidateQueries({ queryKey: ['matches'] })
      }
    },
  })

  const currentProfile = profiles?.[currentIndex % (profiles?.length || 1)] as ProfileWithUser | undefined

  const handleSwipe = useCallback(
    async (direction: 'left' | 'right') => {
      if (!currentProfile || swipeMutation.isPending) return

      if (direction === 'right' && swipesRemaining <= 0 && tier === 'free') {
        hapticFeedback.error()
        addToast('Лимит свайпов исчерпан. Получите Premium!', 'error')
        return
      }

      setSwipeDirection(direction)
      hapticFeedback.medium()

      const action = direction === 'right' ? 'like' : 'skip'

      await swipeMutation.mutateAsync({
        targetUserId: currentProfile.user_id,
        action,
      })

      setTimeout(() => {
        setSwipeDirection(null)
        setCurrentIndex((prev) => prev + 1)
      }, 300)
    },
    [currentProfile, swipeMutation, swipesRemaining, tier, addToast]
  )

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      handleSwipe('right')
    } else if (info.offset.x < -threshold) {
      handleSwipe('left')
    }
  }

  // Show matches list
  if (showMatches) {
    return (
      <div className="p-4">
        <button onClick={() => setShowMatches(false)} className="text-gray-400 mb-4 flex items-center gap-2">
          <ArrowLeft size={20} />
          Назад к свайпам
        </button>

        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart size={24} className="text-success fill-success" />
          Ваши матчи
        </h1>

        {matches && matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match: any) => {
              const matchUser = match.user1_id === user?.id ? match.user2 : match.user1
              const matchProfile = match.user1_id === user?.id ? match.profile2 : match.profile1

              return (
                <Card key={match.id} className="flex items-center gap-3">
                  <Avatar src={matchProfile?.photo_url} name={matchUser?.first_name} size="md" />
                  <div className="flex-1">
                    <div className="font-semibold">{matchUser?.first_name} {matchUser?.last_name}</div>
                    <div className="text-sm text-gray-400">{matchProfile?.occupation || 'Участник'}</div>
                  </div>
                  <Button variant="secondary" size="sm">
                    <MessageCircle size={16} />
                  </Button>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Search size={48} className="text-gray-500" />}
            title="Пока нет матчей"
            description="Свайпайте вправо, чтобы найти совпадения!"
          />
        )}
      </div>
    )
  }

  // Show profile detail
  if (showProfileDetail) {
    const p = showProfileDetail
    return (
      <div className="p-4">
        <button onClick={() => setShowProfileDetail(null)} className="text-gray-400 mb-4 flex items-center gap-2">
          <ArrowLeft size={20} />
          Назад
        </button>

        <div className="text-center mb-6">
          <Avatar src={p.photo_url} name={p.user?.first_name} size="xl" className="mx-auto mb-4" />
          <h2 className="text-xl font-bold">{p.user?.first_name} {p.user?.last_name}</h2>
          <p className="text-accent flex items-center justify-center gap-1">
            <Briefcase size={14} />
            {p.occupation || 'Участник'}
          </p>
          <p className="text-gray-400 flex items-center justify-center gap-1">
            <MapPin size={14} />
            {p.city}
          </p>
        </div>

        <div className="space-y-4">
          {p.bio && (
            <Card>
              <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <User size={14} />
                О себе
              </h4>
              <p>{p.bio}</p>
            </Card>
          )}

          {p.looking_for && (
            <Card>
              <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Target size={14} />
                Ищу
              </h4>
              <p>{p.looking_for}</p>
            </Card>
          )}

          {p.can_help_with && (
            <Card>
              <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <HandshakeIcon size={14} />
                Могу помочь
              </h4>
              <p>{p.can_help_with}</p>
            </Card>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              handleSwipe('left')
              setShowProfileDetail(null)
            }}
          >
            <X size={18} />
            Скип
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              handleSwipe('right')
              setShowProfileDetail(null)
            }}
          >
            <Heart size={18} />
            Лайк
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">Нетворкинг</h1>
          <p className="text-gray-400 text-sm">Найди полезные контакты</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowMatches(true)}
          className="bg-bg-card px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Heart size={16} className="text-success fill-success" />
          <span className="font-semibold">{matches?.length || 0}</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center py-3">
          <div className="text-xl font-bold text-accent">{matches?.length || 0}</div>
          <div className="text-xs text-gray-400">Матчей</div>
        </Card>
        <Card className="text-center py-3">
          <div className="text-xl font-bold text-success">{swipesRemaining}</div>
          <div className="text-xs text-gray-400">Свайпов</div>
        </Card>
        <Card className="text-center py-3">
          <div className="text-xl font-bold">{profiles?.length || 0}</div>
          <div className="text-xs text-gray-400">В очереди</div>
        </Card>
      </div>

      {/* Swipe Card */}
      {isLoading ? (
        <Card className="h-96 flex items-center justify-center">
          <Skeleton className="w-24 h-24 rounded-full" />
        </Card>
      ) : !currentProfile ? (
        <EmptyState
          icon={<Sparkles size={48} className="text-accent" />}
          title="Все просмотрено!"
          description="Загляните позже, появятся новые участники"
        />
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProfile.id}
              drag={!swipeDirection ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={
                swipeDirection === 'left'
                  ? { x: -300, opacity: 0 }
                  : swipeDirection === 'right'
                  ? { x: 300, opacity: 0 }
                  : { x: 0, opacity: 1, scale: 1 }
              }
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="swipe-card"
            >
            <Card className="p-4">
              {/* Компактная карточка: фото + инфо справа */}
              <div className="flex gap-4 items-start">
                {/* Большое фото слева */}
                <div className="flex-shrink-0">
                  <Avatar
                    src={currentProfile.photo_url}
                    name={currentProfile.user?.first_name}
                    size="xl"
                  />
                </div>

                {/* Инфо справа */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold truncate">
                    {currentProfile.user?.first_name} {currentProfile.user?.last_name}
                  </h2>
                  <p className="text-accent text-sm flex items-center gap-1 mb-1">
                    <Briefcase size={12} />
                    <span className="truncate">{currentProfile.occupation || 'Участник'}</span>
                  </p>
                  <p className="text-gray-500 text-xs flex items-center gap-1 mb-2">
                    <MapPin size={10} />
                    {currentProfile.city}
                  </p>

                  {currentProfile.bio && (
                    <p className="text-gray-400 text-sm italic line-clamp-2">"{currentProfile.bio}"</p>
                  )}
                </div>
              </div>

              {/* Доп инфо под основным блоком */}
              {(currentProfile.looking_for || currentProfile.can_help_with) && (
                <div className="mt-3 pt-3 border-t border-bg space-y-2">
                  {currentProfile.looking_for && (
                    <div className="flex gap-2">
                      <Target size={14} className="text-accent flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-300 line-clamp-2">{currentProfile.looking_for}</div>
                    </div>
                  )}
                  {currentProfile.can_help_with && (
                    <div className="flex gap-2">
                      <HandshakeIcon size={14} className="text-success flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-300 line-clamp-2">{currentProfile.can_help_with}</div>
                    </div>
                  )}
                </div>
              )}
            </Card>
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mt-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('left')}
              className="w-16 h-16 rounded-full border-2 border-danger flex items-center justify-center"
            >
              <X size={28} className="text-danger" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowProfileDetail(currentProfile)}
              className="w-14 h-14 rounded-full bg-bg-card flex items-center justify-center"
            >
              <User size={24} className="text-gray-400" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSwipe('right')}
              className="w-16 h-16 rounded-full bg-success flex items-center justify-center"
              disabled={swipesRemaining <= 0 && tier === 'free'}
            >
              <Heart size={28} className="text-bg" />
            </motion.button>
          </div>

          <p className="text-center text-gray-500 text-xs mt-4">
            Пропустить • Профиль • Интересен
          </p>
        </>
      )}
    </div>
  )
}

export default NetworkScreen
