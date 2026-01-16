/**
 * God Mode - Default Constants
 * Дефолтные значения для всей платформы
 */

// ═══════════════════════════════════════════════════════════════
// MAIN COMMUNITY (текущий tenant - для обратной совместимости)
// ═══════════════════════════════════════════════════════════════

export const MAIN_COMMUNITY_DEFAULTS = {
  // Базовые
  APP_NAME: 'MAIN Community',
  APP_SLUG: 'main-community',
  STORAGE_KEY: 'main-community-app',

  // Telegram Bot
  BOT_USERNAME: 'maincomapp_bot',
  BOT_LINK: 'https://t.me/maincomapp_bot',

  // Контакты
  SUPPORT_CONTACT: 'yana_martynen',
  CONSULTATION_CONTACT: 'dmitryutlik',
  TELEGRAM_CHANNEL: '@main_community',

  // Локализация
  DEFAULT_LOCALE: 'ru' as const,
  DEFAULT_CITY: 'Минск',
  DEFAULT_TIMEZONE: 'Europe/Minsk',

  // Цвета (текущая тема)
  ACCENT_COLOR: '#c8ff00',
  BG_PRIMARY: '#0a0a0a',
  BG_SECONDARY: '#1a1a1a',
  BG_CARD: '#141414',
} as const;

// ═══════════════════════════════════════════════════════════════
// ENV VARIABLES MAPPING
// ═══════════════════════════════════════════════════════════════

export const ENV_KEYS = {
  // Обязательные
  SUPABASE_URL: 'VITE_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'VITE_SUPABASE_ANON_KEY',

  // Telegram
  BOT_USERNAME: 'VITE_BOT_USERNAME',
  BOT_TOKEN: 'VITE_BOT_TOKEN', // Только для бэкенда!

  // Опциональные переопределения
  APP_NAME: 'VITE_APP_NAME',
  TENANT_ID: 'VITE_TENANT_ID',
  TENANT_SLUG: 'VITE_TENANT_SLUG',
} as const;

// ═══════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════

export const FEATURE_FLAGS = {
  // Основные модули
  NETWORKING: 'networking',
  EVENTS: 'events',
  LEARNING: 'learning',
  ACHIEVEMENTS: 'achievements',
  LEADERBOARD: 'leaderboard',
  REFERRALS: 'referrals',
  SUBSCRIPTIONS: 'subscriptions',

  // Экспериментальные
  AI_MATCHING: 'ai_matching',
  VOICE_INTROS: 'voice_intros',
  VIDEO_PROFILES: 'video_profiles',
} as const;

// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION TIERS
// ═══════════════════════════════════════════════════════════════

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  LIGHT: 'light',
  PRO: 'pro',
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

export const TIER_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    dailyLikes: 5,
    dailyMessages: 10,
    eventsPerMonth: 2,
    coursesAccess: ['free'],
  },
  [SUBSCRIPTION_TIERS.LIGHT]: {
    dailyLikes: 20,
    dailyMessages: 50,
    eventsPerMonth: 10,
    coursesAccess: ['free', 'light'],
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    dailyLikes: Infinity,
    dailyMessages: Infinity,
    eventsPerMonth: Infinity,
    coursesAccess: ['free', 'light', 'pro'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// UI CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const UI_CONSTANTS = {
  // Анимации
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 3000,

  // Пагинация
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Лимиты
  MAX_BIO_LENGTH: 500,
  MAX_SKILLS_COUNT: 10,
  MAX_INTERESTS_COUNT: 20,
  MAX_FILE_SIZE_MB: 10,

  // Debounce
  SEARCH_DEBOUNCE_MS: 300,
  SAVE_DEBOUNCE_MS: 1000,
} as const;

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

export const ROUTES = {
  // Mini App
  HOME: '/',
  PROFILE: '/profile',
  NETWORK: '/network',
  EVENTS: '/events',
  LEARNING: '/learning',
  LEADERBOARD: '/leaderboard',
  ACHIEVEMENTS: '/achievements',
  SETTINGS: '/settings',

  // Admin (God Mode)
  ADMIN_DASHBOARD: '/dashboard',
  ADMIN_TENANTS: '/tenants',
  ADMIN_BUILDER: '/builder',
  ADMIN_THEMES: '/themes',
  ADMIN_USERS: '/users',
  ADMIN_COURSES: '/courses',
  ADMIN_SETTINGS: '/settings',
} as const;
