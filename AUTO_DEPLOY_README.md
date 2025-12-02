# 🤖 Автоматический деплой бота (БЕЗ SSH)

> **TL;DR:** Настраиваешь один раз через SSH → потом обновляешь бота просто через `git push`

---

## 🎯 Быстрый выбор

```
Нужна ПРОСТОТА?     → Способ 1: Git Cron (5 минут настройки)
Нужна СКОРОСТЬ?     → Способ 2: Webhook (15 минут настройки)
Нужен CI/CD?        → Способ 3: Watchtower (30 минут настройки)
```

---

## 🚀 Способ 1: Git Cron (РЕКОМЕНДУЮ)

**Время настройки:** 5 минут
**Скорость деплоя:** 0-5 минут после push

### Установка (один раз через SSH):

```bash
ssh root@104.253.1.54 << 'ENDSSH'
cat > /root/maincomby_bot/auto_update.sh << 'EOF'
#!/bin/bash
cd /root/maincomby_bot
git pull origin main
docker compose up -d --build
echo "[$(date)] ✅ Bot updated" >> /var/log/bot_autoupdate.log
EOF
chmod +x /root/maincomby_bot/auto_update.sh
(crontab -l 2>/dev/null; echo "*/5 * * * * /root/maincomby_bot/auto_update.sh") | crontab -
echo "✅ Cron автообновление настроено!"
ENDSSH
```

### Использование:

```bash
git add .
git commit -m "fix: update bot"
git push origin main
# Ждём до 5 минут → бот обновляется автоматически!
```

### Проверка:

```bash
ssh root@104.253.1.54 "tail -f /var/log/bot_autoupdate.log"
```

📄 **Полная инструкция:** [SIMPLE_DEPLOY.md](./SIMPLE_DEPLOY.md)

---

## 🎣 Способ 2: Webhook (для быстрого деплоя)

**Время настройки:** 15 минут
**Скорость деплоя:** ~30 секунд после push

### Установка (один раз через SSH):

```bash
ssh root@104.253.1.54 << 'ENDSSH'
cd /root/maincomby_bot
git pull origin main

# Установка Flask
pip3 install flask

# Настройка файлов
chmod +x webhook_deploy.sh webhook_server.py
cp webhook_deploy.service /etc/systemd/system/
systemctl daemon-reload
systemctl start webhook_deploy
systemctl enable webhook_deploy

# Nginx для проксирования
apt install -y nginx
cat > /etc/nginx/sites-available/webhook << 'EOF'
server {
    listen 8080;
    server_name _;
    location /deploy {
        proxy_pass http://127.0.0.1:5000/deploy;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    location /health {
        proxy_pass http://127.0.0.1:5000/health;
    }
}
EOF
ln -s /etc/nginx/sites-available/webhook /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Открытие порта
ufw allow 8080/tcp
ufw reload

echo "✅ Webhook сервер запущен!"
curl http://104.253.1.54:8080/health
ENDSSH
```

### Настройка GitHub:

1. Откройте: https://github.com/YOUR_USERNAME/maincomby_bot/settings/secrets/actions
2. Нажмите **"New repository secret"**
3. Добавьте:
   - **Name:** `WEBHOOK_URL`
   - **Value:** `http://104.253.1.54:8080/deploy`

### Использование:

```bash
git add .
git commit -m "fix: update bot"
git push origin main
# Через ~30 секунд бот обновляется!
```

📄 **Полная инструкция:** [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)

---

## 🐳 Способ 3: Watchtower + GitHub Actions

**Время настройки:** 30 минут
**Скорость деплоя:** 1-5 минут после push

Для профессионального CI/CD через Docker Hub или GitHub Container Registry.

📄 **Полная инструкция:** [SIMPLE_DEPLOY.md](./SIMPLE_DEPLOY.md#способ-2-watchtower-docker-auto-update)

---

## 📊 Сравнение способов

| Способ | Установка | Деплой | Надежность | Логи |
|--------|-----------|--------|------------|------|
| **Git Cron** | 5 мин | 0-5 мин | ⭐⭐⭐ | `/var/log/bot_autoupdate.log` |
| **Webhook** | 15 мин | 30 сек | ⭐⭐ | `/var/log/bot_deploy.log` |
| **Watchtower** | 30 мин | 1-5 мин | ⭐⭐⭐ | `docker logs watchtower` |

---

## ✅ Проверка работы

После настройки любого способа:

```bash
# 1. Тестовое изменение
echo "# Test $(date)" >> README.md
git add .
git commit -m "test: auto-deploy"
git push origin main

# 2. Проверка через 1-5 минут
ssh root@104.253.1.54 "docker logs maincomby_bot --tail 20"
```

Должны увидеть свежие логи запуска бота.

---

## 🎯 Рекомендация

**Для начала → Способ 1 (Git Cron)**
- ✅ Самый простой
- ✅ Самый надежный
- ✅ Не требует дополнительных портов
- ✅ Подходит для 99% случаев

**Если нужна скорость → Способ 2 (Webhook)**

---

## 🐛 Troubleshooting

### Не работает автообновление:

```bash
# Проверьте cron
ssh root@104.253.1.54 "crontab -l"

# Проверьте логи
ssh root@104.253.1.54 "tail -f /var/log/bot_autoupdate.log"

# Запустите вручную
ssh root@104.253.1.54 "/root/maincomby_bot/auto_update.sh"
```

### Webhook не срабатывает:

```bash
# Проверьте статус
ssh root@104.253.1.54 "systemctl status webhook_deploy"

# Проверьте логи
ssh root@104.253.1.54 "journalctl -u webhook_deploy -f"

# Проверьте nginx
ssh root@104.253.1.54 "curl http://104.253.1.54:8080/health"
```

---

## 📞 Поддержка

**Документация:**
- [DEPLOY_WITHOUT_SSH.md](./DEPLOY_WITHOUT_SSH.md) - Быстрый старт
- [SIMPLE_DEPLOY.md](./SIMPLE_DEPLOY.md) - Git Cron и Watchtower
- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) - Webhook (подробно)
- [HOSTING_INFO.md](./HOSTING_INFO.md) - Информация о хостинге vdska.ru

**Текущий статус бота:**
- Хостинг: vdska.ru VDS/VPS
- IP: `104.253.1.54`
- Пользователей: 306
- Регистраций: 247
- Активность: ✅ Работает

---

## 🎉 Итог

После настройки любого способа для обновления бота достаточно:

```bash
git add .
git commit -m "your changes"
git push origin main
```

**И всё!** Бот обновится автоматически, **БЕЗ SSH**! 🚀
