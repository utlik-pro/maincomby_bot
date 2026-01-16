# God Mode: Глобальная Админ-панель White-Label Платформы

> **Ветка разработки:** `feature/god-mode-admin`
> **Точка отката:** тег `v1.0-stable`
> **Дата создания:** 2026-01-16

---

## Содержание

1. [Обзор](#обзор)
2. [Архитектура](#архитектура)
3. [Система ролей](#система-ролей)
4. [База данных](#база-данных)
5. [Фазы реализации](#фазы-реализации)
6. [Файлы и структура](#файлы-и-структура)

---

## Обзор

### Цель
Создать глобальную админ-панель "God Mode" для управления white-label платформой сообществ.

### Ключевые возможности
- 🎯 **Конструктор блоков** — drag-n-drop сборка Mini App
- 🎨 **Конструктор тем** — визуальный редактор брендинга
- 👥 **Мультитенантность** — изоляция данных партнёров
- 🤖 **Управление ботами** — свой бот ИЛИ общий с startapp
- 📚 **CMS курсов** — редактор без деплоя
- 🔐 **Иерархия ролей** — God Mode → Partner Admin → Moderator

### Готовность к White-Label: ~35%

| Компонент | Готовность | Критичность |
|-----------|-----------|-------------|
| UI Компоненты | 70% | Высокая |
| State Management | 80% | Средняя |
| Telegram API | 90% | Высокая |
| Branding/Colors | 10% | Критичная |
| Config System | 0% | Критичная |
| Multi-tenancy | 15% | Критичная |
| i18n | 5% | Средняя |
| RLS Security | 30% | Критичная |

---

## Архитектура

### Текущая структура
```
maincomby_bot/
├── app/                    # Python Telegram Bot (aiogram 3)
├── miniapp/                # React 18 + TypeScript + Vite (Mini App)
│   ├── landing/           # Next.js 16 (Landing + Courses)
│   ├── supabase/          # Миграции БД
│   └── api/               # Vercel serverless functions
└── scripts/               # Utility скрипты
```

### Целевая структура
```
maincomby_bot/
├── admin/                          # 🆕 God Mode админ-панель
│   ├── src/
│   │   ├── app/                   # Next.js App Router
│   │   │   ├── dashboard/         # Главная панель
│   │   │   ├── tenants/           # Управление партнёрами
│   │   │   ├── builder/           # Конструктор блоков
│   │   │   ├── themes/            # Визуальный конструктор тем
│   │   │   ├── courses/           # CMS для курсов
│   │   │   ├── users/             # Управление пользователями
│   │   │   └── settings/          # Глобальные настройки
│   │   ├── components/
│   │   │   ├── visual-builder/    # Drag-n-drop конструктор
│   │   │   ├── theme-editor/      # Редактор цветов
│   │   │   └── block-library/     # Библиотека блоков
│   │   └── lib/
│   │       ├── supabase-admin.ts  # Admin API
│   │       └── tenant-context.ts  # Multi-tenancy
│   └── package.json
├── app/                            # Telegram Bot (без изменений)
├── miniapp/                        # Mini App (рефакторинг)
│   ├── src/
│   │   └── lib/
│   │       ├── config.ts          # 🆕 Централизованный конфиг
│   │       ├── theme.ts           # 🆕 Динамические темы
│   │       └── i18n.ts            # 🆕 Интернационализация
│   └── landing/                   # Landing (рефакторинг)
└── shared/                         # 🆕 Общий код
    ├── types/                     # TypeScript интерфейсы
    ├── constants/                 # Общие константы
    └── utils/                     # Утилиты
```

---

## Система ролей

### Иерархия

```
🔱 GOD MODE (Super Admin)
│   └── Полный доступ ко всей платформе
│   └── Создание и управление партнёрами
│   └── Глобальные настройки
│
├── 👑 PARTNER ADMIN
│   └── Управление своим tenant'ом
│   └── Конструктор блоков и тем
│   └── Управление пользователями
│   └── Создание Moderator'ов
│
└── 🛡️ MODERATOR
    └── Просмотр данных
    └── Модерация контента
    └── Ограниченное редактирование
```

### Права доступа

| Действие | God Mode | Partner Admin | Moderator |
|----------|:--------:|:-------------:|:---------:|
| Создать tenant | ✅ | ❌ | ❌ |
| Редактировать tenant | ✅ | Свой | ❌ |
| Конструктор блоков | ✅ | Свой | ❌ |
| Редактор тем | ✅ | Свой | ❌ |
| Управление пользователями | ✅ | Свой | 👁️ |
| CMS курсов | ✅ | Свой | 👁️ |
| Глобальные настройки | ✅ | ❌ | ❌ |
| Статистика | ✅ | Свой | Свой |

---

## База данных

### Новые таблицы

```sql
-- ═══════════════════════════════════════════════════════════════
-- MULTI-TENANCY
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT,
  bot_username TEXT,
  bot_token_encrypted TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- РОЛИ И ПРАВА
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE admin_role AS ENUM ('god_mode', 'partner_admin', 'moderator');

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id), -- NULL для God Mode
  role admin_role NOT NULL,
  telegram_id BIGINT,
  telegram_username TEXT,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ТЕМЫ И БРЕНДИНГ
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE tenant_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  colors JSONB NOT NULL DEFAULT '{
    "accent": "#c8ff00",
    "bgPrimary": "#0a0a0a",
    "bgSecondary": "#1a1a1a",
    "bgCard": "#141414",
    "textPrimary": "#ffffff",
    "textSecondary": "#a0a0a0",
    "success": "#22c55e",
    "danger": "#ef4444",
    "warning": "#f59e0b"
  }',
  fonts JSONB DEFAULT '{"primary": "Inter", "heading": "Inter"}',
  border_radius JSONB DEFAULT '{"sm": "8px", "md": "12px", "lg": "16px"}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- КОНСТРУКТОР БЛОКОВ
-- ═══════════════════════════════════════════════════════════════

CREATE TYPE block_type AS ENUM (
  'hero', 'events', 'leaderboard', 'network',
  'courses', 'achievements', 'profile', 'custom_html'
);

CREATE TABLE app_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  block_type block_type NOT NULL,
  position INTEGER NOT NULL,
  title JSONB, -- {"ru": "...", "en": "..."}
  config JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ФИЧИ TENANT'А
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL, -- 'networking', 'events', 'learning', 'achievements'
  is_enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  UNIQUE(tenant_id, feature_key)
);

-- ═══════════════════════════════════════════════════════════════
-- ПРИВЯЗКА БОТОВ
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE tenant_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  bot_type TEXT NOT NULL CHECK (bot_type IN ('own', 'shared')),
  -- Для own бота:
  bot_token_encrypted TEXT,
  bot_username TEXT,
  webhook_url TEXT,
  -- Для shared бота:
  startapp_param TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ПЕРЕВОДЫ
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, locale, key)
);

-- ═══════════════════════════════════════════════════════════════
-- CMS КУРСОВ
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE cms_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title JSONB NOT NULL, -- {"ru": "...", "en": "..."}
  description JSONB,
  cover_url TEXT,
  content JSONB, -- Структурированные уроки
  is_published BOOLEAN DEFAULT false,
  access_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- ═══════════════════════════════════════════════════════════════
-- ИНДЕКСЫ
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX idx_admin_users_tenant ON admin_users(tenant_id);
CREATE INDEX idx_admin_users_telegram ON admin_users(telegram_id);
CREATE INDEX idx_tenant_themes_tenant ON tenant_themes(tenant_id);
CREATE INDEX idx_app_blocks_tenant ON app_blocks(tenant_id);
CREATE INDEX idx_app_blocks_position ON app_blocks(tenant_id, position);
CREATE INDEX idx_tenant_features_tenant ON tenant_features(tenant_id);
CREATE INDEX idx_translations_lookup ON translations(tenant_id, locale, key);
```

### RLS Политики

```sql
-- God Mode видит всё
CREATE POLICY "god_mode_full_access" ON tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'god_mode'
    )
  );

-- Partner Admin видит только свой tenant
CREATE POLICY "partner_admin_own_tenant" ON tenants
  FOR ALL USING (
    id IN (
      SELECT tenant_id FROM admin_users
      WHERE user_id = auth.uid()
      AND role IN ('partner_admin', 'moderator')
    )
  );

-- Аналогичные политики для остальных таблиц...
```

---

## Фазы реализации

### Фаза 1: Фундамент ⏱️
**Срок:** ~1-2 недели

**Цель:** Подготовить кодовую базу к multi-tenancy

#### Задачи:
1. ✅ Создать ветку `feature/god-mode-admin`
2. ⬜ Создать `shared/` директорию с типами
3. ⬜ Создать `miniapp/src/lib/config.ts`
4. ⬜ Рефакторинг 120+ hardcoded значений
5. ⬜ Миграции БД для multi-tenancy
6. ⬜ Обновить RLS политики

#### Файлы:
```
shared/
├── types/
│   ├── tenant.ts          # Tenant, TenantTheme interfaces
│   ├── roles.ts           # AdminRole, Permission interfaces
│   └── blocks.ts          # BlockType, BlockConfig interfaces
└── constants/
    └── blocks.ts          # BLOCK_TYPES, DEFAULT_BLOCKS

miniapp/src/lib/
├── config.ts              # Централизованный конфиг
├── theme.ts               # Динамические темы
├── blocks.ts              # Загрузка конфигурации блоков
└── tenant.ts              # Tenant context
```

---

### Фаза 2: Админ-панель MVP ⏱️
**Срок:** ~2-3 недели

**Цель:** Базовая админка с аутентификацией

#### Задачи:
1. ⬜ Инициализация `admin/` проекта (Next.js 15)
2. ⬜ Система аутентификации (Supabase Auth)
3. ⬜ Middleware проверки ролей
4. ⬜ Dashboard со статистикой
5. ⬜ CRUD для tenants

#### Структура:
```
admin/
├── src/app/
│   ├── (auth)/login/page.tsx
│   ├── dashboard/page.tsx
│   ├── tenants/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── new/page.tsx
│   └── layout.tsx
├── src/components/
│   ├── sidebar/Sidebar.tsx
│   └── ui/ (shadcn)
└── src/lib/
    ├── supabase.ts
    ├── auth.ts
    └── roles.ts
```

---

### Фаза 3: Конструктор блоков ⭐ ПРИОРИТЕТ
**Срок:** ~2-3 недели

**Цель:** Визуальный drag-n-drop конструктор

#### Библиотека блоков:
```typescript
const BLOCK_TYPES = {
  hero: { name: 'Hero Banner', icon: '🎯', props: {...} },
  events: { name: 'События', icon: '📅', props: {...} },
  leaderboard: { name: 'Лидерборд', icon: '🏆', props: {...} },
  network: { name: 'Нетворкинг', icon: '🤝', props: {...} },
  courses: { name: 'Курсы', icon: '📚', props: {...} },
  achievements: { name: 'Достижения', icon: '🎖️', props: {...} },
  profile: { name: 'Профиль', icon: '👤', props: {...} },
  custom_html: { name: 'Кастомный блок', icon: '🧩', props: {...} },
}
```

#### Задачи:
1. ⬜ Создать библиотеку блоков
2. ⬜ Drag-n-drop интерфейс (@dnd-kit/core)
3. ⬜ Live Preview в iframe
4. ⬜ Сохранение конфигурации в БД
5. ⬜ Рендеринг в Mini App по конфигурации

---

### Фаза 4: Конструктор тем ⏱️
**Срок:** ~1-2 недели

**Цель:** Визуальный редактор цветовой схемы

#### Задачи:
1. ⬜ Color picker для всех цветов
2. ⬜ Загрузка логотипа (Supabase Storage)
3. ⬜ CSS переменные в Mini App
4. ⬜ Export/Import тем

---

### Фаза 5: Управление партнёрами ⏱️
**Срок:** ~2 недели

**Цель:** Полное управление аккаунтами

#### Задачи:
1. ⬜ Форма создания партнёра
2. ⬜ Настройка бота (свой ИЛИ startapp)
3. ⬜ Sub-админы (Partner Admin → Moderator)
4. ⬜ Биллинг (опционально)

---

### Фаза 6: CMS курсов ⏱️
**Срок:** ~2 недели

**Цель:** Редактор курсов без деплоя

#### Задачи:
1. ⬜ WYSIWYG редактор (Tiptap)
2. ⬜ Структура: Модули → Уроки → Контент
3. ⬜ Миграция HTML курсов
4. ⬜ Управление доступом

---

## Файлы и структура

### Рефакторинг Mini App

| Файл | Изменения |
|------|-----------|
| `miniapp/src/lib/config.ts` | 🆕 Централизованный конфиг |
| `miniapp/src/lib/theme.ts` | 🆕 Динамические темы |
| `miniapp/src/lib/blocks.ts` | 🆕 Загрузка конфигурации блоков |
| `miniapp/src/lib/tenant.ts` | 🆕 Tenant context |
| `miniapp/src/App.tsx` | Заменить hardcoded на config calls |
| `miniapp/src/lib/store.ts` | Динамический localStorage key |
| `miniapp/src/lib/telegram.ts` | Параметризация bot links |
| `miniapp/src/lib/supabase.ts` | Добавить tenant_id в запросы |
| `miniapp/src/components/Navigation.tsx` | Динамические labels |
| `miniapp/src/components/LogoHeader.tsx` | Динамический логотип |
| `miniapp/src/components/AdminSettingsPanel.tsx` | Проверка ролей через БД |
| `miniapp/tailwind.config.js` | CSS переменные |
| `miniapp/src/index.css` | CSS custom properties |

### Миграции БД

```
miniapp/supabase/migrations/
├── 20260116_001_add_tenants.sql
├── 20260116_002_add_admin_roles.sql
├── 20260116_003_add_tenant_themes.sql
├── 20260116_004_add_app_blocks.sql
├── 20260116_005_add_tenant_features.sql
├── 20260116_006_add_tenant_bots.sql
├── 20260116_007_add_translations.sql
├── 20260116_008_add_cms_courses.sql
└── 20260116_009_update_rls_policies.sql
```

---

## Технологический стек

| Компонент | Технология | Почему |
|-----------|------------|--------|
| Framework | Next.js 15 | App Router, Server Components |
| UI Library | shadcn/ui | Готовые компоненты, кастомизация |
| Styling | Tailwind CSS 4 | Консистентность с Mini App |
| Drag-n-Drop | @dnd-kit/core | Современный, доступный |
| Forms | react-hook-form + zod | Валидация, типизация |
| State | Zustand | Лёгкий, знакомый |
| Auth | Supabase Auth | Уже используется |
| Editor | Tiptap | WYSIWYG для курсов |
| Charts | Recharts | Dashboard статистика |

---

## Выявленные проблемы (HARDCODED)

### 120+ мест для рефакторинга:

**Telegram Bot:**
- `@maincomapp_bot` → `config.botUsername`
- `https://t.me/maincomapp_bot?startapp=...` → `config.botLink`

**Брендинг:**
- `"MAIN Community"` в 50+ местах → `config.appName`
- `/logo.png` → `config.logoUrl`
- `#c8ff00` → `theme.colors.accent`
- `'main-community-app'` localStorage → `config.storageKey`

**Админы (НЕБЕЗОПАСНО!):**
- `['dmitryutlik', 'utlik_offer']` → проверка через БД
- `dmitryutlik` как контакт → `config.supportContact`
- `yana_martynen` как support → `config.supportContact`

**Локализация:**
- `'Минск'` → `config.defaultCity`
- `'ru-RU'` → `config.defaultLocale`
- Все UI тексты → i18n система

---

## Верификация

### После каждой фазы:

```bash
# 1. Проверить что Mini App запускается
cd miniapp && npm run dev

# 2. Запустить тесты
npm test

# 3. Проверить TypeScript
npm run typecheck

# 4. Проверить миграции
supabase db push --dry-run
```

### Критерии успеха:

- [ ] God Mode может создать нового партнёра
- [ ] Partner Admin видит только свои данные
- [ ] Конструктор блоков сохраняет конфигурацию
- [ ] Mini App рендерит блоки по конфигурации tenant'а
- [ ] Темы применяются через CSS переменные
- [ ] Боты привязываются (свой токен ИЛИ startapp)
- [ ] RLS политики изолируют данные по tenant_id
- [ ] CMS курсов работает без git commit

---

## Риски и митигация

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| RLS миграции сломают текущее приложение | Высокая | Backward-compatible миграции, staging |
| Конструктор блоков сложнее чем кажется | Средняя | Начать с 3-4 базовых блоков |
| Производительность с tenant context | Низкая | Индексы на tenant_id, кеширование |
| Партнёры не разберутся | Средняя | Onboarding wizard, tooltips |

---

## Git стратегия

```
main (production)
│
├── v1.0-stable (тег - точка возврата)
│
└── feature/god-mode-admin (текущая ветка)
    ├── feature/god-mode-foundation     # Фаза 1
    ├── feature/god-mode-mvp            # Фаза 2
    ├── feature/god-mode-block-builder  # Фаза 3
    ├── feature/god-mode-themes         # Фаза 4
    ├── feature/god-mode-partners       # Фаза 5
    └── feature/god-mode-cms            # Фаза 6
```

**Команды:**
```bash
# Откат к стабильной версии
git checkout v1.0-stable

# Вернуться к разработке
git checkout feature/god-mode-admin

# Мерж фазы в основную ветку
git checkout feature/god-mode-admin
git merge feature/god-mode-foundation
```
