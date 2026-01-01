#!/usr/bin/env python3
"""
Скрипт для добавления пользователей в серверную базу данных.
"""

import asyncio
import sqlite3
from datetime import datetime

# Список пользователей для добавления
USERS = [
    {"first_name": "Ксения", "last_name": "Колтун", "username": "KseniyaPdM", "phone": "375291185276"},
    {"first_name": "Денис", "last_name": "Крушев", "username": "Krushevdenis", "phone": "375296165152"},
    {"first_name": "Илья", "last_name": "Семенов", "username": "iwntonlyu", "phone": "375298754138"},
    {"first_name": "Ульяна", "last_name": "Прусак", "username": "mamaeremi", "phone": "375291674971"},
    {"first_name": "Валерьян", "last_name": "Брунин", "username": "valeryan_brunin", "phone": "375297619370"},
    {"first_name": "Евгений", "last_name": "Писарев", "username": "evgenius_smm_minsk", "phone": "375291410961"},
    {"first_name": "Владислав", "last_name": "Койдановский", "username": None, "phone": "375296767777"},
    {"first_name": "Марина", "last_name": "Осипчик", "username": "marina_aesera", "phone": "375292051527"},
    {"first_name": "Анастасия", "last_name": "Прищепова", "username": "lisana333", "phone": "375291988009"},
    {"first_name": "Егор", "last_name": "Крячев", "username": "pjff", "phone": "375291594005"},
    {"first_name": "Айша", "last_name": "Аллазова", "username": "aishaallazova", "phone": "375256903953"},
    {"first_name": "Валерий", "last_name": "Гринько", "username": "grinko_vr", "phone": "375255334168"},
]


async def add_users():
    """Добавляет пользователей в серверную базу данных."""

    db_path = "bot_server.db"

    print(f"📊 Добавление пользователей в СЕРВЕРНУЮ базу данных")
    print(f"📁 База данных: {db_path}")
    print(f"👥 Пользователей для добавления: {len(USERS)}")
    print()

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        added = 0
        skipped = 0

        for user in USERS:
            # Генерируем фейковый telegram ID (начиная с 9000000000)
            cursor.execute("SELECT MAX(tg_user_id) FROM users")
            max_id = cursor.fetchone()[0]
            if max_id is None or max_id < 9000000000:
                tg_user_id = 9000000001
            else:
                tg_user_id = max_id + 1

            # Проверяем, существует ли пользователь по username
            if user['username']:
                cursor.execute(
                    "SELECT id FROM users WHERE username = ?",
                    (user['username'],)
                )
                existing = cursor.fetchone()

                if existing:
                    print(f"⏭️  @{user['username']} уже существует, пропускаем")
                    skipped += 1
                    continue

            # Добавляем пользователя
            cursor.execute("""
                INSERT INTO users (
                    tg_user_id,
                    username,
                    first_name,
                    last_name,
                    phone_number,
                    first_seen_at,
                    points,
                    warns,
                    banned
                ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0)
            """, (
                tg_user_id,
                user['username'],
                user['first_name'],
                user['last_name'],
                user['phone'],
                datetime.utcnow()
            ))

            username_display = f"@{user['username']}" if user['username'] else "(без username)"
            print(f"✅ Добавлен: {user['first_name']} {user['last_name']} {username_display}")
            added += 1

        conn.commit()
        print()
        print(f"✅ Добавлено: {added} пользователей")
        print(f"⏭️  Пропущено: {skipped} (уже существуют)")
        print()
        print("📊 Общее количество пользователей в базе:")
        cursor.execute("SELECT COUNT(*) FROM users")
        total = cursor.fetchone()[0]
        print(f"   👥 Всего: {total}")

    except Exception as e:
        conn.rollback()
        print(f"❌ Ошибка: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    asyncio.run(add_users())
