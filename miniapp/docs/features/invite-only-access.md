# Фича: Система инвайтов (доступ только по приглашениям)

**Статус:** Запланировано
**Приоритет:** Высокий
**Создано:** 2026-01-04

---

## Описание

Система закрытого доступа к приложению через инвайты. Каждый участник сообщества получает ограниченное количество приглашений для друзей.

## Требования

- Доступ к приложению **только по инвайтам**
- Каждый пользователь получает **5 инвайтов** (без пополнения)
- При регистрации по инвайту: **+50 XP обоим** (пригласившему и новому)
- Админы могут добавлять в **whitelist** для входа без инвайта
- Формат: **ссылка** `t.me/maincomapp_bot?start=invite_CODE`
- Инвайты **бессрочные**, одноразовые

---

## 1. База данных (SQL миграция)

### Новые таблицы

```sql
-- Таблица инвайтов
CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(12) NOT NULL UNIQUE,           -- Уникальный код (например "ABC123XYZ456")
    inviter_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    invitee_id INTEGER REFERENCES bot_users(id) ON DELETE SET NULL,  -- NULL пока не использован
    used_at TIMESTAMPTZ,                        -- NULL пока не использован
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Whitelist для входа без инвайта
CREATE TABLE admin_whitelist (
    id SERIAL PRIMARY KEY,
    tg_user_id BIGINT NOT NULL UNIQUE,          -- Telegram user ID
    added_by INTEGER REFERENCES bot_users(id),   -- Кто добавил
    reason TEXT,                                 -- Причина (опционально)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_invites_code ON invites(code);
CREATE INDEX idx_invites_inviter ON invites(inviter_id);
CREATE INDEX idx_invites_invitee ON invites(invitee_id);
CREATE INDEX idx_whitelist_tg_id ON admin_whitelist(tg_user_id);
```

### Изменения в bot_users

```sql
ALTER TABLE bot_users
ADD COLUMN invites_remaining INTEGER DEFAULT 0,
ADD COLUMN invited_by INTEGER REFERENCES bot_users(id),
ADD COLUMN invite_code_used VARCHAR(12);

CREATE INDEX idx_users_invited_by ON bot_users(invited_by);
```

### Функции PostgreSQL

```sql
-- Генерация уникального кода (исключены похожие символы: 0, O, 1, I)
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(12) AS $$
DECLARE
    chars VARCHAR := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(12) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Создание инвайтов для пользователя
CREATE OR REPLACE FUNCTION create_user_invites(p_user_id INTEGER, p_count INTEGER DEFAULT 5)
RETURNS INTEGER AS $$
DECLARE
    i INTEGER;
    new_code VARCHAR(12);
    created_count INTEGER := 0;
BEGIN
    FOR i IN 1..p_count LOOP
        LOOP
            new_code := generate_invite_code();
            EXIT WHEN NOT EXISTS (SELECT 1 FROM invites WHERE code = new_code);
        END LOOP;

        INSERT INTO invites (code, inviter_id)
        VALUES (new_code, p_user_id);

        created_count := created_count + 1;
    END LOOP;

    UPDATE bot_users
    SET invites_remaining = invites_remaining + p_count
    WHERE id = p_user_id;

    RETURN created_count;
END;
$$ LANGUAGE plpgsql;
```

### Миграция существующих пользователей

```sql
-- Дать всем существующим пользователям 5 инвайтов
UPDATE bot_users
SET invites_remaining = 5
WHERE invites_remaining = 0 OR invites_remaining IS NULL;

-- Создать инвайт-коды для каждого
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM bot_users LOOP
        PERFORM create_user_invites(user_record.id, 5);
    END LOOP;
END $$;

-- Добавить core team в whitelist
INSERT INTO admin_whitelist (tg_user_id, reason)
SELECT tg_user_id, 'Core team member'
FROM bot_users
WHERE team_role = 'core'
ON CONFLICT (tg_user_id) DO NOTHING;
```

---

## 2. Изменения в коде

### `src/types/index.ts`

```typescript
// Добавить в XP_REWARDS
export const XP_REWARDS = {
  // ... существующие
  INVITE_ACCEPTED: 50,  // Оба получают
}

// Новые типы
export interface Invite {
  id: string
  code: string
  inviter_id: number
  invitee_id: number | null
  used_at: string | null
  created_at: string
}

export interface AdminWhitelist {
  id: number
  tg_user_id: number
  added_by: number | null
  reason: string | null
  created_at: string
}

// Расширить User
export interface User {
  // ... существующие поля
  invites_remaining: number
  invited_by: number | null
  invite_code_used: string | null
}
```

### `src/lib/supabase.ts` - новые функции

```typescript
// Проверка whitelist
export async function isUserWhitelisted(tgUserId: number): Promise<boolean>

// Проверка доступа (существующий, whitelisted, или нет)
export async function checkUserAccess(tgUserId: number): Promise<{
  hasAccess: boolean
  isExistingUser: boolean
  isWhitelisted: boolean
}>

// Валидация инвайт-кода (без использования)
export async function validateInviteCode(code: string): Promise<{
  valid: boolean
  inviterName?: string
  error?: string
}>

// Использование инвайта и создание пользователя
export async function useInviteAndCreateUser(
  code: string,
  userData: { tg_user_id: number; username?: string | null; first_name?: string | null; last_name?: string | null }
): Promise<{ success: boolean; user?: User; error?: string }>

// Получение инвайтов пользователя
export async function getUserInvites(userId: number): Promise<Invite[]>

// Генерация ссылки
export function generateInviteLink(code: string): string {
  return `https://t.me/maincomapp_bot?start=invite_${code}`
}
```

### `src/lib/store.ts`

```typescript
interface AppState {
  // ... существующие
  pendingInviteCode: string | null
  accessDenied: boolean

