# 📝 DigitalOcean: Полезные команды

Справочник команд для работы с ботом на DigitalOcean.

---

## 🔧 Для App Platform

### Через веб-интерфейс

1. **Логи:** Apps → ваш бот → Runtime Logs
2. **Переменные окружения:** Apps → ваш бот → Settings → App-Level Environment Variables
3. **Перезапуск:** Apps → ваш бот → Settings → Deployments → Redeploy

### Через CLI (doctl)

```bash
# Установка doctl (macOS)
brew install doctl

# Авторизация
doctl auth init

# Просмотр всех приложений
doctl apps list

# Просмотр информации о приложении
doctl apps get APP_ID

# Логи в реальном времени
doctl apps logs APP_ID --follow

# Последние 100 строк логов
doctl apps logs APP_ID --tail 100

# Переменные окружения
doctl apps get APP_ID --format Spec.EnvVars

# Обновление переменной окружения
doctl apps update APP_ID --spec spec.yaml
```

---

## 🖥️ Для Droplet

### Подключение

```bash
ssh root@ваш_ip_адрес
```

### Управление ботом

```bash
cd /root/maincomby_bot

# Статус
docker ps | grep maincomby

# Логи
docker logs maincomby_bot --tail 50
docker logs -f maincomby_bot  # в реальном времени

# Остановить
docker compose down

# Запустить
docker compose up -d

# Перезапустить
docker compose restart

# Пересобрать и запустить
docker compose up -d --build
```

### Работа с базой данных

```bash
# Подключиться к контейнеру
docker exec -it maincomby_bot sh

# Внутри контейнера - проверить БД
sqlite3 /app/data/bot.db "SELECT * FROM events;"

# Создать бэкап БД
docker exec maincomby_bot sqlite3 /app/data/bot.db ".backup '/app/data/backup.db'"

# Скопировать БД на локальную машину
docker cp maincomby_bot:/app/data/bot.db ./bot_backup.db

# Или использовать скрипт бэкапа
/root/maincomby_bot/backup.sh
```

### Обновление бота

```bash
cd /root/maincomby_bot

# Создать бэкап перед обновлением
./backup.sh

# Обновить код из Git
git pull origin main

# Пересобрать и перезапустить
docker compose up -d --build

# Проверить логи
docker logs maincomby_bot --tail 30
```

### Мониторинг

```bash
# Использование ресурсов
docker stats maincomby_bot --no-stream

# Размер контейнера
docker ps -s | grep maincomby

# Использование диска
df -h
du -sh /root/maincomby_bot/data

# Проверить запущенные контейнеры
docker ps -a
```

### Управление Docker

```bash
# Очистка неиспользуемых образов
docker image prune -a

# Очистка неиспользуемых контейнеров
docker container prune

# Полная очистка (осторожно!)
docker system prune -a

# Просмотр всех образов
docker images

# Удалить конкретный образ
docker rmi IMAGE_ID
```

---

## 🔄 Резервное копирование

### Создание бэкапа

```bash
# На сервере (Droplet)
cd /root/maincomby_bot
./backup.sh

# Или вручную
docker exec maincomby_bot sqlite3 /app/data/bot.db ".backup '/app/data/backup_$(date +%Y%m%d_%H%M%S).db'"
```

### Скачать бэкап на локальную машину

```bash
# Через scp
scp root@ваш_ip:/root/maincomby_bot/backups/backup_*.db ./

# Через docker cp (если уже подключены)
docker cp maincomby_bot:/app/data/backup.db ./
```

### Восстановление из бэкапа

```bash
cd /root/maincomby_bot

# Остановить бота
docker compose down

# Восстановить БД
cp backups/backup_YYYYMMDD_HHMMSS.db data/bot.db

# Запустить бота
docker compose up -d

# Проверить логи
docker logs maincomby_bot --tail 30
```

---

## 🐛 Отладка

### Проверка переменных окружения

```bash
# В контейнере
docker exec maincomby_bot env | grep BOT_TOKEN
docker exec maincomby_bot env | grep ADMIN

# На хосте (Droplet)
cat /root/maincomby_bot/.env
```

### Проверка подключения к базе данных

```bash
docker exec maincomby_bot python3 -c "
import sqlite3
conn = sqlite3.connect('/app/data/bot.db')
print('База данных доступна')
print('Таблицы:', conn.execute(\"SELECT name FROM sqlite_master WHERE type='table'\").fetchall())
conn.close()
"
```

### Проверка статуса бота

```bash
# Проверить, что процесс запущен
docker ps | grep maincomby

# Проверить последние ошибки в логах
docker logs maincomby_bot 2>&1 | grep -i error | tail -20

# Проверить, что бот получает обновления
docker logs maincomby_bot | grep -i "polling\|update"
```

---

## 📊 Полезные команды для диагностики

```bash
# Использование памяти
free -h

# Использование диска
df -h
du -sh /root/maincomby_bot/*

# Загрузка системы
uptime
top

# Сетевые соединения
netstat -tulpn | grep docker

# Последние строки логов Docker
journalctl -u docker.service -n 50
```

---

## 🔐 Безопасность

### Смена пароля root

```bash
passwd
```

### Настройка SSH ключей

```bash
# На локальной машине - создать ключ
ssh-keygen -t ed25519

# Скопировать публичный ключ на сервер
ssh-copy-id root@ваш_ip

# Отключить вход по паролю (на сервере)
nano /etc/ssh/sshd_config
# Установить: PasswordAuthentication no

# Перезапустить SSH
systemctl restart sshd
```

### Firewall (UFW)

```bash
# Разрешить SSH
ufw allow 22/tcp

# Включить firewall
ufw enable

# Проверить статус
ufw status
```

---

## 🆘 Экстренное восстановление

### Если бот не запускается

```bash
# 1. Проверить логи
docker logs maincomby_bot --tail 100

# 2. Проверить переменные окружения
docker exec maincomby_bot env

# 3. Проверить доступность БД
ls -lh /root/maincomby_bot/data/bot.db

# 4. Перезапустить контейнер
docker compose restart

# 5. Если не помогло - пересобрать
docker compose down
docker compose up -d --build
```

### Если база данных повреждена

```bash
# 1. Остановить бота
docker compose down

# 2. Восстановить из последнего бэкапа
ls -lt /root/maincomby_bot/backups/
cp /root/maincomby_bot/backups/bot_backup_LATEST.db /root/maincomby_bot/data/bot.db

# 3. Запустить бота
docker compose up -d
```

---

## 📚 Дополнительные ресурсы

- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [Docker Documentation](https://docs.docker.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)




