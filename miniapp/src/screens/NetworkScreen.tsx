import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Star,
  Undo2,
} from 'lucide-react'
import { useAppStore, useToastStore } from '@/lib/store'
import { hapticFeedback, backButton, openTelegramLink, callEdgeFunction, notifySuperLike } from '@/lib/telegram'
import {
  getApprovedProfilesWithPhotos,
  createSwipe,
  checkMutualLike,
  createMatch,
  getUserMatches,
  createNotification,
  incrementDailySwipes,
  checkAndUpdateSwipeStreak,
  addXP,
  hasReceivedXPBonus,
  getIncomingLikes,
  deleteSwipe,
  incrementDailySuperlikes,
} from '@/lib/supabase'
import { XP_REWARDS, SUBSCRIPTION_LIMITS } from '@/types'
import { AvatarWithSkin, Button, Card, EmptyState, Skeleton } from '@/components/ui'
import { SwipeCard } from '@/components/SwipeCard'
import { PhotoGallery } from '@/components/PhotoGallery'
import type { SwipeCardProfile, LastSwipeInfo } from '@/types'

const NetworkScreen: React.FC = () => {
  const { user, setUser, addPoints, getSubscriptionTier, getDailySwipesRemaining, profile, deepLinkTarget, setDeepLinkTarget } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'swipe' | 'matches' | 'likes'>('swipe')
  const [showMatches, setShowMatches] = useState(false)
  const [showProfileDetail, setShowProfileDetail] = useState<SwipeCardProfile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [lastSwipe, setLastSwipe] = useState<LastSwipeInfo | null>(null)
  const [showUndoButton, setShowUndoButton] = useState(false)

  useEffect(() => {
    if (deepLinkTarget === 'matches') {
      setActiveTab('matches')
      setDeepLinkTarget(null)
    }
  }, [deepLinkTarget, setDeepLinkTarget])

  // Handle Telegram BackButton
  useEffect(() => {
    if (showProfileDetail) {
      backButton.show(() => setShowProfileDetail(null))
    } else if (activeTab !== 'swipe') {
      backButton.show(() => setActiveTab('swipe'))
    } else {
      backButton.hide()
    }
    return () => {
      backButton.hide()
    }
  }, [activeTab, showProfileDetail])

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

  // Fetch incoming likes for "Who Liked You" feature
  const { data: incomingLikes, isLoading: likesLoading, refetch: refetchLikes } = useQuery({
    queryKey: ['incomingLikes', user?.id],
    queryFn: async () => {
      if (!user) return { profiles: [], count: 0 }
      return getIncomingLikes(user.id)
    },
    enabled: !!user && tier !== 'free',
  })

  // Calculate daily superlikes remaining
  const getDailySuperlikesRemaining = () => {
    if (!user) return 0
    const limits = SUBSCRIPTION_LIMITS[tier]
    if (!limits.canSuperlike) return 0

    const resetAt = user.daily_superlikes_reset_at ? new Date(user.daily_superlikes_reset_at) : null
    const now = new Date()
    const needsReset = !resetAt || now >= resetAt
    const usedSuperlikes = needsReset ? 0 : (user.daily_superlikes_used || 0)
    return Math.max(0, limits.superlikesPerDay - usedSuperlikes)
  }

  const superlikesRemaining = getDailySuperlikesRemaining()

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
      const swipe = await createSwipe(user.id, currentProfile.profile.user_id, action)

      // Store for undo functionality
      setLastSwipe({
        swipeId: swipe.id,
        swipedUserId: currentProfile.profile.user_id,
        action,
        profile: currentProfile,
        timestamp: Date.now()
      })
      setShowUndoButton(true)
      setTimeout(() => setShowUndoButton(false), 5000)

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

          // Check if all daily swipes used (5 for free, 20 for light)
          const dailyLimit = tier === 'light' ? 20 : 5
          if (daily_swipes_used >= dailyLimit) {
            // Check swipe streak
            const streakResult = await checkAndUpdateSwipeStreak(user.id)
            if (streakResult.reward) {
              addToast(`🎯 ${streakResult.streak} дней активности! Pro на ${streakResult.reward.proAwarded} дн.`, 'success')
            }
          }
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

          // Telegram notifications via Edge Function (secure, no BOT_TOKEN on client)
          if (currentProfile.user?.tg_user_id) {
            callEdgeFunction('send-notification', {
              userTgId: currentProfile.user.tg_user_id,
              type: 'match',
              title: 'Новый контакт!',
              message: `${myName} тоже хочет познакомиться. Начните общение!`,
              deepLink: { screen: 'matches', buttonText: 'Открыть контакты' }
            }).catch(console.error)
          }
          if (user.tg_user_id) {
            callEdgeFunction('send-notification', {
              userTgId: user.tg_user_id,
              type: 'match',
              title: 'Новый контакт!',
              message: `${theirName} тоже хочет познакомиться. Начните общение!`,
              deepLink: { screen: 'matches', buttonText: 'Открыть контакты' }
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

  // Handle super like
  const handleSuperLike = async () => {
    if (!currentProfile || !user || isProcessing) return

    const limits = SUBSCRIPTION_LIMITS[tier]
    if (!limits.canSuperlike) {
      hapticFeedback.error()
      addToast('Super Like доступен с подпиской Light', 'error')
      return
    }

    if (superlikesRemaining <= 0) {
      hapticFeedback.error()
      addToast('Super Likes закончились на сегодня', 'error')
      return
    }

    setIsProcessing(true)
    hapticFeedback.heavy()

    try {
      // Save superlike swipe
      const swipe = await createSwipe(user.id, currentProfile.profile.user_id, 'superlike')

      // Increment superlikes counter
      const { daily_superlikes_used, daily_superlikes_reset_at } = await incrementDailySuperlikes(user.id)
      setUser({
        ...user,
        daily_superlikes_used,
        daily_superlikes_reset_at
      })

      // Store for undo
      setLastSwipe({
        swipeId: swipe.id,
        swipedUserId: currentProfile.profile.user_id,
        action: 'superlike',
        profile: currentProfile,
        timestamp: Date.now()
      })
      setShowUndoButton(true)
      setTimeout(() => setShowUndoButton(false), 5000)

      // Send notification with username
      const myUsername = user.username
      const myName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Участник'

      if (currentProfile.user?.tg_user_id) {
        notifySuperLike(
          currentProfile.user.tg_user_id,
          myUsername || null,
          myName
        ).catch(console.error)
      }

      // Check for match (superlike counts as like)
      const isMutual = await checkMutualLike(user.id, currentProfile.profile.user_id)
      if (isMutual) {
        await createMatch(user.id, currentProfile.profile.user_id)
        const theirName = `${currentProfile.user?.first_name || ''} ${currentProfile.user?.last_name || ''}`.trim() || 'Участник'

        // Award XP for match
        try {
          await addXP(user.id, XP_REWARDS.MATCH_RECEIVED, 'MATCH_RECEIVED')
          await addXP(currentProfile.profile.user_id, XP_REWARDS.MATCH_RECEIVED, 'MATCH_RECEIVED')
          addPoints(XP_REWARDS.MATCH_RECEIVED)
        } catch (e) {
          console.warn('Failed to award match XP:', e)
        }

        // Notifications
        createNotification(user.id, 'match', 'Новый контакт!', `${theirName} тоже хочет познакомиться. Начните общение!`, { matchedUserId: currentProfile.profile.user_id }).catch(console.error)

        hapticFeedback.success()
        addToast(`Новый контакт: ${theirName}! +${XP_REWARDS.MATCH_RECEIVED} XP`, 'success')
        queryClient.invalidateQueries({ queryKey: ['matches'] })
      } else {
        addToast('Super Like отправлен!', 'success')
      }

      await refetch()
    } catch (error) {
      console.error('Superlike error:', error)
      addToast('Ошибка. Попробуйте ещё раз.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle undo last swipe
  const handleUndo = async () => {
    if (!lastSwipe || !user) return

    setIsProcessing(true)
    hapticFeedback.medium()

    try {
      const success = await deleteSwipe(lastSwipe.swipeId, user.id)
      if (success) {
        setShowUndoButton(false)
        setLastSwipe(null)
        addToast('Свайп отменён', 'info')
        await refetch()
      } else {
        addToast('Не удалось отменить', 'error')
      }
    } catch (error) {
      console.error('Undo error:', error)
      addToast('Ошибка при отмене', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle like back from "Who Liked You"
  const handleLikeBack = async (cardProfile: SwipeCardProfile) => {
    if (!user || isProcessing) return

    setIsProcessing(true)
    hapticFeedback.medium()

    try {
      await createSwipe(user.id, cardProfile.profile.user_id, 'like')

      // This will always be a mutual match since they already liked us
      await createMatch(user.id, cardProfile.profile.user_id)
      const theirName = `${cardProfile.user?.first_name || ''} ${cardProfile.user?.last_name || ''}`.trim() || 'Участник'
      const myName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Участник'

      // Award XP
      try {
        await addXP(user.id, XP_REWARDS.MATCH_RECEIVED, 'MATCH_RECEIVED')
        await addXP(cardProfile.profile.user_id, XP_REWARDS.MATCH_RECEIVED, 'MATCH_RECEIVED')
        addPoints(XP_REWARDS.MATCH_RECEIVED)
      } catch (e) {
        console.warn('Failed to award match XP:', e)
      }

      // Notifications
      createNotification(user.id, 'match', 'Новый контакт!', `${theirName} тоже хочет познакомиться. Начните общение!`, { matchedUserId: cardProfile.profile.user_id }).catch(console.error)
      createNotification(cardProfile.profile.user_id, 'match', 'Новый контакт!', `${myName} ответил(а) вам взаимностью!`, { matchedUserId: user.id }).catch(console.error)

      // Telegram notification
      if (cardProfile.user?.tg_user_id) {
        callEdgeFunction('send-notification', {
          userTgId: cardProfile.user.tg_user_id,
          type: 'match',
          title: 'Новый контакт!',
          message: `${myName} ответил(а) вам взаимностью!`,
          deepLink: { screen: 'matches', buttonText: 'Открыть контакты' }
        }).catch(console.error)
      }

      hapticFeedback.success()
      addToast(`Новый контакт: ${theirName}! +${XP_REWARDS.MATCH_RECEIVED} XP`, 'success')
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      refetchLikes()
    } catch (error) {
      console.error('Like back error:', error)
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

  // Main view with tabs
  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-xl font-bold">Нетворкинг</h1>
          {activeTab === 'swipe' && (
            <p className="text-gray-400 text-sm">{swipesRemaining} свайпов осталось</p>
          )}
        </div>
        <div className="flex gap-2">
          {tier !== 'free' && superlikesRemaining > 0 && activeTab === 'swipe' && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
              <Star size={14} className="text-purple-400 fill-purple-400" />
              <span className="text-sm text-purple-400 font-semibold">{superlikesRemaining}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('swipe')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'swipe' ? 'bg-accent text-bg' : 'bg-bg-card text-gray-400'
          }`}
        >
          Свайпы
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'matches' ? 'bg-accent text-bg' : 'bg-bg-card text-gray-400'
          }`}
        >
          Контакты
          {matches && matches.length > 0 && (
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === 'matches' ? 'bg-bg text-accent' : 'bg-success/20 text-success'
            }`}>
              {matches.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('likes')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 relative ${
            activeTab === 'likes' ? 'bg-accent text-bg' : 'bg-bg-card text-gray-400'
          }`}
        >
          Лайки
          {tier === 'free' && (
            <Crown size={14} className="text-amber-400" />
          )}
          {tier !== 'free' && incomingLikes && incomingLikes.profiles.length > 0 && (
            <span className={`px-1.5 py-0.5 text-xs rounded-full ${
              activeTab === 'likes' ? 'bg-bg text-accent' : 'bg-pink-500/20 text-pink-400'
            }`}>
              {incomingLikes.profiles.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'swipe' && (
        <>
          {/* Swipe Card Area */}
          <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <Card className="w-full aspect-[3/4] max-h-[calc(100vh-280px)] flex items-center justify-center">
                <Skeleton className="w-32 h-32 rounded-full" />
              </Card>
            ) : profilesError ? (
              <EmptyState
                icon={<X size={48} className="text-danger" />}
                title="Ошибка загрузки"
                description="Не удалось загрузить профили."
              />
            ) : swipesRemaining <= 0 && tier !== 'pro' ? (
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
                    onClick={() => openTelegramLink('https://t.me/maincomapp_bot?start=subscribe')}
                  >
                    <Crown size={18} className="mr-2" />
                    Получить PRO — безлимит
                  </Button>
                  <p className="text-xs text-gray-500">
                    PRO-подписка даёт безлимитные свайпы и другие преимущества
                  </p>
                </div>
                {matches && matches.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setActiveTab('matches')}
                  >
                    <Heart size={16} className="mr-2 text-success fill-success" />
                    Посмотреть контакты ({matches.length})
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

          {/* Action Buttons with Super Like and Undo */}
          {currentProfile && !isLoading && swipesRemaining > 0 && (
            <div className="flex justify-center items-center gap-4 py-4">
              {/* Skip button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('left')}
                disabled={isProcessing}
                className="w-14 h-14 rounded-full border-2 border-danger flex items-center justify-center disabled:opacity-50"
              >
                <X size={24} className="text-danger" />
              </motion.button>

              {/* Undo button (shown briefly after swipe) */}
              <AnimatePresence>
                {showUndoButton && lastSwipe && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleUndo}
                    disabled={isProcessing}
                    className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center disabled:opacity-50"
                  >
                    <Undo2 size={20} className="text-white" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Super Like button (Light/Pro only) */}
              {tier !== 'free' && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSuperLike}
                  disabled={isProcessing || superlikesRemaining <= 0}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center disabled:opacity-50"
                >
                  <Star size={20} className="text-white fill-white" />
                </motion.button>
              )}

              {/* View profile button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowProfileDetail(currentProfile)}
                className="w-12 h-12 rounded-full bg-bg-card flex items-center justify-center"
              >
                <User size={20} className="text-gray-400" />
              </motion.button>

              {/* Like button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSwipe('right')}
                disabled={isProcessing}
                className="w-14 h-14 rounded-full bg-accent flex items-center justify-center disabled:opacity-50"
              >
                <Heart size={24} className="text-bg" />
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="flex-1 overflow-y-auto">
          {matches && matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match: any) => {
                const matchUser = match.user1_id === user?.id ? match.user2 : match.user1
                const matchProfile = match.user1_id === user?.id ? match.profile2 : match.profile1
                const matchSkin = matchUser?.active_skin
                const skinData = Array.isArray(matchSkin) ? matchSkin[0] : matchSkin
                return (
                  <Card
                    key={match.id}
                    className="flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => {
                      setShowProfileDetail({
                        profile: matchProfile,
                        user: matchUser,
                        photos: [],
                        activeSkin: skinData
                      })
                    }}
                  >
                    <AvatarWithSkin
                      src={matchProfile?.photo_url}
                      name={matchUser?.first_name}
                      size="md"
                      skin={skinData}
                      role={matchUser?.team_role}
                      tier={matchUser?.subscription_tier === 'pro' ? 'pro' : matchUser?.subscription_tier === 'light' ? 'light' : null}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{matchUser?.first_name} {matchUser?.last_name}</div>
                      <div className="text-sm text-gray-400 truncate">{matchProfile?.occupation || 'Участник'}</div>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMessageMatch(matchUser)
                      }}
                    >
                      <Button variant="secondary" size="sm">
                        <MessageCircle size={16} />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Search size={48} className="text-gray-500" />}
              title="Пока нет контактов"
              description="Свайпайте вправо, чтобы найти совпадения!"
            />
          )}
        </div>
      )}

      {/* Who Liked You Tab */}
      {activeTab === 'likes' && (
        <div className="flex-1 overflow-y-auto">
          {tier === 'free' ? (
            <Card className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Heart size={32} className="text-pink-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Кто вас лайкнул?</h2>
              <p className="text-gray-400 mb-4">
                {incomingLikes?.count || 0} человек хотят познакомиться с вами
              </p>
              <p className="text-sm text-gray-500 mb-6">
                С подпиской Light или PRO вы сможете видеть, кто вас лайкнул, и сразу начать общение
              </p>
              <Button onClick={() => openTelegramLink('https://t.me/maincomapp_bot?start=subscribe')}>
                <Crown size={18} className="mr-2" />
                Открыть доступ
              </Button>
            </Card>
          ) : likesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : incomingLikes?.profiles.length === 0 ? (
            <EmptyState
              icon={<Heart size={48} className="text-gray-500" />}
              title="Пока нет лайков"
              description="Продолжайте свайпать, и скоро кто-то вас заметит!"
            />
          ) : (
            <div className="space-y-3">
              {incomingLikes?.profiles.map((cardProfile) => {
                const displayName = `${cardProfile.user?.first_name || ''} ${cardProfile.user?.last_name || ''}`.trim() || 'Участник'
                return (
                  <Card
                    key={cardProfile.profile.user_id}
                    className="flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => setShowProfileDetail(cardProfile)}
                  >
                    <div className="relative">
                      <AvatarWithSkin
                        src={cardProfile.profile.photo_url}
                        name={cardProfile.user?.first_name}
                        size="md"
                        skin={cardProfile.activeSkin}
                      />
                      {cardProfile.isSuperlike && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Star size={10} className="text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate flex items-center gap-2">
                        {displayName}
                        {cardProfile.isSuperlike && (
                          <span className="text-xs text-purple-400">Super Like</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        {cardProfile.profile.occupation || 'Участник'}
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleLikeBack(cardProfile)}
                        disabled={isProcessing}
                      >
                        <Heart size={16} className="mr-1" />
                        Нравится
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
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
              Чтобы писать контактам, оформите подписку Light или PRO
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

export default NetworkScreen
