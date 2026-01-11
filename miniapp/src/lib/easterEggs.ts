import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore, useToastStore } from './store'
import { addXP } from './supabase'
import { hapticFeedback } from './telegram'

// Easter egg configuration
interface EasterEgg {
  id: string
  xpReward: number
  message: string
}

const EASTER_EGGS: Record<string, EasterEgg> = {
  logo_taps: {
    id: 'logo_taps',
    xpReward: 100,
    message: 'Секрет найден! +100 XP за любопытство!',
  },
  avatar_taps: {
    id: 'avatar_taps',
    xpReward: 50,
    message: 'Нашёл секрет аватара! +50 XP',
  },
  rank_taps: {
    id: 'rank_taps',
    xpReward: 200,
    message: 'Мастер тапов! +200 XP за настойчивость!',
  },
  long_press: {
    id: 'long_press',
    xpReward: 75,
    message: '⏱️ Терпеливый! +75 XP за выдержку!',
  },
  double_tap: {
    id: 'double_tap',
    xpReward: 100,
    message: '👆👆 Двойной удар! +100 XP!',
  },
  swipe_pattern: {
    id: 'swipe_pattern',
    xpReward: 150,
    message: '↔️ Мастер свайпов! +150 XP за ловкость!',
  },
  secret_code: {
    id: 'secret_code',
    xpReward: 1000,
    message: 'MAIN в сердце! +1000 XP за преданность!',
  },
  speed_runner: {
    id: 'speed_runner',
    xpReward: 50,
    message: '⚡ Спидраннер! +50 XP за скорость!',
  },
  debug_console: {
    id: 'debug_console',
    xpReward: 0,
    message: '🔧 Debug режим активирован',
  },
}

// Get unlocked easter eggs from localStorage
const getUnlockedEggs = (): Set<string> => {
  try {
    const stored = localStorage.getItem('unlocked_easter_eggs')
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

// Save unlocked easter egg
const saveUnlockedEgg = (eggId: string) => {
  const unlocked = getUnlockedEggs()
  unlocked.add(eggId)
  localStorage.setItem('unlocked_easter_eggs', JSON.stringify([...unlocked]))
}

// Check if easter egg is already unlocked
export const isEggUnlocked = (eggId: string): boolean => {
  return getUnlockedEggs().has(eggId)
}

// Hook for tap-based easter eggs
export function useTapEasterEgg(
  eggId: keyof typeof EASTER_EGGS,
  requiredTaps: number,
  onUnlock?: () => void
) {
  const [tapCount, setTapCount] = useState(0)
  const [isUnlocked, setIsUnlocked] = useState(() => isEggUnlocked(eggId))
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { user, addPoints } = useAppStore()
  const { addToast } = useToastStore()

  const handleTap = useCallback(async () => {
    if (isUnlocked) return

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const newCount = tapCount + 1
    setTapCount(newCount)

    // Reset tap count after 2 seconds of inactivity
    timeoutRef.current = setTimeout(() => {
      setTapCount(0)
    }, 2000)

    // Check if easter egg is unlocked
    if (newCount >= requiredTaps) {
      const egg = EASTER_EGGS[eggId]
      setIsUnlocked(true)
      saveUnlockedEgg(eggId)
      hapticFeedback.success()

      // Award XP if reward > 0
      if (egg.xpReward > 0 && user) {
        try {
          await addXP(user.id, egg.xpReward, `EASTER_EGG_${eggId.toUpperCase()}`)
          // Update local state immediately
          addPoints(egg.xpReward)
        } catch (e) {
          console.warn('Failed to award easter egg XP:', e)
        }
      }

      addToast(egg.message, 'xp', egg.xpReward)
      onUnlock?.()
    } else if (newCount >= requiredTaps - 2) {
      // Hint when close
      hapticFeedback.light()
    }
  }, [tapCount, isUnlocked, eggId, requiredTaps, user, addToast, onUnlock])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { tapCount, handleTap, isUnlocked }
}

// Hook for long press easter egg (hold for 3 seconds)
export function useLongPressEasterEgg(
  duration = 3000,
  onUnlock?: () => void
) {
  const [isPressed, setIsPressed] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isUnlocked, setIsUnlocked] = useState(() => isEggUnlocked('long_press'))
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const { user, addPoints } = useAppStore()
  const { addToast } = useToastStore()

  const handlePressStart = useCallback(() => {
    if (isUnlocked) return

    setIsPressed(true)
    startTimeRef.current = Date.now()
    hapticFeedback.light()

    // Update progress every 100ms
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      // Haptic feedback at milestones
      if (newProgress >= 50 && newProgress < 55) {
        hapticFeedback.light()
      } else if (newProgress >= 80 && newProgress < 85) {
        hapticFeedback.medium()
      }
    }, 100)

    // Unlock after duration
    timerRef.current = setTimeout(async () => {
      setIsUnlocked(true)
      saveUnlockedEgg('long_press')
      hapticFeedback.success()

      const egg = EASTER_EGGS.long_press
      if (user && egg.xpReward > 0) {
        try {
          await addXP(user.id, egg.xpReward, 'EASTER_EGG_LONG_PRESS')
          addPoints(egg.xpReward)
        } catch (e) {
          console.warn('Failed to award easter egg XP:', e)
        }
      }

      addToast(egg.message, 'xp', egg.xpReward)
      onUnlock?.()
    }, duration)
  }, [isUnlocked, duration, user, addToast, onUnlock, addPoints])

  const handlePressEnd = useCallback(() => {
    setIsPressed(false)
    setProgress(0)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (progressRef.current) {
      clearInterval(progressRef.current)
      progressRef.current = null
    }
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [])

  return {
    isPressed,
    progress,
    isUnlocked,
    handlers: {
      onTouchStart: handlePressStart,
      onTouchEnd: handlePressEnd,
      onTouchCancel: handlePressEnd,
      onMouseDown: handlePressStart,
      onMouseUp: handlePressEnd,
      onMouseLeave: handlePressEnd,
    }
  }
}

