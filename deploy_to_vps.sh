#!/bin/bash
# Скрипт для развертывания обновлений на VPS
# Использование: bash deploy_to_vps.sh

set -e  # Остановка при ошибке

VPS_IP="104.253.1.54"
VPS_USER="root"
VPS_PASSWORD="gxorqwTvKEKv7"
VPS_PATH="/root/maincomby_bot"

echo "🚀 Начинаю развертывание на VPS..."
echo ""

# 1. Проверка подключения
echo "📡 Проверка подключения к VPS..."
if ! sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $VPS_USER@$VPS_IP "echo 'OK'" > /dev/null 2>&1; then
    echo "❌ Ошибка: не могу подключиться к VPS"
    echo "Проверьте:"
    echo "  - IP адрес: $VPS_IP"
    echo "  - Работает ли VPS"
    echo "  - Есть ли доступ к интернету"
    exit 1
fi
echo "✅ Подключение к VPS установлено"
echo ""

# 2. Остановка бота
echo "🛑 Остановка бота..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $VPS_PATH && docker stop maincomby_bot || true"
echo "✅ Бот остановлен"
echo ""

# 3. Копирование файлов
echo "📦 Копирование обновленных файлов..."
echo "  - Копирование app/..."
sshpass -p "$VPS_PASSWORD" scp -r -o StrictHostKeyChecking=no app/ $VPS_USER@$VPS_IP:$VPS_PATH/

echo "  - Копирование миграции..."
sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no migrations/add_registration_versioning.py $VPS_USER@$VPS_IP:$VPS_PATH/migrations/

echo "  - Копирование видео файла..."
if [ -f "7486356307190949804.MP4" ]; then
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no 7486356307190949804.MP4 $VPS_USER@$VPS_IP:$VPS_PATH/
    echo "✅ Видео файл скопирован"
else
    echo "⚠️  Видео файл не найден, пропускаю"
fi
echo "✅ Все файлы скопированы"
echo ""

# 4. Применение миграции
echo "🔄 Применение миграции БД..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $VPS_PATH && python3 migrations/add_registration_versioning.py"
echo "✅ Миграция применена"
echo ""

# 5. Запуск бота
echo "🚀 Запуск бота..."
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $VPS_PATH && docker compose up -d --build"
echo "✅ Бот запущен"
echo ""

# 6. Проверка логов
echo "📋 Последние 30 строк логов:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "cd $VPS_PATH && docker logs maincomby_bot --tail 30"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ Развертывание завершено успешно!"
echo ""
echo "📝 Следующие шаги:"
echo "  1. Проверьте команду /help в боте"
echo "  2. Проверьте команду /broadcast_video_test"
echo "  3. Проверьте команду /event_stats 1"
echo ""
echo "📄 Полная документация: USAGE_GUIDE.md"
echo ""
echo "Для просмотра логов в реальном времени:"
echo "  sshpass -p '$VPS_PASSWORD' ssh $VPS_USER@$VPS_IP 'docker logs maincomby_bot -f'"
