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
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback, backButton } from '@/lib/telegram'
import {
  getApprovedProfilesWithPhotos,
  createSwipe,
  checkMutualLike,
  createMatch,
  getUserMatches,
  createNotification,
} from '@/lib/supabase'
import { AvatarWithSkin, Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { SwipeCard } from '@/components/SwipeCard'
import { PhotoGallery } from '@/components/PhotoGallery'
import type { SwipeCardProfile } from '@/types'

const NetworkScreen: React.FC = () => {
  const { user, getSubscriptionTier, getDailySwipesRemaining, profile, deepLinkTarget, setDeepLinkTarget } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [showMatches, setShowMatches] = useState(false)
  const [showProfileDetail, setShowProfileDetail] = useState<SwipeCardProfile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

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

    if (direction === 'right' && swipesRemaining <= 0 && tier === 'free') {
      hapticFeedback.error()
      addToast('Лимит свайпов исчерпан. Получите Premium!', 'error')
      return
    }

    setIsProcessing(true)
    hapticFeedback.medium()

    try {
      const action = direction === 'right' ? 'like' : 'skip'

      // Save swipe
      await createSwipe(user.id, currentProfile.profile.user_id, action)

      // Check for match
      if (action === 'like') {
        const isMutual = await checkMutualLike(user.id, currentProfile.profile.user_id)
        if (isMutual) {
          await createMatch(user.id, currentProfile.profile.user_id)

          const myName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Участник'
          const theirName = `${currentProfile.user?.first_name || ''} ${currentProfile.user?.last_name || ''}`.trim() || 'Участник'

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
          addToast(`Новый контакт: ${theirName}!`, 'success')
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

  // Matches view
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
                  <Button variant="secondary" size="sm">
                    <MessageCircle size={16} />
                  </Button>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState icon={<Search size={48} className="text-gray-500" />} title="Пока нет матчей" description="Свайпайте вправо, чтобы найти совпадения!" />
        )}
      </div>
    )
  }

  // Profile detail view
  if (showProfileDetail) {
    const p = showProfileDetail
    return (
      <div className="h-full overflow-y-auto">
        <button onClick={() => setShowProfileDetail(null)} className="absolute top-4 left-4 z-20 text-white bg-black/50 rounded-full p-2">
          <ArrowLeft size={20} />
        </button>

        {/* Large Photo */}
        <div className="w-full aspect-[3/4] max-h-[60vh] relative">
          <PhotoGallery
            photos={p.photos}
            fallbackUrl={p.profile.photo_url}
            userName={p.user?.first_name}
            showIndicator={true}
          />
        </div>

        {/* Profile Info */}
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{p.user?.first_name} {p.user?.last_name}</h2>
            {p.profile.occupation && (
              <p className="text-accent flex items-center gap-1 mt-1">
                <Briefcase size={16} />
                {p.profile.occupation}
              </p>
            )}
            {p.profile.city && (
              <p className="text-gray-400 flex items-center gap-1">
                <MapPin size={14} />
                {p.profile.city}
              </p>
            )}
          </div>

          {p.profile.bio && (
            <Card>
              <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <User size={14} />
                О себе
              </h4>
              <p>{p.profile.bio}</p>
            </Card>
          )}

          {p.profile.looking_for && (
            <Card>
              <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Target size={14} />
                Ищу
              </h4>
              <p>{p.profile.looking_for}</p>
            </Card>
          )}

          {p.profile.can_help_with && (
            <Card>
              <h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <HandshakeIcon size={14} />
                Могу помочь
              </h4>
              <p>{p.profile.can_help_with}</p>
            </Card>
          )}

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
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 p-4 bg-gradient-to-t from-bg via-bg to-transparent">
          <div className="flex gap-4">
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
      {currentProfile && !isLoading && (
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
            disabled={isProcessing || (swipesRemaining <= 0 && tier === 'free')}
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
