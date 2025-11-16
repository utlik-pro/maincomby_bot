# Быстрая справка

## ⚠️ ВАЖНО: НЕ УДАЛЯЙТЕ И НЕ ИЗМЕНЯЙТЕ `/root/maincomby_bot` НА СЕРВЕРЕ!
**Всегда делайте бэкап перед любыми изменениями:** `/root/maincomby_bot/backup.sh`

---

## 🔑 Доступ к серверу
```bash
ssh root@104.253.1.54
# Пароль: gxorqwTvKEKv7
```

## 📊 Проверка статуса бота
```bash
docker ps | grep maincomby
docker logs maincomby_bot --tail 20
```

## 🔄 Обновление бота

**На локальной машине:**
```bash
# 1. Создать архив
tar czf /tmp/maincomby_bot_update.tar.gz app/ Dockerfile docker-compose.yml requirements.txt migrations/ .dockerignore

# 2. Загрузить и обновить
sshpass -p 'gxorqwTvKEKv7' scp /tmp/maincomby_bot_update.tar.gz root@104.253.1.54:/root/
sshpass -p 'gxorqwTvKEKv7' ssh root@104.253.1.54 "/root/maincomby_bot/update.sh"
```

## 💾 Резервное копирование

**Автоматически:** Каждый день в 3:00 UTC

**Вручную:**
```bash
ssh root@104.253.1.54
/root/maincomby_bot/backup.sh
```

**Просмотр бэкапов:**
```bash
ls -lh /root/maincomby_bot/backups/
```

## 🔧 Управление

**Перезапуск:**
```bash
docker restart maincomby_bot
```

**Остановка:**
```bash
docker stop maincomby_bot
```

**Запуск:**
```bash
docker start maincomby_bot
```

## 📁 Важные пути

- База данных: `/root/maincomby_bot/data/bot.db`
- Бэкапы: `/root/maincomby_bot/backups/`
- Логи бэкапов: `/var/log/maincomby_bot_backup.log`

## 🆘 Быстрое восстановление

```bash
# 1. Подключиться
ssh root@104.253.1.54

# 2. Остановить бота
docker stop maincomby_bot

# 3. Восстановить из бэкапа
cp /root/maincomby_bot/backups/bot_backup_ДАТА.db /root/maincomby_bot/data/bot.db

# 4. Запустить
docker start maincomby_bot
```

## 📈 Статистика БД

```bash
ssh root@104.253.1.54
python3 -c "
import sqlite3
conn = sqlite3.connect('/root/maincomby_bot/data/bot.db')
c = conn.cursor()
c.execute('SELECT COUNT(*) FROM users')
print(f'Пользователей: {c.fetchone()[0]}')
c.execute('SELECT COUNT(*) FROM event_registrations')
print(f'Регистраций: {c.fetchone()[0]}')
c.execute('SELECT COUNT(*) FROM events WHERE is_active=1')
print(f'Активных мероприятий: {c.fetchone()[0]}')
conn.close()
"
```
