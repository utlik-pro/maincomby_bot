/**
 * God Mode - Centralized Configuration
 * Централизованный конфиг для Mini App
 *
 * Этот файл заменяет все hardcoded значения в приложении.
 * Конфиг загружается из:
 * 1. Environment variables (VITE_*)
 * 2. Supabase (tenant settings) - если включен multi-tenancy
 * 3. Default values (fallback)
 */

import {
  MAIN_COMMUNITY_DEFAULTS,
  ENV_KEYS,
  FEATURE_FLAGS,
  SUBSCRIPTION_TIERS,
  type SubscriptionTier,
} from '@shared/constants';

import type {
  Tenant,
  TenantSettings,
  TenantFeatures,
  TenantTheme,
  ThemeColors,
} from '@shared/types';

// ═══════════════════════════════════════════════════════════════
// APP CONFIG INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface AppConfig {
  // Базовые
  appName: string;
  appSlug: string;
  storageKey: string;

  // Telegram Bot
  botUsername: string;
  botLink: string;

  // Контакты
  supportContact: string;
  consultationContact: string;
  telegramChannel: string;

  // Локализация
  defaultLocale: 'ru' | 'en' | 'uk';
  defaultCity: string;
  timezone: string;

  // URLs
  supabaseUrl: string;
  supabaseAnonKey: string;

  // Tenant (для multi-tenancy)
  tenantId: string | null;
  tenantSlug: string | null;

  // Feature flags
  features: TenantFeatures;

  // Environment
  isDev: boolean;
  isProd: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CONFIG SINGLETON
// ═══════════════════════════════════════════════════════════════

let _config: AppConfig | null = null;

/**
 * Получить конфиг приложения (singleton)
 */
export function getConfig(): AppConfig {
  if (!_config) {
    _config = createConfig();
  }
  return _config;
}

/**
 * Обновить конфиг из tenant settings (для multi-tenancy)
 */
export function updateConfigFromTenant(tenant: Tenant, theme?: TenantTheme): void {
  if (!_config) {
    _config = createConfig();
  }

  _config.appName = tenant.settings.appName;
  _config.appSlug = tenant.slug;
  _config.storageKey = `${tenant.slug}-app`;
  _config.tenantId = tenant.id;
  _config.tenantSlug = tenant.slug;
  _config.defaultLocale = tenant.settings.defaultLocale;
  _config.defaultCity = tenant.settings.defaultCity;
  _config.timezone = tenant.settings.timezone;
  _config.features = tenant.settings.features;

  if (tenant.settings.supportContact) {
    _config.supportContact = tenant.settings.supportContact;
  }
  if (tenant.settings.consultationContact) {
    _config.consultationContact = tenant.settings.consultationContact;
  }
  if (tenant.settings.telegramChannel) {
    _config.telegramChannel = tenant.settings.telegramChannel;
  }

  // Применяем тему если передана
  if (theme) {
    applyThemeToDocument(theme.colors);
  }

  // Сохраняем конфиг в window для отладки
  if (typeof window !== 'undefined') {
    (window as unknown as { __APP_CONFIG__: AppConfig }).__APP_CONFIG__ = _config;
  }
}

/**
 * Сбросить конфиг к дефолтным значениям
 */
export function resetConfig(): void {
  _config = createConfig();
}

// ═══════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════

function createConfig(): AppConfig {
  const config: AppConfig = {
    // Базовые - из env или defaults
    appName: getEnv(ENV_KEYS.APP_NAME, MAIN_COMMUNITY_DEFAULTS.APP_NAME),
    appSlug: getEnv('VITE_APP_SLUG', MAIN_COMMUNITY_DEFAULTS.APP_SLUG),
    storageKey: MAIN_COMMUNITY_DEFAULTS.STORAGE_KEY,

    // Telegram Bot
    botUsername: getEnv(ENV_KEYS.BOT_USERNAME, MAIN_COMMUNITY_DEFAULTS.BOT_USERNAME),
    botLink: '', // Вычисляется ниже

    // Контакты
    supportContact: MAIN_COMMUNITY_DEFAULTS.SUPPORT_CONTACT,
    consultationContact: MAIN_COMMUNITY_DEFAULTS.CONSULTATION_CONTACT,
    telegramChannel: MAIN_COMMUNITY_DEFAULTS.TELEGRAM_CHANNEL,

    // Локализация
    defaultLocale: MAIN_COMMUNITY_DEFAULTS.DEFAULT_LOCALE,
    defaultCity: MAIN_COMMUNITY_DEFAULTS.DEFAULT_CITY,
    timezone: MAIN_COMMUNITY_DEFAULTS.DEFAULT_TIMEZONE,

    // URLs
    supabaseUrl: getEnv(ENV_KEYS.SUPABASE_URL, ''),
    supabaseAnonKey: getEnv(ENV_KEYS.SUPABASE_ANON_KEY, ''),

    // Tenant
    tenantId: getEnv(ENV_KEYS.TENANT_ID, null),
    tenantSlug: getEnv(ENV_KEYS.TENANT_SLUG, null),

    // Features - все включены по умолчанию
    features: {
      networking: true,
      events: true,
      learning: true,
      achievements: true,
      leaderboard: true,
      referrals: true,
      subscriptions: true,
    },

    // Environment
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  };

  // Вычисляем bot link
  config.botLink = `https://t.me/${config.botUsername}`;

  // Сохраняем в window для отладки
  if (typeof window !== 'undefined') {
    (window as unknown as { __APP_CONFIG__: AppConfig }).__APP_CONFIG__ = config;
  }

  return config;
}

