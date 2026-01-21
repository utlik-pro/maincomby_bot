/**
 * Version information for MAIN Community Mini App
 *
 * NOTE: This file is updated by scripts/release.sh
 * Do not edit version values manually.
 */

export const APP_VERSION = '1.1.11'
export const APP_NAME = 'MAIN Community'

// Increment this number to trigger "What's New" modal for all users
// This works similarly to CURRENT_ONBOARDING_VERSION in store.ts
export const CURRENT_APP_VERSION = 15

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
  version: '1.1.11',
  date: '2026-01-21',
  summary: 'Исправления и улучшения v1.1.11',
  highlights: [
    { title: 'add engagement notificati...', description: 'Подробнее в changelog' },
    { title: 'add engagement notificati...', description: 'Подробнее в changelog' },
    { title: 'add glowing animation to ...', description: 'Подробнее в changelog' },
  ],
  features: [
    'add engagement notification analytics dashboard',
    'add engagement notification system for user retention',
    'add glowing animation to Network and Learning icons',
  ],
  fixes: [
    'remove duplicate networking banner with English text',
    'change Networking card icon from heart to flame',
    'filter out matched users from Likes tab',
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
