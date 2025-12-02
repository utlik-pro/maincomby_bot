#!/bin/bash
# Webhook скрипт для автоматического деплоя
# Установка на VPS: запускается через systemd или простой web-сервер

set -e

BOT_DIR="/root/maincomby_bot"
LOG_FILE="/var/log/bot_deploy.log"

echo "[$(date)] 🚀 Webhook triggered - starting deployment" >> "$LOG_FILE"

cd "$BOT_DIR"

# 1. Пулим изменения из GitHub
echo "[$(date)] 📥 Pulling changes from GitHub..." >> "$LOG_FILE"
git pull origin main >> "$LOG_FILE" 2>&1

# 2. Применяем миграции (если есть новые)
echo "[$(date)] 🔄 Checking for migrations..." >> "$LOG_FILE"
if [ -d "migrations" ]; then
    for migration in migrations/*.py; do
        if [ -f "$migration" ]; then
            echo "[$(date)] Running migration: $migration" >> "$LOG_FILE"
            python3 "$migration" >> "$LOG_FILE" 2>&1 || true
        fi
    done
fi

# 3. Пересобираем и перезапускаем контейнер
echo "[$(date)] 🔨 Rebuilding and restarting container..." >> "$LOG_FILE"
docker compose up -d --build >> "$LOG_FILE" 2>&1

# 4. Проверяем статус
echo "[$(date)] ✅ Checking container status..." >> "$LOG_FILE"
docker ps | grep maincomby_bot >> "$LOG_FILE" 2>&1

echo "[$(date)] ✨ Deployment completed successfully!" >> "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> "$LOG_FILE"