function getEnv<T>(key: string, defaultValue: T): T {
  const value = import.meta.env[key];
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value as unknown as T;
}

function applyThemeToDocument(colors: ThemeColors): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    // Конвертируем camelCase в kebab-case
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--color-${cssKey}`, value);
  });
}

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE GETTERS
// ═══════════════════════════════════════════════════════════════

/**
 * Получить название приложения
 */
export function getAppName(): string {
  return getConfig().appName;
}

/**
 * Получить ссылку на бота
 */
export function getBotLink(startapp?: string): string {
  const config = getConfig();
  if (startapp) {
    return `${config.botLink}?startapp=${startapp}`;
  }
  return config.botLink;
}

/**
 * Получить username бота (без @)
 */
export function getBotUsername(): string {
  return getConfig().botUsername;
}

/**
 * Получить ключ для localStorage
 */
export function getStorageKey(suffix?: string): string {
  const config = getConfig();
  return suffix ? `${config.storageKey}-${suffix}` : config.storageKey;
}

/**
 * Проверить включена ли фича
 */
export function isFeatureEnabled(feature: keyof TenantFeatures): boolean {
  return getConfig().features[feature] ?? false;
}

/**
 * Получить контакт поддержки
 */
export function getSupportContact(): string {
  return getConfig().supportContact;
}

/**
 * Получить контакт консультации
 */
export function getConsultationContact(): string {
  return getConfig().consultationContact;
}

/**
 * Получить ссылку на Telegram канал
 */
export function getTelegramChannel(): string {
  return getConfig().telegramChannel;
}

/**
 * Получить дефолтный город
 */
export function getDefaultCity(): string {
  return getConfig().defaultCity;
}

/**
 * Получить дефолтную локаль
 */
export function getDefaultLocale(): string {
  return getConfig().defaultLocale;
}

/**
 * Получить tenant ID (null если single-tenant mode)
 */
export function getTenantId(): string | null {
  return getConfig().tenantId;
}

/**
 * Проверить работаем ли в multi-tenant mode
 */
export function isMultiTenantMode(): boolean {
  return getConfig().tenantId !== null;
}

// ═══════════════════════════════════════════════════════════════
// GOD MODE / ADMIN CHECKS
// ═══════════════════════════════════════════════════════════════

/**
 * Список God Mode usernames (для обратной совместимости)
 * TODO: После миграции на БД - удалить этот массив
 * @deprecated Use database roles instead
 */
const GOD_MODE_USERNAMES = ['dmitryutlik', 'utlik_offer'] as const;

/**
 * Проверить является ли пользователь God Mode (legacy)
 * @deprecated Use checkUserRole from tenant.ts instead
 */
export function isGodModeUser(username: string | undefined | null): boolean {
  if (!username) return false;
  const normalized = username.toLowerCase().replace('@', '');
  return GOD_MODE_USERNAMES.includes(normalized as typeof GOD_MODE_USERNAMES[number]);
}

/**
 * Проверить является ли пользователь админом (legacy)
 * @deprecated Use checkUserRole from tenant.ts instead
 */
export function isAdminUser(username: string | undefined | null): boolean {
  return isGodModeUser(username);
}

// ═══════════════════════════════════════════════════════════════
// EXPORT CONFIG TYPES
// ═══════════════════════════════════════════════════════════════

export type { Tenant, TenantSettings, TenantFeatures, TenantTheme, ThemeColors };
export { FEATURE_FLAGS, SUBSCRIPTION_TIERS };
export type { SubscriptionTier };
