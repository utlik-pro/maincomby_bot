# Чек-лист мер безопасности после восстановления доступа к серверу

⚠️ **КРИТИЧНО**: Выполните ВСЕ пункты сразу после получения доступа к серверу!

## 1. Немедленная диагностика (СРОЧНО!)

```bash
# Подключитесь к серверу
ssh root@104.253.1.54

# 1.1 Проверьте запущенные процессы
ps aux --sort=-%cpu | head -50
ps aux | grep -E 'ssh|scan|brute|attack|bot'

# 1.2 Проверьте активные сетевые соединения
netstat -tupn | grep ESTABLISHED
ss -tupn | grep ESTABLISHED

# 1.3 Проверьте исходящие SSH-подключения (КРИТИЧНО!)
netstat -tupn | grep ':22' | grep ESTABLISHED
lsof -i :22 | grep ESTABLISHED

# 1.4 Проверьте подозрительные файлы в /tmp и /var/tmp
ls -la /tmp /var/tmp
find /tmp /var/tmp -type f -executable

# 1.5 Проверьте cron jobs
crontab -l
cat /etc/crontab
ls -la /etc/cron.*
systemctl list-timers

# 1.6 Проверьте Docker-контейнеры
docker ps -a
docker logs maincomby_bot --tail=100
```

## 2. Остановка подозрительной активности

```bash
# 2.1 Если нашли подозрительные процессы - убейте их
kill -9 <PID>

# 2.2 Проверьте и очистите cron (если есть подозрительные задачи)
crontab -r  # ОСТОРОЖНО: удалит ВСЕ задачи root
# Или отредактируйте: crontab -e

# 2.3 Остановите Docker, если подозреваете компрометацию контейнера
cd /root/maincomby_bot
docker compose down
```

## 3. Проверка логов (Найти точку входа)

```bash
# 3.1 Проверьте SSH логи
tail -n 500 /var/log/auth.log | grep -i 'failed\|accept\|session'
grep 'Accepted' /var/log/auth.log | tail -50

# 3.2 Проверьте системные логи
tail -n 500 /var/log/syslog
journalctl -xe --since "2025-12-08" | grep -i 'ssh\|fail\|error'

# 3.3 Поиск подозрительных файлов (недавно измененных)
find /root /home /tmp /var/tmp -type f -mtime -2 -ls
find /usr/local/bin /usr/bin -type f -mtime -2 -ls
```

## 4. Смена всех паролей (ОБЯЗАТЕЛЬНО!)

```bash
# 4.1 Смените пароль root
passwd root
# Введите ОЧЕНЬ сложный пароль (32+ символов)

# 4.2 Проверьте других пользователей
cat /etc/passwd | grep -v 'nologin\|false'
# Смените пароли для всех пользователей с shell-доступом

# 4.3 Смените пароли к БД (если есть)
# PostgreSQL:
sudo -u postgres psql -c "ALTER USER your_user WITH PASSWORD 'new_password';"
```

## 5. Настройка SSH (Жесткая защита)

```bash
# 5.1 Создайте резервную копию конфига
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# 5.2 Отредактируйте конфиг SSH
nano /etc/ssh/sshd_config

# Добавьте/измените следующие строки:
```
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222
MaxAuthTries 3
LoginGraceTime 30
AllowUsers deployuser  # Создайте нового пользователя!
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
```

```bash
# 5.3 Создайте нового пользователя для SSH (НЕ root!)
adduser deployuser
usermod -aG sudo deployuser

# 5.4 Настройте SSH-ключи для нового пользователя
su - deployuser
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Вставьте ваш PUBLIC ключ
chmod 600 ~/.ssh/authorized_keys
exit

# 5.5 Перезапустите SSH
systemctl restart sshd

# ВАЖНО: Протестируйте вход с НОВОГО терминала ПЕРЕД закрытием текущей сессии!
# В новом терминале: ssh -p 2222 deployuser@104.253.1.54
```

## 6. Настройка Firewall (КРИТИЧНО!)

```bash
# 6.1 Установите UFW (если нет)
apt update && apt install -y ufw

# 6.2 Настройте правила
# РАЗРЕШАЕМ входящие
ufw allow 2222/tcp  # SSH (новый порт)
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 5432/tcp  # PostgreSQL (если нужен внешний доступ)

# БЛОКИРУЕМ исходящий SSH (КРИТИЧНО!)
ufw deny out 22/tcp
ufw deny out 2222/tcp

# РАЗРЕШАЕМ необходимые исходящие
ufw allow out 80/tcp   # HTTP
ufw allow out 443/tcp  # HTTPS
ufw allow out 53       # DNS
ufw allow out 5432/tcp # PostgreSQL (если БД на другом сервере)

# 6.3 Включите firewall
ufw --force enable
ufw status verbose

# 6.4 Дополнительная защита через iptables (двойная защита!)
iptables -A OUTPUT -p tcp --dport 22 -j DROP
iptables -A OUTPUT -p tcp --dport 2220:2230 -j DROP
iptables-save > /etc/iptables/rules.v4
```

## 7. Установка защитного ПО

```bash
# 7.1 Fail2Ban (защита от брутфорса)
apt install -y fail2ban

# Создайте конфиг
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 2222
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl restart fail2ban
fail2ban-client status

