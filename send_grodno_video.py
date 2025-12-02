"""
Рассылка видео-инструкции участникам мероприятия в Гродно
"""
import asyncio
from pathlib import Path
from aiogram import Bot
from aiogram.types import FSInputFile
from sqlalchemy import select, and_, update
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.config import load_settings
from app.db.models import User, Event, EventRegistration


async def send_video_instruction():
    """Отправляет видео-инструкцию всем участникам события в Гродно."""

    settings = load_settings()
    bot = Bot(token=settings.bot_token)

    # Путь к видео
    video_path = Path("/Users/admin/maincomby_bot/IMG_4732.MP4")

    if not video_path.exists():
        print(f"❌ Видео файл не найден: {video_path}")
        return

    print(f"✅ Видео файл найден: {video_path} ({video_path.stat().st_size / 1024 / 1024:.1f} MB)")

    # Подключение к БД
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    event_id = 2  # Событие в Гродно

    async with async_session() as session:
        # Получаем информацию о событии
        event_result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = event_result.scalar_one_or_none()

        if not event:
            print(f"❌ Событие ID {event_id} не найдено")
            return

        print(f"\n📋 Событие: {event.title}")
        print(f"📅 Дата: {event.event_date}")
        print(f"📍 Место: {event.location}")

        # Получаем список участников
        query = (
            select(User)
            .join(EventRegistration, EventRegistration.user_id == User.id)
            .where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.status == "registered"
                )
            )
        )

        result = await session.execute(query)
        users = result.scalars().all()

        print(f"\n👥 Участников с регистрацией: {len(users)}")
        print(f"\n🚀 Начинаю рассылку видео-инструкции...\n")

        # Текст сообщения
        message_text = (
            "📍 <b>Как найти место проведения мероприятия</b>\n\n"
            f"Адрес: {event.location or 'ул. Гаспадарчая, 21А, Техно парк'}\n\n"
            "🎥 В видео показываем как дойти в конференцзал\n\n"
            f"Ждём вас сегодня в {event.event_date.strftime('%H:%M')}!"
        )

        # Рассылка
        success_count = 0
        blocked_count = 0
        failed_count = 0
        failed_users = []

        for i, user in enumerate(users, 1):
            try:
                print(f"[{i}/{len(users)}] Отправляю {user.username or user.first_name} (ID: {user.tg_user_id})...", end=" ")

                # Отправляем видео с текстом
                await bot.send_video(
                    chat_id=user.tg_user_id,
                    video=FSInputFile(video_path),
                    caption=message_text,
                    parse_mode="HTML",
                    width=1080,
                    height=1920,
                    supports_streaming=True
                )

                success_count += 1
                print("✅")

                # Пауза между сообщениями (антифлуд)
                await asyncio.sleep(0.1)

            except Exception as e:
                error_message = str(e).lower()

                if "blocked" in error_message or "bot was blocked" in error_message:
                    blocked_count += 1
                    print("🚫 (заблокировал бота)")
                else:
                    failed_count += 1
                    failed_users.append(f"{user.username or user.first_name} (ID: {user.tg_user_id})")
                    print(f"❌ ({e})")

        # Финальный отчет
        print(f"\n" + "="*50)
        print(f"✅ Рассылка завершена!")
        print(f"="*50)
        print(f"👥 Всего участников: {len(users)}")
        print(f"✅ Успешно отправлено: {success_count}")
        print(f"🚫 Заблокировали бота: {blocked_count}")
        print(f"❌ Ошибки отправки: {failed_count}")

        if failed_users and len(failed_users) <= 10:
            print(f"\n❌ Не удалось отправить:")
            for failed_user in failed_users:
                print(f"  • {failed_user}")
        elif failed_users:
            print(f"\n❌ Не удалось отправить {len(failed_users)} пользователям")

    await engine.dispose()
    await bot.session.close()


if __name__ == "__main__":
    print("="*50)
    print("Рассылка видео-инструкции для Гродно")
    print("="*50)
    asyncio.run(send_video_instruction())
