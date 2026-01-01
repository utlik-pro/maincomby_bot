#!/bin/bash
# Простой скрипт для копирования только нужных файлов на сервер

VPS_IP="104.253.1.54"
VPS_USER="root"
VPS_PATH="/root/maincomby_bot"

echo "🚀 Копирование файлов на сервер..."
echo ""

# Копируем handler для feedback
echo "📁 Копирование app/handlers/feedback.py..."
scp app/handlers/feedback.py $VPS_USER@$VPS_IP:$VPS_PATH/app/handlers/

# Копируем миграцию
echo "📁 Копирование migrations/add_event_feedback.py..."
scp migrations/add_event_feedback.py $VPS_USER@$VPS_IP:$VPS_PATH/migrations/

# Копируем обновлённые файлы
echo "📁 Копирование app/db/models.py..."
scp app/db/models.py $VPS_USER@$VPS_IP:$VPS_PATH/app/db/

echo "📁 Копирование app/main.py..."
scp app/main.py $VPS_USER@$VPS_IP:$VPS_PATH/app/

echo ""
echo "✅ Файлы скопированы!"
echo ""
echo "📋 Теперь выполни на сервере:"
echo "   ssh $VPS_USER@$VPS_IP"
echo "   cd $VPS_PATH"
echo "   python3 migrations/add_event_feedback.py"
echo "   docker compose up -d"
