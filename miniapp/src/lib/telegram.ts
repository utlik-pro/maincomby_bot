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

    // Request fullscreen to hide Telegram header (v8.0+ only)
    requestFullscreen()

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

// Request phone number from user (requires version 6.9+)
export interface TelegramContact {
  phone_number: string
  first_name: string
  last_name?: string
  user_id: number
}

export const isContactRequestSupported = (): boolean => {
  const webApp = getTelegramWebApp()
  if (!webApp) return false
  const version = parseFloat(webApp.version || '0')
  return version >= 6.9
}

export const requestContact = (): Promise<TelegramContact | null> => {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp()
    if (!webApp || !isContactRequestSupported()) {
      resolve(null)
      return
    }

    // @ts-ignore - Method might not be in types yet
    webApp.requestContact?.((sent: boolean, contact?: TelegramContact) => {
      if (sent && contact) {
        resolve(contact)
      } else {
        resolve(null)
      }
    })

    // Fallback timeout
    setTimeout(() => resolve(null), 30000)
  })
}

// Check if QR Scanner is supported (requires version 6.4+)
export const isQrScannerSupported = (): boolean => {
  const webApp = getTelegramWebApp()
  if (!webApp) return false
  const version = parseFloat(webApp.version || '0')
  return version >= 6.4 && typeof webApp.showScanQrPopup === 'function'
}

// Show QR Scanner
export const showQrScanner = (text?: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp()
    if (!webApp || !isQrScannerSupported()) {
      resolve(null)
      return
    }

    webApp.showScanQrPopup({ text: text || 'Наведите камеру на QR-код' }, (qrData: string) => {
      // Close the scanner
      webApp.closeScanQrPopup()
      // Return the scanned data
      resolve(qrData)
      // Return true to close popup
      return true
    })

    // If user closes scanner without scanning
    setTimeout(() => {
      try {
        webApp.closeScanQrPopup()
      } catch (e) {
        // Already closed
      }
      resolve(null)
    }, 60000) // 1 minute timeout
  })
}

// Check if fullscreen API is supported (requires version 8.0+)
export const isFullscreenSupported = (): boolean => {
  const webApp = getTelegramWebApp()
  if (!webApp) return false
  const version = parseFloat(webApp.version || '0')
  return version >= 8.0 && typeof webApp.requestFullscreen === 'function'
}

// Request fullscreen mode (hides Telegram header)
export const requestFullscreen = (): void => {
  const webApp = getTelegramWebApp()
  if (!webApp) {
    console.warn('[Telegram] WebApp not available, cannot request fullscreen')
    return
  }

  if (!isFullscreenSupported()) {
    console.info('[Telegram] Fullscreen API not supported (requires Telegram 8.0+)')
    return
  }

  try {
    webApp.requestFullscreen()
    console.log('[Telegram] Fullscreen requested')
  } catch (error) {
    console.error('[Telegram] Failed to request fullscreen:', error)
  }
}

// Exit fullscreen mode
export const exitFullscreen = (): void => {
  const webApp = getTelegramWebApp()
  if (!webApp || !isFullscreenSupported()) return

  try {
    webApp.exitFullscreen()
    console.log('[Telegram] Exited fullscreen')
  } catch (error) {
    console.error('[Telegram] Failed to exit fullscreen:', error)
  }
}

// Check if app is currently in fullscreen mode
export const isFullscreen = (): boolean => {
  const webApp = getTelegramWebApp()
  if (!webApp) return false
  return webApp.isFullscreen === true
}

// ============ CLOUD NOTIFICATIONS ============

// Check if Cloud Notifications are supported (requires version 8.0+)
export const isCloudNotificationsSupported = (): boolean => {
  const webApp = getTelegramWebApp()
  if (!webApp) return false
  const version = parseFloat(webApp.version || '0')
  return version >= 8.0
}

// Request permission for notifications (write access to bot)
export const requestNotificationPermission = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp()
    if (!webApp || !isCloudNotificationsSupported()) {
      resolve(false)
      return
    }

    try {
      // @ts-ignore - Method might not be in types yet
      webApp.requestWriteAccess?.((granted: boolean) => {
        console.log('[Telegram] Write access granted:', granted)
        resolve(granted)
      })

      // Fallback timeout
      setTimeout(() => resolve(false), 30000)
    } catch (error) {
      console.error('[Telegram] Failed to request write access:', error)
      resolve(false)
    }
  })
}

// Check current notification permission status
export const checkNotificationPermission = (): Promise<'granted' | 'denied' | 'unknown'> => {
  return new Promise((resolve) => {
    const webApp = getTelegramWebApp()
    if (!webApp || !isCloudNotificationsSupported()) {
      resolve('unknown')
      return
    }

    // Check if we have write access (bot can message user)
    // This is indicated by initDataUnsafe.user.allows_write_to_pm
    const user = webApp.initDataUnsafe?.user
    if (user?.allows_write_to_pm) {
      resolve('granted')
    } else {
      resolve('denied')
    }
  })
}

// Notification types
export type NotificationType = 'match' | 'event' | 'achievement' | 'reminder' | 'system'

export interface NotificationPayload {
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
}

// Send notification via Bot API
const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN || '8302587804:AAH2ZIjWA9QQLzXlOiDUpYQiM8bw6NuO8nw'

export const sendPushNotification = async (
  userTgId: number,
  notification: NotificationPayload
): Promise<boolean> => {
  try {
    const emoji = {
      match: '💕',
      event: '📅',
      achievement: '🏆',
      reminder: '⏰',
      system: '🔔',
    }[notification.type] || '🔔'

    const text = `${emoji} *${notification.title}*\n\n${notification.message}`

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userTgId,
        text,
        parse_mode: 'Markdown',
      }),
    })

    const result = await response.json()
    return result.ok === true
  } catch (error) {
    console.error('[Telegram] Failed to send notification:', error)
    return false
  }
}
