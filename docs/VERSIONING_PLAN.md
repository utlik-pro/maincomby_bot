# План: Система версионирования и Changelog для MAIN Community

> Дата создания: 2026-01-10
> Статус: Реализовано

## Цель
Создать систему для:
1. Отслеживания версий приложения (bot + miniapp + landing)
2. Автоматической генерации changelog из git commits
3. Отображения "Что нового" пользователям
4. Ведения истории релизов для клиентов платформы

## Архитектура

```
maincomby_bot/
├── VERSION                         # Единый источник версии (1.0.0)
├── CHANGELOG.md                    # Human-readable changelog
├── releases/
│   └── releases.json              # Структурированные данные релизов
├── scripts/
│   ├── release.sh                 # Скрипт релиза
│   └── check-versions.sh          # Проверка консистентности
├── app/
│   ├── version.py                 # Python модуль версии
│   └── handlers/utils.py          # Команда /version
├── miniapp/src/
│   ├── lib/version.ts             # TS модуль версии
│   └── components/WhatsNewModal.tsx
└── landing/src/
    └── lib/version.ts             # Landing версия
```

## Фазы реализации

### Фаза 1: Центральное управление версией

**Файлы:**
- `VERSION` (new) - содержит `1.0.0`
- `app/version.py` (new) - читает VERSION, экспортирует `__version__`
- `miniapp/src/lib/version.ts` (new) - константы `APP_VERSION`, `CURRENT_APP_VERSION`
- `miniapp/landing/src/lib/version.ts` (new) - константа `APP_VERSION`

### Фаза 2: Changelog инфраструктура

**Файлы:**
- `CHANGELOG.md` (new) - Keep a Changelog формат
- `releases/releases.json` (new) - JSON с историей релизов

**Формат releases.json:**
```json
{
  "schemaVersion": "1.0",
  "releases": [{
    "version": "1.0.0",
    "date": "2026-01-10",
    "type": "major",
    "summary": "Initial release",
    "highlights": ["..."],
    "features": [{"description": "...", "scope": "bot|miniapp"}],
    "fixes": [...]
  }]
}
```

### Фаза 3: Скрипт релиза

**Файл:** `scripts/release.sh`

```bash
./scripts/release.sh patch|minor|major [--dry-run]
```

Функционал:
1. Bump версии в VERSION
2. Парсинг git commits с последнего тега (feat:, fix:, etc.)
3. Обновление CHANGELOG.md
4. Синхронизация версий во всех package.json и version.ts
5. Git commit + tag

### Фаза 4: Интеграция в UI

**Bot (`app/handlers/utils.py`):**
```python
@router.message(Command("version"))
async def cmd_version(message):
    await message.answer(f"MAIN Community v{__version__}")
```

**Bot startup (`app/main.py`):**
```python
logger.info(f"Starting MAIN Community Bot v{__version__}")
```

**Mini App (`miniapp/src/screens/ProfileScreen.tsx:920`):**
```typescript
// Было: <span>1.0.0</span>
// Стало:
import { APP_VERSION } from '@/lib/version'
<span>{APP_VERSION}</span>
```

**Mini App "Что нового" (`miniapp/src/components/WhatsNewModal.tsx`):**
- Модальное окно с highlights релиза
- Показывается при изменении `CURRENT_APP_VERSION`
- По паттерну `CURRENT_ONBOARDING_VERSION` из store.ts:6

**Mini App store (`miniapp/src/lib/store.ts`):**
```typescript
// Добавить:
lastSeenAppVersion: number
setLastSeenAppVersion: (version: number) => void
```

**Landing Footer (`landing/src/components/sections/Footer.tsx`):**
```typescript
import { APP_VERSION } from '@/lib/version'
// v{APP_VERSION} в footer
```

**Landing Changelog страница (`landing/src/app/[locale]/changelog/page.tsx`):**
- Отдельная страница `/changelog` для B2B клиентов
- Читает `releases.json` и отображает полную историю версий
- Фильтры по типу (features/fixes) и по компоненту (bot/miniapp)
- SEO-оптимизированная для поиска "MAIN Community updates"

### Фаза 5: Push-уведомления о релизах

При выходе нового релиза - активные уведомления во всех каналах:

