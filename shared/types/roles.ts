/**
 * God Mode - Role Types
 * Типы для системы ролей и прав доступа
 */

// ═══════════════════════════════════════════════════════════════
// РОЛИ
// ═══════════════════════════════════════════════════════════════

export type AdminRole = 'god_mode' | 'partner_admin' | 'moderator';

export interface AdminUser {
  id: string;
  userId: string; // Supabase auth.users.id
  tenantId: string | null; // null для God Mode (доступ ко всем)
  role: AdminRole;
  telegramId?: number;
  telegramUsername?: string;
  permissions: Permissions;
  isActive: boolean;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════
// ПРАВА ДОСТУПА
// ═══════════════════════════════════════════════════════════════

export interface Permissions {
  // Управление tenant'ами
  tenants: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };

  // Управление пользователями
  users: {
    read: boolean;
    update: boolean;
    delete: boolean;
    ban: boolean;
  };

  // Конструктор блоков
  blocks: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };

  // Темы и брендинг
  themes: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };

  // События
  events: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    moderate: boolean;
  };

  // Курсы
  courses: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    publish: boolean;
  };

  // Глобальные настройки
  settings: {
    read: boolean;
    update: boolean;
  };

  // Статистика
  analytics: {
    read: boolean;
    export: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════
// ПРЕСЕТЫ ПРАВ ПО РОЛЯМ
// ═══════════════════════════════════════════════════════════════

export const GOD_MODE_PERMISSIONS: Permissions = {
  tenants: { create: true, read: true, update: true, delete: true },
  users: { read: true, update: true, delete: true, ban: true },
  blocks: { read: true, create: true, update: true, delete: true },
  themes: { read: true, create: true, update: true, delete: true },
  events: { read: true, create: true, update: true, delete: true, moderate: true },
  courses: { read: true, create: true, update: true, delete: true, publish: true },
  settings: { read: true, update: true },
  analytics: { read: true, export: true },
};

export const PARTNER_ADMIN_PERMISSIONS: Permissions = {
  tenants: { create: false, read: true, update: true, delete: false },
  users: { read: true, update: true, delete: false, ban: true },
  blocks: { read: true, create: true, update: true, delete: true },
  themes: { read: true, create: true, update: true, delete: true },
  events: { read: true, create: true, update: true, delete: true, moderate: true },
  courses: { read: true, create: true, update: true, delete: true, publish: true },
  settings: { read: true, update: true },
  analytics: { read: true, export: true },
};

export const MODERATOR_PERMISSIONS: Permissions = {
  tenants: { create: false, read: true, update: false, delete: false },
  users: { read: true, update: false, delete: false, ban: false },
  blocks: { read: true, create: false, update: false, delete: false },
  themes: { read: true, create: false, update: false, delete: false },
  events: { read: true, create: false, update: false, delete: false, moderate: true },
  courses: { read: true, create: false, update: false, delete: false, publish: false },
  settings: { read: true, update: false },
  analytics: { read: true, export: false },
};

// ═══════════════════════════════════════════════════════════════
// УТИЛИТЫ
// ═══════════════════════════════════════════════════════════════

export function getDefaultPermissions(role: AdminRole): Permissions {
  switch (role) {
    case 'god_mode':
      return GOD_MODE_PERMISSIONS;
    case 'partner_admin':
      return PARTNER_ADMIN_PERMISSIONS;
    case 'moderator':
      return MODERATOR_PERMISSIONS;
    default:
      return MODERATOR_PERMISSIONS;
  }
}

export function hasPermission(
  user: AdminUser,
  resource: keyof Permissions,
  action: string
): boolean {
  const resourcePerms = user.permissions[resource];
  if (!resourcePerms) return false;
  return (resourcePerms as Record<string, boolean>)[action] ?? false;
}

export function isGodMode(user: AdminUser): boolean {
  return user.role === 'god_mode';
}

export function isPartnerAdmin(user: AdminUser): boolean {
  return user.role === 'partner_admin';
}

export function isModerator(user: AdminUser): boolean {
  return user.role === 'moderator';
}

// ═══════════════════════════════════════════════════════════════
// ROLE METADATA
// ═══════════════════════════════════════════════════════════════

export const ROLE_METADATA: Record<AdminRole, { label: string; icon: string; description: string }> = {
  god_mode: {
    label: 'God Mode',
    icon: '🔱',
    description: 'Полный доступ ко всей платформе',
  },
  partner_admin: {
    label: 'Partner Admin',
    icon: '👑',
    description: 'Управление своим сообществом',
  },
  moderator: {
    label: 'Moderator',
    icon: '🛡️',
    description: 'Модерация и просмотр',
  },
};
