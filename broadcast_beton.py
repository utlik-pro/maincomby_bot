#!/usr/bin/env python3
"""
Скрипт для локальной рассылки о переносе ИИшницы в Минске.
Отправляет видео beton.mp4 и текстовое сообщение участникам мероприятия.

Использование:
    python3 broadcast_beton.py --test  # Тест на админах
    python3 broadcast_beton.py         # Полная рассылка
"""

import asyncio
import argparse
import sys
from pathlib import Path
from datetime import datetime

# Добавляем путь к проекту
sys.path.insert(0, str(Path(__file__).parent))

from aiogram import Bot
from aiogram.types import FSInputFile
from sqlalchemy import select, and_
from loguru import logger

from app.db.session import create_engine, create_session_factory
from app.db.models import User, Event, EventRegistration
from app.config import load_settings


# Текст сообщения о переносе
BROADCAST_MESSAGE = """Ребята, привет! ❄️
Всех с первым снегом!
Вы такие крутые — регистраций уже больше 120! 🔥
Мы переносим вечернюю ИИшницу на площадку побольше и на новую дату:
🗓️ 3 декабря (среда)
⏰ 18:30
📍 пространство «Бетон» (ул. Кальварийская, 17)
Ваши регистрации остаются действительными ❤️
Ничего переподтверждать не нужно — просто приходите!
Ждём вас на самой тёплой декабрьской ИИшнице! 🫶
Команда M.AI.N - AI Community"""


async def get_event_participants(session_factory, event_id: int):
    """Получает список участников мероприятия."""
    async with session_factory() as session:
        result = await session.execute(
            select(User)
            .join(EventRegistration, EventRegistration.user_id == User.id)
            .where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.status == "registered"
                )
            )
            .distinct()
        )
        users = result.scalars().all()
        return users


async def broadcast_to_users(bot: Bot, users: list, video_path: Path, message_text: str, test_mode: bool = False):
    """Отправляет рассылку пользователям."""
    success_count = 0
    failed_count = 0
    blocked_count = 0
    failed_users = []

    total_users = len(users)

    logger.info(f"{'[TEST MODE] ' if test_mode else ''}Starting broadcast to {total_users} users")

    for idx, user in enumerate(users, 1):
        try:
            # Отправляем видео
            video = FSInputFile(str(video_path))
            await bot.send_video(
                chat_id=user.tg_user_id,
                video=video,
                supports_streaming=True
            )

            # Отправляем текстовое сообщение
            await bot.send_message(
                chat_id=user.tg_user_id,
                text=message_text
            )

            success_count += 1
            logger.info(
                f"[{idx}/{total_users}] ✅ Sent to user {user.tg_user_id} "
                f"(@{user.username or 'no_username'}) - {user.first_name} {user.last_name}"
            )

            # Anti-flood защита: 10 сообщений в секунду
            # Каждому пользователю = 2 сообщения (видео + текст)
            # Итого: 0.2 сек на пользователя
            await asyncio.sleep(0.2)

        except Exception as e:
            error_message = str(e).lower()

            # Проверяем, заблокировал ли пользователь бота
            if "blocked" in error_message or "bot was blocked" in error_message:
                blocked_count += 1
                logger.warning(
                    f"[{idx}/{total_users}] ⚠️  User {user.tg_user_id} has blocked the bot"
                )
            else:
                failed_count += 1
                failed_users.append(f"{user.tg_user_id} (@{user.username or 'no_username'})")
                logger.error(
                    f"[{idx}/{total_users}] ❌ Failed to send to user {user.tg_user_id}: {e}"
                )

    # Финальный отчет
    logger.info("=" * 60)
    logger.info("BROADCAST COMPLETED")
    logger.info("=" * 60)
    logger.info(f"Total users: {total_users}")
    logger.info(f"✅ Success: {success_count}")
    logger.info(f"🚫 Blocked bot: {blocked_count}")
    logger.info(f"❌ Errors: {failed_count}")

    if failed_users and len(failed_users) <= 10:
        logger.info("\n❌ Failed users:")
        for failed_user in failed_users:
            logger.info(f"  • {failed_user}")
    elif failed_users:
        logger.info(f"\n❌ Failed {len(failed_users)} users (too many to display)")

    logger.info("=" * 60)

    return {
        "total": total_users,
        "success": success_count,
        "blocked": blocked_count,
        "failed": failed_count
    }


async def main(test_mode: bool = False):
    """Основная функция."""
    # Настройка логирования
    logger.remove()
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>",
        level="INFO"
    )

    # Загружаем настройки
    settings = load_settings()

    # Проверяем наличие видео
    video_path = Path(__file__).parent / "beton.mp4"
    if not video_path.exists():
        logger.error(f"Video file not found: {video_path}")
        return

    logger.info(f"Video file found: {video_path} ({video_path.stat().st_size / 1024 / 1024:.2f} MB)")

    # Инициализируем бота
    bot = Bot(token=settings.bot_token)

    # Инициализируем БД
    engine = create_engine()
    session_factory = create_session_factory(engine)

    # ID мероприятия (ИИшница в Минске, 3 декабря)
    event_id = 1

    if test_mode:
        logger.warning("=" * 60)
        logger.warning("TEST MODE: Broadcasting to admins only")
        logger.warning("=" * 60)

        # В тестовом режиме создаем фейковых пользователей из админов
        users = []
        for admin_id in settings.admin_ids:
            # Создаем временный объект пользователя
            class FakeUser:
                def __init__(self, tg_id):
                    self.tg_user_id = tg_id
                    self.username = "admin"
                    self.first_name = "Admin"
                    self.last_name = "User"

            users.append(FakeUser(admin_id))
    else:
        # Получаем участников мероприятия
        logger.info(f"Fetching participants for event_id={event_id}...")
        users = await get_event_participants(session_factory, event_id)

        if not users:
            logger.warning(f"No registered users found for event_id={event_id}")
            return

        logger.info(f"Found {len(users)} registered users")

        # Запрашиваем подтверждение
        print("\n" + "=" * 60)
        print(f"Ready to broadcast to {len(users)} users")
        print(f"Event: ИИшница в Минске (ID={event_id})")
        print(f"Video: {video_path.name} ({video_path.stat().st_size / 1024 / 1024:.2f} MB)")
        print("=" * 60)
        confirmation = input("\nProceed with broadcast? (yes/no): ").strip().lower()

        if confirmation not in ["yes", "y"]:
            logger.warning("Broadcast cancelled by user")
            return

    # Запускаем рассылку
    logger.info("Starting broadcast...")
    stats = await broadcast_to_users(bot, users, video_path, BROADCAST_MESSAGE, test_mode)

    # Закрываем бота
    await bot.session.close()

    logger.success("Broadcast script completed!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Broadcast about event venue change")
    parser.add_argument("--test", action="store_true", help="Test mode: send only to admins")
    args = parser.parse_args()

    asyncio.run(main(test_mode=args.test))
