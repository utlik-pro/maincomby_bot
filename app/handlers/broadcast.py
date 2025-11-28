"""
Broadcast module for sending video notes and messages to participants.
Handles admin-only mass communications with anti-flood protection.
"""

from __future__ import annotations

import asyncio
from datetime import datetime
from pathlib import Path

from aiogram import Router, Bot
from aiogram.filters import Command
from aiogram.types import Message, FSInputFile
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from ..db.models import EventRegistration, User, Event
from ..config import load_settings

router = Router()

# Доступные города для рассылки
VALID_CITIES = ["Минск", "Гродно"]

# Глобальная сессия (будет инициализирована в main.py)
_session_factory = None


def set_session_factory(factory):
    """Устанавливает фабрику сессий."""
    global _session_factory
    _session_factory = factory


def get_session() -> AsyncSession:
    """Получает сессию БД."""
    if _session_factory is None:
        raise RuntimeError("Session factory not initialized. Call set_session_factory() first.")
    return _session_factory()


async def is_admin(user_id: int) -> bool:
    """Проверяет, является ли пользователь администратором."""
    settings = load_settings()
    return user_id in settings.admin_ids


def validate_and_normalize_city(city_input: str) -> str | None:
    """
    Валидирует и нормализует название города.

    Args:
        city_input: Введённое название города

    Returns:
        Нормализованное название города из VALID_CITIES или None если город недопустим
    """
    for valid_city in VALID_CITIES:
        if city_input.strip().lower() == valid_city.lower():
            return valid_city
    return None


async def _send_video_broadcast(
    bot: Bot,
    users: list[User],
    video_path: Path,
    event_id: int | None = None,
    event: Event | None = None,
    mark_reminder_sent: bool = False
) -> tuple[int, int, int, list[str]]:
    """
    Внутренняя функция для отправки видео-рассылок пользователям.

    Args:
        bot: Экземпляр бота
        users: Список пользователей для рассылки
        video_path: Путь к видео файлу
        event_id: ID мероприятия (опционально, для кнопок подтверждения)
        event: Объект мероприятия (опционально)
        mark_reminder_sent: Отметить в БД, что напоминание отправлено

    Returns:
        Кортеж (success_count, blocked_count, failed_count, failed_users)
    """
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    from sqlalchemy import update

    success_count = 0
    blocked_count = 0
    failed_count = 0
    failed_users = []

    logger.info(f"Starting video broadcast to {len(users)} users (event_id={event_id}, mark_reminder={mark_reminder_sent})")

    for user in users:
        try:
            # Отправляем видео-кружок
            video = FSInputFile(str(video_path))
            await bot.send_video_note(
                chat_id=user.tg_user_id,
                video_note=video
            )

            # Отправляем сообщение с кнопками подтверждения (только если указан event_id)
            if event_id:
                keyboard = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(
                        text="✅ Буду!",
                        callback_data=f"attend_{event_id}_{user.tg_user_id}"
                    )],
                    [InlineKeyboardButton(
                        text="❌ Не смогу прийти",
                        callback_data=f"not_attend_{event_id}_{user.tg_user_id}"
                    )]
                ])

                await bot.send_message(
                    chat_id=user.tg_user_id,
                    text="Подтвердите, пожалуйста, ваше участие:",
                    reply_markup=keyboard
                )

            success_count += 1
            logger.info(f"✅ Video note sent to user {user.tg_user_id} ({user.username or 'no username'})")

            # Отметить в БД, что напоминание отправлено
            if mark_reminder_sent and event_id:
                async with get_session() as session:
                    await session.execute(
                        update(EventRegistration)
                        .where(
                            and_(
                                EventRegistration.event_id == event_id,
                                EventRegistration.user_id == user.id
                            )
                        )
                        .values(
                            reminder_sent=True,
                            reminder_sent_at=datetime.utcnow()
                        )
                    )
                    await session.commit()
                    logger.info(f"📝 Marked reminder as sent for user {user.id} at event {event_id}")

            # Anti-flood защита
            await asyncio.sleep(0.1)

        except Exception as e:
            error_message = str(e).lower()

            # Проверяем, заблокировал ли пользователь бота
            if "blocked" in error_message or "bot was blocked" in error_message:
                blocked_count += 1
                logger.warning(f"⚠️ User {user.tg_user_id} has blocked the bot")
            else:
                failed_count += 1
                failed_users.append(f"{user.tg_user_id} ({user.username or 'no username'})")
                logger.error(f"❌ Failed to send video note to user {user.tg_user_id}: {e}")

    return success_count, blocked_count, failed_count, failed_users


