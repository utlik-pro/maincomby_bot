#!/usr/bin/env python3
"""
ТЕСТОВЫЙ скрипт рассылки опроса после ИИшницы №5 (18.12.2024, Минск).

ТОЛЬКО ДЛЯ АДМИНОВ! Не для production!

Использование:
    python test_feedback_minsk_dec18.py

Перед запуском:
1. Убедись, что бот запущен локально (python -m app.main)
2. Запусти миграцию: python migrations/add_feedback_topics.py
3. Узнай ID ивента через /event_list или show_events.py
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from loguru import logger

from app.config import load_settings


# ID ивента Минск 18.12.2024 (уточнить через /event_list!)
EVENT_ID = 3  # TODO: Проверить и исправить если нужно!

# Текст рассылки
MESSAGE_TEXT = """<b>ИИшница № 5 от M.AI.N Community в Минске!</b>

Спасибо, что провел(-а) вечер четверга с M.AI.N!
Здорово, что ты был(а) с нами!

Чтобы следующие ИИшницы стали ещё лучше и полезнее, нам очень нужен твой взгляд.

Пожалуйста, оставь фидбек — это займёт всего пару минут."""


async def main():
    """Тестовая рассылка на админов."""
    settings = load_settings()
    bot = Bot(token=settings.bot_token)

    admin_ids = settings.admin_ids
    if not admin_ids:
        print("Нет админов в ADMIN_IDS!")
        await bot.session.close()
        return

    print(f"Тестовая рассылка опроса")
    print(f"EVENT_ID: {EVENT_ID}")
    print(f"Админы: {admin_ids}")
    print("-" * 40)

    # Клавиатура с кнопкой для начала опроса
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="Оставить отзыв",
            callback_data=f"broadcast_fb_start_{EVENT_ID}"
        )]
    ])

    success = 0
    failed = 0

    for admin_id in admin_ids:
        try:
            await bot.send_message(
                chat_id=admin_id,
                text=MESSAGE_TEXT,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
            print(f"  Отправлено: {admin_id}")
            success += 1
        except Exception as e:
            print(f"  Ошибка {admin_id}: {e}")
            failed += 1

    print("-" * 40)
    print(f"Успешно: {success}")
    print(f"Ошибок: {failed}")
    print("\nТеперь проверь Telegram и пройди опрос!")

    await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
