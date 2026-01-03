# P0 - КРИТИЧЕСКИЕ ЗАДАЧИ

**Дедлайн:** Немедленно (1-2 дня)
**Общее время:** ~12 часов
**Статус:** ⬜ 0/5 выполнено

---

## ✅ IMP-001: Add React Error Boundary

**Статус:** ⬜ Not Started
**Приоритет:** P0 - CRITICAL
**Время:** 2-3 часа
**Ответственный:** _________

### Проблема
Любая ошибка JavaScript роняет всё приложение с белым экраном. Пользователи не могут восстановить работу без перезагрузки страницы.

### Решение
1. Создать `src/components/ErrorBoundary.tsx`:
```typescript
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
    // TODO: Send to monitoring service (Sentry, LogRocket)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Что-то пошло не так</h1>
          <p className="text-gray-600 mb-4">Приложение столкнулось с ошибкой</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Попробовать снова
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

2. Обернуть App в `src/App.tsx`:
```typescript
import ErrorBoundary from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      {/* existing app content */}
    </ErrorBoundary>
  )
}
```

### Критерии приёмки
- [ ] ErrorBoundary ловит все render ошибки
- [ ] Показывается fallback UI с кнопкой retry
- [ ] Ошибки логируются в консоль
- [ ] Приложение восстанавливается без перезагрузки страницы
- [ ] Протестировано с искусственной ошибкой

### Файлы
- Create: `src/components/ErrorBoundary.tsx`
- Modify: `src/App.tsx`

### Связанные баги
- BUG-001: No Error Boundary - App Crashes on Uncaught Errors
- CQ-022: No Error Boundary Implementation

---

## 🔒 IMP-002: Validate Telegram initData on Server

**Статус:** ⬜ Not Started
**Приоритет:** P0 - CRITICAL SECURITY
**Время:** 4-6 часов
**Ответственный:** _________
**Зависимости:** Backend/Edge Function setup

### Проблема
Приложение использует `initDataUnsafe.user` без валидации. Атакующий может:
1. Открыть DevTools
2. Выполнить: `window.Telegram.WebApp.initDataUnsafe.user = { id: 12345, first_name: 'Hacker' }`
3. Выдать себя за любого пользователя Telegram
4. Изменить данные в БД от чужого имени

### Решение

**Backend (Supabase Edge Function или API):**
```typescript
// validate-telegram-init-data.ts
import { createHash, createHmac } from 'crypto'

export const validateTelegramInitData = (initData: string, botToken: string): boolean => {
  const urlParams = new URLSearchParams(initData)
  const hash = urlParams.get('hash')
  urlParams.delete('hash')

  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest()

  const calculatedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  return calculatedHash === hash
}
```

**Frontend (`src/lib/telegram.ts`):**
```typescript
export const validateAndAuthenticateUser = async () => {
  const initData = window.Telegram?.WebApp?.initData

  if (!initData) {
    throw new Error('No Telegram initData available')
  }

  // Send to server for validation
  const response = await fetch('/api/validate-telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData })
  })

  if (!response.ok) {
    throw new Error('Invalid Telegram authentication')
  }

  const { user } = await response.json()
  return user
}
```

### Критерии приёмки
- [ ] initData валидируется на сервере перед любыми операциями
- [ ] Невалидные подписи отклоняются с ошибкой
- [ ] Ошибки валидации обрабатываются gracefully
- [ ] Dev mode fallback работает для локальной разработки
- [ ] Документация по настройке BOT_TOKEN

### Файлы
- Create: Backend validation function
- Modify: `src/lib/telegram.ts`
- Modify: `src/App.tsx` (use validated data)

### Связанные баги
- BUG-002: initDataUnsafe Not Validated - User Spoofing Possible

### Документация
https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

---

## 🔒 IMP-003: Remove Hardcoded Supabase URL

**Статус:** ⬜ Not Started
**Приоритет:** P0 - SECURITY
**Время:** 30 минут
**Ответственный:** _________

### Проблема
Production Supabase URL захардкожен в коде:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ndpkxustvcijykzxqxrn.supabase.co'
```

Риски:
- Production URL виден в git истории
- Разработка без .env случайно использует продакшн БД
- Усложняет переключение окружений

### Решение

**1. Обновить `src/lib/supabase.ts`:**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**2. Обновить `.env.example`:**
```bash
# Supabase Configuration (REQUIRED)
# Get these from: https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Telegram Bot Token (for development mode)
VITE_TELEGRAM_BOT_TOKEN=your-bot-token-here
VITE_DEV_USER_ID=your-telegram-id-here
```

**3. Добавить в README:**
```markdown
## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials from https://app.supabase.com
3. Fill in your Telegram bot token from @BotFather
```

### Критерии приёмки
- [ ] Приложение падает с понятной ошибкой если нет env vars
- [ ] Нет production URLs в исходном коде
- [ ] .env.example обновлён с инструкциями
- [ ] README содержит setup инструкции

### Файлы
- Modify: `src/lib/supabase.ts`
- Modify: `.env.example`
- Modify: `README.md`

### Связанные баги
- BUG-003: Hardcoded Production Supabase URL in Source Code
- CQ-034: Hardcoded Production Supabase URL

---

## 🛠️ IMP-004: Create ESLint Configuration

**Статус:** ⬜ Not Started
**Приоритет:** P0 - INFRASTRUCTURE
**Время:** 1-2 часа
**Ответственный:** _________

### Проблема
- ESLint 9.9.1 установлен но конфиг отсутствует
- `npm run lint` использует deprecated флаги
- Нет автоматической проверки качества кода