**Bot Push (`app/services/release_notifier.py`):**
```python
async def notify_users_about_release(version: str, highlights: list[str]):
    """Отправить всем пользователям уведомление о новом релизе"""
    # Формат сообщения:
    # 🚀 Обновление v1.1.0!
    # • Новая фича X
    # • Исправлен баг Y
    # [Подробнее →] (ссылка на changelog)
```

**Bot Handler (`app/handlers/utils.py`):**
- Команда `/changelog` - показывает последние изменения
- При релизе: broadcast всем пользователям

**Mini App Push:**
- Использовать существующую систему notifications из `miniapp/src/lib/notifications.ts`
- При открытии приложения проверять новую версию → показать toast/banner
- Banner в верхней части экрана: "Вышло обновление 1.1.0" + кнопка "Подробнее"

**Landing Notification Banner:**
- Компонент `UpdateBanner.tsx` в header
- Показывает: "Новое обновление v1.1.0" + краткое описание + ссылка на /changelog
- Можно закрыть (сохраняется в localStorage)

**Интеграция в release.sh:**
```bash
# После создания релиза:
# 1. Отправить webhook в бота для broadcast
# 2. Обновить releases.json (landing подхватит автоматически)
```

### Фаза 6: Скрипт проверки

**Файл:** `scripts/check-versions.sh`
- Проверяет что VERSION = package.json = version.ts везде
- Запускать в CI/pre-commit

## Изменяемые файлы

| Файл | Действие | Статус |
|------|----------|--------|
| `VERSION` | Создать | [x] |
| `CHANGELOG.md` | Создать | [x] |
| `releases/releases.json` | Создать | [x] |
| `scripts/release.sh` | Создать | [x] |
| `scripts/check-versions.sh` | Создать | [x] |
| `app/version.py` | Создать | [x] |
| `app/main.py` | Добавить лог версии | [x] |
| `app/handlers/utils.py` | Добавить /version | [x] |
| `miniapp/src/lib/version.ts` | Создать | [x] |
| `miniapp/src/lib/store.ts` | Добавить lastSeenAppVersion | [x] |
| `miniapp/src/screens/ProfileScreen.tsx` | Импорт версии (line 920) | [x] |
| `miniapp/src/components/WhatsNewModal.tsx` | Создать | [x] |
| `miniapp/src/App.tsx` | Интегрировать WhatsNewModal | [x] |
| `miniapp/package.json` | Версия уже 1.0.0 | [x] |
| `miniapp/landing/src/lib/version.ts` | Создать | [x] |
| `miniapp/landing/src/components/sections/Footer.tsx` | Добавить версию | [x] |
| `miniapp/landing/src/app/[locale]/changelog/page.tsx` | Создать (страница для B2B) | [x] |
| `miniapp/landing/src/components/UpdateBanner.tsx` | Создать (banner о релизах) | [x] |
| `app/services/release_notifier.py` | Создать (broadcast релизов) | [x] |
| `miniapp/src/components/UpdateBanner.tsx` | Создать (banner в mini app) | [x] |

## Верификация

1. [x] **Unit test:** `./scripts/check-versions.sh` проходит
2. [ ] **Bot:** команда `/version` возвращает текущую версию
3. [ ] **Bot:** команда `/changelog` показывает последние изменения
4. [ ] **Bot logs:** при старте показывает версию
5. [ ] **Bot push:** при релизе отправляется broadcast всем пользователям
6. [ ] **Mini App:** в настройках показывает версию из version.ts
7. [ ] **Mini App:** при обновлении показывает banner + модалку "Что нового"
8. [ ] **Landing:** в footer видна версия
9. [ ] **Landing:** страница `/changelog` показывает полную историю
10. [ ] **Landing:** UpdateBanner появляется при новом релизе
11. [ ] **Release flow:** `./scripts/release.sh patch --dry-run` показывает changelog

## Дополнительно (опционально)

- [ ] **Conventional Commits enforcement:** git hook для проверки формата коммитов
- [ ] **GitHub Actions:** автоматическая генерация release notes при теге
- [ ] **Telegram канал:** автопост о новом релизе

## Начальная версия

Стартуем с `1.0.0` - это текущее состояние приложения. Первые коммиты после реализации системы пойдут в `[Unreleased]` секцию CHANGELOG.
