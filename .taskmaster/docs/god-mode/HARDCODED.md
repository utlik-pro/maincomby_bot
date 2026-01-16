# Hardcoded Values - Refactoring Checklist

> Документация всех hardcoded значений, которые нужно заменить на config calls

## Сводка

| Категория | Количество мест | Приоритет |
|-----------|-----------------|-----------|
| Название приложения | 15+ | Высокий |
| Bot username/links | 20+ | Высокий |
| Admin usernames | 6 | Критический |
| Контакты | 3 | Высокий |
| Default city | 8 | Средний |
| Accent color | 25+ | Средний |
| localStorage key | 1 | Высокий |

---

## 1. Название приложения "MAIN Community"

**Заменить на:** `getAppName()` из `@/lib/config`

| Файл | Строка | Контекст |
|------|--------|----------|
| `src/App.tsx` | 35 | alt="MAIN Community" |
| `src/App.tsx` | 38 | MAIN Community (h1) |
| `src/App.tsx` | 512 | 'Основатель MAIN Community.' |
| `src/App.tsx` | 610 | 'Добро пожаловать в MAIN Community!' |
| `src/screens/AccessGateScreen.tsx` | 117 | 'доступ в MAIN Community' |
| `src/screens/OnboardingScreen.tsx` | 19 | 'Добро пожаловать в MAIN Community!' |
| `src/screens/ProfileScreen.tsx` | 1187 | 'в MAIN Community' |
| `src/components/InviteBottomSheet.tsx` | 43 | 'в MAIN Community!' |
| `src/lib/version.ts` | 2 | comment |
| `src/lib/version.ts` | 9 | APP_NAME constant |
| `src/lib/version.ts` | 58 | release summary |

---

## 2. Bot Username/Links

**Заменить на:** `getBotLink()`, `getBotUsername()` из `@/lib/config`

### Direct username references

| Файл | Строка | Значение |
|------|--------|----------|
| `src/App.tsx` | 55 | @maincomapp_bot |
| `src/App.tsx` | 58 | t.me/maincomapp_bot |

### Deep links (startapp)

| Файл | Строка | Pattern |
|------|--------|---------|
| `src/screens/EventsScreen.tsx` | 421 | t.me/maincomapp_bot?startapp=event_ |
| `src/screens/EventsScreen.tsx` | 451 | t.me/maincomapp_bot?startapp=event_ |
| `src/screens/ProfileScreen.tsx` | 1185 | t.me/maincomapp_bot?startapp=profile_ |
| `src/screens/ProfileScreen.tsx` | 1208 | t.me/maincomapp_bot?startapp=profile_ |
| `src/screens/NetworkScreen.tsx` | 305 | t.me/maincomapp_bot?start=subscribe |
| `src/screens/NetworkScreen.tsx` | 534 | t.me/maincomapp_bot?start=subscribe |
| `src/components/AdminSettingsPanel.tsx` | 85 | t.me/maincomapp_bot?startapp=event_ |
| `src/components/AdminSettingsPanel.tsx` | 96 | t.me/maincomapp_bot?startapp=event_ |
| `src/components/AdminSettingsPanel.tsx` | 360 | t.me/maincomapp_bot?startapp=event_ |
| `src/lib/supabase.ts` | 1194 | t.me/maincomapp_bot?startapp=invite_ |

---

## 3. Admin Usernames (КРИТИЧНО!)

**Заменить на:** Проверку ролей через `isGodMode()`, `isPartnerAdmin()` из `@/lib/tenant`

| Файл | Строка | Код |
|------|--------|-----|
| `src/screens/ProfileScreen.tsx` | 1353 | `['dmitryutlik', 'utlik_offer'].includes(user?.username)` |
| `src/components/UserRoleManager.tsx` | 33 | `['dmitryutlik', 'utlik_offer'].includes(currentUser?.username)` |
| `src/components/AnalyticsPanel.tsx` | 70 | `['dmitryutlik', 'utlik_offer'].includes(user?.username)` |
| `src/components/BroadcastPanel.tsx` | 112 | `['dmitryutlik', 'utlik_offer'].includes(user?.username)` |
| `src/components/AdminSettingsPanel.tsx` | 32 | `['dmitryutlik', 'utlik_offer'].includes(user?.username)` |
| `src/lib/config.ts` | 311 | `GOD_MODE_USERNAMES` constant (deprecated) |

