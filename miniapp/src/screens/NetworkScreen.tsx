import React, { useState, useEffect, useRef } from 'react'
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
  const { user, setUser, addPoints, getSubscriptionTier, getDailySwipesRemaining, profile, deepLinkTarget, setDeepLinkTarget, setHideNavigation, setHideHeader, setActiveTab: setGlobalActiveTab } = useAppStore()
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'swipe' | 'matches' | 'likes'>('swipe')
  const [showProfileDetail, setShowProfileDetail] = useState<SwipeCardProfile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [lastSwipe, setLastSwipe] = useState<LastSwipeInfo | null>(null)
  const [showUndoButton, setShowUndoButton] = useState(false)
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
      }
    }
  }, [])

  // Fullscreen mode for swipe tab - hide header and navigation
  useEffect(() => {
    if (activeTab === 'swipe') {
      setHideHeader(true)
      setHideNavigation(true)
    } else {
      setHideHeader(false)
      setHideNavigation(false)
    }
    // Cleanup on unmount
    return () => {
      setHideHeader(false)
      setHideNavigation(false)
    }
  }, [activeTab, setHideHeader, setHideNavigation])

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
      // In swipe mode - back to home
      backButton.show(() => setGlobalActiveTab('home'))
    }
    return () => {
      backButton.hide()
    }
  }, [activeTab, showProfileDetail, setGlobalActiveTab])

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
    enabled: !!user,
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
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
      undoTimeoutRef.current = setTimeout(() => setShowUndoButton(false), 5000)

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
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
      undoTimeoutRef.current = setTimeout(() => setShowUndoButton(false), 5000)

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

  return (
    <div className="h-[100dvh] w-full bg-black flex flex-col relative overflow-hidden">
      {/* Persistent Top Bar - Sticky */}
      <div className="sticky top-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-xl border-b border-white/5 pt-safe">
        <div className="flex items-center justify-between p-3">
          {/* Spacer for symmetry/TG back button area */}
          <div className="w-12" />

          {/* Compact Tabs - Persistent across all views */}
          <div className="flex gap-1 p-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
            <button
              onClick={() => setActiveTab('swipe')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'swipe'
                ? 'bg-accent text-bg shadow-lg'
                : 'text-white/70 hover:text-white'
                }`}
            >
              Свайпы
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'matches'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
                }`}
            >
              Контакты
              {matches && matches.length > 0 && (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-success px-1.5 text-xs text-white font-bold">
                  {matches.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'likes'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/70 hover:text-white'
                }`}
            >
              <Heart size={14} className="text-red-500 fill-red-500" />
              Лайки
              {tier === 'free' ? (
                <Crown size={14} className="text-amber-400" />
              ) : incomingLikes && incomingLikes.profiles.length > 0 ? (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-pink-500 px-1.5 text-xs text-white font-bold">
                  {incomingLikes.profiles.length}
                </span>
              ) : null}
            </button>
          </div>

          {/* Superlikes counter - larger icon */}
          <div className="w-12 flex justify-end">
            {tier !== 'free' && superlikesRemaining > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30">
                <Star size={16} className="text-blue-400 fill-blue-400" />
                <span className="text-sm text-blue-100 font-bold">{superlikesRemaining}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'swipe' && (
          <div className="h-full w-full flex flex-col">
            <div className="flex-1 relative px-4 pb-28">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="w-48 h-64 rounded-3xl bg-white/5" />
                </div>
              ) : profilesError ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <EmptyState
                    icon={<X size={48} className="text-danger" />}
                    title="Ошибка загрузки"
                    description="Не удалось загрузить профили."
                  />
                </div>
              ) : swipesRemaining <= 0 && tier !== 'pro' ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <Card className="w-full max-w-sm p-8 text-center bg-zinc-900/50 border-white/10 backdrop-blur-xl">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 shadow-[0_0_20px_rgba(var(--accent-rgb),0.2)]">
                      <Clock size={40} className="text-accent" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-white">Свайпы закончились</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                      {tier === 'free'
                        ? 'У вас было 5 свайпов на сегодня. Новые свайпы будут доступны завтра утром.'
                        : 'У вас было 20 свайпов на сегодня. Новые свайпы будут доступны завтра утром.'}
                    </p>
                    <div className="space-y-4">
                      <Button
                        className="w-full py-6 text-lg font-bold shadow-[0_4px_20px_rgba(var(--accent-rgb),0.3)]"
                        onClick={() => openTelegramLink('https://t.me/maincomapp_bot?start=subscribe')}
                      >
                        <Crown size={20} className="mr-2" />
                        Получить PRO — безлимит
                      </Button>
                      {matches && matches.length > 0 && (
                        <button
                          className="w-full py-3 text-accent hover:text-white transition-colors font-medium flex items-center justify-center gap-2"
                          onClick={() => setActiveTab('matches')}
                        >
                          <Heart size={18} className="fill-current" />
                          Посмотреть контакты ({matches.length})
                        </button>
                      )}
                    </div>
                  </Card>
                </div>
              ) : !currentProfile ? (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <EmptyState
                    icon={<Sparkles size={64} className="text-accent/50 animate-pulse" />}
                    title="Это всё на сегодня!"
                    description="Загляните позже, обязательно появятся новые участники."
                  />
                </div>
              ) : (
                <div className="h-full w-full max-w-md mx-auto relative overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/10">
                  <SwipeCard
                    profile={currentProfile}
                    onSwipe={handleSwipe}
                    onViewProfile={() => setShowProfileDetail(currentProfile)}
                    isProcessing={isProcessing}
                  />
                </div>
              )}
            </div>

            {/* Swipe Action Buttons */}
            {currentProfile && !isLoading && (swipesRemaining > 0 || tier === 'pro') && (
              <div className="absolute bottom-0 left-0 right-0 z-20 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-8 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="flex justify-center items-center gap-5 px-4 max-w-sm mx-auto">
                  {/* Undo Button */}
                  <div className="w-12 h-12 flex items-center justify-center">
                    <AnimatePresence>
                      {showUndoButton && lastSwipe && (
                        <motion.button
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleUndo}
                          disabled={isProcessing}
                          className="w-11 h-11 rounded-full bg-black/40 border border-amber-500/40 backdrop-blur-md flex items-center justify-center shadow-lg text-amber-500"
                        >
                          <Undo2 size={22} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Skip Button */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleSwipe('left')}
                    disabled={isProcessing}
                    className="w-16 h-16 rounded-full bg-black/40 border-2 border-red-500/40 backdrop-blur-md flex items-center justify-center shadow-xl text-red-500 transition-all hover:bg-red-500/10"
                  >
                    <X size={32} strokeWidth={2.5} />
                  </motion.button>

                  {/* Super Like Button */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleSuperLike}
                    disabled={isProcessing || (tier !== 'free' && superlikesRemaining <= 0)}
                    className={`w-14 h-14 rounded-full bg-black/40 border border-blue-500/40 backdrop-blur-md flex items-center justify-center shadow-lg transition-all hover:bg-blue-500/10 ${tier === 'free' ? 'opacity-40 grayscale pointer-events-none' : 'text-blue-400'
                      }`}
                  >
                    <Star size={26} className={tier !== 'free' ? "fill-current" : ""} />
                  </motion.button>

                  {/* Like Button */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleSwipe('right')}
                    disabled={isProcessing}
                    className="w-16 h-16 rounded-full bg-black/40 border-2 border-green-500/40 backdrop-blur-md flex items-center justify-center shadow-xl text-green-500 transition-all hover:bg-green-500/10"
                  >
                    <Heart size={32} className="fill-current" strokeWidth={2.5} />
                  </motion.button>

                  {/* Boost Placeholder */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addToast('Буст скоро будет доступен!', 'info')}
                    className="w-11 h-11 rounded-full bg-black/40 border border-purple-500/40 backdrop-blur-md flex items-center justify-center shadow-lg text-purple-400 opacity-60"
                  >
                    <Sparkles size={22} />
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'matches' || activeTab === 'likes') && (
          <div className="h-full w-full flex flex-col px-4">
            <div className="flex-1 overflow-y-auto pb-safe pt-2 custom-scrollbar">
              {activeTab === 'matches' ? (
                <div className="space-y-3">
                  {matches && matches.length > 0 ? (
                    matches.map((match: any) => {
                      const matchUser = match.user1_id === user?.id ? match.user2 : match.user1
                      const matchProfile = match.user1_id === user?.id ? match.profile2 : match.profile1
                      const skinData = Array.isArray(matchUser?.active_skin) ? matchUser.active_skin[0] : matchUser?.active_skin

                      return (
                        <div
                          key={match.id}
                          className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm cursor-pointer active:scale-95 transition-all hover:bg-white/10"
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
                            src={matchProfile?.photo_url || undefined}
                            name={matchUser?.first_name}
                            size="lg"
                            skin={skinData}
                            role={matchUser?.team_role}
                            tier={matchUser?.subscription_tier}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-white truncate text-base">
                              {matchUser?.first_name} {matchUser?.last_name}
                            </div>
                            <div className="text-xs text-white/50 truncate flex items-center gap-1">
                              {matchProfile?.occupation || 'Участник сообщества'}
                            </div>
                          </div>
                          <button
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-accent hover:bg-accent hover:text-bg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMessageMatch(matchUser)
                            }}
                          >
                            <MessageCircle size={20} />
                          </button>
                        </div>
                      )
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center mt-20">
                      <EmptyState
                        icon={<Search size={48} className="text-white/20" />}
                        title="Пока нет контактов"
                        description="Свайпайте вправо, чтобы найти единомышленников!"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {tier === 'free' ? (
                    <div className="mt-4">
                      <Card className="text-center p-8 bg-gradient-to-br from-zinc-900 to-black border-white/10">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-pink-500/30">
                          <Heart size={40} className="text-pink-500 fill-pink-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-white">Кто вас лайкнул?</h2>
                        <p className="text-white/60 mb-6 px-4">
                          <span className="text-pink-400 font-bold">{incomingLikes?.count || 0} человек</span> хотят познакомиться с вами прямо сейчас.
                        </p>
                        <p className="text-xs text-white/40 mb-8 max-w-xs mx-auto">
                          С подпиской PRO вы увидите всех, кто проявил интерес, и сможете сразу начать общение.
                        </p>
                        <Button
                          className="w-full py-6 font-bold bg-gradient-to-r from-purple-600 to-pink-600 border-none shadow-lg shadow-pink-500/20"
                          onClick={() => openTelegramLink('https://t.me/maincomapp_bot?start=subscribe')}
                        >
                          <Crown size={20} className="mr-2" />
                          Открыть доступ
                        </Button>
                      </Card>
                    </div>
                  ) : likesLoading ? (
                    <div className="space-y-4 mt-2">
                      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />)}
                    </div>
                  ) : incomingLikes?.profiles.length === 0 ? (
                    <div className="h-full flex items-center justify-center mt-20">
                      <EmptyState
                        icon={<Heart size={48} className="text-white/20" />}
                        title="Пока нет лайков"
                        description="Ваша идеальный партнер где-то рядом, продолжайте свайпать!"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {incomingLikes?.profiles.map((cardProfile) => {
                        const displayName = cardProfile.user?.first_name || 'Участник'
                        return (
                          <div
                            key={cardProfile.profile.user_id}
                            className="group relative flex flex-col rounded-2xl bg-zinc-900 overflow-hidden border border-white/5 active:scale-95 transition-all shadow-xl"
                            onClick={() => setShowProfileDetail(cardProfile)}
                          >
                            <div className="aspect-[4/5] relative">
                              <img
                                src={cardProfile.profile.photo_url || undefined}
                                alt={displayName}
                                className="w-full h-full object-cover grayscale-[0.2] transition-all group-hover:grayscale-0"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                              {cardProfile.isSuperlike && (
                                <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border border-white/20">
                                  <Star size={16} className="text-white fill-white" />
                                </div>
                              )}

                              <div className="absolute bottom-2 left-3 right-3">
                                <div className="font-bold text-white text-sm truncate">{displayName}</div>
                                <div className="text-[10px] text-white/50 truncate font-medium">
                                  {cardProfile.profile.occupation || 'Участник'}
                                </div>
                              </div>
                            </div>

                            <button
                              className="w-full py-2.5 bg-accent/20 hover:bg-accent text-accent hover:text-bg text-xs font-bold transition-all border-t border-white/5 flex items-center justify-center gap-1.5"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLikeBack(cardProfile)
                              }}
                              disabled={isProcessing}
                            >
                              <Heart size={14} className="fill-current" />
                              Нравится
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile Detail Overlays & Modals */}
      {/* (Keep existing logic for Detail Modals if any, though most are likely handled by the same structure now) */}

      {showSubscriptionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all animate-in fade-in">
          <Card className="w-full max-w-sm p-8 text-center bg-zinc-900/90 border-white/10 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
              <Lock size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">Нужна подписка</h2>
            <p className="text-white/60 mb-8 text-sm leading-relaxed">
              Чтобы обмениваться контактами и писать участникам напрямую, необходима подписка Light или PRO.
            </p>
            <div className="space-y-4">
              <Button
                className="w-full py-6 font-bold"
                onClick={() => {
                  openTelegramLink('https://t.me/maincomapp_bot?start=subscribe')
                  setShowSubscriptionModal(false)
                }}
              >
                <Crown size={20} className="mr-2" />
                Оформить подписку
              </Button>
              <button
                className="w-full py-2 text-white/40 hover:text-white/60 transition-colors text-sm font-medium"
                onClick={() => setShowSubscriptionModal(false)}
              >
                Закрыть
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default NetworkScreen
