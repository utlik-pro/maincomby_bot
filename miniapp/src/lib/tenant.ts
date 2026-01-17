/**
 * God Mode - Tenant Context
 * Управление multi-tenancy для Mini App
 *
 * Этот модуль:
 * 1. Определяет текущего tenant'а (по домену, startapp параметру, или env)
 * 2. Загружает настройки tenant'а из БД
 * 3. Применяет тему и конфиг
 * 4. Проверяет роли пользователей
 */

import { supabase } from './supabase';
import { updateConfigFromTenant, getConfig, getTenantId } from './config';
import { applyTheme, createDefaultTheme } from './theme';
import type {
  Tenant,
  TenantTheme,
  TenantBot,
  AdminUser,
  AdminRole,
  AppBlock,
} from '@shared/types';
import { getDefaultPermissions, hasPermission } from '@shared/types';

// ═══════════════════════════════════════════════════════════════
// TENANT STATE
// ═══════════════════════════════════════════════════════════════

let _currentTenant: Tenant | null = null;
let _currentTheme: TenantTheme | null = null;
let _currentBlocks: AppBlock[] = [];
let _adminUser: AdminUser | null = null;
let _isInitialized = false;

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Инициализировать tenant context
 * Вызывается при старте приложения
 */
export async function initializeTenant(): Promise<void> {
  if (_isInitialized) return;

  try {
    // 1. Определяем tenant ID
    const tenantId = await detectTenantId();

    if (tenantId) {
      // 2. Загружаем tenant из БД
      const tenant = await fetchTenant(tenantId);

      if (tenant) {
        _currentTenant = tenant;

        // 3. Загружаем тему
        const theme = await fetchTenantTheme(tenantId);
        _currentTheme = theme || createDefaultTheme();

        // 4. Загружаем конфигурацию блоков
        _currentBlocks = await fetchTenantBlocks(tenantId);

        // 5. Применяем конфиг и тему
        updateConfigFromTenant(tenant, _currentTheme);
        applyTheme(_currentTheme);

        console.log('[Tenant] Initialized:', tenant.name);
      }
    } else {
      // Single-tenant mode - используем дефолты
      console.log('[Tenant] Single-tenant mode');
    }

    _isInitialized = true;
  } catch (error) {
    console.error('[Tenant] Initialization failed:', error);
    _isInitialized = true; // Продолжаем работу с дефолтами
  }
}

/**
 * Определить tenant ID из различных источников
 */
async function detectTenantId(): Promise<string | null> {
  // 1. Из env переменной (для разработки или статического деплоя)
  const envTenantId = getTenantId();
  if (envTenantId) return envTenantId;

  // 2. Из Telegram startapp параметра
  const startappParam = getStartappParam();
  if (startappParam) {
    const tenantId = await resolveTenantByStartapp(startappParam);
    if (tenantId) return tenantId;
  }

  // 3. Из домена (для кастомных доменов)
  const domain = window.location.hostname;
  if (domain && domain !== 'localhost') {
    const tenantId = await resolveTenantByDomain(domain);
    if (tenantId) return tenantId;
  }

  return null;
}

/**
 * Получить startapp параметр из Telegram Web App
 */
function getStartappParam(): string | null {
  try {
    const tg = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { start_param?: string } } } }).Telegram;
    return tg?.WebApp?.initDataUnsafe?.start_param || null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// DATABASE OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Загрузить tenant из БД
 */
async function fetchTenant(tenantId: string): Promise<Tenant | null> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      domain: data.domain,
      logoUrl: data.logo_url,
      isActive: data.is_active,
      settings: data.settings || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Tenant;
  } catch {
    return null;
  }
}

/**
 * Найти tenant по startapp параметру
 */
async function resolveTenantByStartapp(startapp: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('tenant_bots')
      .select('tenant_id')
      .eq('startapp_param', startapp)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data.tenant_id;
  } catch {
    return null;
  }
}

