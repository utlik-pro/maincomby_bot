#!/usr/bin/env python3
"""
Скрипт для рассылки видео участникам из Минска.
"""

import asyncio
import os
from aiogram import Bot
from aiogram.types import FSInputFile
from aiogram.exceptions import TelegramBadRequest, TelegramForbiddenError
from dotenv import load_dotenv
import sqlite3

# Загрузка переменных окружения
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN not found in environment")

# ID мероприятия "ИИшница от M.AI.N Community в Минске!"
# Нужно найти в базе данных
MINSK_EVENT_ID = None  # Будет определён автоматически

VIDEO_PATH = "/Users/admin/maincomby_bot/IMG_4805.MP4"

MESSAGE_TEXT = """📹 Видео с прошедшей ИИшницы!

<b>Мероприятие:</b> ИИшница от M.AI.N Community в Минске!
<b>Дата:</b> 03.12.2025
<b>Время:</b> 18:30 (регистрация) | 19:00 (начало)
<b>Место:</b> ивент-пространство Beton (Кальварийская, 17)

Ждём вас!"""


async def get_minsk_participants():
    """Получить список участников, зарегистрированных на мероприятия в Минске."""
    db_path = "bot.db"

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Ищем мероприятие в Минске
    cursor.execute("""
        SELECT id, title, city
        FROM events
        WHERE city = 'Минск'
        ORDER BY event_date DESC
        LIMIT 5
    """)
    events = cursor.fetchall()

    print("📊 Найденные мероприятия в Минске:")
    for event_id, title, city in events:
        cursor.execute("""
            SELECT COUNT(*)
            FROM event_registrations
            WHERE event_id = ?
        """, (event_id,))
        count = cursor.fetchone()[0]
        print(f"  [{event_id}] {title} — {count} участников")

    if not events:
        print("❌ Не найдено мероприятий в Минске")
        conn.close()
        return []

    # Берём последнее мероприятие или спрашиваем
    event_id = events[0][0]
    print(f"\n✅ Выбрано мероприятие: [{event_id}] {events[0][1]}")

    # Получаем участников
    cursor.execute("""
        SELECT DISTINCT u.tg_user_id, u.first_name, u.last_name, u.username
        FROM users u
        INNER JOIN event_registrations er ON u.id = er.user_id
        WHERE er.event_id = ?
    """, (event_id,))

    participants = cursor.fetchall()
    conn.close()

    return participants


async def send_video_to_participants():
    """Отправить видео всем участникам."""
    bot = Bot(token=BOT_TOKEN)

    print("🔍 Получение списка участников...")
    participants = await get_minsk_participants()

    if not participants:
        print("❌ Нет участников для рассылки")
        return

    print(f"\n📨 Начинаю рассылку для {len(participants)} участников")
    print(f"📹 Видео: {VIDEO_PATH}")
    print()

    video = FSInputFile(VIDEO_PATH)

    success = 0
    blocked = 0
    errors = 0

    for tg_user_id, first_name, last_name, username in participants:
        try:
            name = f"{first_name} {last_name or ''}".strip()
            username_display = f"@{username}" if username else "(нет username)"

            await bot.send_video(
                chat_id=tg_user_id,
                video=video,
                caption=MESSAGE_TEXT,
                parse_mode="HTML"
            )

            print(f"✅ {name} {username_display}")
            success += 1

            # Пауза между отправками, чтобы не нарваться на rate limit
            await asyncio.sleep(0.5)

        except TelegramForbiddenError:
            print(f"🚫 {name} {username_display} — заблокировал бота")
            blocked += 1

        except TelegramBadRequest as e:
            print(f"⚠️  {name} {username_display} — ошибка: {e}")
            errors += 1

        except Exception as e:
            print(f"❌ {name} {username_display} — неожиданная ошибка: {e}")
            errors += 1

    print()
    print("=" * 50)
    print(f"✅ Успешно: {success}")
    print(f"🚫 Заблокировали бота: {blocked}")
    print(f"❌ Ошибки: {errors}")
    print(f"📊 Всего: {len(participants)}")
    print("=" * 50)

    await bot.session.close()


if __name__ == "__main__":
    asyncio.run(send_video_to_participants())
