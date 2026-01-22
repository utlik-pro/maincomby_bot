/**
 * Version information for MAIN Community Mini App
 *
 * NOTE: This file is updated by scripts/release.sh
 * Do not edit version values manually.
 */

export const APP_VERSION = '1.1.12'
export const APP_NAME = 'MAIN Community'

// Increment this number to trigger "What's New" modal for all users
// This works similarly to CURRENT_ONBOARDING_VERSION in store.ts
export const CURRENT_APP_VERSION = 16

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
  version: '1.1.12',
  date: '2026-01-22',
  summary: 'Исправления и улучшения v1.1.12',
  highlights: [
    { title: 'add ticket deep link supp...', description: 'Подробнее в changelog' },
    { title: 'add prompts promo sheet a...', description: 'Подробнее в changelog' },
    { title: 'improve prompt submission...', description: 'Подробнее в changelog' },
  ],
  features: [
    'add ticket deep link support for direct QR code access',
    'add prompts promo sheet and fix detail modal layout',
    'improve prompt submission with file upload and push notifications',
  ],
  fixes: [
    'move ticket deep link handler after registrations query',
    'event reminders timezone + escapeMarkdown for notifications',
    'improve prompts gallery layout and submit button visibility',
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