// Hook for double tap easter egg (rapid double tap within 300ms)
export function useDoubleTapEasterEgg(
  maxInterval = 300,
  onUnlock?: () => void
) {
  const [isUnlocked, setIsUnlocked] = useState(() => isEggUnlocked('double_tap'))
  const lastTapRef = useRef<number>(0)
  const { user, addPoints } = useAppStore()
  const { addToast } = useToastStore()

  const handleTap = useCallback(async () => {
    if (isUnlocked) return

    const now = Date.now()
    const timeSinceLastTap = now - lastTapRef.current

    if (timeSinceLastTap < maxInterval && timeSinceLastTap > 50) {
      // Double tap detected!
      setIsUnlocked(true)
      saveUnlockedEgg('double_tap')
      hapticFeedback.success()

      const egg = EASTER_EGGS.double_tap
      if (user && egg.xpReward > 0) {
        try {
          await addXP(user.id, egg.xpReward, 'EASTER_EGG_DOUBLE_TAP')
          addPoints(egg.xpReward)
        } catch (e) {
          console.warn('Failed to award easter egg XP:', e)
        }
      }

      addToast(egg.message, 'xp', egg.xpReward)
      onUnlock?.()
    } else {
      hapticFeedback.light()
    }

    lastTapRef.current = now
  }, [isUnlocked, maxInterval, user, addToast, onUnlock, addPoints])

  return { handleTap, isUnlocked }
}

// Hook for swipe pattern easter egg (swipe left-right-left or up-down-up)
export function useSwipePatternEasterEgg(
  pattern: ('left' | 'right' | 'up' | 'down')[] = ['left', 'right', 'left'],
  onUnlock?: () => void
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isUnlocked, setIsUnlocked] = useState(() => isEggUnlocked('swipe_pattern'))
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { user, addPoints } = useAppStore()
  const { addToast } = useToastStore()

  const detectSwipeDirection = useCallback((startX: number, startY: number, endX: number, endY: number): 'left' | 'right' | 'up' | 'down' | null => {
    const deltaX = endX - startX
    const deltaY = endY - startY
    const minSwipeDistance = 50

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) >= minSwipeDistance) {
        return deltaX > 0 ? 'right' : 'left'
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) >= minSwipeDistance) {
        return deltaY > 0 ? 'down' : 'up'
      }
    }
    return null
  }, [])

  const handleSwipe = useCallback(async (direction: 'left' | 'right' | 'up' | 'down') => {
    if (isUnlocked) return

    // Reset timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Check if this swipe matches the expected pattern
    if (direction === pattern[currentIndex]) {
      hapticFeedback.light()
      const nextIndex = currentIndex + 1

      if (nextIndex >= pattern.length) {
        // Pattern complete!
        setIsUnlocked(true)
        saveUnlockedEgg('swipe_pattern')
        hapticFeedback.success()

        const egg = EASTER_EGGS.swipe_pattern
        if (user && egg.xpReward > 0) {
          try {
            await addXP(user.id, egg.xpReward, 'EASTER_EGG_SWIPE_PATTERN')
            addPoints(egg.xpReward)
          } catch (e) {
            console.warn('Failed to award easter egg XP:', e)
          }
        }

        addToast(egg.message, 'xp', egg.xpReward)
        onUnlock?.()
        setCurrentIndex(0)
      } else {
        setCurrentIndex(nextIndex)
        // Reset after 2 seconds of inactivity
        timeoutRef.current = setTimeout(() => setCurrentIndex(0), 2000)
      }
    } else {
      // Wrong direction, reset
      setCurrentIndex(0)
    }
  }, [isUnlocked, currentIndex, pattern, user, addToast, onUnlock, addPoints])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isUnlocked) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [isUnlocked])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isUnlocked || !touchStartRef.current) return
    const touch = e.changedTouches[0]
    const direction = detectSwipeDirection(
      touchStartRef.current.x,
      touchStartRef.current.y,
      touch.clientX,
      touch.clientY
    )
    if (direction) {
      handleSwipe(direction)
    }
    touchStartRef.current = null
  }, [isUnlocked, detectSwipeDirection, handleSwipe])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    currentIndex,
    patternLength: pattern.length,
    isUnlocked,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    }
  }
}

