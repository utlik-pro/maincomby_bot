# 🚀 Быстрый старт для Dokploy

## ⚡ За 5 минут до деплоя

### 1️⃣ Подготовка (уже сделано ✅)
- ✅ Dockerfile создан
- ✅ docker-compose.yml создан
- ✅ .dockerignore создан

### 2️⃣ Загрузка на GitHub

```bash
# Инициализируем git (если еще не сделано)
git init
git add .
git commit -m "Initial commit with Dokploy support"

# Создайте репозиторий на GitHub, затем:
git remote add origin https://github.com/ваш-username/maincomby_bot.git
git push -u origin main
```

### 3️⃣ Деплой на Dokploy

1. **Откройте Dokploy** → http://ваш-сервер:3000
2. **New Project** → Введите название (например: `maincomby-bot`)
3. **Add Application** → Docker Compose
4. **Git Repository:**
   - URL: ваш репозиторий GitHub
   - Branch: `main`
   - ✅ Auto Deploy
5. **Environment Variables** → добавьте:
   ```
   BOT_TOKEN=ваш_токен
   ADMIN_IDS=ваш_telegram_id
   DATABASE_URL=sqlite+aiosqlite:///./data/bot.db
   ```
6. **Volumes** (важно для сохранения БД!):
   - Container path: `/app/data`
   - Host path: `/dokploy/data/maincomby_bot`
7. **Deploy** → нажать кнопку

### 4️⃣ Проверка

```bash
# В Dokploy UI проверьте логи
# Должно быть: "Starting bot long-polling…"
```

Готово! Бот работает 24/7 🎉

---

## 🔄 Обновление после изменений

```bash
git add .
git commit -m "Update bot"
git push
```

Dokploy автоматически пересоберет и перезапустит бот!

---

## 📊 Полезные команды администратора

В боте (как админ):
- `/event_stats 1` - список зарегистрированных
- `/export_leads 1` - экспорт лидов в CSV
- `/list_events` - все мероприятия
- `/create_event` - создать новое мероприятие

---

## 🆘 Проблемы?

Смотрите полную инструкцию: [DEPLOY.md](DEPLOY.md)
