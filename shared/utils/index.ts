/**
 * God Mode - Shared Utilities
 */

/**
 * Генерирует slug из строки
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Генерирует уникальный startapp параметр
 */
export function generateStartappParam(tenantSlug: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${tenantSlug}-${randomSuffix}`;
}

/**
 * Форматирует Telegram username (убирает @)
 */
export function formatUsername(username: string): string {
  return username.startsWith('@') ? username.slice(1) : username;
}

/**
 * Создаёт Telegram deep link
 */
export function createTelegramLink(
  botUsername: string,
  startapp?: string
): string {
  const base = `https://t.me/${formatUsername(botUsername)}`;
  return startapp ? `${base}?startapp=${startapp}` : base;
}

/**
 * Проверяет валидность hex цвета
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Конвертирует hex в CSS переменную с alpha
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Безопасный JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Debounce функция
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Форматирует дату для отображения
 */
export function formatDate(
  date: string | Date,
  locale: string = 'ru-RU'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Pluralize для русского языка
 */
export function pluralizeRu(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}