// Hook for secret code detection in text input
export function useSecretCode(
  targetCode: string,
  currentValue: string,
  onMatch: () => void
) {
  const [isUnlocked, setIsUnlocked] = useState(() => isEggUnlocked('secret_code'))
  const { user, addPoints } = useAppStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    if (isUnlocked) return

    // Check if the value contains the secret code (case insensitive)
    if (currentValue.toUpperCase().includes(targetCode.toUpperCase())) {
      setIsUnlocked(true)
      saveUnlockedEgg('secret_code')
      hapticFeedback.success()

      const egg = EASTER_EGGS.secret_code
      if (user) {
        addXP(user.id, egg.xpReward, 'EASTER_EGG_SECRET_CODE')
          .then(() => addPoints(egg.xpReward))
          .catch(() => { })
      }
      addToast(egg.message, 'xp', egg.xpReward)
      onMatch()
    }
  }, [currentValue, targetCode, isUnlocked, user, addToast, onMatch, addPoints])

  return { isUnlocked }
}

// Hook for speed runner (visit all tabs quickly)
export function useSpeedRunner(tabs: string[], timeLimit = 10000) {
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set())
  const [isUnlocked, setIsUnlocked] = useState(() => isEggUnlocked('speed_runner'))
  const startTimeRef = useRef<number | null>(null)
  const { user, addPoints } = useAppStore()
  const { addToast } = useToastStore()

  const recordTabVisit = useCallback((tabId: string) => {
    if (isUnlocked) return

    setVisitedTabs(prev => {
      const newSet = new Set(prev)

      // Start timer on first visit
      if (newSet.size === 0) {
        startTimeRef.current = Date.now()
      }

      newSet.add(tabId)

      // Check if all tabs visited within time limit
      if (newSet.size === tabs.length && startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current
        if (elapsed <= timeLimit) {
          // Success!
          setIsUnlocked(true)
          saveUnlockedEgg('speed_runner')
          hapticFeedback.success()

          const egg = EASTER_EGGS.speed_runner
          if (user) {
            addXP(user.id, egg.xpReward, 'EASTER_EGG_SPEED_RUNNER')
              .then(() => addPoints(egg.xpReward))
              .catch(() => { })
          }
          addToast(egg.message, 'xp', egg.xpReward)
        }
      }

      return newSet
    })
  }, [isUnlocked, tabs.length, timeLimit, user, addToast, addPoints])

  // Reset after time limit
  useEffect(() => {
    if (visitedTabs.size > 0 && !isUnlocked) {
      const timeout = setTimeout(() => {
        setVisitedTabs(new Set())
        startTimeRef.current = null
      }, timeLimit)
      return () => clearTimeout(timeout)
    }
  }, [visitedTabs, timeLimit, isUnlocked])

  return { visitedTabs, recordTabVisit, isUnlocked }
}

// Get all easter eggs status
export function getEasterEggsStatus() {
  const unlocked = getUnlockedEggs()
  return Object.entries(EASTER_EGGS).map(([id, egg]) => ({
    ...egg,
    isUnlocked: unlocked.has(id),
  }))
}

// Get total XP from easter eggs
export function getTotalEasterEggXP() {
  const unlocked = getUnlockedEggs()
  return Object.entries(EASTER_EGGS)
    .filter(([id]) => unlocked.has(id))
    .reduce((sum, [, egg]) => sum + egg.xpReward, 0)
}
