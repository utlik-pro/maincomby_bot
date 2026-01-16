# God Mode - Changelog

> История разработки white-label админ-панели

---

## [Unreleased]

### Planned
- Фаза 2: Админ-панель MVP (Next.js 15)
- Фаза 3: Конструктор блоков (drag-n-drop)
- Фаза 4: Конструктор тем
- Фаза 5: Управление партнёрами
- Фаза 6: CMS курсов

---

## [0.1.0] - 2026-01-16

### Фаза 1: Фундамент

**Ветка:** `feature/god-mode-admin`
**Коммит:** `a595772`
**Файлов изменено:** 21
**Строк добавлено:** +3308

#### Added

##### Shared Types (`shared/types/`)
- `tenant.ts` — Интерфейсы Tenant, TenantSettings, TenantTheme, ThemeColors
- `roles.ts` — AdminRole (god_mode, partner_admin, moderator), Permissions с пресетами
- `blocks.ts` — BlockType (10 типов), BlockConfig, полный BLOCK_REGISTRY с метаданными
- `index.ts` — Реэкспорт всех типов

##### Shared Constants (`shared/constants/`)
- `defaults.ts` — MAIN_COMMUNITY_DEFAULTS, ENV_KEYS, FEATURE_FLAGS, SUBSCRIPTION_TIERS, UI_CONSTANTS, ROUTES
- `index.ts` — Реэкспорт

##### Shared Utils (`shared/utils/`)
- `slugify()` — Генерация slug из строки
- `generateStartappParam()` — Генерация уникального startapp
- `formatUsername()` — Форматирование Telegram username
- `createTelegramLink()` — Создание deep links
- `isValidHexColor()` — Валидация hex цвета
- `hexToRgba()` — Конвертация hex в rgba
- `safeJsonParse()` — Безопасный JSON parse
- `debounce()` — Debounce функция
- `formatDate()` — Форматирование даты
- `pluralizeRu()` — Плюрализация для русского языка

##### Mini App Config (`miniapp/src/lib/config.ts`)
- `getConfig()` — Singleton конфигурации
- `updateConfigFromTenant()` — Обновление из tenant settings
- `getAppName()` — Название приложения
- `getBotLink()` — Ссылка на бота
- `getBotUsername()` — Username бота
- `getStorageKey()` — Ключ localStorage
- `isFeatureEnabled()` — Проверка feature flag
- `getSupportContact()` — Контакт поддержки
- `getConsultationContact()` — Контакт консультации
- `getTelegramChannel()` — Telegram канал
- `getDefaultCity()` — Дефолтный город
- `isGodModeUser()` — Проверка God Mode (legacy, deprecated)

##### Mini App Theme (`miniapp/src/lib/theme.ts`)
- `getCurrentTheme()` — Текущая тема
- `applyTheme()` — Применение темы
- `onThemeChange()` — Подписка на изменения
- `applyColorsToCSS()` — Применение цветов как CSS переменных
- `createDefaultTheme()` — Создание дефолтной темы
- `createThemeWithOverrides()` — Тема с переопределениями
- `generateThemeCSS()` — Генерация CSS из темы
- `THEME_PRESETS` — Пресеты тем (main-community, blue, purple, pink, orange, green, red, light)
- `hexToRgb()`, `rgbToHex()` — Конвертация цветов
- `getContrastColor()` — Контрастный цвет текста
- `adjustColor()` — Осветление/затемнение
- `generateHoverColor()` — Генерация hover цвета

##### Mini App Tenant (`miniapp/src/lib/tenant.ts`)
- `initializeTenant()` — Инициализация tenant context
- `loadUserRole()` — Загрузка роли пользователя
- `isGodMode()` — Проверка God Mode роли
- `isPartnerAdmin()` — Проверка Partner Admin роли
- `isModeratorOrAbove()` — Проверка Moderator+ роли
- `checkPermission()` — Проверка конкретного права
- `getCurrentTenant()` — Текущий tenant
- `getTenantTheme()` — Тема tenant'а
- `getTenantBlocks()` — Блоки tenant'а
- `getTenantBot()` — Информация о боте
- `getTenantBotLink()` — Ссылка на бота tenant'а

##### Database Migrations (6 файлов)

**20260116_001_add_tenants.sql**
- Таблица `tenants` с настройками
- Дефолтный tenant MAIN Community
- RLS политика публичного чтения

**20260116_002_add_admin_roles.sql**
- ENUM `admin_role` (god_mode, partner_admin, moderator)
- Таблица `admin_users`
- God Mode пользователи: dmitryutlik, utlik_offer
- Функция `check_admin_role()`
- Функция `get_admin_tenant_id()`

**20260116_003_add_tenant_themes.sql**
- Таблица `tenant_themes`
- Дефолтная тема MAIN Dark
- Constraint: одна дефолтная тема на tenant

**20260116_004_add_app_blocks.sql**
- ENUM `block_type` (10 типов)
- Таблица `app_blocks`
- Дефолтные блоки для MAIN Community (profile, events, leaderboard, network, achievements)
- Функция `get_tenant_blocks()`
- Функция `move_block()`

**20260116_005_add_tenant_bots.sql**
- Таблица `tenant_bots`
- Поддержка own бота (свой токен) и shared (startapp параметр)
- Дефолтный бот maincomapp_bot
- Функция `get_tenant_by_startapp()`
- Функция `generate_startapp_param()`

**20260116_006_add_tenant_features.sql**
- Таблица `tenant_features`
- Дефолтные фичи для MAIN Community
- Функция `is_feature_enabled()`
- Функция `get_feature_config()`
- Функция `get_tenant_features()`

#### Changed

- `miniapp/vite.config.ts` — Добавлен alias `@shared`
- `miniapp/tsconfig.json` — Добавлен path mapping `@shared/*`
- `miniapp/src/lib/supabase.ts` — Экспортирован `getSupabase()` и объект `supabase`

#### Documentation

- `PLAN.md` — Полный план реализации (650+ строк)
- `README.md` — Краткий обзор проекта
- `HARDCODED.md` — Аудит 80+ hardcoded значений для рефакторинга

---

## Backlog

### Hardcoded Values to Refactor (80+)
See [HARDCODED.md](./HARDCODED.md) for full list.

**Critical (Security):**
- [ ] Admin username checks in 6 files → `isGodMode()` from DB

**High Priority:**
- [ ] App name "MAIN Community" in 15+ places → `getAppName()`
- [ ] Bot links in 20+ places → `getBotLink()`
- [ ] localStorage key → `getStorageKey()`

**Medium Priority:**
- [ ] Default city "Минск" in 8 places → `getDefaultCity()`
- [ ] Support contacts → `getSupportContact()`
- [ ] Accent color #c8ff00 in 25+ places → CSS variables

---

## Migration Guide

### Applying Database Migrations

```bash
# Dry run (check what will change)
cd miniapp
supabase db push --dry-run

# Apply migrations
supabase db push

# Verify tables created
supabase db dump --schema public | grep -E "CREATE TABLE (tenants|admin_users|tenant_themes|app_blocks|tenant_bots|tenant_features)"
```

### Testing Locally

```bash
# Start Mini App
cd miniapp
npm run dev

# Check config in browser console
window.__APP_CONFIG__

# Check theme application
# Open DevTools → Elements → :root → check CSS variables
```

---

## Git History

| Date | Commit | Description |
|------|--------|-------------|
| 2026-01-16 | `47e2f8b` | docs: add God Mode implementation plan |
| 2026-01-16 | `a595772` | feat(god-mode): Phase 1 - Foundation for multi-tenancy |
