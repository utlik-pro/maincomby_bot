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
    message: '🎉 Секрет найден! +100 XP за любопытство!',
  },
  avatar_taps: {
    id: 'avatar_taps',
    xpReward: 50,
    message: '👤 Нашёл секрет аватара! +50 XP',
  },
  rank_taps: {
    id: 'rank_taps',
    xpReward: 200,
    message: '🎖️ Мастер тапов! +200 XP за настойчивость!',
  },
  phone_shake: {
    id: 'phone_shake',
    xpReward: 150,
    message: '📱 Шейкер! +150 XP за встряску!',
  },
  secret_code: {
    id: 'secret_code',
    xpReward: 75,
    message: '🔐 Код принят! +75 XP за "MAIN"!',
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

// Hook for shake detection
export function useShakeDetector(onShake: () => void, requiredShakes = 3) {
  const [shakeCount, setShakeCount] = useState(0)
  const [isUnlocked, setIsUnlocked] = useState(() => isEggUnlocked('phone_shake'))
  const lastShakeRef = useRef<number>(0)
  const { user } = useAppStore()
  const { addToast } = useToastStore()

  useEffect(() => {
    if (isUnlocked) return

    let lastX = 0, lastY = 0, lastZ = 0
    const threshold = 15

    const handleMotion = (event: DeviceMotionEvent) => {
      const { accelerationIncludingGravity } = event
      if (!accelerationIncludingGravity) return

      const { x, y, z } = accelerationIncludingGravity
      if (x === null || y === null || z === null) return

      const deltaX = Math.abs(x - lastX)
      const deltaY = Math.abs(y - lastY)
      const deltaZ = Math.abs(z - lastZ)

      if (deltaX + deltaY + deltaZ > threshold) {
        const now = Date.now()
        if (now - lastShakeRef.current > 500) {
          lastShakeRef.current = now
          setShakeCount(prev => {
            const newCount = prev + 1
            if (newCount >= requiredShakes) {
              // Unlock easter egg
              setIsUnlocked(true)
              saveUnlockedEgg('phone_shake')
              hapticFeedback.success()

              const egg = EASTER_EGGS.phone_shake
              if (user) {
                addXP(user.id, egg.xpReward, 'EASTER_EGG_PHONE_SHAKE').catch(() => {})
              }
              addToast(egg.message, 'xp', egg.xpReward)
              onShake()
              return 0
            }
            hapticFeedback.light()
            return newCount
          })
        }
      }

      lastX = x
      lastY = y
      lastZ = z
    }

    // Request permission for iOS
    const requestPermission = async () => {
      // @ts-ignore - DeviceMotionEvent.requestPermission is iOS only
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          // @ts-ignore
          const permission = await DeviceMotionEvent.requestPermission()
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion)
          }
        } catch (e) {
          console.warn('Shake detection not available:', e)
        }
      } else {
        // Android or desktop - just add listener
        window.addEventListener('devicemotion', handleMotion)
      }
    }

    requestPermission()

    return () => {
      window.removeEventListener('devicemotion', handleMotion)
    }
  }, [isUnlocked, requiredShakes, user, addToast, onShake])

  // Reset shake count after inactivity
  useEffect(() => {
    if (shakeCount > 0 && shakeCount < requiredShakes) {
      const timeout = setTimeout(() => setShakeCount(0), 3000)
      return () => clearTimeout(timeout)
    }
  }, [shakeCount, requiredShakes])

  return { shakeCount, isUnlocked }
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
          .catch(() => {})
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
              .catch(() => {})
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
