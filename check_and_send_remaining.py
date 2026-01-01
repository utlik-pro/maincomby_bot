#!/usr/bin/env python3
"""
Скрипт для проверки участников в БД и отправки рассылки тем, кто не получил.
"""

import asyncio
import os
from aiogram import Bot
from aiogram.types import FSInputFile
from aiogram.exceptions import TelegramBadRequest, TelegramForbiddenError
from dotenv import load_dotenv
import sqlite3
from datetime import datetime

# Загрузка переменных окружения
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN not found in environment")

VIDEO_PATH = "/app/IMG_4805.MP4"

MESSAGE_TEXT = """📹 Видео с прошедшей ИИшницы!

<b>Мероприятие:</b> ИИшница от M.AI.N Community в Минске!
<b>Дата:</b> 03.12.2025
<b>Время:</b> 18:30 (регистрация) | 19:00 (начало)
<b>Место:</b> ивент-пространство Beton (Кальварийская, 17)

Ждём вас!"""

# Список всех участников из таблицы
PARTICIPANTS = [
    {"first_name": "Волоха", "last_name": "Алина", "username": "alinavoloha", "phone": "375291245114"},
    {"first_name": "Трофимова", "last_name": "Надежда", "username": "tnadejdaa", "phone": "375296065724"},
    {"first_name": "Шершень", "last_name": "Иван", "username": "vania_jj", "phone": "375336867787"},
    {"first_name": "Троско", "last_name": "Герман", "username": "gerych_siu", "phone": "375295141861"},
    {"first_name": "Голубев", "last_name": "Егор", "username": "SQflex", "phone": "375447387513"},
    {"first_name": "Кушнир", "last_name": "Людмила", "username": "Mil_a111", "phone": "375336869169"},
    {"first_name": "Безнощенко", "last_name": "Виктория", "username": "vikigolubeva", "phone": "375297345682"},
    {"first_name": "Кузьмин", "last_name": "Егор", "username": "RoggeSkog", "phone": "375447729719"},
    {"first_name": "Курильченко", "last_name": "Тарас", "username": "taras_servolux", "phone": "375296526552"},
    {"first_name": "Шкляревский", "last_name": "Евгений", "username": "nevelite", "phone": "375336985740"},
    {"first_name": "Михайловский", "last_name": "Кирилл", "username": "kiryl2005", "phone": "375296560623"},
    {"first_name": "Мороз", "last_name": "Дмитрий", "username": "liqut_tiu", "phone": "375333814126"},
    {"first_name": "Грушевская", "last_name": "Элеонора", "username": "eleonora_gru", "phone": "375445608909"},
    {"first_name": "Шереш", "last_name": "Ольга", "username": "Olgasheresh", "phone": "375293805590"},
    {"first_name": "Кисель", "last_name": "Евгений", "username": "OldKisel", "phone": "375333620073"},
    {"first_name": "Клевитов", "last_name": "Алексей", "username": "aklevitov", "phone": "375293330013"},
    {"first_name": "Скрабатун", "last_name": "Виталий", "username": "Vitali177", "phone": "375336795015"},
    {"first_name": "Комель", "last_name": "Иван", "username": "kofigz", "phone": "375333307432"},
    {"first_name": "Кручёнок", "last_name": "Александра", "username": "ssmlk_ww", "phone": "375291404211"},
    {"first_name": "Котов", "last_name": "Василий", "username": "Vasil556", "phone": "375295686035"},
    {"first_name": "Ефремов", "last_name": "Кирилл", "username": "kirichoar", "phone": "375291942473"},
    {"first_name": "Федькович", "last_name": "Надежда", "username": "Agentt_7_00", "phone": "3750297226320"},
    {"first_name": "Федосов", "last_name": "Егор", "username": "inqua", "phone": "375259521298"},
    {"first_name": "Ишеков", "last_name": "Андрей", "username": "andrewvvvw", "phone": "375336969303"},
    {"first_name": "Морозовец", "last_name": "Дмитрий", "username": "DzmitriM", "phone": "3750296176689"},
    {"first_name": "Федорченко", "last_name": "Анна", "username": "annafiad", "phone": "375296093374"},
    {"first_name": "Грушевский", "last_name": "Евгений", "username": "ZhekaGrushevskiy", "phone": "375295237498"},
    {"first_name": "Моссэ", "last_name": "Екатерина", "username": "katemosse", "phone": "375293220885"},
    {"first_name": "Пичугин", "last_name": "Юпитер", "username": "ArtaDIP", "phone": "375295002500"},
    {"first_name": "Пичугина", "last_name": "Диана", "username": "DianaPichugina", "phone": "375296237896"},
    {"first_name": "Михнюк", "last_name": "Александр", "username": "poostotel", "phone": "375444765694"},
    {"first_name": "Яник", "last_name": "Ксения", "username": "ksenkssaa", "phone": "375296688104"},
    {"first_name": "Колтун", "last_name": "Ксения", "username": "KseniyaPdM", "phone": "375291185276"},
    {"first_name": "Мавчун", "last_name": "Артем", "username": "Mefl15", "phone": "375255405690"},
    {"first_name": "Диана", "last_name": "", "username": "pepelishka", "phone": "375296794010"},
    {"first_name": "Весельков", "last_name": "Максим", "username": "mx_veselkov", "phone": "375333013026"},
    {"first_name": "Далинник", "last_name": "Виктория", "username": None, "phone": "375297667804"},
    {"first_name": "Кошев", "last_name": "Никита", "username": "nickJAW", "phone": "375298848248"},
    {"first_name": "Крушев", "last_name": "Денис", "username": "Krushevdenis", "phone": "375296165152"},
    {"first_name": "Резников", "last_name": "Владимир", "username": None, "phone": "375296767777"},
    {"first_name": "Семенов", "last_name": "Илья", "username": "iwntonlyu", "phone": "375298754138"},
    {"first_name": "Прусак", "last_name": "Ульяна", "username": "mamaeremi", "phone": "375291674971"},
    {"first_name": "Брунин", "last_name": "Валерьян", "username": "valeryan_brunin", "phone": "375297619370"},
    {"first_name": "Писарев", "last_name": "Евгений", "username": "evgenius_smm_minsk", "phone": "375291410961"},
    {"first_name": "Койдановский", "last_name": "Владислав", "username": None, "phone": "375296767777"},
    {"first_name": "Осипчик", "last_name": "Марина", "username": "marina_aesera", "phone": "375292051527"},
    {"first_name": "Прищепова", "last_name": "Анастасия", "username": "lisana333", "phone": "375291988009"},
    {"first_name": "Вдовин", "last_name": "Дмитрий", "username": "dm_vdovin", "phone": "375297076151"},
    {"first_name": "Рутковский", "last_name": "Андрей", "username": "andrey_rutk", "phone": "375293032604"},
    {"first_name": "Войнилович", "last_name": "Кристина", "username": "kvoinilovich", "phone": "375333173817"},
    {"first_name": "Лавринович", "last_name": "Александр", "username": "propanorm", "phone": "375297677462"},
    {"first_name": "Крячев", "last_name": "Егор", "username": "pjff", "phone": "375291594005"},
    {"first_name": "Аллазова", "last_name": "Айша", "username": "aishaallazova", "phone": "375256903953"},
    {"first_name": "Гринько", "last_name": "Валерий", "username": "grinko_vr", "phone": "375255334168"},
    {"first_name": "Чирко", "last_name": "Илья", "username": "chirkoed", "phone": None},
]