---

## 4. Контакты поддержки

**Заменить на:** `getSupportContact()`, `getConsultationContact()` из `@/lib/config`

| Файл | Строка | Username |
|------|--------|----------|
| `src/screens/ProfileScreen.tsx` | 1365 | t.me/yana_martynen (support) |
| `src/screens/HomeScreen.tsx` | 59 | t.me/dmitryutlik (consultation) |
| `src/screens/HomeScreen.tsx` | 63 | t.me/dmitryutlik (consultation) |

---

## 5. Default City "Минск"

**Заменить на:** `getDefaultCity()` из `@/lib/config`

| Файл | Строка | Контекст |
|------|--------|----------|
| `src/App.tsx` | 519 | city: 'Минск' (dev user) |
| `src/App.tsx` | 672 | city: 'Минск' (default) |
| `src/screens/ProfileScreen.tsx` | 329 | city fallback |
| `src/screens/ProfileScreen.tsx` | 397 | city fallback |
| `src/screens/ProfileScreen.tsx` | 583 | placeholder |
| `src/screens/ProfileScreen.tsx` | 1140 | city fallback |
| `src/lib/supabase.ts` | 1150 | default city |
| `src/lib/supabase.ts` | 3147 | achievement check |

---

## 6. Accent Color #c8ff00

**Заменить на:** CSS переменные `var(--color-accent)` или `getThemeColor('accent')` из `@/lib/theme`

### CSS/Tailwind classes (требует глобального рефакторинга)

| Файл | Строка | Использование |
|------|--------|---------------|
| `src/index.css` | 10-11 | Telegram theme vars |
| `src/index.css` | 88 | gradient |
| `src/screens/ProfileScreen.tsx` | 97-101 | team styles |
| `src/screens/ProfileScreen.tsx` | 1099 | badge bg |
| `src/screens/HomeScreen.tsx` | 33 | team ring |
| `src/components/ui/index.tsx` | 21 | core team color |
| `src/components/ui/index.tsx` | 161, 207 | ring color |
| `src/components/UserRoleManager.tsx` | 17 | core team bg |
| `src/components/ProfilePreviewCard.tsx` | 18, 126 | badge colors |
| `src/components/BadgeGrid.tsx` | 59, 60, 64, 110, 112, 118 | badge styling |
| `src/components/SwipeCard.tsx` | 18, 119 | badge colors |
| `src/types/index.ts` | 399 | portfolio link color |

### Theme presets (уже в config)

| Файл | Строка | Контекст |
|------|--------|----------|
| `src/lib/theme.ts` | 218 | main-community preset |
| `src/lib/theme.ts` | 260 | light theme preset |

---

## 7. localStorage Key

**Заменить на:** `getStorageKey()` из `@/lib/config`

| Файл | Строка | Значение |
|------|--------|----------|
| `src/lib/store.ts` | 211 | name: 'main-community-app' |

---

## Стратегия рефакторинга

### Фаза 1.1: Критические (безопасность)
1. ✅ Создать `isGodMode()` в config.ts (сделано с deprecated)
2. ⬜ Заменить все проверки `['dmitryutlik', 'utlik_offer'].includes()` на `isGodModeUser()`
3. ⬜ После миграции БД - переключить на `loadUserRole()` + `isGodMode()`

### Фаза 1.2: Высокий приоритет
1. ⬜ Заменить названия приложения на `getAppName()`
2. ⬜ Заменить bot links на `getBotLink()`
3. ⬜ Заменить localStorage key на `getStorageKey()`

### Фаза 1.3: Средний приоритет
1. ⬜ Заменить default city на `getDefaultCity()`
2. ⬜ Заменить контакты на `getSupportContact()` / `getConsultationContact()`

### Фаза 1.4: CSS переменные (отдельная задача)
1. ⬜ Обновить index.css с CSS переменными
2. ⬜ Обновить tailwind.config.js для использования CSS vars
3. ⬜ Постепенно заменять hardcoded #c8ff00 на var(--color-accent)

---

## Автоматический скрипт поиска

```bash
# Найти все hardcoded значения
grep -rn "MAIN Community\|maincomapp_bot\|dmitryutlik\|utlik_offer\|yana_martynen\|main-community-app\|Минск\|#c8ff00" src/
```
