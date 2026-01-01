"""
Рассылка напоминаний об отзывах участникам мероприятия в Гродно
"""
import asyncio
from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import load_settings
from app.db.models import User, Event, EventRegistration


async def send_feedback_reminder():
    """Отправляет напоминания об отзывах всем участникам события в Гродно."""

    settings = load_settings()
    bot = Bot(token=settings.bot_token)

    # Константы
    EVENT_ID = 2
    ANTI_FLOOD_DELAY = 0.05

    # Подключение к БД
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Получаем информацию о событии
        event_result = await session.execute(
            select(Event).where(Event.id == EVENT_ID)
        )
        event = event_result.scalar_one_or_none()

        if not event:
            print(f"❌ Событие ID {EVENT_ID} не найдено")
            return

        print(f"\n📋 Событие: {event.title}")
        print(f"📅 Дата: {event.event_date}")
        print(f"📍 Город: {event.city}")

        # Получаем список всех зарегистрированных участников
        query = (
            select(User)
            .join(EventRegistration, EventRegistration.user_id == User.id)
            .where(
                and_(
                    EventRegistration.event_id == EVENT_ID,
                    EventRegistration.status == "registered"
                )
            )
        )

        result = await session.execute(query)
        users = result.scalars().all()

        print(f"\n👥 Зарегистрированных участников: {len(users)}")
        print(f"\n🚀 Начинаю рассылку напоминаний об отзывах...\n")

        # Текст сообщения
        message_text = (
            "📝 Привет!\n\n"
            "Спасибо, что были с нами на <b>ИИшнице в Гродно</b> 28 ноября! 🎉\n\n"
            "Нам очень важно ваше мнение — поделитесь впечатлениями!\n\n"
            "Это займёт всего 1 минуту ⏱\n\n"
            "Нажмите кнопку ниже чтобы оставить отзыв.\n\n"
            "Заранее спасибо! ❤️"
        )

        # Inline-кнопка
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text="📝 Оставить отзыв",
                callback_data=f"broadcast_fb_start_{EVENT_ID}"
            )]
        ])

        # Рассылка
        success_count = 0
        blocked_count = 0
        failed_count = 0
        failed_users = []

        for i, user in enumerate(users, 1):
            try:
                display_name = user.username or user.first_name or "Unknown"
                print(f"[{i}/{len(users)}] Отправляю {display_name} (ID: {user.tg_user_id})...", end=" ")

                # Отправляем сообщение
                await bot.send_message(
                    chat_id=user.tg_user_id,
                    text=message_text,
                    reply_markup=keyboard,
                    parse_mode="HTML"
                )

                success_count += 1
                print("✅")

                # Пауза между сообщениями (антифлуд)
                await asyncio.sleep(ANTI_FLOOD_DELAY)

            except Exception as e:
                error_message = str(e).lower()

                if "blocked" in error_message or "bot was blocked" in error_message:
                    blocked_count += 1
                    print("🚫 (заблокировал бота)")
                else:
                    failed_count += 1
                    failed_users.append(f"{display_name} (ID: {user.tg_user_id})")
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

        # Статистика успешности
        if len(users) > 0:
            success_rate = (success_count / len(users)) * 100
            print(f"\n📊 Успешность: {success_rate:.1f}%")

    await engine.dispose()
    await bot.session.close()


if __name__ == "__main__":
    print("="*50)
    print("Рассылка напоминаний об отзывах - Гродно")
    print("="*50)
    asyncio.run(send_feedback_reminder())
