/**
 * God Mode - Block Types
 * Типы для конструктора блоков Mini App
 */

// ═══════════════════════════════════════════════════════════════
// ТИПЫ БЛОКОВ
// ═══════════════════════════════════════════════════════════════

export type BlockType =
  | 'hero'           // Главный баннер
  | 'events'         // Список событий
  | 'leaderboard'    // Таблица лидеров
  | 'network'        // Нетворкинг (рекомендации)
  | 'courses'        // Курсы и обучение
  | 'achievements'   // Достижения пользователя
  | 'profile'        // Мини-профиль
  | 'stats'          // Статистика сообщества
  | 'announcements'  // Объявления
  | 'custom_html';   // Кастомный HTML блок

// ═══════════════════════════════════════════════════════════════
// БАЗОВЫЙ БЛОК
// ═══════════════════════════════════════════════════════════════

export interface AppBlock<T extends BlockType = BlockType> {
  id: string;
  tenantId: string;
  blockType: T;
  position: number; // Порядок отображения (0, 1, 2, ...)
  title?: LocalizedString;
  config: BlockConfig<T>;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Локализованная строка
export interface LocalizedString {
  ru: string;
  en?: string;
  uk?: string;
}

// ═══════════════════════════════════════════════════════════════
// КОНФИГУРАЦИИ БЛОКОВ
// ═══════════════════════════════════════════════════════════════

export type BlockConfig<T extends BlockType> =
  T extends 'hero' ? HeroBlockConfig :
  T extends 'events' ? EventsBlockConfig :
  T extends 'leaderboard' ? LeaderboardBlockConfig :
  T extends 'network' ? NetworkBlockConfig :
  T extends 'courses' ? CoursesBlockConfig :
  T extends 'achievements' ? AchievementsBlockConfig :
  T extends 'profile' ? ProfileBlockConfig :
  T extends 'stats' ? StatsBlockConfig :
  T extends 'announcements' ? AnnouncementsBlockConfig :
  T extends 'custom_html' ? CustomHtmlBlockConfig :
  never;

// Hero Banner
export interface HeroBlockConfig {
  imageUrl?: string;
  title?: LocalizedString;
  subtitle?: LocalizedString;
  ctaText?: LocalizedString;
  ctaLink?: string;
  showLogo: boolean;
  gradientOverlay: boolean;
}

// Events List
export interface EventsBlockConfig {
  limit: number; // Сколько событий показывать
  showPastEvents: boolean;
  showRegistrationButton: boolean;
  layout: 'list' | 'cards' | 'carousel';
  filterByCategory?: string[];
}

// Leaderboard
export interface LeaderboardBlockConfig {
  limit: number; // Топ N пользователей
  period: 'week' | 'month' | 'all_time';
  showCurrentUser: boolean;
  metric: 'points' | 'events_attended' | 'referrals';
}

// Network (Recommendations)
export interface NetworkBlockConfig {
  limit: number;
  showCompatibilityScore: boolean;
  showSkills: boolean;
  enableSwiping: boolean;
}

// Courses
export interface CoursesBlockConfig {
  limit: number;
  showProgress: boolean;
  filterByTier?: ('free' | 'light' | 'pro')[];
  layout: 'grid' | 'list';
}

// Achievements
export interface AchievementsBlockConfig {
  showLocked: boolean;
  limit: number;
  layout: 'grid' | 'list';
  categories?: string[];
}

// Profile (mini)
export interface ProfileBlockConfig {
  showStats: boolean;
  showLevel: boolean;
  showNextAchievement: boolean;
  compactMode: boolean;
}

// Stats
export interface StatsBlockConfig {
  metrics: ('total_users' | 'total_events' | 'total_matches' | 'active_today')[];
  layout: 'row' | 'grid';
  animated: boolean;
}

// Announcements
export interface AnnouncementsBlockConfig {
  limit: number;
  autoRotate: boolean;
  rotationInterval: number; // секунды
  showDismissButton: boolean;
}

// Custom HTML
export interface CustomHtmlBlockConfig {
  html: string;
  css?: string;
  maxHeight?: string;
  sandbox: boolean; // Изолировать в iframe
}

// ═══════════════════════════════════════════════════════════════
// МЕТАДАННЫЕ БЛОКОВ (для UI конструктора)
// ═══════════════════════════════════════════════════════════════

export interface BlockMetadata {
  type: BlockType;
  name: string;
  description: string;
  icon: string;
  category: 'content' | 'engagement' | 'social' | 'custom';
  defaultConfig: Record<string, unknown>;
  configSchema: BlockConfigSchema;
}

export interface BlockConfigSchema {
  fields: BlockConfigField[];
}

export interface BlockConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'image' | 'localized_text';
  required: boolean;
  defaultValue: unknown;
  options?: { label: string; value: string }[]; // для select/multiselect
  min?: number; // для number
  max?: number;
  placeholder?: string;
}