  setPendingInviteCode: (code: string | null) => void
  setAccessDenied: (denied: boolean) => void
}
```

### `src/App.tsx` - изменение init flow

```typescript
// В функции init():
const startParam = getTelegramWebApp()?.initDataUnsafe?.start_param

// Извлечь код из deep link
let inviteCode: string | null = null
if (startParam?.startsWith('invite_')) {
  inviteCode = startParam.replace('invite_', '')
}

// Проверить доступ
const { hasAccess, isExistingUser, isWhitelisted } = await checkUserAccess(userId)

if (isExistingUser) {
  // Обычный flow
} else if (hasAccess && isWhitelisted) {
  // Создать аккаунт + 5 инвайтов
} else if (inviteCode) {
  // Показать AccessGateScreen с подтверждением
  setPendingInviteCode(inviteCode)
} else {
  // Показать AccessGateScreen с вводом кода
  setAccessDenied(true)
}
```

---

## 3. Новые компоненты

### `src/screens/AccessGateScreen.tsx`

**Режим "denied":** (нет инвайта)
- Иконка замка
- Заголовок "Только по приглашению"
- Поле ввода кода
- Кнопка "Проверить код"

**Режим "invite":** (есть инвайт)
- Иконка подарка
- "Вас пригласил {inviterName}!"
- Список бонусов (доступ, 5 инвайтов, +50 XP)
- Кнопка "Присоединиться"

### `src/components/InviteBottomSheet.tsx`

- Заголовок "Твои приглашения"
- Инфо "+50 XP тебе и другу"
- Список инвайт-кодов с кнопками Copy/Share
- Дата создания каждого кода

### `src/screens/ProfileScreen.tsx` (строки 1216-1233)

Заменить текущую секцию на:
- Счётчик "X из 5 приглашений осталось"
- Кнопка открывает InviteBottomSheet
- Показывать сколько людей приглашено (+XP заработано)

---

## 4. Файлы для изменения

| Файл | Действие |
|------|----------|
| `migrations/add_invite_system.sql` | Создать |
| `src/types/index.ts` | Добавить типы |
| `src/lib/supabase.ts` | Добавить функции |
| `src/lib/store.ts` | Добавить state |
| `src/App.tsx` | Изменить init flow |
| `src/screens/AccessGateScreen.tsx` | Создать |
| `src/components/InviteBottomSheet.tsx` | Создать |
| `src/screens/ProfileScreen.tsx` | Обновить секцию |

---

## 5. User Flows

### Новый пользователь с инвайтом

```
Клик по ссылке t.me/bot?start=invite_ABC123
    ↓
App извлекает код из start_param
    ↓
validateInviteCode() → valid, inviterName
    ↓
AccessGateScreen (mode="invite")
"Вас пригласил Иван!"
    ↓
Клик "Присоединиться"
    ↓
useInviteAndCreateUser()
  - Создать пользователя
  - Пометить инвайт использованным
  - +50 XP пригласившему
  - +50 XP новому
  - Создать 5 инвайтов новому
    ↓
Onboarding → App
```

### Новый пользователь без инвайта

```
Открытие t.me/MainCommunityBot (без параметров)
    ↓
checkUserAccess() → hasAccess: false
    ↓
AccessGateScreen (mode="denied")
"Только по приглашению"
[Введите код]
    ↓
Ввод кода вручную
    ↓
validateInviteCode()
    ↓
Если valid → переход в mode="invite"
Если invalid → показать ошибку
```

### Шаринг инвайта существующим пользователем

```
ProfileScreen
"3 из 5 приглашений осталось"
[Поделиться]
    ↓
InviteBottomSheet
  ABC123XYZ456 [Copy] [Share]
  DEF789GHI012 [Copy] [Share]
  ...
    ↓
Клик Share → Telegram share sheet
Клик Copy → Копирование в буфер
```

---

## 6. Edge Cases

1. **Race condition**: Два человека пытаются использовать один код
   - Решение: UNIQUE constraint на invitee_id

2. **Пользователь пытается использовать свой инвайт**
   - Проверка: inviter_id !== current_user_id

3. **Код в неправильном регистре**
   - Нормализация: `.toUpperCase()` перед валидацией

4. **Неверный формат deep link**
   - Игнорировать и показать экран ввода кода

5. **Ошибка сети при регистрации**
   - Показать кнопку "Повторить"
   - Не помечать инвайт использованным до успеха

6. **Пользователь закрыл приложение в процессе**
   - Транзакция должна быть атомарной

---

## 7. Метрики для отслеживания

- Количество использованных инвайтов
- Конверсия: клик по ссылке → регистрация
- Среднее количество приглашённых на пользователя
- Виральность: N-е поколение приглашений

---

## Оценка сложности

- **База данных:** ~2 часа
- **Backend функции:** ~3 часа
- **AccessGateScreen:** ~2 часа
- **InviteBottomSheet:** ~1 час
- **Интеграция в App.tsx:** ~2 часа
- **Тестирование:** ~2 часа

**Итого:** ~12 часов работы
