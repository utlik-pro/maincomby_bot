#!/usr/bin/env python3
"""
Рассылка опроса после ИИшницы №5 (18.12.2024, Минск).

Отправляет опрос ТОЛЬКО зачекинившимся участникам (status = "attended").

Использование:
    python send_feedback_minsk_dec18.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import select, and_
from loguru import logger

from app.config import load_settings
from app.db.session import create_engine, create_session_factory, init_models
from app.db.models import User, EventRegistration


# ID ивента ИИшница №5 Минск 18.12.2024
EVENT_ID = 3

# Anti-flood delay
DELAY = 0.05

# Текст рассылки
MESSAGE_TEXT = """<b>ИИшница № 5 от M.AI.N Community в Минске!</b>

Спасибо, что провел(-а) вечер четверга с M.AI.N!
Здорово, что ты был(а) с нами!

Чтобы следующие ИИшницы стали ещё лучше и полезнее, нам очень нужен твой взгляд.

Пожалуйста, оставь фидбек — это займёт всего пару минут."""


async def main():
    """Рассылка на зачекинившихся участников."""
    settings = load_settings()
    bot = Bot(token=settings.bot_token)

    engine = create_engine()
    await init_models(engine)
    session_factory = create_session_factory(engine)

    # Получаем зачекинившихся пользователей
    async with session_factory() as session:
        result = await session.execute(
            select(User)
            .join(EventRegistration, EventRegistration.user_id == User.id)
            .where(
                and_(
                    EventRegistration.event_id == EVENT_ID,
                    EventRegistration.status == "attended"
                )
            )
        )
        users = result.scalars().all()

    print(f"Рассылка опроса после ИИшницы №5")
    print(f"EVENT_ID: {EVENT_ID}")
    print(f"Зачекинившихся: {len(users)}")
    print("-" * 40)

    if not users:
        print("Нет зачекинившихся пользователей!")
        await bot.session.close()
        return

    # Клавиатура
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="Оставить отзыв",
            callback_data=f"broadcast_fb_start_{EVENT_ID}"
        )]
    ])

    success = 0
    blocked = 0
    failed = 0

    for i, user in enumerate(users, 1):
        try:
            await bot.send_message(
                chat_id=user.tg_user_id,
                text=MESSAGE_TEXT,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
            success += 1
            print(f"  [{i}/{len(users)}] Отправлено: {user.tg_user_id} ({user.first_name})")

        except Exception as e:
            error_msg = str(e).lower()
            if "blocked" in error_msg or "deactivated" in error_msg:
                blocked += 1
                print(f"  [{i}/{len(users)}] Заблокировал: {user.tg_user_id}")
            else:
                failed += 1
                print(f"  [{i}/{len(users)}] Ошибка {user.tg_user_id}: {e}")

        await asyncio.sleep(DELAY)

    print("-" * 40)
    print(f"Успешно: {success}")
    print(f"Заблокировали: {blocked}")
    print(f"Ошибки: {failed}")
    print(f"Всего: {len(users)}")

    await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
