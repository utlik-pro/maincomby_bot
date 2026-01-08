import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Sparkles,
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback, backButton } from '@/lib/telegram'
import {
  getApprovedProfiles,
  createSwipe,
  checkMutualLike,
  createMatch,
  getUserMatches,
  createNotification,
} from '@/lib/supabase'
import { Avatar, AvatarWithSkin, Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { SUBSCRIPTION_LIMITS, UserProfile, User as UserType } from '@/types'

type ProfileWithUser = UserProfile & { user: UserType }

const NetworkScreen: React.FC = () => {
  const { user, getSubscriptionTier, getDailySwipesRemaining, profile, deepLinkTarget, setDeepLinkTarget } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [showMatches, setShowMatches] = useState(false)
  const [showProfileDetail, setShowProfileDetail] = useState<ProfileWithUser | null>(null)
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

  // Простой запрос профилей - каждый раз свежие данные
  const { data: profiles, isLoading, error: profilesError, refetch } = useQuery({
    queryKey: ['swipeProfiles', user?.id],
    queryFn: async () => {
      if (!user) return []
      const allProfiles = await getApprovedProfiles(user.id, profile?.city)
      return allProfiles as ProfileWithUser[]
    },
    enabled: !!user,
  })

  const { data: matches } = useQuery({
    queryKey: ['matches', user?.id],
    queryFn: () => (user ? getUserMatches(user.id) : []),
    enabled: !!user,
  })

  // Текущий профиль - просто первый из списка
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

      // Сохраняем свайп
      await createSwipe(user.id, currentProfile.user_id, action)

      // Проверяем матч
      if (action === 'like') {
        const isMutual = await checkMutualLike(user.id, currentProfile.user_id)
        if (isMutual) {
          await createMatch(user.id, currentProfile.user_id)

          const myName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Участник'
          const theirName = `${currentProfile.user?.first_name || ''} ${currentProfile.user?.last_name || ''}`.trim() || 'Участник'

          // Уведомления
          createNotification(user.id, 'match', 'Новый контакт!', `${theirName} тоже хочет познакомиться. Начните общение!`, { matchedUserId: currentProfile.user_id }).catch(console.error)
          createNotification(currentProfile.user_id, 'match', 'Новый контакт!', `${myName} тоже хочет познакомиться. Начните общение!`, { matchedUserId: user.id }).catch(console.error)

          // Telegram уведомления
          if (currentProfile.user?.tg_user_id) {
            fetch('https://iishnica.vercel.app/api/send-match-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userTgId: currentProfile.user.tg_user_id, matchName: myName, matchedUserId: user.id, userId: currentProfile.user_id }),
            }).catch(console.error)
          }
          if (user.tg_user_id) {
            fetch('https://iishnica.vercel.app/api/send-match-notification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userTgId: user.tg_user_id, matchName: theirName, matchedUserId: currentProfile.user_id, userId: user.id }),
            }).catch(console.error)
          }

          hapticFeedback.success()
          addToast(`Новый контакт: ${theirName}!`, 'success')
          queryClient.invalidateQueries({ queryKey: ['matches'] })
        }
      }

      // Рефетчим профили - свайпнутый пользователь уже не вернётся
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
    const profileSkin = (p.user as any)?.active_skin
    const profileSkinData = Array.isArray(profileSkin) ? profileSkin[0] : profileSkin
    return (
      <div className="p-4">
        <button onClick={() => setShowProfileDetail(null)} className="text-gray-400 mb-4 flex items-center gap-2">
          <ArrowLeft size={20} />
          Назад
        </button>

        <Card className="mb-6">
          <div className="flex gap-4 items-center">
            <AvatarWithSkin
              src={p.photo_url}
              name={p.user?.first_name}
              size="xl"
              skin={profileSkinData}
              role={p.user?.team_role}
              tier={(p.user as any)?.subscription_tier === 'pro' ? 'pro' : (p.user as any)?.subscription_tier === 'light' ? 'light' : null}
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{p.user?.first_name} {p.user?.last_name}</h2>
              <p className="text-accent flex items-center gap-1"><Briefcase size={14} /><span className="truncate">{p.occupation || 'Участник'}</span></p>
              <p className="text-gray-400 flex items-center gap-1"><MapPin size={14} />{p.city}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {p.bio && <Card><h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2"><User size={14} />О себе</h4><p>{p.bio}</p></Card>}
          {p.looking_for && <Card><h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2"><Target size={14} />Ищу</h4><p>{p.looking_for}</p></Card>}
          {p.can_help_with && <Card><h4 className="text-sm text-gray-400 mb-2 flex items-center gap-2"><HandshakeIcon size={14} />Могу помочь</h4><p>{p.can_help_with}</p></Card>}
        </div>

        <div className="flex gap-4 mt-6">
          <Button variant="outline" className="flex-1" onClick={() => { setShowProfileDetail(null); handleSwipe('left') }} disabled={isProcessing}>
            <X size={18} /> Скип
          </Button>
          <Button className="flex-1" onClick={() => { setShowProfileDetail(null); handleSwipe('right') }} disabled={isProcessing}>
            <Heart size={18} /> Лайк
          </Button>
        </div>
      </div>
    )
  }

  // Main view
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">Нетворкинг</h1>
          <p className="text-gray-400 text-sm">Найди полезные контакты</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowMatches(true)} className="bg-bg-card px-4 py-2 rounded-xl flex items-center gap-2">
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
      ) : profilesError ? (
        <EmptyState icon={<X size={48} className="text-danger" />} title="Ошибка загрузки" description="Не удалось загрузить профили." />
      ) : !currentProfile ? (
        <EmptyState icon={<Sparkles size={48} className="text-accent" />} title="Все просмотрено!" description="Загляните позже, появятся новые участники" />
      ) : (
        <>
          <Card className="p-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                {(() => {
                  const swipeSkin = (currentProfile.user as any)?.active_skin
                  const swipeSkinData = Array.isArray(swipeSkin) ? swipeSkin[0] : swipeSkin
                  return (
                    <AvatarWithSkin
                      src={currentProfile.photo_url}
                      name={currentProfile.user?.first_name}
                      size="xl"
                      skin={swipeSkinData}
                      role={currentProfile.user?.team_role}
                      tier={(currentProfile.user as any)?.subscription_tier === 'pro' ? 'pro' : (currentProfile.user as any)?.subscription_tier === 'light' ? 'light' : null}
                    />
                  )
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">{currentProfile.user?.first_name} {currentProfile.user?.last_name}</h2>
                <p className="text-accent text-sm flex items-center gap-1 mb-1"><Briefcase size={12} /><span className="truncate">{currentProfile.occupation || 'Участник'}</span></p>
                <p className="text-gray-500 text-xs flex items-center gap-1 mb-2"><MapPin size={10} />{currentProfile.city}</p>
                {currentProfile.bio && <p className="text-gray-400 text-sm italic line-clamp-2">"{currentProfile.bio}"</p>}
              </div>
            </div>
            {(currentProfile.looking_for || currentProfile.can_help_with) && (
              <div className="mt-3 pt-3 border-t border-bg space-y-2">
                {currentProfile.looking_for && <div className="flex gap-2"><Target size={14} className="text-accent flex-shrink-0 mt-0.5" /><div className="text-sm text-gray-300 line-clamp-2">{currentProfile.looking_for}</div></div>}
                {currentProfile.can_help_with && <div className="flex gap-2"><HandshakeIcon size={14} className="text-success flex-shrink-0 mt-0.5" /><div className="text-sm text-gray-300 line-clamp-2">{currentProfile.can_help_with}</div></div>}
              </div>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mt-6">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('left')} disabled={isProcessing} className="w-16 h-16 rounded-full border-2 border-danger flex items-center justify-center disabled:opacity-50">
              <X size={28} className="text-danger" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowProfileDetail(currentProfile)} className="w-14 h-14 rounded-full bg-bg-card flex items-center justify-center">
              <User size={24} className="text-gray-400" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('right')} disabled={isProcessing || (swipesRemaining <= 0 && tier === 'free')} className="w-16 h-16 rounded-full bg-success flex items-center justify-center disabled:opacity-50">
              <Heart size={28} className="text-bg" />
            </motion.button>
          </div>
          <p className="text-center text-gray-500 text-xs mt-4">Пропустить • Профиль • Интересен</p>
        </>
      )}
    </div>
  )
}

export default NetworkScreen
