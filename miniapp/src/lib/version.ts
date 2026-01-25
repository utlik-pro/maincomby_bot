/**
 * Version information for MAIN Community Mini App
 *
 * NOTE: This file is updated by scripts/release.sh
 * Do not edit version values manually.
 */

export const APP_VERSION = '1.1.14'
export const APP_NAME = 'MAIN Community'

// Increment this number to trigger "What's New" modal for all users
// This works similarly to CURRENT_ONBOARDING_VERSION in store.ts
export const CURRENT_APP_VERSION = 18

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
  version: '1.1.14',
  date: '2026-01-25',
  summary: 'Исправления и улучшения v1.1.14',
  highlights: [
    { title: 'add Telegram push notific...', description: 'Подробнее в changelog' },
    { title: 'auto-award PRO when profi...', description: 'Подробнее в changelog' },
    { title: 'add profile completion te...', description: 'Подробнее в changelog' },
  ],
  features: [
    'add Telegram push notification when PRO awarded for profile completion',
    'auto-award PRO when profile is complete',
    'add profile completion testing tools and admin panel',
  ],
  fixes: [
    'support both BOT_TOKEN and TELEGRAM_BOT_TOKEN env vars',
    'sanitize Telegram usernames in links to prevent broken URLs',
    'sync profile photo_url with first uploaded photo',
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
