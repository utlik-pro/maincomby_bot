import { TelegramWebApp, TelegramUser } from '@/types'

// Get Telegram WebApp instance
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp
  }
  return null
}

// Check if running inside Telegram
export const isTelegramWebApp = (): boolean => {
  return getTelegramWebApp() !== null
}

// Get current user from Telegram
export const getTelegramUser = (): TelegramUser | null => {
  const webApp = getTelegramWebApp()
  return webApp?.initDataUnsafe?.user || null
}

// Get init data for backend validation
export const getInitData = (): string => {
  const webApp = getTelegramWebApp()
  return webApp?.initData || ''
}

// Check if HapticFeedback is supported (requires version 6.1+)
const isHapticSupported = (): boolean => {
  const webApp = getTelegramWebApp()
  if (!webApp) return false
  const version = parseFloat(webApp.version || '0')
  return version >= 6.1
}

// Haptic feedback (silently fails if not supported)
export const hapticFeedback = {
  light: () => isHapticSupported() && getTelegramWebApp()?.HapticFeedback?.impactOccurred('light'),
  medium: () => isHapticSupported() && getTelegramWebApp()?.HapticFeedback?.impactOccurred('medium'),
  heavy: () => isHapticSupported() && getTelegramWebApp()?.HapticFeedback?.impactOccurred('heavy'),
  success: () => isHapticSupported() && getTelegramWebApp()?.HapticFeedback?.notificationOccurred('success'),
  error: () => isHapticSupported() && getTelegramWebApp()?.HapticFeedback?.notificationOccurred('error'),
  warning: () => isHapticSupported() && getTelegramWebApp()?.HapticFeedback?.notificationOccurred('warning'),
  selection: () => isHapticSupported() && getTelegramWebApp()?.HapticFeedback?.selectionChanged(),
}

// Main button controls
export const mainButton = {
  show: (text: string, onClick: () => void) => {
    const webApp = getTelegramWebApp()
    if (webApp) {
      webApp.MainButton.setText(text)
      webApp.MainButton.onClick(onClick)
      webApp.MainButton.show()
    }
  },
  hide: () => {
    const webApp = getTelegramWebApp()
    webApp?.MainButton.hide()
  },
  setLoading: (loading: boolean) => {
    const webApp = getTelegramWebApp()
    if (webApp) {
      if (loading) {
        webApp.MainButton.showProgress()
      } else {
        webApp.MainButton.hideProgress()
      }
    }
  },
}

// Back button controls
export const backButton = {
  show: (onClick: () => void) => {
    const webApp = getTelegramWebApp()
    if (webApp) {
      webApp.BackButton.onClick(onClick)
      webApp.BackButton.show()
    }
  },
  hide: () => {
    const webApp = getTelegramWebApp()
    webApp?.BackButton.hide()
  },
}

// Dialogs
export const showAlert = (message: string): Promise<void> => {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp()
    if (webApp) {
      webApp.showAlert(message, resolve)
    } else {
      alert(message)
      resolve()
    }
  })
}

export const showConfirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp()
    if (webApp) {
      webApp.showConfirm(message, resolve)
    } else {
      resolve(confirm(message))
    }
  })
}

// Open links
export const openLink = (url: string) => {
  const webApp = getTelegramWebApp()
  if (webApp) {
    webApp.openLink(url)
  } else {
    window.open(url, '_blank')
  }
}

export const openTelegramLink = (url: string) => {
  const webApp = getTelegramWebApp()
  if (webApp) {
    webApp.openTelegramLink(url)
  } else {
    window.open(url, '_blank')
  }
}

// Expand app to full height
export const expandApp = () => {
  const webApp = getTelegramWebApp()
  webApp?.expand()
}

// Initialize app
export const initTelegramApp = () => {
  const webApp = getTelegramWebApp()
  if (webApp) {
    webApp.ready()
    webApp.expand()

    // Set theme colors
    document.documentElement.style.setProperty('--tg-theme-bg-color', webApp.themeParams.bg_color || '#0a0a0a')
    document.documentElement.style.setProperty('--tg-theme-text-color', webApp.themeParams.text_color || '#ffffff')
  }
}

// Check if add to home screen is supported (requires version 8.0+)
export const isHomeScreenSupported = (): boolean => {
  const webApp = getTelegramWebApp()
  if (!webApp) return false
  const version = parseFloat(webApp.version || '0')
  return version >= 8.0
}

// Add Mini App to home screen
export const addToHomeScreen = (): void => {
  const webApp = getTelegramWebApp()
  if (webApp && isHomeScreenSupported()) {
    // @ts-ignore - Method might not be in types yet
    webApp.addToHomeScreen?.()
  }
}

// Check home screen status
export const checkHomeScreenStatus = (): Promise<'added' | 'not_added' | 'unknown'> => {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp()
    if (!webApp || !isHomeScreenSupported()) {
      resolve('unknown')
      return
    }
    // @ts-ignore - Method might not be in types yet
    webApp.checkHomeScreenStatus?.((status: string) => {
      resolve(status as 'added' | 'not_added' | 'unknown')
    })
    // Fallback if callback not called
    setTimeout(() => resolve('unknown'), 1000)
  })
}
