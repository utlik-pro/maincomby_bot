# ⚡ Шпаргалка: Деплой БЕЗ SSH

## 🎯 Самый простой способ (5 минут)

### 1. Подключись к VPS один раз:

```bash
ssh root@104.253.1.54
```

### 2. Скопируй и выполни:

```bash
cat > /root/maincomby_bot/auto_update.sh << 'EOF'
#!/bin/bash
cd /root/maincomby_bot
git pull origin main
docker compose up -d --build
echo "[$(date)] ✅ Bot updated" >> /var/log/bot_autoupdate.log
EOF

chmod +x /root/maincomby_bot/auto_update.sh

(crontab -l 2>/dev/null; echo "*/5 * * * * /root/maincomby_bot/auto_update.sh") | crontab -

echo "✅ Готово! Бот будет обновляться каждые 5 минут при git push"
exit
```

### 3. Теперь для обновления бота:

```bash
git add .
git commit -m "feat: your changes"
git push origin main

# Подожди 1-5 минут → бот обновится!
```

### 4. Проверка (если нужно):

```bash
ssh root@104.253.1.54 "tail -f /var/log/bot_autoupdate.log"
```

---

## 🚀 Всё!

- **SSH больше не нужен** для обновления бота
- Просто `git push` → бот обновляется автоматически
- Логи: `/var/log/bot_autoupdate.log` на сервере

---

## 📚 Дополнительно

**Если нужен более быстрый деплой (~30 сек):**
- См. [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)

**Подробная документация:**
- [AUTO_DEPLOY_README.md](./AUTO_DEPLOY_README.md) - Обзор всех способов
- [SIMPLE_DEPLOY.md](./SIMPLE_DEPLOY.md) - Подробные инструкции
- [DEPLOY_WITHOUT_SSH.md](./DEPLOY_WITHOUT_SSH.md) - Быстрый старт

**Текущий статус:**
- VPS IP: `104.253.1.54`
- Бот работает: ✅
- Пользователей: 306
- Регистраций: 247