/**
 * Найти tenant по домену
 */
async function resolveTenantByDomain(domain: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .eq('domain', domain)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
}

/**
 * Загрузить тему tenant'а
 */
async function fetchTenantTheme(tenantId: string): Promise<TenantTheme | null> {
  try {
    const { data, error } = await supabase
      .from('tenant_themes')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_default', true)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      colors: data.colors,
      fonts: data.fonts,
      borderRadius: data.border_radius,
      isDefault: data.is_default,
      createdAt: data.created_at,
    } as TenantTheme;
  } catch {
    return null;
  }
}

/**
 * Загрузить блоки tenant'а
 */
async function fetchTenantBlocks(tenantId: string): Promise<AppBlock[]> {
  try {
    const { data, error } = await supabase
      .from('app_blocks')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_visible', true)
      .order('position', { ascending: true });

    if (error || !data) return [];

    return data.map((block: {
      id: string;
      tenant_id: string;
      block_type: string;
      position: number;
      title: unknown;
      config: unknown;
      is_visible: boolean;
      created_at: string;
      updated_at: string;
    }) => ({
      id: block.id,
      tenantId: block.tenant_id,
      blockType: block.block_type,
      position: block.position,
      title: block.title,
      config: block.config,
      isVisible: block.is_visible,
      createdAt: block.created_at,
      updatedAt: block.updated_at,
    })) as AppBlock[];
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// ROLE & PERMISSION CHECKS
// ═══════════════════════════════════════════════════════════════

/**
 * Загрузить информацию о роли пользователя
 */
export async function loadUserRole(telegramId: number): Promise<AdminUser | null> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('telegram_id', telegramId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      _adminUser = null;
      return null;
    }

    _adminUser = {
      id: data.id,
      userId: data.user_id,
      tenantId: data.tenant_id,
      role: data.role as AdminRole,
      telegramId: data.telegram_id,
      telegramUsername: data.telegram_username,
      permissions: data.permissions || getDefaultPermissions(data.role as AdminRole),
      isActive: data.is_active,
      createdAt: data.created_at,
    };

    return _adminUser;
  } catch {
    return null;
  }
}

/**
 * Проверить является ли пользователь God Mode
 */
export function isGodMode(): boolean {
  return _adminUser?.role === 'god_mode';
}

/**
 * Проверить является ли пользователь Partner Admin
 */
export function isPartnerAdmin(): boolean {
  return _adminUser?.role === 'partner_admin';
}

/**
 * Проверить является ли пользователь Moderator или выше
 */
export function isModeratorOrAbove(): boolean {
  return _adminUser !== null && ['god_mode', 'partner_admin', 'moderator'].includes(_adminUser.role);
}

/**
 * Проверить есть ли у пользователя определённое право
 */
export function checkPermission(resource: string, action: string): boolean {
  if (!_adminUser) return false;
  return hasPermission(_adminUser, resource as keyof typeof _adminUser.permissions, action);
}

/**
 * Получить роль текущего пользователя
 */
export function getCurrentUserRole(): AdminRole | null {
  return _adminUser?.role || null;
}

/**
 * Получить информацию о текущем админе
 */
export function getCurrentAdminUser(): AdminUser | null {
  return _adminUser;
}

// ═══════════════════════════════════════════════════════════════
// GETTERS
// ═══════════════════════════════════════════════════════════════

/**
 * Получить текущего tenant'а
 */
export function getCurrentTenant(): Tenant | null {
  return _currentTenant;
}

/**
 * Получить текущую тему tenant'а
 */
export function getTenantTheme(): TenantTheme | null {
  return _currentTheme;
}

/**
 * Получить блоки текущего tenant'а
 */
export function getTenantBlocks(): AppBlock[] {
  return _currentBlocks;
}

/**
 * Проверить инициализирован ли tenant
 */
export function isTenantInitialized(): boolean {
  return _isInitialized;
}

/**
 * Проверить работаем ли в multi-tenant режиме
 */