@router.message(Command("broadcast_video_test"))
async def cmd_broadcast_video_test(message: Message, bot: Bot):
    """
    Тестовая рассылка видео-кружка только администраторам.
    Использование: /broadcast_video_test
    """
    if not await is_admin(message.from_user.id):
        await message.reply("❌ Только администраторы могут использовать эту команду.")
        return

    settings = load_settings()
    video_path = Path(__file__).parent.parent.parent / "7486356307190949804.MP4"

    if not video_path.exists():
        await message.reply(f"❌ Видео файл не найден: {video_path}")
        return

    await message.answer("🚀 Начинаю тестовую рассылку видео-кружка администраторам...")

    success_count = 0
    failed_count = 0
    failed_admins = []

    for admin_id in settings.admin_ids:
        try:
            video = FSInputFile(str(video_path))
            await bot.send_video_note(
                chat_id=admin_id,
                video_note=video
            )
            success_count += 1
            logger.info(f"✅ Video note sent to admin {admin_id}")

            # Anti-flood защита: 30 сообщений/сек = 0.033 сек между отправками
            # Используем 0.05 сек для безопасности
            await asyncio.sleep(0.05)

        except Exception as e:
            failed_count += 1
            failed_admins.append(admin_id)
            logger.error(f"❌ Failed to send video note to admin {admin_id}: {e}")

    # Отчет о рассылке
    report = (
        f"✅ <b>Тестовая рассылка завершена!</b>\n\n"
        f"📊 Результаты:\n"
        f"✅ Успешно: {success_count}\n"
        f"❌ Ошибки: {failed_count}\n"
    )

    if failed_admins:
        report += f"\n❌ Не удалось отправить админам: {', '.join(map(str, failed_admins))}"

    await message.answer(report, parse_mode="HTML")


@router.message(Command("broadcast_video"))
async def cmd_broadcast_video(message: Message, bot: Bot):
    """
    Рассылка видео-кружка всем участникам мероприятия.
    Использование: /broadcast_video <event_id>
    Если event_id не указан, отправляет всем зарегистрированным пользователям.
    """
    if not await is_admin(message.from_user.id):
        await message.reply("❌ Только администраторы могут использовать эту команду.")
        return

    # Парсинг аргументов
    args = message.text.split()
    event_id = None
    if len(args) > 1:
        try:
            event_id = int(args[1])
        except ValueError:
            await message.reply("❌ Неверный формат ID мероприятия. Используйте: /broadcast_video <event_id>")
            return

    video_path = Path(__file__).parent.parent.parent / "7486356307190949804.MP4"

    if not video_path.exists():
        await message.reply(f"❌ Видео файл не найден: {video_path}")
        return

    async with get_session() as session:
        # Получаем список участников
        if event_id:
            # Проверяем существование мероприятия
            event_result = await session.execute(
                select(Event).where(Event.id == event_id)
            )
            event = event_result.scalar_one_or_none()

            if not event:
                await message.reply(f"❌ Мероприятие с ID {event_id} не найдено.")
                return

            # Получаем участников конкретного мероприятия с активной регистрацией
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

            status_message = await message.answer(
                f"🚀 Начинаю рассылку видео-кружка участникам мероприятия:\n"
                f"<b>{event.title}</b> ({event.city}, {event.event_date.strftime('%d.%m.%Y')})",
                parse_mode="HTML"
            )
        else:
            # Получаем всех пользователей с хотя бы одной активной регистрацией
            query = (
                select(User)
                .join(EventRegistration, EventRegistration.user_id == User.id)
                .where(EventRegistration.status == "registered")
                .distinct()
            )

            status_message = await message.answer(
                "🚀 Начинаю рассылку видео-кружка всем зарегистрированным участникам..."
            )

        result = await session.execute(query)
        users = result.scalars().all()

    if not users:
        await status_message.edit_text("❌ Не найдено ни одного участника для рассылки.")
        return

    # Начинаем рассылку через helper функцию
    success_count, blocked_count, failed_count, failed_users = await _send_video_broadcast(
        bot=bot,
        users=users,
        video_path=video_path,
        event_id=event_id,
        event=event if event_id else None
    )

    # Финальный отчет
    report = (
        f"✅ <b>Рассылка завершена!</b>\n\n"
        f"📊 Результаты:\n"
        f"👥 Всего участников: {len(users)}\n"
        f"✅ Успешно отправлено: {success_count}\n"
        f"🚫 Заблокировали бота: {blocked_count}\n"
        f"❌ Ошибки отправки: {failed_count}\n"
    )

    if failed_users and len(failed_users) <= 10:
        report += f"\n❌ Не удалось отправить:\n"
        for failed_user in failed_users:
            report += f"  • {failed_user}\n"
    elif failed_users:
        report += f"\n❌ Не удалось отправить {len(failed_users)} пользователям (слишком много для отображения)"

    await status_message.edit_text(report, parse_mode="HTML")
    logger.info(f"Broadcast completed: {success_count} success, {blocked_count} blocked, {failed_count} failed")