async def check_and_add_users():
    """Проверяет и добавляет отсутствующих пользователей в БД."""
    db_path = "data/bot.db"

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("=" * 60)
    print("📊 ПРОВЕРКА ПОЛЬЗОВАТЕЛЕЙ В БАЗЕ ДАННЫХ")
    print("=" * 60)
    print()

    missing_users = []
    existing_users = []

    for user in PARTICIPANTS:
        # Проверяем по username (если есть) или по телефону
        if user['username']:
            cursor.execute(
                "SELECT id, tg_user_id, username FROM users WHERE username = ?",
                (user['username'],)
            )
        else:
            cursor.execute(
                "SELECT id, tg_user_id, username FROM users WHERE phone_number = ?",
                (user['phone'],)
            )

        existing = cursor.fetchone()

        if existing:
            existing_users.append({
                **user,
                'db_id': existing[0],
                'tg_user_id': existing[1]
            })
        else:
            missing_users.append(user)

    print(f"✅ Найдено в БД: {len(existing_users)}")
    print(f"❌ Отсутствует в БД: {len(missing_users)}")
    print()

    if missing_users:
        print("📝 Добавление отсутствующих пользователей:")
        print()

        added = 0
        for user in missing_users:
            # Генерируем фейковый telegram ID
            cursor.execute("SELECT MAX(tg_user_id) FROM users")
            max_id = cursor.fetchone()[0]
            if max_id is None or max_id < 9000000000:
                tg_user_id = 9000000001
            else:
                tg_user_id = max_id + 1

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
            print(f"   ➕ {user['first_name']} {user['last_name']} {username_display}")
            added += 1

        conn.commit()
        print()
        print(f"✅ Добавлено: {added} пользователей")
        print()

    conn.close()

    return existing_users, missing_users


async def send_video_to_remaining():
    """Отправляет видео тем, кто ещё не получил."""
    bot = Bot(token=BOT_TOKEN)

    print("=" * 60)
    print("📨 РАССЫЛКА ВИДЕО")
    print("=" * 60)
    print()

    existing_users, missing_users = await check_and_add_users()

    if not existing_users and not missing_users:
        print("❌ Нет пользователей для рассылки")
        return

    # Получаем список тех, кто уже в БД (у них есть настоящий tg_user_id)
    real_users = [u for u in existing_users if u['tg_user_id'] < 9000000000]

    print(f"👥 Пользователей с реальными Telegram ID: {len(real_users)}")
    print(f"🔄 Начинаю рассылку...")
    print()

    if not real_users:
        print("⚠️  Нет пользователей с реальными Telegram ID для рассылки")
        print("   (пользователи с фейковыми ID получат видео когда напишут боту)")
        return

    video = FSInputFile(VIDEO_PATH)

    success = 0
    blocked = 0
    errors = 0

    for user in real_users:
        try:
            name = f"{user['first_name']} {user['last_name'] or ''}".strip()
            username_display = f"@{user['username']}" if user['username'] else "(нет username)"

            await bot.send_video(
                chat_id=user['tg_user_id'],
                video=video,
                caption=MESSAGE_TEXT,
                parse_mode="HTML"
            )

            print(f"✅ {name} {username_display}")
            success += 1

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
    print("=" * 60)
    print(f"✅ Успешно: {success}")
    print(f"🚫 Заблокировали бота: {blocked}")
    print(f"❌ Ошибки: {errors}")
    print(f"📊 Всего попыток: {len(real_users)}")
    print("=" * 60)

    await bot.session.close()


if __name__ == "__main__":
    asyncio.run(send_video_to_remaining())
