## Telegram Admin Bot (aiogram 3)

### Quick start

#### 1. Создание бота через @BotFather

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Укажите имя бота (например: "MainComby Admin Bot")
4. Укажите username бота (должен заканчиваться на `bot`, например: `maincomby_admin_bot`)
5. Сохраните полученный токен (формат: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### 2. Настройка .env файла

1. Откройте `.env` файл
2. Вставьте полученный токен в `BOT_TOKEN=ваш_токен_здесь`
3. Укажите ID администраторов в `ADMIN_IDS=123456789,987654321` (как узнать ID — см. ниже)
4. При необходимости настройте остальные параметры

#### 3. Установка зависимостей

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

#### 4. Как добавить бота в группу/канал

**Для группы:**
1. Откройте группу в Telegram
2. Перейдите в "Настройки группы" → "Администраторы"
3. Нажмите "Добавить администратора"
4. Найдите вашего бота по username (например: `@maincomby_admin_bot`)
5. Выдайте права:
   - ✅ Удалять сообщения
   - ✅ Блокировать пользователей
   - ✅ Закреплять сообщения (опционально)
   - ✅ Редактировать сообщения (опционально)
   - ✅ Управлять чатом (опционально, для супергрупп)

**Для канала:**
1. Откройте канал в Telegram
2. Перейдите в "Настройки канала" → "Администраторы"
3. Нажмите "Добавить администратора"
4. Найдите вашего бота по username
5. Выдайте права:
   - ✅ Публиковать сообщения
   - ✅ Редактировать сообщения
   - ✅ Удалять сообщения

**Важно:** Бот должен быть добавлен как администратор, иначе он не сможет удалять сообщения и банить пользователей.

#### 5. Как узнать свой Telegram ID (для ADMIN_IDS)

1. Напишите боту [@userinfobot](https://t.me/userinfobot) — он покажет ваш ID
2. Или добавьте временно бота в группу и проверьте логи при отправке сообщения

#### 6. Запуск бота

```bash
python -m app.main
```

Бот должен ответить в логах, что он запущен и работает через long-polling.

### OpenAI (необязательно)

- Добавьте в `.env`:
  - `OPENAI_API_KEY=...`
  - `OPENAI_MODEL=gpt-5-chat-latest`
- После этого бот сможет генерировать краткие ответы модерации, саммари постов и черновики анонсов.

### Система модерации новостей из каналов конкурентов

Бот автоматически:
1. Мониторит каналы-источники (конкуренты)
2. Адаптирует новости через OpenAI (убирает рекламу, промокоды, ссылки конкурентов)
3. Отправляет адаптированные новости в промежуточный канал для модерации
4. После одобрения админом публикует в основной канал

**Настройка:**

1. Создайте канал/группу для модерации (промежуточный)
2. Добавьте бота туда как администратора
3. Узнайте ID канала (можно через [@userinfobot](https://t.me/userinfobot) или [@getidsbot](https://t.me/getidsbot))
4. Добавьте в `.env`:
   ```
   INTERMEDIATE_CHAT_ID=-1001234567890  # ID канала для модерации
   TARGET_CHANNEL_ID=-1001234567890      # ID основного канала для публикации
   ```
5. Добавьте бота в каналы-источники (конкуренты) как подписчика
6. В группе с ботом выполните одну из команд:

   **Быстрое добавление всех предустановленных каналов:**
   ```
   /add_default_channels
   ```
   
   Или добавьте каналы по одному:
   ```
   /add_source_channel @elkornacio
   /add_source_channel @tips_ai
   /add_source_channel @data_secrets
   /add_source_channel @ii_community
   /add_source_channel @cryptoEssay
   /add_source_channel @lovedeathtransformers
   /add_source_channel @ArtificialIntelligencedl
   ```

**Предустановленные каналы-источники:**
- [@elkornacio](https://t.me/elkornacio) - ElKornacio (технологии и бизнес)
- [@tips_ai](https://t.me/tips_ai) - Tips AI | IT & AI
- [@data_secrets](https://t.me/data_secrets) - Data Secrets (машинное обучение)
- [@ii_community](https://t.me/ii_community) - ИИ (полное погружение в мир ИИ)
- [@cryptoEssay](https://t.me/cryptoEssay) - e/acc (AI, web3, технологии)
- [@lovedeathtransformers](https://t.me/lovedeathtransformers) - Love. Death. Transformers
- [@ArtificialIntelligencedl](https://t.me/ArtificialIntelligencedl) - Artificial Intelligence

**Команды админа:**
- `/add_default_channels` — добавить все предустановленные каналы-источники
- `/add_source_channel @channel` — добавить канал-источник
- `/list_source_channels` — список отслеживаемых каналов
- `/list_pending` — посты на модерации
- `/approve_<id>` — одобрить и опубликовать пост
- `/reject_<id>` — отклонить пост

**Как работает:**
- Бот автоматически получает новые посты из каналов-источников
- Через OpenAI адаптирует текст (убирает рекламу, сохраняет факты)
- Если новость рекламная — автоматически пропускается
- Адаптированная новость отправляется в промежуточный канал
- Админ одобряет или отклоняет через команды
- После одобрения — публикация в основной канал

### Features (roadmap)

- Moderation: track messages, questions, warns/bans, deletes
- Points & rewards: per-user scoring, leaderboard, badges
- News: RSS/forwarding from other channels with filters
- Surveys: Telegram polls + simple data collection
- Announcements: events, speakers, scheduled posts & DM campaigns
- Admin roles/permissions and commands

### Structure

```
app/
  __init__.py
  config.py
  main.py
  bot.py
  handlers/
    __init__.py
    base.py
  db/
    __init__.py
    models.py
    session.py
  services/
    __init__.py
    scheduler.py
```