@router.message(Command("broadcast_text"))
async def cmd_broadcast_text(message: Message, bot: Bot):
    """
    Рассылка текстового сообщения всем участникам.
    Использование: /broadcast_text <event_id> <текст сообщения>
    Если event_id не указан, отправляет всем зарегистрированным пользователям.
    """
    if not await is_admin(message.from_user.id):
        await message.reply("❌ Только администраторы могут использовать эту команду.")
        return

    # Парсинг аргументов
    parts = message.text.split(maxsplit=2)

    if len(parts) < 2:
        await message.reply(
            "❌ Неверный формат команды.\n\n"
            "Используйте:\n"
            "/broadcast_text <текст> - рассылка всем\n"
            "/broadcast_text <event_id> <текст> - рассылка участникам мероприятия"
        )
        return

    event_id = None
    text = parts[1]

    # Проверяем, является ли первый аргумент числом (event_id)
    if len(parts) == 3:
        try:
            event_id = int(parts[1])
            text = parts[2]
        except ValueError:
            # Первый аргумент не число, значит это текст для всех
            text = " ".join(parts[1:])

    async with get_session() as session:
        # Получаем список участников
        if event_id:
            # Проверяем существование мероприятия
            event_result = await session.execute(
                select(Event).where(Event.id == event_id)
            )
            event = event_result.scalar_one_or_none()

            if not event:
                await message.reply(f"❌ Мероприятие с ID {event_id} не найдено.")
                return

            # Получаем участников конкретного мероприятия
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

            status_message = await message.answer(
                f"🚀 Начинаю рассылку участникам мероприятия:\n"
                f"<b>{event.title}</b>",
                parse_mode="HTML"
            )
        else:
            # Получаем всех пользователей
            query = (
                select(User)
                .join(EventRegistration, EventRegistration.user_id == User.id)
                .where(EventRegistration.status == "registered")
                .distinct()
            )

            status_message = await message.answer(
                "🚀 Начинаю рассылку всем зарегистрированным участникам..."
            )

        result = await session.execute(query)
        users = result.scalars().all()

    if not users:
        await status_message.edit_text("❌ Не найдено ни одного участника для рассылки.")
        return

    # Начинаем рассылку
    success_count = 0
    failed_count = 0
    blocked_count = 0

    for user in users:
        try:
            await bot.send_message(
                chat_id=user.tg_user_id,
                text=text,
                parse_mode="HTML"
            )
            success_count += 1
            await asyncio.sleep(0.05)

        except Exception as e:
            error_message = str(e).lower()

            if "blocked" in error_message or "bot was blocked" in error_message:
                blocked_count += 1
            else:
                failed_count += 1
                logger.error(f"Failed to send text to user {user.tg_user_id}: {e}")

    # Финальный отчет
    report = (
        f"✅ <b>Рассылка завершена!</b>\n\n"
        f"📊 Результаты:\n"
        f"👥 Всего участников: {len(users)}\n"
        f"✅ Успешно: {success_count}\n"
        f"🚫 Заблокировали бота: {blocked_count}\n"
        f"❌ Ошибки: {failed_count}"
    )

    await status_message.edit_text(report, parse_mode="HTML")


