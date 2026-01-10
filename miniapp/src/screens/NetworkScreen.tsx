import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  Sparkles,
  Filter,
  Crown,
  Clock,
  Lock,
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback, backButton, openTelegramLink } from '@/lib/telegram'
import {
  getApprovedProfilesWithPhotos,
  createSwipe,
  checkMutualLike,
  createMatch,
  getUserMatches,
  createNotification,
  incrementDailySwipes,
  addXP,
  hasReceivedXPBonus,
} from '@/lib/supabase'
import { XP_REWARDS } from '@/types'
import { AvatarWithSkin, Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { SwipeCard } from '@/components/SwipeCard'
import { PhotoGallery } from '@/components/PhotoGallery'
import type { SwipeCardProfile } from '@/types'

const NetworkScreen: React.FC = () => {
  const { user, setUser, addPoints, getSubscriptionTier, getDailySwipesRemaining, profile, deepLinkTarget, setDeepLinkTarget } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [showMatches, setShowMatches] = useState(false)
  const [showProfileDetail, setShowProfileDetail] = useState<SwipeCardProfile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  useEffect(() => {
    if (deepLinkTarget === 'matches') {
      setShowMatches(true)
      setDeepLinkTarget(null)
    }
  }, [deepLinkTarget, setDeepLinkTarget])

  // Handle Telegram BackButton
  useEffect(() => {
    if (showMatches) {
      backButton.show(() => setShowMatches(false))
    } else if (showProfileDetail) {
      backButton.show(() => setShowProfileDetail(null))
    } else {
      backButton.hide()
    }
    return () => {
      backButton.hide()
    }
  }, [showMatches, showProfileDetail])

  const tier = getSubscriptionTier()
  const swipesRemaining = getDailySwipesRemaining()

  // Fetch profiles with photos
  const { data: profiles, isLoading, error: profilesError, refetch } = useQuery({
    queryKey: ['swipeProfilesWithPhotos', user?.id],
    queryFn: async () => {
      if (!user) return []
      return getApprovedProfilesWithPhotos(user.id, profile?.city)
    },
    enabled: !!user,
  })

  const { data: matches } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: () => (user ? getUserMatches(user.id) : []),
    enabled: !!user,
  })

  // Current profile - first from list
  const currentProfile = profiles && profiles.length > 0 ? profiles[0] : undefined

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!currentProfile || !user || isProcessing) return

    // Check swipe limit for non-PRO users
    if (swipesRemaining <= 0 && tier !== 'pro') {
      hapticFeedback.error()
      return // Will show the "swipes exhausted" screen
    }

    setIsProcessing(true)
    hapticFeedback.medium()

    try {
      const action = direction === 'right' ? 'like' : 'skip'

      // Save swipe
      await createSwipe(user.id, currentProfile.profile.user_id, action)

      // Check and award first swipe bonus
      try {
        const hadFirstSwipe = await hasReceivedXPBonus(user.id, 'FIRST_SWIPE')
        if (!hadFirstSwipe) {
          await addXP(user.id, XP_REWARDS.FIRST_SWIPE, 'FIRST_SWIPE')
          addPoints(XP_REWARDS.FIRST_SWIPE)
          addToast(`Первый свайп! +${XP_REWARDS.FIRST_SWIPE} XP`, 'xp', XP_REWARDS.FIRST_SWIPE)
        }
      } catch (e) {
        console.warn('Failed to check/award first swipe XP:', e)
      }

      // Increment daily swipes counter (for non-PRO users)
      if (tier !== 'pro') {
        try {
          const { daily_swipes_used, daily_swipes_reset_at } = await incrementDailySwipes(user.id)
          // Update user in store
          setUser({
            ...user,
            daily_swipes_used,
            daily_swipes_reset_at
          })
        } catch (e) {
          console.warn('Failed to increment swipes:', e)
        }
      }

      // Check for match
      if (action === 'like') {
        const isMutual = await checkMutualLike(user.id, currentProfile.profile.user_id)
        if (isMutual) {
          await createMatch(user.id, currentProfile.profile.user_id)

          const myName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Участник'
          const theirName = `${currentProfile.user?.first_name || ''} ${currentProfile.user?.last_name || ''}`.trim() || 'Участник'

          // Award XP for match to both users
          try {
            await addXP(user.id, XP_REWARDS.MATCH_RECEIVED, 'MATCH_RECEIVED')
            await addXP(currentProfile.profile.user_id, XP_REWARDS.MATCH_RECEIVED, 'MATCH_RECEIVED')
            addPoints(XP_REWARDS.MATCH_RECEIVED)
          } catch (e) {
            console.warn('Failed to award match XP:', e)
          }

          // Notifications
          createNotification(user.id, 'match', 'Новый контакт!', `${theirName} тоже хочет познакомиться. Начните общение!`, { matchedUserId: currentProfile.profile.user_id }).catch(console.error)
          createNotification(currentProfile.profile.user_id, 'match', 'Новый контакт!', `${myName} тоже хочет познакомиться. Начните общение!`, { matchedUserId: user.id }).catch(console.error)

          // Telegram notifications
          if (currentProfile.user?.tg_user_id) {
            fetch('https://iishnica.vercel.app/api/send-match-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userTgId: currentProfile.user.tg_user_id, matchName: myName, matchedUserId: user.id, userId: currentProfile.profile.user_id }),
            }).catch(console.error)
          }
          if (user.tg_user_id) {
            fetch('https://iishnica.vercel.app/api/send-match-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userTgId: user.tg_user_id, matchName: theirName, matchedUserId: currentProfile.profile.user_id, userId: user.id }),
            }).catch(console.error)
          }

          hapticFeedback.success()
          addToast(`Новый контакт: ${theirName}! +${XP_REWARDS.MATCH_RECEIVED} XP`, 'success')
          queryClient.invalidateQueries({ queryKey: ['matches'] })
        }
      }

      // Refetch profiles
      await refetch()

    } catch (error) {
      console.error('Swipe error:', error)
      addToast('Ошибка. Попробуйте ещё раз.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle message to match
  const handleMessageMatch = (matchUser: any) => {
    const currentTier = getSubscriptionTier()

    // Free users can't message matches
    if (currentTier === 'free') {
      setShowSubscriptionModal(true)
      hapticFeedback.error()
      return
    }

    // Open Telegram chat
    hapticFeedback.light()
    if (matchUser?.username) {
      openTelegramLink(`https://t.me/${matchUser.username}`)
    } else if (matchUser?.tg_user_id) {
      // Fallback to user ID if no username
      openTelegramLink(`tg://user?id=${matchUser.tg_user_id}`)
    } else {
      addToast('Не удалось открыть чат', 'error')
    }
  }

  // Matches view
  if (showMatches) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart size={24} className="text-success fill-success" />
          Ваши матчи
        </h1>

        {matches && matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match: any) => {
              const matchUser = match.user1_id === user?.id ? match.user2 : match.user1
              const matchProfile = match.user1_id === user?.id ? match.profile2 : match.profile1
              const matchSkin = matchUser?.active_skin
              const skinData = Array.isArray(matchSkin) ? matchSkin[0] : matchSkin
              return (
                <Card key={match.id} className="flex items-center gap-3">
                  <AvatarWithSkin
                    src={matchProfile?.photo_url}
                    name={matchUser?.first_name}
                    size="md"
                    skin={skinData}
                    role={matchUser?.team_role}
                    tier={matchUser?.subscription_tier === 'pro' ? 'pro' : matchUser?.subscription_tier === 'light' ? 'light' : null}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{matchUser?.first_name} {matchUser?.last_name}</div>
                    <div className="text-sm text-gray-400">{matchProfile?.occupation || 'Участник'}</div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleMessageMatch(matchUser)}
                  >
                    <MessageCircle size={16} />
                  </Button>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState icon={<Search size={48} className="text-gray-500" />} title="Пока нет матчей" description="Свайпайте вправо, чтобы найти совпадения!" />
        )}

        {/* Subscription Modal */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <Card className="w-full max-w-sm mx-4 p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                <Lock size={32} className="text-accent" />
              </div>
              <h2 className="text-xl font-bold mb-2">Нужна подписка</h2>
              <p className="text-gray-400 mb-6">
                Чтобы писать матчам, оформите подписку Light или PRO
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    openTelegramLink('https://t.me/maincomapp_bot?start=subscribe')
                    setShowSubscriptionModal(false)
                  }}
                >
                  <Crown size={18} className="mr-2" />
                  Оформить подписку
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowSubscriptionModal(false)}
                >
                  Закрыть
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    )
  }

  // Profile detail view - full profile page
  if (showProfileDetail) {
    const p = showProfileDetail
    const photos = p.photos || []
    const displayName = `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.trim() || 'Участник'

    return (
      <div className="h-full overflow-y-auto pb-24">
        {/* Header with back button */}
        <div className="sticky top-0 z-20 bg-bg/90 backdrop-blur-sm p-4 flex items-center gap-3 border-b border-white/10">
          <button
            onClick={() => setShowProfileDetail(null)}
            className="w-10 h-10 bg-bg-card rounded-full flex items-center justify-center"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">Профиль</h1>
        </div>

        {/* Profile Header - compact photo + name */}
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Photo - small square */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-bg-card">
              {photos.length > 0 || p.profile.photo_url ? (
                <img
                  src={photos[0]?.photo_url || p.profile.photo_url || ''}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User size={40} className="text-gray-500" />
                </div>
              )}
            </div>

            {/* Name and basic info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{displayName}</h2>
              {p.profile.occupation && (
                <p className="text-accent flex items-center gap-1.5 mt-1 text-sm">
                  <Briefcase size={14} />
                  <span className="truncate">{p.profile.occupation}</span>
                </p>
              )}
              {p.profile.city && (
                <p className="text-gray-400 flex items-center gap-1.5 text-sm">
                  <MapPin size={14} />
                  {p.profile.city}
                </p>
              )}
            </div>
          </div>

          {/* Photo gallery if multiple photos */}
          {photos.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {photos.map((photo, i) => (
                <div key={photo.id || i} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile sections */}
        <div className="px-4 space-y-3">
          {/* Bio */}
          {p.profile.bio && (
            <Card>
              <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <User size={14} />
                О себе
              </h4>
              <p className="text-sm leading-relaxed">{p.profile.bio}</p>
            </Card>
          )}

          {/* Looking for */}
          {p.profile.looking_for && (
            <Card>
              <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Target size={14} className="text-accent" />
                Ищу
              </h4>
              <p className="text-sm leading-relaxed">{p.profile.looking_for}</p>
            </Card>
          )}

          {/* Can help with */}
          {p.profile.can_help_with && (
            <Card>
              <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <HandshakeIcon size={14} className="text-success" />
                Могу помочь
              </h4>
              <p className="text-sm leading-relaxed">{p.profile.can_help_with}</p>
            </Card>
          )}

          {/* Skills */}
          {p.profile.skills && p.profile.skills.length > 0 && (
            <Card>
              <h4 className="text-sm text-gray-400 mb-2">Навыки</h4>
              <div className="flex flex-wrap gap-2">
                {p.profile.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-bg rounded-full text-sm">{skill}</span>
                ))}
              </div>
            </Card>
          )}

          {/* Interests */}
          {p.profile.interests && p.profile.interests.length > 0 && (
            <Card>
              <h4 className="text-sm text-gray-400 mb-2">Интересы</h4>
              <div className="flex flex-wrap gap-2">
                {p.profile.interests.map((interest, i) => (
                  <span key={i} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">{interest}</span>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Action Buttons - fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg via-bg to-transparent">
          <div className="flex gap-3 max-w-lg mx-auto">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setShowProfileDetail(null); handleSwipe('left') }}
              disabled={isProcessing}
            >
              <X size={18} /> Пропустить
            </Button>
            <Button
              className="flex-1"
              onClick={() => { setShowProfileDetail(null); handleSwipe('right') }}
              disabled={isProcessing}
            >
              <Heart size={18} /> Интересно
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Main view - Tinder style
  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">Нетворкинг</h1>
          <p className="text-gray-400 text-sm">{swipesRemaining} свайпов осталось</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 bg-bg-card rounded-xl flex items-center justify-center"
          >
            <Filter size={18} className="text-gray-400" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMatches(true)}
            className="bg-bg-card px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Heart size={16} className="text-success fill-success" />
            <span className="font-semibold">{matches?.length || 0}</span>
          </motion.button>
        </div>
      </div>

      {/* Swipe Card Area */}
      <div className="flex-1 flex items-center justify-center">
        {isLoading ? (
          <Card className="w-full aspect-[3/4] max-h-[calc(100vh-220px)] flex items-center justify-center">
            <Skeleton className="w-32 h-32 rounded-full" />
          </Card>
        ) : profilesError ? (
          <EmptyState
            icon={<X size={48} className="text-danger" />}
            title="Ошибка загрузки"
            description="Не удалось загрузить профили."
          />
        ) : swipesRemaining <= 0 && tier !== 'pro' ? (
          // Swipes exhausted screen
          <Card className="w-full max-w-sm p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
              <Clock size={40} className="text-accent" />
            </div>
            <h2 className="text-xl font-bold mb-2">Свайпы закончились</h2>
            <p className="text-gray-400 mb-6">
              {tier === 'free'
                ? 'У вас было 5 свайпов на сегодня. Новые свайпы будут доступны завтра.'
                : 'У вас было 20 свайпов на сегодня. Новые свайпы будут доступны завтра.'}
            </p>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => {
                  openTelegramLink('https://t.me/maincomapp_bot?start=subscribe')
                }}
              >
                <Crown size={18} className="mr-2" />
                Получить PRO — безлимит
              </Button>

              <p className="text-xs text-gray-500">
                PRO-подписка даёт безлимитные свайпы и другие преимущества
              </p>
            </div>

            {/* Show matches button */}
            {matches && matches.length > 0 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowMatches(true)}
              >
                <Heart size={16} className="mr-2 text-success fill-success" />
                Посмотреть матчи ({matches.length})
              </Button>
            )}
          </Card>
        ) : !currentProfile ? (
          <EmptyState
            icon={<Sparkles size={48} className="text-accent" />}
            title="Все просмотрено!"
            description="Загляните позже, появятся новые участники"
          />
        ) : (
          <SwipeCard
            profile={currentProfile}
            onSwipe={handleSwipe}
            onViewProfile={() => setShowProfileDetail(currentProfile)}
            isProcessing={isProcessing}
          />
        )}
      </div>

      {/* Action Buttons */}
      {currentProfile && !isLoading && swipesRemaining > 0 && (
        <div className="flex justify-center gap-6 py-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            disabled={isProcessing}
            className="w-16 h-16 rounded-full border-2 border-danger flex items-center justify-center disabled:opacity-50"
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
            disabled={isProcessing}
            className="w-16 h-16 rounded-full bg-accent flex items-center justify-center disabled:opacity-50"
          >
            <Heart size={28} className="text-bg" />
          </motion.button>
        </div>
      )}
    </div>
  )
}

export default NetworkScreen
