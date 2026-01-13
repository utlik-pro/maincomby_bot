/**
 * Version information for MAIN Community Mini App
 *
 * NOTE: This file is updated by scripts/release.sh
 * Do not edit version values manually.
 */

export const APP_VERSION = '1.1.5'
export const APP_NAME = 'MAIN Community'

// Increment this number to trigger "What's New" modal for all users
// This works similarly to CURRENT_ONBOARDING_VERSION in store.ts
export const CURRENT_APP_VERSION = 9

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
  version: '1.1.5',
  date: '2026-01-13',
  summary: 'Исправления и улучшения v1.1.5',
  highlights: [
    { title: 'add event funnel stats fo...', description: 'Подробнее в changelog' },
    { title: 'add speaker ratings and a...', description: 'Подробнее в changelog' },
    { title: 'add event funnel analytic...', description: 'Подробнее в changelog' },
  ],
  features: [
    'add event funnel stats for team + leads/checkins modals',
    'add speaker ratings and analytics',
    'add event funnel analytics (registered, today, checked-in, cancelled)',
  ],
  fixes: [
    'store funnel visibility setting in database for all users',
    'hide leads/checkins tabs when toggle is off, add analytics tab',
    'reset daily swipes counter on new day',
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