### Решение

**1. Создать `eslint.config.js`:**
```javascript
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', {
        allowConstantExport: true
      }],
    },
  },
]
```

**2. Обновить `package.json`:**
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

**3. Добавить в `.gitignore` (если нет):**
```
.eslintcache
```

### Критерии приёмки
- [ ] `npm run lint` выполняется без ошибок конфигурации
- [ ] TypeScript файлы проверяются
- [ ] React rules применяются
- [ ] `npm run lint:fix` автоматически исправляет проблемы
- [ ] CI/CD может использовать lint проверку

### Файлы
- Create: `eslint.config.js`
- Modify: `package.json`

### Связанные баги
- BUG-051: ESLint Config Missing
- CQ-033: No ESLint Configuration

---

## 🏷️ IMP-005: Fix Rank Name Translation Inconsistency

**Статус:** ⬜ Not Started
**Приоритет:** P0 - DATA INTEGRITY
**Время:** 2-3 часа
**Ответственный:** _________

### Проблема
Звания дублируются в 2 файлах с разными переводами:

**`src/lib/store.ts`:**
```typescript
const RANK_LABELS = {
  private: 'Рядовой',
  corporal: 'Капрал',  // ❌ Разный перевод
  // ...
}
```

**`src/types/index.ts`:**
```typescript
export const RANK_LABELS = {
  private: 'Рядовой',
  corporal: 'Ефрейтор',  // ❌ Разный перевод
  // ...
}
```

Результат: пользователи видят разные названия в UI и уведомлениях.

### Решение

**1. Создать `src/lib/ranks.ts`:**
```typescript
export type UserRank =
  | 'private'
  | 'corporal'
  | 'sergeant'
  | 'lieutenant'
  | 'captain'
  | 'major'
  | 'colonel'
  | 'general'

interface RankConfig {
  threshold: number
  label: string
  emoji: string
}

export const RANK_CONFIG: Record<UserRank, RankConfig> = {
  private: { threshold: 0, label: 'Рядовой', emoji: '🎖️' },
  corporal: { threshold: 100, label: 'Ефрейтор', emoji: '🎖️' },
  sergeant: { threshold: 250, label: 'Сержант', emoji: '🎖️' },
  lieutenant: { threshold: 500, label: 'Лейтенант', emoji: '⭐' },
  captain: { threshold: 1000, label: 'Капитан', emoji: '⭐' },
  major: { threshold: 2000, label: 'Майор', emoji: '⭐⭐' },
  colonel: { threshold: 5000, label: 'Полковник', emoji: '⭐⭐⭐' },
  general: { threshold: 10000, label: 'Генерал', emoji: '🌟' },
}

export const calculateRank = (points: number): UserRank => {
  if (points >= 10000) return 'general'
  if (points >= 5000) return 'colonel'
  if (points >= 2000) return 'major'
  if (points >= 1000) return 'captain'
  if (points >= 500) return 'lieutenant'
  if (points >= 250) return 'sergeant'
  if (points >= 100) return 'corporal'
  return 'private'
}

export const getRankLabel = (rank: UserRank): string => {
  return RANK_CONFIG[rank].label
}

export const getRankEmoji = (rank: UserRank): string => {
  return RANK_CONFIG[rank].emoji
}

export const getNextRank = (currentRank: UserRank): { rank: UserRank; pointsNeeded: number } | null => {
  const ranks: UserRank[] = [
    'private', 'corporal', 'sergeant', 'lieutenant',
    'captain', 'major', 'colonel', 'general'
  ]

  const currentIndex = ranks.indexOf(currentRank)
  if (currentIndex === ranks.length - 1) return null // Already general

  const nextRank = ranks[currentIndex + 1]
  return {
    rank: nextRank,
    pointsNeeded: RANK_CONFIG[nextRank].threshold
  }
}
```

**2. Обновить `src/lib/store.ts`:**
```typescript
import { calculateRank, getRankLabel } from './ranks'

// Remove RANK_LABELS constant
// Update calculateRank usage
const newRank = calculateRank(newPoints)
```

**3. Обновить `src/lib/supabase.ts`:**
```typescript
import { calculateRank } from './ranks'

// Use centralized calculateRank
```

**4. Обновить `src/types/index.ts`:**
```typescript
// Remove duplicate RANK_LABELS export
export type { UserRank } from '../lib/ranks'
```

### Критерии приёмки
- [ ] Единый файл `src/lib/ranks.ts` с определениями званий
- [ ] Все названия званий консистентны
- [ ] UI показывает те же названия что и уведомления
- [ ] Удалены дубликаты из store.ts, supabase.ts, types/index.ts
- [ ] Тесты проходят (если есть)

### Файлы
- Create: `src/lib/ranks.ts`
- Modify: `src/lib/store.ts`
- Modify: `src/lib/supabase.ts`
- Modify: `src/types/index.ts`

### Связанные баги
- BUG-005: Rank Translation Inconsistency
- CQ-007: Rank Calculation Logic Duplicated
- UIUX-025: Rank Name Translation Inconsistency

---

## 📊 Прогресс P0

- [ ] IMP-001: Error Boundary (2-3h)
- [ ] IMP-002: Validate initData (4-6h) ⚠️ Needs backend
- [ ] IMP-003: Remove hardcoded URL (30min)
- [ ] IMP-004: ESLint config (1-2h)
- [ ] IMP-005: Rank consolidation (2-3h)

**Общий прогресс:** 0/5 (0%)
**Оценка времени:** ~12 часов

---

**Дата создания:** 2026-01-03
**Источник:** Comprehensive Application Audit