# 7.2 Rkhunter (сканер руткитов)
apt install -y rkhunter
rkhunter --update
rkhunter --propupd
rkhunter --check --sk

# 7.3 ClamAV (антивирус)
apt install -y clamav clamav-daemon
systemctl stop clamav-freshclam
freshclam
systemctl start clamav-freshclam
clamscan -r -i /root /home

# 7.4 AIDE (контроль целостности файлов)
apt install -y aide
aideinit
mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
aide --check
```

## 8. Проверка и очистка Docker

```bash
cd /root/maincomby_bot

# 8.1 Проверьте Docker-образы
docker images
docker history maincomby_bot-bot:latest

# 8.2 Пересоберите контейнеры с нуля
docker compose down
docker system prune -a --volumes -f

# 8.3 Пересоберите из чистых образов
docker compose build --no-cache
docker compose up -d

# 8.4 Проверьте логи
docker compose logs --tail=100
```

## 9. Мониторинг и алертинг

```bash
# 9.1 Создайте скрипт мониторинга
cat > /root/monitor_security.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/security_monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Проверка исходящих SSH
OUTGOING_SSH=$(netstat -tupn 2>/dev/null | grep ':22' | grep ESTABLISHED | grep -v '104.253.1.54')
if [ ! -z "$OUTGOING_SSH" ]; then
    echo "[$DATE] ALERT: Outgoing SSH detected!" >> $LOG_FILE
    echo "$OUTGOING_SSH" >> $LOG_FILE
fi

# Проверка CPU
CPU_LOAD=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
if (( $(echo "$CPU_LOAD > 80" | bc -l) )); then
    echo "[$DATE] ALERT: High CPU load: $CPU_LOAD%" >> $LOG_FILE
fi

# Проверка подозрительных процессов
SUSPICIOUS=$(ps aux | grep -iE 'masscan|nmap|hydra|medusa|scan|brute' | grep -v grep)
if [ ! -z "$SUSPICIOUS" ]; then
    echo "[$DATE] ALERT: Suspicious process detected!" >> $LOG_FILE
    echo "$SUSPICIOUS" >> $LOG_FILE
fi
EOF

chmod +x /root/monitor_security.sh

# 9.2 Добавьте в cron (каждые 5 минут)
(crontab -l 2>/dev/null; echo "*/5 * * * * /root/monitor_security.sh") | crontab -

# 9.3 Проверьте, что мониторинг работает
/root/monitor_security.sh
tail /var/log/security_monitor.log
```

## 10. Обновление системы

```bash
# 10.1 Обновите все пакеты
apt update
apt upgrade -y
apt autoremove -y

# 10.2 Установите автоматические обновления безопасности
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## 11. Финальная проверка

```bash
# 11.1 Убедитесь, что исходящие SSH заблокированы
echo "Testing outgoing SSH block..."
timeout 5 nc -zv 8.8.8.8 22 2>&1 | grep -i "refused\|timeout\|failed" && echo "✅ Outgoing SSH blocked" || echo "❌ WARNING: Outgoing SSH NOT blocked!"

# 11.2 Проверьте UFW статус
ufw status verbose

# 11.3 Проверьте Fail2Ban
fail2ban-client status sshd

# 11.4 Проверьте запущенные сервисы
systemctl status docker
systemctl status fail2ban
systemctl status sshd

# 11.5 Проверьте логи
tail -50 /var/log/security_monitor.log
tail -50 /var/log/auth.log
```

## 12. Отчет для хостинга

После выполнения ВСЕХ шагов выше, заполните отчет:

```
✅ Выполненные действия:
1. Проверены все процессы, найдены и остановлены подозрительные: [перечислить]
2. Проверены cron jobs, удалены подозрительные задачи: [перечислить]
3. Сменены все пароли (root, пользователи, БД)
4. SSH усилен: отключен root-login, отключены пароли, изменен порт на 2222
5. Настроен firewall (UFW + iptables): исходящий SSH заблокирован
6. Установлены: Fail2Ban, rkhunter, ClamAV, AIDE
7. Docker-контейнеры пересобраны с нуля
8. Настроен мониторинг каждые 5 минут
9. Система обновлена до последних версий

✅ Проверка исходящего SSH:
[Вставьте вывод: timeout 5 nc -zv 8.8.8.8 22]

✅ Firewall статус:
[Вставьте вывод: ufw status verbose]

✅ Гарантия: Исходящие SSH-подключения технически невозможны.
```

---

## ВАЖНЫЕ ЗАМЕЧАНИЯ:

1. ⚠️ **НЕ закрывайте текущую SSH-сессию** до тех пор, пока не протестируете новый вход в отдельном терминале!
2. ⚠️ **Сохраните приватный SSH-ключ** в безопасном месте
3. ⚠️ **Запишите новый SSH-порт** (2222) - без него не войдете!
4. ⚠️ **После настройки**: `ssh -p 2222 deployuser@104.253.1.54`
5. ⚠️ Если что-то пошло не так - НЕ ЗАКРЫВАЙТЕ текущую сессию, попросите помощи!

## Для быстрого восстановления бота:

После настройки безопасности:
```bash
cd /root/maincomby_bot
docker compose up -d
docker compose logs --tail=100 -f
```

Удачи! Действуйте быстро, но аккуратно.
