/**
 * Version information for MAIN Community Mini App
 *
 * NOTE: This file is updated by scripts/release.sh
 * Do not edit version values manually.
 */

export const APP_VERSION = '1.1.4'
export const APP_NAME = 'MAIN Community'

// Increment this number to trigger "What's New" modal for all users
// This works similarly to CURRENT_ONBOARDING_VERSION in store.ts
export const CURRENT_APP_VERSION = 8

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
  version: '1.1.4',
  date: '2026-01-12',
  summary: 'Исправления и улучшения v1.1.4',
  highlights: [
    { title: 'add session tracking and ...', description: 'Подробнее в changelog' },
    { title: 'add streak progress UI ca...', description: 'Подробнее в changelog' },
    { title: 'add streak rewards + prof...', description: 'Подробнее в changelog' },
  ],
  features: [
    'add session tracking and analytics for super admin',
    'add streak progress UI card on HomeScreen',
    'add streak rewards + profile completion XP',
  ],
  fixes: [
    'daily streak shows on day 1 + disable XP notification spam',
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
