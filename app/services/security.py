from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict

from aiogram import Bot
from aiogram.exceptions import TelegramBadRequest
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import SecurityLog


# In-memory хранилище ограничений (user_id -> until_datetime)
_restricted_users: Dict[int, datetime] = {}


def is_user_restricted(user_id: int) -> bool:
    """Проверяет, ограничен ли пользователь."""
    if user_id not in _restricted_users:
        return False

    # Проверяем, не истекло ли время ограничения
    if datetime.utcnow() >= _restricted_users[user_id]:
        del _restricted_users[user_id]
        return False

    return True


def get_restriction_time_left(user_id: int) -> int:
    """Возвращает оставшееся время ограничения в секундах."""
    if user_id not in _restricted_users:
        return 0

    time_left = (_restricted_users[user_id] - datetime.utcnow()).total_seconds()
    return max(0, int(time_left))


async def restrict_user(
    bot: Bot,
    chat_id: int,
    user_id: int,
    duration_minutes: int = 5,
) -> bool:
    """
    Ограничивает пользователя (мут) в группе на указанное время.

    Args:
        bot: Экземпляр бота
        chat_id: ID чата
        user_id: ID пользователя
        duration_minutes: Длительность ограничения в минутах

    Returns:
        True если успешно, False если ошибка
    """
    try:
        # Проверяем статус пользователя в чате
        try:
            member = await bot.get_chat_member(chat_id, user_id)
            # Не можем мутить владельца или админов
            if member.status in ["creator", "administrator"]:
                logger.warning(
                    f"Попытка ограничить админа/владельца {user_id}. Пропускаем мут, только логируем."
                )
                return False
        except Exception as e:
            logger.warning(f"Не удалось проверить статус пользователя {user_id}: {e}")

        # Вычисляем время окончания ограничения
        until_date = datetime.utcnow() + timedelta(minutes=duration_minutes)

        # Ограничиваем пользователя в Telegram (убираем право отправки сообщений)
        from aiogram.types import ChatPermissions

        await bot.restrict_chat_member(
            chat_id=chat_id,
            user_id=user_id,
            permissions=ChatPermissions(
                can_send_messages=False,
                can_send_media_messages=False,
                can_send_other_messages=False,
                can_add_web_page_previews=False,
            ),
            until_date=until_date,
        )

        # Добавляем в in-memory хранилище
        _restricted_users[user_id] = until_date

        logger.warning(
            f"Пользователь {user_id} ограничен в чате {chat_id} на {duration_minutes} минут"
        )
        return True

    except TelegramBadRequest as e:
        logger.error(f"Ошибка при ограничении пользователя {user_id}: {e}")
        # Если не удалось ограничить в Telegram, все равно добавляем в in-memory
        _restricted_users[user_id] = datetime.utcnow() + timedelta(minutes=duration_minutes)
        return False
    except Exception as e:
        logger.error(f"Неожиданная ошибка при ограничении пользователя {user_id}: {e}")
        return False


async def log_security_incident(
    session: AsyncSession,
    user_id: int,
    username: str | None,
    chat_id: int,
    attack_type: str,
    user_input: str,
    detection_reason: str,
    action_taken: str,
) -> None:
    """Логирует инцидент безопасности в БД."""
    try:
        log_entry = SecurityLog(
            user_id=user_id,
            username=username,
            chat_id=chat_id,
            attack_type=attack_type,
            user_input=user_input[:4000],  # Ограничиваем длину
            detection_reason=detection_reason,
            action_taken=action_taken,
        )
        session.add(log_entry)
        await session.commit()
        logger.info(f"Инцидент безопасности залогирован: user={user_id}, type={attack_type}")
    except Exception as e:
        logger.error(f"Ошибка при логировании инцидента: {e}")


async def handle_prompt_injection_attempt(
    bot: Bot,
    session: AsyncSession,
    user_id: int,
    username: str | None,
    chat_id: int,
    user_input: str,
    detection_reason: str,
) -> str:
    """
    Обрабатывает попытку prompt injection.

    Returns:
        Сообщение для отправки пользователю
    """
    # Логируем инцидент
    await log_security_incident(
        session=session,
        user_id=user_id,
        username=username,
        chat_id=chat_id,
        attack_type="prompt_injection",
        user_input=user_input,
        detection_reason=detection_reason,
        action_taken="muted_5min",
    )

    # Ограничиваем пользователя на 5 минут
    success = await restrict_user(bot, chat_id, user_id, duration_minutes=5)

    if success:
        return (
            "🚨 <b>Попытка взлома!</b>\n\n"
            "⏱ Мут на 5 минут.\n"
            f"Причина: {detection_reason[:100]}"
        )
    else:
        # Не удалось замутить (владелец/админ или ошибка)
        return (
            "🚨 <b>Попытка взлома обнаружена!</b>\n\n"
            "⚠️ Инцидент залогирован.\n"
            f"Причина: {detection_reason[:100]}"
        )
