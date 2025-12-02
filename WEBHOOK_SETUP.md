# 🎣 Настройка автоматического деплоя через Webhook (БЕЗ SSH)

Этот гайд поможет настроить автоматический деплой бота при `git push` в main ветку.

---

## 🏗️ Архитектура

```
GitHub Push → GitHub Actions → Webhook → VPS → Auto Deploy
```

**Преимущества:**
- ✅ Никакого SSH в CI/CD
- ✅ Просто делаешь `git push` → бот обновляется
- ✅ Логи деплоя доступны на сервере
- ✅ Безопасность через секретный ключ

---

## 📋 Шаг 1: Установка на VPS (один раз через SSH)

### 1.1 Подключитесь к VPS:

```bash
ssh root@104.253.1.54
```

### 1.2 Установите Flask для webhook сервера:

```bash
pip3 install flask
```

### 1.3 Скопируйте файлы (или git pull с GitHub):

```bash
cd /root/maincomby_bot
git pull origin main
```

### 1.4 Сделайте скрипты исполняемыми:

```bash
chmod +x webhook_deploy.sh webhook_server.py
```

### 1.5 Настройте systemd сервис:

```bash
# Скопируйте файл сервиса
cp webhook_deploy.service /etc/systemd/system/

# Перезагрузите systemd
systemctl daemon-reload

# Запустите сервис
systemctl start webhook_deploy

# Включите автозапуск
systemctl enable webhook_deploy

# Проверьте статус
systemctl status webhook_deploy
```

Вы должны увидеть:
```
● webhook_deploy.service - Webhook Server for Bot Auto-Deploy
   Loaded: loaded (/etc/systemd/system/webhook_deploy.service; enabled)
   Active: active (running)
```

### 1.6 Настройте Nginx (для проксирования webhook):

```bash
# Установите nginx (если нет)
apt install -y nginx

# Создайте конфигурацию
nano /etc/nginx/sites-available/webhook
```

Добавьте:

```nginx
server {
    listen 8080;
    server_name _;

    location /deploy {
        proxy_pass http://127.0.0.1:5000/deploy;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /health {
        proxy_pass http://127.0.0.1:5000/health;
    }
}
```

Активируйте конфигурацию:

```bash
ln -s /etc/nginx/sites-available/webhook /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 1.7 Откройте порт 8080 в файрволе:

```bash
ufw allow 8080/tcp
ufw reload
```

### 1.8 Проверьте работу webhook:

```bash
curl http://104.253.1.54:8080/health
```

Должно вернуть:
```json
{"status": "ok"}
```

---

## 📋 Шаг 2: Настройка GitHub

### 2.1 Добавьте Secret в GitHub репозитории:

1. Откройте: https://github.com/YOUR_USERNAME/maincomby_bot/settings/secrets/actions
2. Нажмите **"New repository secret"**
3. Добавьте:
   - **Name:** `WEBHOOK_URL`
   - **Value:** `http://104.253.1.54:8080/deploy`

### 2.2 (Опционально) Добавьте секретный ключ для безопасности:

1. Сгенерируйте случайный ключ:
   ```bash
   openssl rand -hex 32
   ```

2. Добавьте его в GitHub Secrets:
   - **Name:** `WEBHOOK_SECRET`
   - **Value:** `<сгенерированный_ключ>`

3. Обновите на VPS:
   ```bash
   # Отредактируйте сервис
   nano /etc/systemd/system/webhook_deploy.service

   # Измените строку:
   Environment="WEBHOOK_SECRET=<ваш_сгенерированный_ключ>"

   # Перезапустите
   systemctl daemon-reload
   systemctl restart webhook_deploy
   ```

---

## 📋 Шаг 3: Коммит и пуш

Теперь файлы уже созданы локально. Сделайте коммит:

```bash
git add .github/workflows/deploy.yml webhook_deploy.sh webhook_server.py webhook_deploy.service WEBHOOK_SETUP.md
git commit -m "feat: Add webhook auto-deploy (no SSH required)"
git push origin main
```

---

## ✅ Проверка работы

### Сразу после пуша:

1. Откройте GitHub: **Actions** → увидите запущенный workflow "Deploy to VPS via Webhook"
2. Подождите ~30 секунд
3. Проверьте логи на VPS:

```bash
# Логи деплоя
tail -f /var/log/bot_deploy.log

# Логи webhook сервера
journalctl -u webhook_deploy -f

# Логи бота
docker logs maincomby_bot -f
```

### Тестовый деплой:

1. Измените что-нибудь в коде (например, в README.md)
2. Сделайте коммит:
   ```bash
   git add .
   git commit -m "test: trigger auto-deploy"
   git push origin main
   ```
3. Через 30-60 секунд бот должен перезапуститься с изменениями

---

## 🐛 Troubleshooting

### Webhook не срабатывает:

1. Проверьте статус сервиса:
   ```bash
   systemctl status webhook_deploy
   ```

2. Проверьте логи nginx:
   ```bash
   tail -f /var/log/nginx/error.log
   ```

3. Проверьте, что порт 8080 открыт:
   ```bash
   ufw status
   netstat -tuln | grep 8080
   ```

### Деплой не выполняется:

1. Проверьте логи:
   ```bash
   tail -50 /var/log/bot_deploy.log
   ```

2. Проверьте права доступа:
   ```bash
   ls -la /root/maincomby_bot/webhook_deploy.sh
   chmod +x /root/maincomby_bot/webhook_deploy.sh
   ```

3. Запустите скрипт вручную:
   ```bash
   bash /root/maincomby_bot/webhook_deploy.sh
   ```

---

## 🔐 Безопасность

**⚠️ ВАЖНО:** Webhook URL доступен через HTTP на порту 8080. Для продакшена рекомендуется:

1. **Использовать HTTPS** (настроить Let's Encrypt для домена)
2. **Добавить проверку секретного ключа** (уже реализовано в webhook_server.py)
3. **Ограничить доступ к порту** только с IP GitHub Actions

### Настройка HTTPS (опционально):

Если у вас есть домен (например, `bot.yourdomain.com`):

```bash
# Установите certbot
apt install -y certbot python3-certbot-nginx

# Получите сертификат
certbot --nginx -d bot.yourdomain.com

# Обновите WEBHOOK_URL в GitHub Secrets:
# https://bot.yourdomain.com/deploy
```

---

## 📊 Мониторинг

### Посмотреть последние деплои:

```bash
tail -50 /var/log/bot_deploy.log
```

### Статус webhook сервера:

```bash
systemctl status webhook_deploy
```

### Тест webhook вручную:

```bash
curl -X POST http://104.253.1.54:8080/deploy \
  -H "Content-Type: application/json" \
  -d '{"ref": "refs/heads/main", "repository": "test"}'
```

---

## 🎉 Готово!

Теперь для обновления бота достаточно:

```bash
git add .
git commit -m "fix: your changes"
git push origin main
```

Бот автоматически обновится через ~30-60 секунд! 🚀

---

## 🔄 Альтернатива: Watchtower (Docker Auto-Update)

Если вы хотите автоматически обновлять Docker образы при публикации в Docker Hub:

```bash
# Запустите Watchtower
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 300 \
  maincomby_bot
```

Это будет проверять новые образы каждые 5 минут и автоматически обновлять контейнер.

---

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи: `/var/log/bot_deploy.log`
2. Проверьте статус сервисов: `systemctl status webhook_deploy`
3. Проверьте GitHub Actions: вкладка "Actions" в репозитории
