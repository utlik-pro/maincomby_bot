# 🚀 Деплой БЕЗ SSH - Быстрый старт

**Цель:** После начальной настройки обновлять бота просто через `git push`, без SSH.

---

## 🎯 Выберите способ

### ⚡ **Вариант 1: Git Pull через Cron** (РЕКОМЕНДУЮ для старта)
**Сложность:** ⭐ Очень просто
**Скорость:** 0-5 минут после push
**Документация:** [SIMPLE_DEPLOY.md](./SIMPLE_DEPLOY.md#способ-1-git-pull-через-cron-самый-простой)

#### Быстрая установка:
```bash
# 1. Подключитесь к VPS (последний раз через SSH!)
ssh root@104.253.1.54

# 2. Создайте auto-update скрипт
cat > /root/maincomby_bot/auto_update.sh << 'EOF'
#!/bin/bash
cd /root/maincomby_bot
git pull origin main
docker compose up -d --build
echo "[$(date)] ✅ Bot updated" >> /var/log/bot_autoupdate.log
EOF

# 3. Сделайте исполняемым
chmod +x /root/maincomby_bot/auto_update.sh

# 4. Добавьте в cron (каждые 5 минут)
(crontab -l 2>/dev/null; echo "*/5 * * * * /root/maincomby_bot/auto_update.sh") | crontab -

# 5. Проверьте
crontab -l
```

**Готово!** Теперь просто:
```bash
git push origin main
# Подождите до 5 минут → бот обновится автоматически
```

---

### 🎣 **Вариант 2: Webhook** (для мгновенного деплоя)
**Сложность:** ⭐⭐ Средне
**Скорость:** ~30 секунд после push
**Документация:** [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)

#### Быстрая установка:
```bash
# 1. Подключитесь к VPS
ssh root@104.253.1.54

# 2. Установите Flask
pip3 install flask

# 3. Настройте файлы (уже в репозитории)
cd /root/maincomby_bot
git pull origin main
chmod +x webhook_deploy.sh webhook_server.py

# 4. Установите systemd сервис
cp webhook_deploy.service /etc/systemd/system/
systemctl daemon-reload
systemctl start webhook_deploy
systemctl enable webhook_deploy

# 5. Настройте nginx
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

# 6. Откройте порт
ufw allow 8080/tcp
ufw reload

# 7. Проверьте
curl http://104.253.1.54:8080/health
```

#### Настройка GitHub:
1. Откройте: https://github.com/YOUR_USERNAME/maincomby_bot/settings/secrets/actions
2. Добавьте секрет:
   - **Name:** `WEBHOOK_URL`
   - **Value:** `http://104.253.1.54:8080/deploy`

**Готово!** Теперь:
```bash
git push origin main
# Через ~30 секунд бот обновится автоматически
```

---

### 🐳 **Вариант 3: Watchtower + GitHub Actions** (для профи)
**Сложность:** ⭐⭐⭐ Сложнее
**Скорость:** 1-5 минут после push
**Документация:** [SIMPLE_DEPLOY.md](./SIMPLE_DEPLOY.md#способ-2-watchtower-docker-auto-update)

Для CI/CD через Docker Hub или GitHub Container Registry.

---

## ✅ Тестирование

После настройки любого способа:

```bash
# 1. Сделайте тестовое изменение
echo "# Test auto-deploy" >> README.md

# 2. Закоммитьте и запушьте
git add .
git commit -m "test: auto-deploy"
git push origin main

# 3. Подождите (зависит от способа)
# - Cron: 0-5 минут
# - Webhook: ~30 секунд
# - Watchtower: 1-5 минут

# 4. Проверьте логи
ssh root@104.253.1.54 "docker logs maincomby_bot --tail 20"
```

---

## 📊 Сравнение способов

| Критерий | Cron | Webhook | Watchtower |
|----------|------|---------|------------|
| Сложность настройки | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| Скорость деплоя | 0-5 мин | 30 сек | 1-5 мин |
| Надежность | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| SSH после настройки | ❌ Не нужен | ❌ Не нужен | ❌ Не нужен |
| Логи | `/var/log/bot_autoupdate.log` | `/var/log/bot_deploy.log` | `docker logs watchtower` |

---

## 🐛 Troubleshooting

### Бот не обновляется:

```bash
# Проверьте логи (для Cron)
ssh root@104.253.1.54 "tail -f /var/log/bot_autoupdate.log"

# Проверьте логи (для Webhook)
ssh root@104.253.1.54 "tail -f /var/log/bot_deploy.log"
ssh root@104.253.1.54 "journalctl -u webhook_deploy -f"

# Проверьте, что cron работает
ssh root@104.253.1.54 "crontab -l"
ssh root@104.253.1.54 "systemctl status cron"

# Запустите скрипт вручную для теста
ssh root@104.253.1.54 "/root/maincomby_bot/auto_update.sh"
```

### GitHub Actions не срабатывает:

1. Проверьте: https://github.com/YOUR_USERNAME/maincomby_bot/actions
2. Убедитесь, что файл `.github/workflows/deploy.yml` есть в main ветке
3. Проверьте, что `WEBHOOK_URL` добавлен в Secrets

---

## 🎉 Итог

**Рекомендация:**
1. **Начните с Варианта 1 (Cron)** - самый простой и надежный
2. Если нужен быстрый деплой → переключитесь на **Вариант 2 (Webhook)**
3. Для больших проектов → используйте **Вариант 3 (Watchtower)**

После настройки для обновления бота достаточно:
```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

**БЕЗ SSH!** 🚀

---

## 📚 Дополнительные материалы

- [SIMPLE_DEPLOY.md](./SIMPLE_DEPLOY.md) - Подробные инструкции для Cron и Watchtower
- [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) - Полное руководство по Webhook
- [HOSTING_INFO.md](./HOSTING_INFO.md) - Информация о хостинге vdska.ru
