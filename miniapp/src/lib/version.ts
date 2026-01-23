/**
 * Version information for MAIN Community Mini App
 *
 * NOTE: This file is updated by scripts/release.sh
 * Do not edit version values manually.
 */

export const APP_VERSION = '1.1.13'
export const APP_NAME = 'MAIN Community'

// Increment this number to trigger "What's New" modal for all users
// This works similarly to CURRENT_ONBOARDING_VERSION in store.ts
export const CURRENT_APP_VERSION = 17

export interface ReleaseHighlight {
  title: string
  description?: string
}

export interface ReleaseNote {
  version: string
  date: string
  summary: string
  highlights: ReleaseHighlight[]
  features: string[]
  fixes: string[]
}

// Latest release information for "What's New" modal
// NOTE: This is updated automatically by release.sh
export const LATEST_RELEASE: ReleaseNote = {
  version: '1.1.13',
  date: '2026-01-23',
  summary: 'Исправления и улучшения v1.1.13',
  highlights: [
    { title: 'disable vertical swipes g...', description: 'Подробнее в changelog' },
    { title: 'enable fullscreen mode fo...', description: 'Подробнее в changelog' },
    { title: 'add mandatory policy cons...', description: 'Подробнее в changelog' },
  ],
  features: [
    'disable vertical swipes globally at app init',
    'enable fullscreen mode for legal screens',
    'add mandatory policy consent screen per Belarus Law №99-З',
  ],
  fixes: [
    'make check-in more robust by removing .select().single()',
    'add JS-based pull-to-refresh prevention for iOS WebView',
    'aggressive overscroll prevention on all elements',
  ],
}

// Release history for changelog
export const RELEASE_HISTORY: ReleaseNote[] = [
  LATEST_RELEASE,
  {
    version: '1.0.0',
    date: '2026-01-10',
    summary: 'Initial release of MAIN Community',
    highlights: [
      { title: 'Telegram Mini App', description: 'Full-featured community app inside Telegram' },
      { title: 'Networking', description: 'Find and connect with like-minded people' },
      { title: 'Events', description: 'Register for events and check-in' },
      { title: 'Achievements', description: 'Earn XP and unlock ranks' },
    ],
    features: [
      'Profile management with photos',
      'Swipe-based matching system',
      'Event registration and reminders',
      'Achievement and XP system',
      'Subscription tiers with Telegram Stars',
      'Push notifications',
    ],
    fixes: [],
  },
]
