/**
 * God Mode - Dynamic Theme System
 * Система динамических тем для Mini App
 *
 * Темы загружаются из:
 * 1. CSS переменных (установленных из tenant config)
 * 2. Default theme colors (fallback)
 */

import type { ThemeColors, TenantTheme, ThemeFonts, ThemeBorderRadius } from '@shared/types';
import {
  DEFAULT_THEME_COLORS,
  DEFAULT_THEME_FONTS,
  DEFAULT_THEME_BORDER_RADIUS,
} from '@shared/types';

// ═══════════════════════════════════════════════════════════════
// THEME STATE
// ═══════════════════════════════════════════════════════════════

let _currentTheme: TenantTheme | null = null;
let _themeListeners: Array<(theme: TenantTheme) => void> = [];

/**
 * Получить текущую тему
 */
export function getCurrentTheme(): TenantTheme {
  if (!_currentTheme) {
    _currentTheme = createDefaultTheme();
  }
  return _currentTheme;
}

/**
 * Применить тему к приложению
 */
export function applyTheme(theme: TenantTheme): void {
  _currentTheme = theme;

  // Применяем CSS переменные
  applyColorsToCSS(theme.colors);
  applyFontsToCSS(theme.fonts);
  applyBorderRadiusToCSS(theme.borderRadius);

  // Уведомляем слушателей
  _themeListeners.forEach(listener => listener(theme));

  // Debug
  if (import.meta.env.DEV) {
    console.log('[Theme] Applied:', theme.name, theme.colors);
  }
}

/**
 * Подписаться на изменения темы
 */
export function onThemeChange(listener: (theme: TenantTheme) => void): () => void {
  _themeListeners.push(listener);
  return () => {
    _themeListeners = _themeListeners.filter(l => l !== listener);
  };
}

/**
 * Сбросить тему к дефолтной
 */
export function resetTheme(): void {
  applyTheme(createDefaultTheme());
}

// ═══════════════════════════════════════════════════════════════
// CSS VARIABLE HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Применить цвета как CSS переменные
 */
export function applyColorsToCSS(colors: ThemeColors): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Основные цвета
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-hover', colors.accentHover);
  root.style.setProperty('--color-bg-primary', colors.bgPrimary);
  root.style.setProperty('--color-bg-secondary', colors.bgSecondary);
  root.style.setProperty('--color-bg-card', colors.bgCard);
  root.style.setProperty('--color-bg-input', colors.bgInput);
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-text-muted', colors.textMuted);
  root.style.setProperty('--color-border', colors.border);

  // Семантические цвета
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-danger', colors.danger);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-info', colors.info);

  // Также устанавливаем Tailwind-совместимые переменные
  root.style.setProperty('--tw-color-accent', colors.accent);
  root.style.setProperty('--tw-color-success', colors.success);
  root.style.setProperty('--tw-color-danger', colors.danger);
  root.style.setProperty('--tw-color-warning', colors.warning);
}

/**
 * Применить шрифты как CSS переменные
 */
export function applyFontsToCSS(fonts: ThemeFonts): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--font-primary', fonts.primary);
  root.style.setProperty('--font-heading', fonts.heading);
  root.style.setProperty('--font-mono', fonts.mono);
}

/**
 * Применить border-radius как CSS переменные
 */
export function applyBorderRadiusToCSS(borderRadius: ThemeBorderRadius): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--radius-sm', borderRadius.sm);
  root.style.setProperty('--radius-md', borderRadius.md);
  root.style.setProperty('--radius-lg', borderRadius.lg);
  root.style.setProperty('--radius-xl', borderRadius.xl);
  root.style.setProperty('--radius-full', borderRadius.full);
}

/**
 * Получить значение CSS переменной
 */
