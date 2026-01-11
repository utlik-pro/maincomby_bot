/**
 * Version information for MAIN Community Mini App
 *
 * NOTE: This file is updated by scripts/release.sh
 * Do not edit version values manually.
 */

export const APP_VERSION = '1.1.1'
export const APP_NAME = 'MAIN Community'

// Increment this number to trigger "What's New" modal for all users
// This works similarly to CURRENT_ONBOARDING_VERSION in store.ts
export const CURRENT_APP_VERSION = 5

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
export const LATEST_RELEASE: ReleaseNote = {
  version: '1.1.0',
  date: '2026-01-10',
  summary: 'Отзывы о событиях и улучшенный интерфейс',
  highlights: [
    { title: 'Отзывы о событиях', description: 'Оцените мероприятие и получите +20 XP' },
    { title: 'Новые модальные окна', description: 'Подписка и отзывы в едином стиле' },
    { title: 'Умные уведомления', description: 'Напоминания об отзыве в 22:30 после события' },
  ],
  features: [
    'Система отзывов о мероприятиях (1-5 звёзд + текст)',
    'Автоматический запрос отзыва при открытии приложения',
    'Push-уведомления для отзывов через бота',
    'Подписка в формате Bottom Sheet',
    'XP бонус за заполнение профиля',
  ],
  fixes: [],
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
