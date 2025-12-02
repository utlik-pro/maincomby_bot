# 🚀 Простые способы деплоя БЕЗ SSH на vdska.ru

Два суперпростых способа обновлять бота без SSH после начальной настройки.

**Хостинг:** vdska.ru VDS/VPS
**IP:** 104.253.1.54

---

## ⚡ Способ 1: Git Pull через Cron (САМЫЙ ПРОСТОЙ)

Настраивается **один раз через SSH**, потом просто делаешь `git push`.

### Установка (один раз через SSH):

```bash
ssh root@104.253.1.54

# Создайте скрипт автообновления
cat > /root/maincomby_bot/auto_update.sh << 'EOF'
#!/bin/bash
cd /root/maincomby_bot
git pull origin main
docker compose up -d --build
echo "[$(date)] ✅ Bot updated" >> /var/log/bot_autoupdate.log
EOF

# Сделайте исполняемым
chmod +x /root/maincomby_bot/auto_update.sh

# Добавьте в cron (проверка каждые 5 минут)
crontab -e
# Добавьте эту строку:
*/5 * * * * /root/maincomby_bot/auto_update.sh
```

**Готово!** Теперь каждые 5 минут сервер проверяет GitHub и обновляется, если есть новые коммиты.

### Использование:

```bash
# На локальной машине
git add .
git commit -m "fix: update bot"
git push origin main

# Подождите до 5 минут → бот автоматически обновится
```

### Проверка логов:

```bash
ssh root@104.253.1.54 "tail -f /var/log/bot_autoupdate.log"
```

---

## 🐳 Способ 2: Watchtower (Docker Auto-Update)

Автоматически обновляет Docker контейнеры при публикации новых образов.

### Вариант A: Обновление из GitHub Container Registry

#### 1. Добавьте GitHub Action для сборки образа:

```yaml
# .github/workflows/docker-publish.yml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
```

#### 2. На VPS обновите docker-compose.yml:

```bash
ssh root@104.253.1.54

# Отредактируйте docker-compose.yml
nano /root/maincomby_bot/docker-compose.yml
```

Измените на:

```yaml
version: "3.8"

services:
  bot:
    image: ghcr.io/YOUR_GITHUB_USERNAME/maincomby_bot:latest
    container_name: maincomby_bot
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data:/app/data

  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_POLL_INTERVAL=300  # Проверка каждые 5 минут
      - WATCHTOWER_CLEANUP=true
    command: maincomby_bot
```

#### 3. Перезапустите:

```bash
docker compose down
docker compose up -d
```

**Готово!** Теперь при `git push` → GitHub собирает образ → Watchtower автоматически обновляет бот.

---

## 📊 Сравнение способов

| Способ | Сложность | Скорость обновления | Логи |
|--------|-----------|---------------------|------|
| **Git Pull через Cron** | ⭐ Очень просто | 0-5 минут | `/var/log/bot_autoupdate.log` |
| **Webhook** (из WEBHOOK_SETUP.md) | ⭐⭐ Средне | ~30 секунд | `/var/log/bot_deploy.log` |
| **Watchtower + GitHub Actions** | ⭐⭐⭐ Сложнее | 1-5 минут | `docker logs watchtower` |

---

## 🎯 Рекомендации

- **Для начала:** используйте **Способ 1 (Git Pull через Cron)** - самый простой
- **Для продакшена:** используйте **Webhook** (см. WEBHOOK_SETUP.md) - быстрее и надежнее
- **Для CI/CD:** используйте **Watchtower + GitHub Actions** - профессиональный подход

---

## ✅ Тестирование

После настройки любого способа:

1. Измените что-нибудь в коде:
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: auto-deploy"
   git push origin main
   ```

2. Подождите 1-5 минут (в зависимости от способа)

3. Проверьте, что бот обновился:
   ```bash
   ssh root@104.253.1.54 "docker logs maincomby_bot --tail 20"
   ```

Должны увидеть свежие логи запуска.

---

## 🐛 Troubleshooting

### Бот не обновляется (Способ 1 - Cron):

```bash
# Проверьте, что скрипт работает
ssh root@104.253.1.54 "bash /root/maincomby_bot/auto_update.sh"

# Проверьте cron логи
ssh root@104.253.1.54 "tail -f /var/log/syslog | grep CRON"

# Проверьте логи автообновления
ssh root@104.253.1.54 "tail -f /var/log/bot_autoupdate.log"
```

### Бот не обновляется (Способ 2 - Watchtower):

```bash
# Проверьте логи Watchtower
ssh root@104.253.1.54 "docker logs watchtower -f"

# Проверьте, что образ собрался в GitHub
# Откройте: https://github.com/YOUR_USERNAME/maincomby_bot/actions
```

---

## 🎉 Готово!

Выберите удобный способ и настройте один раз. После этого для обновления бота достаточно:

```bash
git add .
git commit -m "your changes"
git push origin main
```

И бот обновится автоматически! 🚀