export function isMultiTenant(): boolean {
  return _currentTenant !== null;
}

// ═══════════════════════════════════════════════════════════════
// BOT UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Получить информацию о боте tenant'а
 */
export async function getTenantBot(): Promise<TenantBot | null> {
  const tenantId = _currentTenant?.id;
  if (!tenantId) return null;

  try {
    const { data, error } = await supabase
      .from('tenant_bots')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      tenantId: data.tenant_id,
      botType: data.bot_type as 'own' | 'shared',
      botTokenEncrypted: data.bot_token_encrypted,
      botUsername: data.bot_username,
      webhookUrl: data.webhook_url,
      startappParam: data.startapp_param,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Сгенерировать ссылку на бота для текущего tenant'а
 */
export async function getTenantBotLink(path?: string): Promise<string> {
  const config = getConfig();
  const bot = await getTenantBot();

  let baseLink: string;

  if (bot?.botType === 'own' && bot.botUsername) {
    // Свой бот
    baseLink = `https://t.me/${bot.botUsername}`;
  } else if (bot?.botType === 'shared' && bot.startappParam) {
    // Общий бот с startapp параметром
    baseLink = `https://t.me/${config.botUsername}?startapp=${bot.startappParam}`;
  } else {
    // Fallback на дефолтный бот
    baseLink = config.botLink;
  }

  return path ? `${baseLink}${path.startsWith('/') ? '' : '/'}${path}` : baseLink;
}

// ═══════════════════════════════════════════════════════════════
// RESET & CLEANUP
// ═══════════════════════════════════════════════════════════════

/**
 * Сбросить tenant context
 */
export function resetTenantContext(): void {
  _currentTenant = null;
  _currentTheme = null;
  _currentBlocks = [];
  _adminUser = null;
  _isInitialized = false;
}

// ═══════════════════════════════════════════════════════════════
// PREVIEW MODE SUPPORT
// ═══════════════════════════════════════════════════════════════

/**
 * Проверить работаем ли в preview режиме (для Builder)
 */
export function isPreviewMode(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('preview') === 'true';
}

/**
 * Получить tenant ID из URL параметра (для preview mode)
 */
export function getTenantIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('tenant');
}

/**
 * Перезагрузить блоки tenant'а из БД
 * Используется в preview mode для получения актуальных данных
 */
export async function refetchTenantBlocks(): Promise<AppBlock[]> {
  // Сначала пробуем взять tenant ID из URL (preview mode)
  let tenantId = getTenantIdFromUrl();

  // Если нет в URL, берём из текущего tenant
  if (!tenantId && _currentTenant) {
    tenantId = _currentTenant.id;
  }

  if (!tenantId) {
    return [];
  }

  const blocks = await fetchTenantBlocks(tenantId);
  _currentBlocks = blocks;
  return blocks;
}

/**
 * Инициализация для preview mode
 * Принимает tenant ID напрямую из URL
 */
export async function initializePreviewMode(): Promise<void> {
  const tenantId = getTenantIdFromUrl();

  if (!tenantId) {
    console.log('[Tenant] Preview mode: no tenant ID in URL');
    _isInitialized = true;
    return;
  }

  try {
    // Загружаем tenant
    const tenant = await fetchTenant(tenantId);

    if (tenant) {
      _currentTenant = tenant;

      // Загружаем тему
      const theme = await fetchTenantTheme(tenantId);
      _currentTheme = theme || createDefaultTheme();

      // Загружаем блоки
      _currentBlocks = await fetchTenantBlocks(tenantId);

      // Применяем конфиг и тему
      updateConfigFromTenant(tenant, _currentTheme);
      applyTheme(_currentTheme);

      console.log('[Tenant] Preview mode initialized:', tenant.name);
    }

    _isInitialized = true;
  } catch (error) {
    console.error('[Tenant] Preview mode initialization failed:', error);
    _isInitialized = true;
  }
}
