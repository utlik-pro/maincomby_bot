# 🚀 DigitalOcean: Быстрый старт

Краткая инструкция для развертывания на DigitalOcean App Platform (5 минут).

---

## 📋 Шаги

### 1. Подготовьте токен бота

Получите токен от [@BotFather](https://t.me/BotFather) в Telegram.

### 2. Войдите в DigitalOcean

Откройте [cloud.digitalocean.com](https://cloud.digitalocean.com) и войдите в аккаунт.

### 3. Создайте App

1. **Apps** → **Create App**
2. **GitHub** → Выберите репозиторий `maincomby_bot` → **Next**

### 4. Настройте переменные окружения

В разделе **"Environment Variables"** добавьте:

```bash
BOT_TOKEN=ваш_токен_здесь
ADMIN_IDS=ваш_telegram_id
DATABASE_URL=sqlite+aiosqlite:///./data/bot.db
```

**Как узнать Telegram ID:**
- Напишите боту [@userinfobot](https://t.me/userinfobot) в Telegram

### 5. Добавьте Volume

В разделе **"Resources"** → **"Volumes"**:

- **Name:** `bot-database`
- **Mount Path:** `/app/data`
- **Size:** 1 GB

### 6. Деплойте

1. Выберите план: **Basic - $5/month**
2. Нажмите **"Create Resources"**
3. Подождите 2-5 минут

### 7. Проверьте

1. Откройте **Runtime Logs** - должна быть строка:
   ```
   Starting bot long-polling…
   ```
2. Отправьте `/start` боту в Telegram

---

## ✅ Готово!

Бот работает 24/7 на DigitalOcean.

---

## 📚 Полная документация

См. [DIGITALOCEAN_SETUP.md](DIGITALOCEAN_SETUP.md) для подробной инструкции.




