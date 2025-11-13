from __future__ import annotations

from datetime import datetime

from aiogram import Router, F, Bot
from aiogram.types import Message
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from ..services.llm import answer_user_question, detect_prompt_injection
from ..services.security import (
    is_user_restricted,
    get_restriction_time_left,
    handle_prompt_injection_attempt,
    log_security_incident,
)
from ..db.models import Question

router = Router()

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


async def save_question(
    user_id: int,
    username: str | None,
    chat_id: int,
    message_id: int,
    question_text: str,
    answer_text: str | None,
    question_type: str,
) -> None:
    """Сохраняет вопрос в БД."""
    try:
        async with get_session() as session:
            question = Question(
                user_id=user_id,
                username=username,
                chat_id=chat_id,
                message_id=message_id,
                question_text=question_text,
                answer_text=answer_text,
                question_type=question_type,
                answered=bool(answer_text),
                answered_at=datetime.utcnow() if answer_text else None,
            )
            session.add(question)
            await session.commit()
    except Exception as e:
        logger.error(f"Ошибка при сохранении вопроса в БД: {e}")


@router.message(F.reply_to_message.from_user.is_bot)
async def handle_reply_to_bot(message: Message, bot: Bot):
    """Обрабатывает ответы пользователей на сообщения бота."""
    # Проверяем, что это ответ на сообщение нашего бота
    if message.reply_to_message.from_user.id != bot.id:
        return

    user_question = message.text or message.caption
    if not user_question:
        return

    logger.info(f"Получен вопрос от пользователя {message.from_user.id}: {user_question[:50]}...")

    try:
        # Получаем ответ от LLM
        answer = await answer_user_question(user_question)

        if answer:
            await message.reply(answer)
        else:
            answer = "Извините, я не смог найти ответ на ваш вопрос. Попробуйте переформулировать или обратитесь к администраторам."
            await message.reply(answer)

        # Сохраняем вопрос в БД
        await save_question(
            user_id=message.from_user.id,
            username=message.from_user.username,
            chat_id=message.chat.id,
            message_id=message.message_id,
            question_text=user_question,
            answer_text=answer,
            question_type="reply",
        )
    except Exception as e:
        logger.error(f"Ошибка при обработке вопроса: {e}")
        await message.reply("Произошла ошибка при обработке вашего вопроса. Попробуйте позже.")


@router.message(F.text.contains("@"))
async def handle_bot_mention(message: Message, bot: Bot):
    """Обрабатывает упоминания бота в сообщениях."""
    logger.info(f"Получено сообщение с @ от пользователя {message.from_user.id}: {message.text[:50]}")

    # Получаем username бота
    bot_info = await bot.get_me()
    bot_username = bot_info.username

    # Проверяем, упоминается ли бот
    if not message.text or f"@{bot_username}" not in message.text:
        logger.info(f"Упоминание не для нас (@{bot_username})")
        return

    # Убираем упоминание бота из текста
    user_question = message.text.replace(f"@{bot_username}", "").strip()
    if not user_question:
        await message.reply("Да? Чем могу помочь? 😊")
        return

    # ПРОВЕРКА: Ограничен ли пользователь?
    if is_user_restricted(message.from_user.id):
        time_left = get_restriction_time_left(message.from_user.id)
        minutes = time_left // 60
        seconds = time_left % 60
        await message.reply(
            f"⏱ Вы временно ограничены из-за нарушения правил.\n"
            f"Осталось: {minutes}м {seconds}с"
        )
        return

    logger.info(f"Получен вопрос через mention от пользователя {message.from_user.id}: {user_question[:50]}...")

    try:
        # ПРОВЕРКА НА PROMPT INJECTION
        is_attack, reason = await detect_prompt_injection(user_question)

        if is_attack:
            logger.warning(
                f"🚨 Обнаружена попытка взлома от пользователя {message.from_user.id} (@{message.from_user.username})"
            )

            async with get_session() as session:
                response = await handle_prompt_injection_attempt(
                    bot=bot,
                    session=session,
                    user_id=message.from_user.id,
                    username=message.from_user.username,
                    chat_id=message.chat.id,
                    user_input=user_question,
                    detection_reason=reason,
                )

            await message.reply(response, parse_mode="HTML")
            return

        # Обычная обработка вопроса
        answer = await answer_user_question(user_question)

        if answer:
            await message.reply(answer)
        else:
            answer = "Извините, я не смог найти ответ на ваш вопрос. Попробуйте переформулировать или обратитесь к администраторам."
            await message.reply(answer)

        # Сохраняем вопрос в БД
        await save_question(
            user_id=message.from_user.id,
            username=message.from_user.username,
            chat_id=message.chat.id,
            message_id=message.message_id,
            question_text=user_question,
            answer_text=answer,
            question_type="mention",
        )
    except Exception as e:
        logger.error(f"Ошибка при обработке вопроса через mention: {e}")
        await message.reply("Произошла ошибка при обработке вашего вопроса. Попробуйте позже.")


@router.message(F.chat.type == "private")
async def handle_private_message(message: Message):
    """Обрабатывает личные сообщения боту."""
    user_question = message.text or message.caption
    if not user_question or user_question.startswith("/"):
        return

    # ПРОВЕРКА: Ограничен ли пользователь? (даже в личке)
    if is_user_restricted(message.from_user.id):
        time_left = get_restriction_time_left(message.from_user.id)
        minutes = time_left // 60
        seconds = time_left % 60
        await message.reply(
            f"⏱ Вы временно ограничены из-за нарушения правил.\n"
            f"Осталось: {minutes}м {seconds}с"
        )
        return

    logger.info(f"Получен вопрос в личке от пользователя {message.from_user.id}: {user_question[:50]}...")

    try:
        # ПРОВЕРКА НА PROMPT INJECTION
        is_attack, reason = await detect_prompt_injection(user_question)

        if is_attack:
            logger.warning(
                f"🚨 Обнаружена попытка взлома в личке от пользователя {message.from_user.id} (@{message.from_user.username})"
            )

            async with get_session() as session:
                # В личке не можем замутить, но логируем
                await log_security_incident(
                    session=session,
                    user_id=message.from_user.id,
                    username=message.from_user.username,
                    chat_id=message.chat.id,
                    attack_type="prompt_injection",
                    user_input=user_question,
                    detection_reason=reason,
                    action_taken="warned",
                )

            await message.reply(
                "🚨 <b>Попытка взлома!</b>\n\n"
                "⚠️ Инцидент залогирован.\n"
                f"Причина: {reason[:100]}",
                parse_mode="HTML"
            )
            return

        # Обычная обработка вопроса
        answer = await answer_user_question(user_question)

        if answer:
            await message.reply(answer)
        else:
            answer = "Извините, я не смог найти ответ на ваш вопрос. Попробуйте переформулировать или обратитесь к администраторам."
            await message.reply(answer)

        # Сохраняем вопрос в БД
        await save_question(
            user_id=message.from_user.id,
            username=message.from_user.username,
            chat_id=message.chat.id,
            message_id=message.message_id,
            question_text=user_question,
            answer_text=answer,
            question_type="private",
        )
    except Exception as e:
        logger.error(f"Ошибка при обработке вопроса в личке: {e}")
        await message.reply("Произошла ошибка при обработке вашего вопроса. Попробуйте позже.")
