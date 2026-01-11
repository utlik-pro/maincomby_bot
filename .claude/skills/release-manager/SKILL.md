---
name: release-manager
description: |
  Manages versions and releases for MAIN Community. Activates when:
  - Discussing releases, version updates, or changelog
  - User mentions "what's new", "новая версия", "релиз"
  - After multiple feat:/fix: commits accumulated
  - When version files are out of sync
allowed-tools: Bash(*), Read, Edit, Write, Grep, Glob
---

# Release Manager Skill

Автоматическое управление версиями и релизами MAIN Community.

## Ключевые файлы

| Файл | Назначение |
|------|------------|
| `/VERSION` | Единый источник правды для версии |
| `/CHANGELOG.md` | История изменений (Keep a Changelog) |
| `/releases/releases.json` | Структурированные данные для UI |
| `/scripts/release.sh` | Основной скрипт релиза |
| `/scripts/check-versions.sh` | Проверка синхронизации версий |
| `/docs/RELEASE_GUIDE.md` | Полная документация |

## Команды

### Проверить синхронизацию версий
```bash
./scripts/check-versions.sh
```

### Посмотреть что изменится (dry run)
```bash
./scripts/release.sh minor --dry-run
```

### Создать релиз
```bash
./scripts/release.sh patch   # 1.1.0 → 1.1.1 (багфиксы)
./scripts/release.sh minor   # 1.1.0 → 1.2.0 (новые фичи)
./scripts/release.sh major   # 1.1.0 → 2.0.0 (breaking changes)
```

### После релиза
```bash
git push && git push --tags
```

## Триггеры уведомлений

### Mini App (ChangelogSheet)
- Контролируется `CURRENT_APP_VERSION` в `miniapp/src/lib/version.ts`
- При каждом релизе инкрементируется автоматически
- Пользователи видят "Что нового" при открытии приложения

### Landing (UpdateBanner)
- Контролируется `releases.json` в `landing/src/data/`
- Показывает модалку с highlights нового релиза
- Страница `/changelog` показывает полную историю

## Conventional Commits

Скрипт релиза парсит коммиты по префиксам:

| Префикс | Секция |
|---------|--------|
| `feat:` | Added / Features |
| `fix:` | Fixed |
| `refactor:` | Changed |
| `perf:` | Changed |
| `docs:` | Documentation |

## Когда предлагать релиз

Предложи создать релиз когда:
1. Накопилось 5+ коммитов с `feat:` или `fix:`
2. Прошла неделя с последнего релиза
3. Пользователь спрашивает о версии или changelog
4. Версии в файлах рассинхронизированы

## Проактивные действия

При обнаружении проблем с версиями:
1. Запусти `./scripts/check-versions.sh`
2. Если есть ошибки - предложи исправить
3. Покажи какие файлы нужно обновить
