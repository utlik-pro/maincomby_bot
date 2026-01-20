/**
 * God Mode - Types
 */

// Re-export shared types
// Note: In production, you'd set up proper monorepo with shared package
// For now, we duplicate key types

export type AdminRole = 'god_mode' | 'partner_admin' | 'moderator'

export interface AdminUser {
  id: string
  user_id: string | null
  tenant_id: string | null
  role: AdminRole
  telegram_id: number | null
  telegram_username: string | null
  permissions: Record<string, Record<string, boolean>>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  domain: string | null
  logo_url: string | null
  is_active: boolean
  settings: TenantSettings
  created_at: string
  updated_at: string
}

export interface TenantSettings {
  appName: string
  defaultLocale: 'ru' | 'en' | 'uk'
  defaultCity: string
  timezone: string
  supportContact?: string
  consultationContact?: string
  telegramChannel?: string
  features: TenantFeatures
}

export interface TenantFeatures {
  networking: boolean
  events: boolean
  learning: boolean
  achievements: boolean
  leaderboard: boolean
  referrals: boolean
  subscriptions: boolean
}

export interface TenantTheme {
  id: string
  tenant_id: string
  name: string
  colors: ThemeColors
  fonts: ThemeFonts
  border_radius: ThemeBorderRadius
  is_default: boolean
  created_at: string
}

export interface ThemeColors {
  accent: string
  accentHover: string
  bgPrimary: string
  bgSecondary: string
  bgCard: string
  bgInput: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  success: string
  danger: string
  warning: string
  info: string
}

export interface ThemeFonts {
  primary: string
  heading: string
  mono: string
}

export interface ThemeBorderRadius {
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

export interface TenantBot {
  id: string
  tenant_id: string
  bot_type: 'own' | 'shared'
  bot_token_encrypted: string | null
  bot_username: string | null
  webhook_url: string | null
  startapp_param: string | null
  is_active: boolean
  created_at: string
}

export interface AppBlock {
  id: string
  tenant_id: string
  block_type: BlockType
  position: number
  title: Record<string, string> | null
  config: Record<string, unknown>
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type BlockType =
  | 'hero'
  | 'events'
  | 'leaderboard'
  | 'network'
  | 'courses'
  | 'achievements'
  | 'profile'
  | 'stats'
  | 'announcements'
  | 'custom_html'

// Dashboard stats
export interface DashboardStats {
  totalUsers: number
  totalEvents: number
  totalMatches: number
  activeToday: number
  tenantCount: number
}
