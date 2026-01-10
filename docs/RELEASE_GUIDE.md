# MAIN Community - Release Pipeline Guide

## Обзор системы версионирования

### Архитектура

```
maincomby_bot/
├── VERSION                              # Главный источник версии (1.1.0)
├── CHANGELOG.md                         # История изменений (Keep a Changelog)
├── releases/
│   └── releases.json                    # Структурированные данные для UI
│
├── miniapp/
│   └── src/lib/version.ts               # APP_VERSION + CURRENT_APP_VERSION
│
└── miniapp/landing/
    └── src/
        ├── lib/version.ts               # APP_VERSION для footer
        └── data/releases.json           # Копия для changelog страницы
```

### Ключевые переменные

| Переменная | Файл | Назначение |
|------------|------|------------|
| `VERSION` | `/VERSION` | Единый источник правды |
| `APP_VERSION` | `miniapp/src/lib/version.ts` | Отображаемая версия в UI |
| `CURRENT_APP_VERSION` | `miniapp/src/lib/version.ts` | Триггер "Что нового" (число) |
| `releases.json` | `/releases/` + `landing/src/data/` | История для changelog UI |

## Как работают уведомления

### Mini App ("Что нового")

```
CURRENT_APP_VERSION = 4  (в коде)
lastSeenAppVersion = 3   (в localStorage пользователя)

Если lastSeenAppVersion < CURRENT_APP_VERSION → показать ChangelogSheet
```

**Файлы:**
- `miniapp/src/lib/version.ts` - CURRENT_APP_VERSION
- `miniapp/src/lib/store.ts` - shouldShowWhatsNew()
- `miniapp/src/App.tsx` - показ ChangelogSheet
- `miniapp/src/components/ChangelogSheet.tsx` - UI компонент

### Landing (Update Banner)

```
releases.json[0].version = "1.1.0"  (в коде)
localStorage.main_last_seen_version = "1.0.0"  (у пользователя)

Если версии разные → показать UpdateBanner модалку
```

**Файлы:**
- `landing/src/data/releases.json` - данные релизов
- `landing/src/components/UpdateBanner.tsx` - UI компонент
- `landing/src/app/[locale]/layout.tsx` - подключение баннера
- `landing/src/app/[locale]/changelog/page.tsx` - страница истории

## Релизный процесс

### Автоматический (рекомендуется)

```bash
# Из корня проекта
./scripts/release.sh minor

# Опции:
#   patch  - 1.1.0 → 1.1.1 (багфиксы)
#   minor  - 1.1.0 → 1.2.0 (новые фичи)
#   major  - 1.1.0 → 2.0.0 (breaking changes)
#
# Флаги:
#   --dry-run    - превью без изменений
#   --no-tag     - без git tag
#   --no-commit  - без git commit
```

**Что делает скрипт:**

1. Читает текущую версию из `VERSION`
2. Вычисляет новую версию
3. Генерирует changelog из git commits (feat:, fix:, etc.)
4. Обновляет все файлы:
   - `VERSION`
   - `CHANGELOG.md`
   - `releases/releases.json`
   - `miniapp/package.json`
   - `miniapp/src/lib/version.ts` (APP_VERSION + CURRENT_APP_VERSION)
   - `landing/package.json`
   - `landing/src/lib/version.ts`
   - `landing/src/data/releases.json` (копирует из /releases/)
5. Создает git commit и tag

### Ручной процесс (если нужно)

```bash
# 1. Обновить VERSION
echo "1.2.0" > VERSION

# 2. Обновить miniapp/src/lib/version.ts
# - APP_VERSION = '1.2.0'
# - CURRENT_APP_VERSION = 5 (инкремент!)

# 3. Обновить landing/src/lib/version.ts
# - APP_VERSION = '1.2.0'

# 4. Добавить релиз в releases/releases.json (в начало массива)

# 5. Скопировать в landing
cp releases/releases.json miniapp/landing/src/data/releases.json

# 6. Обновить CHANGELOG.md

# 7. Commit & push
git add -A
git commit -m "release: v1.2.0"
git tag v1.2.0
git push && git push --tags
```

## Структура releases.json

```json
{
  "releases": [
    {
      "version": "1.2.0",
      "date": "2026-01-15",
      "tag": "v1.2.0",
      "type": "minor",
      "summary": "Краткое описание релиза",
      "highlights": [
        "Главная фича 1",
        "Главная фича 2"
      ],
      "features": [
        { "description": "Описание фичи", "scope": "miniapp" }
      ],
      "fixes": [
        { "description": "Описание фикса", "scope": "bot" }
      ],
      "improvements": [],
      "breaking": []
    }
  ]
}
```

**Scope:** `bot` | `miniapp` | `landing` | `all`

## Чеклист релиза

- [ ] Все фичи замержены в main
- [ ] Тесты проходят
- [ ] `./scripts/release.sh minor --dry-run` показывает корректный changelog
- [ ] `./scripts/release.sh minor` выполнен
- [ ] `git push && git push --tags`
- [ ] Vercel задеплоил landing и miniapp
- [ ] Проверить уведомление на landing
- [ ] Проверить "Что нового" в mini app
- [ ] Проверить /changelog страницу

## Troubleshooting

### Mini App не показывает "Что нового"

1. Проверь `CURRENT_APP_VERSION` в `miniapp/src/lib/version.ts`
2. Это число должно быть > чем `lastSeenAppVersion` в localStorage пользователя
3. Инкрементируй `CURRENT_APP_VERSION` и передеплой

### Landing не показывает баннер

1. Проверь `releases.json` в `landing/src/data/`
2. Первый релиз в массиве должен быть новым
3. Версия должна отличаться от `localStorage.main_last_seen_version`

### Версии рассинхронизированы

```bash
# Проверить все версии
cat VERSION
grep "APP_VERSION" miniapp/src/lib/version.ts
grep "APP_VERSION" miniapp/landing/src/lib/version.ts
head -1 releases/releases.json

# Синхронизировать вручную если нужно
./scripts/release.sh patch --dry-run  # посмотреть что изменится
```

## Conventional Commits

Скрипт парсит коммиты по префиксам:

| Префикс | Секция в changelog |
|---------|-------------------|
| `feat:` | Added / Features |
| `fix:` | Fixed |
| `refactor:` | Changed |
| `perf:` | Changed |
| `chore:` | Changed |

**Примеры:**
```
feat: add event feedback system
feat(miniapp): implement daily swipes limit
fix: correct XP reward calculation
fix(bot): handle missing user profile
refactor: simplify notification logic
```