export function getCSSVariable(name: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Получить цвет из текущей темы
 */
export function getThemeColor(key: keyof ThemeColors): string {
  return getCurrentTheme().colors[key];
}

// ═══════════════════════════════════════════════════════════════
// THEME CREATION HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Создать дефолтную тему
 */
export function createDefaultTheme(): TenantTheme {
  return {
    id: 'default',
    tenantId: '',
    name: 'Default Dark',
    colors: { ...DEFAULT_THEME_COLORS },
    fonts: { ...DEFAULT_THEME_FONTS },
    borderRadius: { ...DEFAULT_THEME_BORDER_RADIUS },
    isDefault: true,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Создать тему с частичными изменениями
 */
export function createThemeWithOverrides(
  overrides: Partial<ThemeColors>,
  baseName?: string
): TenantTheme {
  const base = createDefaultTheme();
  return {
    ...base,
    name: baseName || 'Custom Theme',
    colors: { ...base.colors, ...overrides },
    isDefault: false,
  };
}

/**
 * Сгенерировать CSS строку из темы (для экспорта)
 */
export function generateThemeCSS(theme: TenantTheme): string {
  const lines: string[] = [':root {'];

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    lines.push(`  --color-${cssKey}: ${value};`);
  });

  // Fonts
  Object.entries(theme.fonts).forEach(([key, value]) => {
    lines.push(`  --font-${key}: ${value};`);
  });

  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    lines.push(`  --radius-${key}: ${value};`);
  });

  lines.push('}');
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// THEME PRESETS
// ═══════════════════════════════════════════════════════════════

export const THEME_PRESETS: Record<string, Partial<ThemeColors>> = {
  // Текущая тема MAIN Community
  'main-community': {
    accent: '#c8ff00',
    accentHover: '#d4ff33',
  },

  // Синяя тема
  blue: {
    accent: '#3b82f6',
    accentHover: '#60a5fa',
  },

  // Фиолетовая тема
  purple: {
    accent: '#a855f7',
    accentHover: '#c084fc',
  },

  // Розовая тема
  pink: {
    accent: '#ec4899',
    accentHover: '#f472b6',
  },

  // Оранжевая тема
  orange: {
    accent: '#f97316',
    accentHover: '#fb923c',
  },

  // Зелёная тема
  green: {
    accent: '#22c55e',
    accentHover: '#4ade80',
  },

  // Красная тема
  red: {
    accent: '#ef4444',
    accentHover: '#f87171',
  },

  // Светлая тема (для будущего)
  light: {
    accent: '#c8ff00',
    accentHover: '#b8e600',
    bgPrimary: '#ffffff',
    bgSecondary: '#f5f5f5',
    bgCard: '#ffffff',
    bgInput: '#f0f0f0',
    textPrimary: '#0a0a0a',
    textSecondary: '#666666',
    textMuted: '#999999',
    border: '#e5e5e5',
  },
};

/**
 * Применить пресет темы
 */
export function applyThemePreset(presetName: keyof typeof THEME_PRESETS): void {
  const preset = THEME_PRESETS[presetName];
  if (!preset) {
    console.warn(`[Theme] Preset "${presetName}" not found`);
    return;
  }

  const theme = createThemeWithOverrides(preset, presetName);
  applyTheme(theme);
}

// ═══════════════════════════════════════════════════════════════
// COLOR UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Конвертировать HEX в RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Конвертировать RGB в HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Получить контрастный цвет текста (чёрный или белый)
 */
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#ffffff';

  // Формула яркости: https://www.w3.org/TR/AERT/#color-contrast
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

/**
 * Сделать цвет темнее/светлее
 */
export function adjustColor(hexColor: string, amount: number): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return hexColor;

  return rgbToHex(
    Math.max(0, Math.min(255, rgb.r + amount)),
    Math.max(0, Math.min(255, rgb.g + amount)),
    Math.max(0, Math.min(255, rgb.b + amount))
  );
}

/**
 * Сгенерировать hover цвет
 */
export function generateHoverColor(baseColor: string): string {
  return adjustColor(baseColor, 20);
}
