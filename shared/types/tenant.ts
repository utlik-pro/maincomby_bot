/**
 * God Mode - Tenant Types
 * Типы для мультитенантной архитектуры
 */

// ═══════════════════════════════════════════════════════════════
// TENANT (Партнёр/Сообщество)
// ═══════════════════════════════════════════════════════════════

export interface Tenant {
  id: string;
  name: string;
  slug: string; // уникальный идентификатор в URL
  domain?: string; // кастомный домен (если есть)
  logoUrl?: string;
  isActive: boolean;
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  // Базовые настройки
  appName: string;
  defaultLocale: 'ru' | 'en' | 'uk';
  defaultCity: string;
  timezone: string;

  // Контакты
  supportContact?: string; // Telegram username
  consultationContact?: string;

  // Социальные сети
  telegramChannel?: string;
  instagramUrl?: string;
  websiteUrl?: string;

  // Feature flags
  features: TenantFeatures;
}

export interface TenantFeatures {
  networking: boolean;
  events: boolean;
  learning: boolean;
  achievements: boolean;
  leaderboard: boolean;
  referrals: boolean;
  subscriptions: boolean;
}

// ═══════════════════════════════════════════════════════════════
// TENANT BOT (Привязка Telegram бота)
// ═══════════════════════════════════════════════════════════════

export type BotType = 'own' | 'shared';

export interface TenantBot {
  id: string;
  tenantId: string;
  botType: BotType;

  // Для own бота
  botTokenEncrypted?: string;
  botUsername?: string;
  webhookUrl?: string;

  // Для shared бота
  startappParam?: string; // уникальный параметр в t.me/bot?startapp=PARAM

  isActive: boolean;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════
// TENANT THEME (Тема/Брендинг)
// ═══════════════════════════════════════════════════════════════

export interface TenantTheme {
  id: string;
  tenantId: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  borderRadius: ThemeBorderRadius;
  isDefault: boolean;
  createdAt: string;
}

export interface ThemeColors {
  accent: string;        // #c8ff00 (лаймовый по умолчанию)
  accentHover: string;   // #d4ff33
  bgPrimary: string;     // #0a0a0a (основной фон)
  bgSecondary: string;   // #1a1a1a (вторичный фон)
  bgCard: string;        // #141414 (фон карточек)
  bgInput: string;       // #1f1f1f (фон инпутов)
  textPrimary: string;   // #ffffff
  textSecondary: string; // #a0a0a0
  textMuted: string;     // #666666
  border: string;        // #2a2a2a
  success: string;       // #22c55e
  danger: string;        // #ef4444
  warning: string;       // #f59e0b
  info: string;          // #3b82f6
}

export interface ThemeFonts {
  primary: string;  // 'Inter'
  heading: string;  // 'Inter'
  mono: string;     // 'JetBrains Mono'
}

export interface ThemeBorderRadius {
  sm: string;  // '8px'
  md: string;  // '12px'
  lg: string;  // '16px'
  xl: string;  // '24px'
  full: string; // '9999px'
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_THEME_COLORS: ThemeColors = {
  accent: '#c8ff00',
  accentHover: '#d4ff33',
  bgPrimary: '#0a0a0a',
  bgSecondary: '#1a1a1a',
  bgCard: '#141414',
  bgInput: '#1f1f1f',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#666666',
  border: '#2a2a2a',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export const DEFAULT_THEME_FONTS: ThemeFonts = {
  primary: 'Inter',
  heading: 'Inter',
  mono: 'JetBrains Mono',
};

export const DEFAULT_THEME_BORDER_RADIUS: ThemeBorderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

export const DEFAULT_TENANT_FEATURES: TenantFeatures = {
  networking: true,
  events: true,
  learning: true,
  achievements: true,
  leaderboard: true,
  referrals: true,
  subscriptions: true,
};

export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  appName: 'Community App',
  defaultLocale: 'ru',
  defaultCity: 'Минск',
  timezone: 'Europe/Minsk',
  features: DEFAULT_TENANT_FEATURES,
};