@router.message(Command("broadcast_city"))
async def cmd_broadcast_city(message: Message, bot: Bot):
    """
    Рассылка видео-кружка участникам мероприятия в конкретном городе.

    Использование:
        /broadcast_city <город> <event_id>

    Примеры:
        /broadcast_city Гродно 8
        /broadcast_city Минск 12
    """
    if not await is_admin(message.from_user.id):
        await message.reply("❌ Только администраторы могут использовать эту команду.")
        return

    # Парсинг аргументов
    args = message.text.split()
    if len(args) < 3:
        await message.reply(
            "❌ Неверный формат команды.\n\n"
            "Используйте:\n"
            "/broadcast_city <город> <event_id>\n\n"
            "Примеры:\n"
            "/broadcast_city Гродно 8\n"
            "/broadcast_city Минск 12\n\n"
            f"Доступные города: {', '.join(VALID_CITIES)}"
        )
        return

    # Валидация города
    city_input = args[1]
    city_name = validate_and_normalize_city(city_input)

    if not city_name:
        await message.reply(
            f"❌ Неверный город: {city_input}\n\n"
            f"Доступные города: {', '.join(VALID_CITIES)}"
        )
        return

    # Парсинг event_id
    try:
        event_id = int(args[2])
    except ValueError:
        await message.reply("❌ Неверный формат ID мероприятия. Используйте число.")
        return

    # Проверка видео файла
    video_path = Path(__file__).parent.parent.parent / "main-video-281125.MP4"

    if not video_path.exists():
        await message.reply(f"❌ Видео файл не найден: {video_path}")
        return

    async with get_session() as session:
        # Получаем событие с валидацией города
        event_result = await session.execute(
            select(Event).where(
                and_(
                    Event.id == event_id,
                    Event.city == city_name
                )
            )
        )
        event = event_result.scalar_one_or_none()

        if not event:
            await message.reply(
                f"❌ Мероприятие {event_id} не найдено в городе {city_name}.\n"
                f"Проверьте ID мероприятия и город."
            )
            return

        # Получаем зарегистрированных участников
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

        status_message = await message.answer(
            f"🚀 Начинаю рассылку видео-кружка участникам мероприятия:\n"
            f"<b>{event.title}</b> (г. {event.city}, {event.event_date.strftime('%d.%m.%Y')})",
            parse_mode="HTML"
        )

        result = await session.execute(query)
        users = result.scalars().all()

    # Проверка наличия участников
    if not users:
        await status_message.edit_text(
            f"❌ Не найдено ни одного зарегистрированного участника для этого мероприятия."
        )
        return

    # Начинаем рассылку через helper функцию
    success_count, blocked_count, failed_count, failed_users = await _send_video_broadcast(
        bot=bot,
        users=users,
        video_path=video_path,
        event_id=event_id,
        event=event,
        mark_reminder_sent=True  # Отметить в БД, что напоминание отправлено
    )

    # Финальный отчёт
    report = (
        f"✅ <b>Рассылка завершена!</b>\n\n"
        f"🏙 <b>Город:</b> {city_name}\n"
        f"📋 <b>Мероприятие:</b> {event.title}\n\n"
        f"📊 Результаты:\n"
        f"👥 Всего участников: {len(users)}\n"
        f"✅ Успешно отправлено: {success_count}\n"
        f"🚫 Заблокировали бота: {blocked_count}\n"
        f"❌ Ошибки отправки: {failed_count}\n"
    )

    if failed_users and len(failed_users) <= 10:
        report += f"\n❌ Не удалось отправить:\n"
        for failed_user in failed_users:
            report += f"  • {failed_user}\n"
    elif failed_users:
        report += f"\n❌ Не удалось отправить {len(failed_users)} пользователям"

    await status_message.edit_text(report, parse_mode="HTML")

    logger.info(
        f"City broadcast completed for {city_name} (event {event_id}): "
        f"{success_count} success, {blocked_count} blocked, {failed_count} failed"
    )