// ═══════════════════════════════════════════════════════════════
// BLOCK REGISTRY
// ═══════════════════════════════════════════════════════════════

export const BLOCK_REGISTRY: Record<BlockType, BlockMetadata> = {
  hero: {
    type: 'hero',
    name: 'Hero Banner',
    description: 'Главный баннер с изображением и призывом к действию',
    icon: '🎯',
    category: 'content',
    defaultConfig: {
      showLogo: true,
      gradientOverlay: true,
    },
    configSchema: {
      fields: [
        { key: 'imageUrl', label: 'Изображение', type: 'image', required: false, defaultValue: '' },
        { key: 'title', label: 'Заголовок', type: 'localized_text', required: false, defaultValue: { ru: '' } },
        { key: 'subtitle', label: 'Подзаголовок', type: 'localized_text', required: false, defaultValue: { ru: '' } },
        { key: 'ctaText', label: 'Текст кнопки', type: 'localized_text', required: false, defaultValue: { ru: '' } },
        { key: 'ctaLink', label: 'Ссылка кнопки', type: 'text', required: false, defaultValue: '' },
        { key: 'showLogo', label: 'Показывать логотип', type: 'boolean', required: false, defaultValue: true },
        { key: 'gradientOverlay', label: 'Градиент поверх', type: 'boolean', required: false, defaultValue: true },
      ],
    },
  },

  events: {
    type: 'events',
    name: 'События',
    description: 'Список предстоящих событий сообщества',
    icon: '📅',
    category: 'content',
    defaultConfig: {
      limit: 5,
      showPastEvents: false,
      showRegistrationButton: true,
      layout: 'list',
    },
    configSchema: {
      fields: [
        { key: 'limit', label: 'Количество', type: 'number', required: true, defaultValue: 5, min: 1, max: 20 },
        { key: 'layout', label: 'Вид', type: 'select', required: true, defaultValue: 'list', options: [
          { label: 'Список', value: 'list' },
          { label: 'Карточки', value: 'cards' },
          { label: 'Карусель', value: 'carousel' },
        ]},
        { key: 'showPastEvents', label: 'Показывать прошедшие', type: 'boolean', required: false, defaultValue: false },
        { key: 'showRegistrationButton', label: 'Кнопка регистрации', type: 'boolean', required: false, defaultValue: true },
      ],
    },
  },

  leaderboard: {
    type: 'leaderboard',
    name: 'Лидерборд',
    description: 'Таблица лидеров сообщества',
    icon: '🏆',
    category: 'engagement',
    defaultConfig: {
      limit: 10,
      period: 'month',
      showCurrentUser: true,
      metric: 'points',
    },
    configSchema: {
      fields: [
        { key: 'limit', label: 'Топ N', type: 'number', required: true, defaultValue: 10, min: 3, max: 50 },
        { key: 'period', label: 'Период', type: 'select', required: true, defaultValue: 'month', options: [
          { label: 'Неделя', value: 'week' },
          { label: 'Месяц', value: 'month' },
          { label: 'Всё время', value: 'all_time' },
        ]},
        { key: 'metric', label: 'Метрика', type: 'select', required: true, defaultValue: 'points', options: [
          { label: 'Очки', value: 'points' },
          { label: 'События', value: 'events_attended' },
          { label: 'Рефералы', value: 'referrals' },
        ]},
        { key: 'showCurrentUser', label: 'Показывать текущего', type: 'boolean', required: false, defaultValue: true },
      ],
    },
  },

  network: {
    type: 'network',
    name: 'Нетворкинг',
    description: 'Рекомендации для знакомства',
    icon: '🤝',
    category: 'social',
    defaultConfig: {
      limit: 5,
      showCompatibilityScore: true,
      showSkills: true,
      enableSwiping: false,
    },
    configSchema: {
      fields: [
        { key: 'limit', label: 'Количество', type: 'number', required: true, defaultValue: 5, min: 1, max: 20 },
        { key: 'showCompatibilityScore', label: 'Показывать совместимость', type: 'boolean', required: false, defaultValue: true },
        { key: 'showSkills', label: 'Показывать навыки', type: 'boolean', required: false, defaultValue: true },
        { key: 'enableSwiping', label: 'Режим свайпов', type: 'boolean', required: false, defaultValue: false },
      ],
    },
  },

  courses: {
    type: 'courses',
    name: 'Курсы',
    description: 'Обучающие материалы и курсы',
    icon: '📚',
    category: 'content',
    defaultConfig: {
      limit: 6,
      showProgress: true,
      layout: 'grid',
    },
    configSchema: {
      fields: [
        { key: 'limit', label: 'Количество', type: 'number', required: true, defaultValue: 6, min: 1, max: 20 },
        { key: 'layout', label: 'Вид', type: 'select', required: true, defaultValue: 'grid', options: [
          { label: 'Сетка', value: 'grid' },
          { label: 'Список', value: 'list' },
        ]},
        { key: 'showProgress', label: 'Показывать прогресс', type: 'boolean', required: false, defaultValue: true },
      ],
    },
  },

  achievements: {
    type: 'achievements',
    name: 'Достижения',
    description: 'Достижения и бейджи пользователя',
    icon: '🎖️',
    category: 'engagement',
    defaultConfig: {
      showLocked: true,
      limit: 8,
      layout: 'grid',
    },
    configSchema: {
      fields: [
        { key: 'limit', label: 'Количество', type: 'number', required: true, defaultValue: 8, min: 1, max: 20 },
        { key: 'layout', label: 'Вид', type: 'select', required: true, defaultValue: 'grid', options: [
          { label: 'Сетка', value: 'grid' },
          { label: 'Список', value: 'list' },
        ]},
        { key: 'showLocked', label: 'Показывать заблокированные', type: 'boolean', required: false, defaultValue: true },
      ],
    },
  },

  profile: {
    type: 'profile',
    name: 'Профиль',
    description: 'Мини-карточка профиля пользователя',
    icon: '👤',
    category: 'social',
    defaultConfig: {
      showStats: true,
      showLevel: true,
      showNextAchievement: true,
      compactMode: false,
    },
    configSchema: {
      fields: [
        { key: 'showStats', label: 'Показывать статистику', type: 'boolean', required: false, defaultValue: true },
        { key: 'showLevel', label: 'Показывать уровень', type: 'boolean', required: false, defaultValue: true },
        { key: 'showNextAchievement', label: 'Следующее достижение', type: 'boolean', required: false, defaultValue: true },
        { key: 'compactMode', label: 'Компактный режим', type: 'boolean', required: false, defaultValue: false },
      ],
    },
  },

  stats: {
    type: 'stats',
    name: 'Статистика',
    description: 'Общая статистика сообщества',
    icon: '📊',
    category: 'content',
    defaultConfig: {
      metrics: ['total_users', 'total_events', 'active_today'],
      layout: 'row',
      animated: true,
    },
    configSchema: {
      fields: [
        { key: 'metrics', label: 'Метрики', type: 'multiselect', required: true, defaultValue: ['total_users', 'total_events'], options: [
          { label: 'Всего участников', value: 'total_users' },
          { label: 'Всего событий', value: 'total_events' },
          { label: 'Всего знакомств', value: 'total_matches' },
          { label: 'Активны сегодня', value: 'active_today' },
        ]},
        { key: 'layout', label: 'Вид', type: 'select', required: true, defaultValue: 'row', options: [
          { label: 'В ряд', value: 'row' },
          { label: 'Сетка', value: 'grid' },
        ]},
        { key: 'animated', label: 'Анимация чисел', type: 'boolean', required: false, defaultValue: true },
      ],
    },
  },

  announcements: {
    type: 'announcements',
    name: 'Объявления',
    description: 'Важные объявления и новости',
    icon: '📢',
    category: 'content',
    defaultConfig: {
      limit: 3,
      autoRotate: true,
      rotationInterval: 5,
      showDismissButton: true,
    },
    configSchema: {
      fields: [
        { key: 'limit', label: 'Количество', type: 'number', required: true, defaultValue: 3, min: 1, max: 10 },
        { key: 'autoRotate', label: 'Автопрокрутка', type: 'boolean', required: false, defaultValue: true },
        { key: 'rotationInterval', label: 'Интервал (сек)', type: 'number', required: false, defaultValue: 5, min: 2, max: 30 },
        { key: 'showDismissButton', label: 'Кнопка закрытия', type: 'boolean', required: false, defaultValue: true },
      ],
    },
  },

  custom_html: {
    type: 'custom_html',
    name: 'Кастомный блок',
    description: 'Произвольный HTML контент',
    icon: '🧩',
    category: 'custom',
    defaultConfig: {
      html: '<div>Ваш контент здесь</div>',
      css: '',
      sandbox: true,
    },
    configSchema: {
      fields: [
        { key: 'html', label: 'HTML код', type: 'text', required: true, defaultValue: '<div></div>' },
        { key: 'css', label: 'CSS стили', type: 'text', required: false, defaultValue: '' },
        { key: 'maxHeight', label: 'Макс. высота', type: 'text', required: false, defaultValue: '', placeholder: 'например: 300px' },
        { key: 'sandbox', label: 'Изолировать (iframe)', type: 'boolean', required: false, defaultValue: true },
      ],
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// DEFAULT BLOCKS (для нового tenant'а)
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_BLOCK_ORDER: BlockType[] = [
  'profile',
  'events',
  'leaderboard',
  'network',
  'achievements',
];
