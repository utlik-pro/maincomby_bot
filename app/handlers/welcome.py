from __future__ import annotations

from aiogram import Router, F, Bot
from aiogram.types import Message, ChatMemberUpdated
from aiogram.filters import ChatMemberUpdatedFilter, IS_NOT_MEMBER, IS_MEMBER
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..db.models import User
from ..services.llm import generate_personalized_welcome, generate_introduction_response

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


@router.message(F.new_chat_members)
async def on_new_chat_members(message: Message, bot: Bot):
    """Обрабатывает присоединение новых участников через service message."""
    chat = message.chat

    for user in message.new_chat_members:
        # Пропускаем, если это сам бот
        if user.is_bot and user.id == bot.id:
            logger.info(f"Бот добавлен в группу {chat.title}")
            continue

        logger.info(f"Новый участник (service msg): {user.id} (@{user.username}) присоединился к {chat.title}")

        # Сохраняем пользователя в БД (если еще нет)
        async with get_session() as session:
            try:
                # Проверяем, есть ли пользователь
                result = await session.execute(
                    select(User).where(User.tg_user_id == user.id)
                )
                existing_user = result.scalar_one_or_none()

                if not existing_user:
                    # Создаем нового пользователя
                    new_user = User(
                        tg_user_id=user.id,
                        username=user.username,
                        first_name=user.first_name,
                        last_name=user.last_name,
                        source="telegram_group",
                    )
                    session.add(new_user)
                    await session.commit()
                    logger.info(f"Создан новый пользователь в БД: {user.id}")
            except Exception as e:
                logger.error(f"Ошибка при сохранении пользователя: {e}")

        # Генерируем персонализированное приветствие
        try:
            from ..config import load_settings
            settings = load_settings()

            logger.info(f"Генерируем персональное приветствие для {user.first_name} (@{user.username})")
            welcome_message = await generate_personalized_welcome(
                first_name=user.first_name,
                username=user.username,
                last_name=user.last_name,
            )

            # Добавляем упоминание пользователя в начало сообщения
            user_mention = f'<a href="tg://user?id={user.id}">{user.first_name}</a>'
            full_message = f"{user_mention}, {welcome_message}"

            # Определяем куда отправлять: в ветку или в основной чат
            target_chat_id = settings.welcome_chat_id if settings.welcome_chat_id else chat.id
            message_thread_id = settings.welcome_thread_id if settings.welcome_thread_id else None

            await bot.send_message(
                chat_id=target_chat_id,
                text=full_message,
                parse_mode="HTML",
                message_thread_id=message_thread_id
            )
            logger.info(f"Приветствие отправлено пользователю {user.id} в чат {target_chat_id}, ветка {message_thread_id}")
        except Exception as e:
            logger.error(f"Ошибка при отправке приветствия: {e}")


@router.chat_member(ChatMemberUpdatedFilter(IS_NOT_MEMBER >> IS_MEMBER))
async def on_user_join(event: ChatMemberUpdated, bot: Bot):
    """Обрабатывает присоединение нового участника к группе (через chat_member update)."""
    user = event.new_chat_member.user
    chat = event.chat

    logger.info(f"Новый участник (chat_member): {user.id} (@{user.username}) присоединился к {chat.title}")

    # Сохраняем пользователя в БД (если еще нет)
    async with get_session() as session:
        try:
            # Проверяем, есть ли пользователь
            result = await session.execute(
                select(User).where(User.tg_user_id == user.id)
            )
            existing_user = result.scalar_one_or_none()

            if not existing_user:
                # Создаем нового пользователя
                new_user = User(
                    tg_user_id=user.id,
                    username=user.username,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    source="telegram_group",  # Пришел через группу
                )
                session.add(new_user)
                await session.commit()
                logger.info(f"Создан новый пользователь в БД: {user.id}")
        except Exception as e:
            logger.error(f"Ошибка при сохранении пользователя: {e}")

    # Генерируем персонализированное приветствие
    try:
        from ..config import load_settings
        settings = load_settings()

        logger.info(f"Генерируем персональное приветствие для {user.first_name} (@{user.username})")
        welcome_message = await generate_personalized_welcome(
            first_name=user.first_name,
            username=user.username,
            last_name=user.last_name,
        )

        # Добавляем упоминание пользователя в начало сообщения
        user_mention = f'<a href="tg://user?id={user.id}">{user.first_name}</a>'
        full_message = f"{user_mention}, {welcome_message}"

        # Определяем куда отправлять: в ветку или в основной чат
        target_chat_id = settings.welcome_chat_id if settings.welcome_chat_id else chat.id
        message_thread_id = settings.welcome_thread_id if settings.welcome_thread_id else None

        await bot.send_message(
            chat_id=target_chat_id,
            text=full_message,
            parse_mode="HTML",
            message_thread_id=message_thread_id
        )
        logger.info(f"Приветствие отправлено пользователю {user.id} в чат {target_chat_id}, ветка {message_thread_id}")
    except Exception as e:
        logger.error(f"Ошибка при отправке приветствия: {e}")


@router.message(F.text == "/test_welcome")
async def test_welcome_message(message: Message, bot: Bot):
    """Тестовая команда для проверки приветствия."""
    from ..config import load_settings
    settings = load_settings()

    user = message.from_user
    logger.info(f"Тест приветствия от {user.id} (@{user.username})")

    try:
        welcome_message = await generate_personalized_welcome(
            first_name=user.first_name,
            username=user.username,
            last_name=user.last_name,
        )

        user_mention = f'<a href="tg://user?id={user.id}">{user.first_name}</a>'
        full_message = f"{user_mention}, {welcome_message}"

        target_chat_id = settings.welcome_chat_id if settings.welcome_chat_id else message.chat.id
        message_thread_id = settings.welcome_thread_id if settings.welcome_thread_id else None

        await bot.send_message(
            chat_id=target_chat_id,
            text=full_message,
            parse_mode="HTML",
            message_thread_id=message_thread_id
        )
        logger.info(f"Тестовое приветствие отправлено в чат {target_chat_id}, ветка {message_thread_id}")
    except Exception as e:
        logger.error(f"Ошибка при отправке тестового приветствия: {e}")
        await message.reply(f"Ошибка: {e}")


@router.message(F.text.regexp(r"^/welcome_user\s+(\d+)"))
async def welcome_specific_user(message: Message, bot: Bot):
    """Команда для приветствия конкретного пользователя по ID."""
    from ..config import load_settings
    settings = load_settings()

    # Проверяем, что команду отправил админ
    if message.from_user.id not in settings.admin_ids:
        await message.reply("У вас нет прав для использования этой команды.")
        return

    # Извлекаем ID пользователя
    import re
    match = re.match(r"^/welcome_user\s+(\d+)", message.text)
    if not match:
        await message.reply("Использование: /welcome_user <user_id>")
        return

    user_id = int(match.group(1))
    logger.info(f"Админ запросил приветствие для пользователя {user_id}")

    try:
        # Получаем информацию о пользователе
        chat_member = await bot.get_chat_member(chat_id=message.chat.id, user_id=user_id)
        user = chat_member.user

        logger.info(f"Отправляем приветствие для {user.first_name} (@{user.username})")

        welcome_message = await generate_personalized_welcome(
            first_name=user.first_name,
            username=user.username,
            last_name=user.last_name,
        )

        user_mention = f'<a href="tg://user?id={user.id}">{user.first_name}</a>'
        full_message = f"{user_mention}, {welcome_message}"

        target_chat_id = settings.welcome_chat_id if settings.welcome_chat_id else message.chat.id
        message_thread_id = settings.welcome_thread_id if settings.welcome_thread_id else None

        await bot.send_message(
            chat_id=target_chat_id,
            text=full_message,
            parse_mode="HTML",
            message_thread_id=message_thread_id
        )
        logger.info(f"Приветствие отправлено для пользователя {user_id} в чат {target_chat_id}, ветка {message_thread_id}")
        await message.reply(f"✅ Приветствие отправлено для {user.first_name}")
    except Exception as e:
        logger.error(f"Ошибка при отправке приветствия пользователю {user_id}: {e}")
        await message.reply(f"❌ Ошибка: {e}")


@router.message(F.text.startswith("#introduce") | F.text.startswith("#представление"))
async def handle_introduction(message: Message):
    """Обрабатывает представления участников с хештегом."""
    user = message.from_user
    intro_text = message.text

    logger.info(f"Получено представление от {user.id} (@{user.username})")

    # Сохраняем информацию в заметки пользователя
    async with get_session() as session:
        try:
            result = await session.execute(
                select(User).where(User.tg_user_id == user.id)
            )
            db_user = result.scalar_one_or_none()

            if db_user:
                # Можно добавить поле notes в модель User или создать отдельную таблицу
                # Пока просто логируем
                logger.info(f"Представление сохранено для пользователя {user.id}")
            else:
                # Создаем пользователя, если его нет
                new_user = User(
                    tg_user_id=user.id,
                    username=user.username,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    source="telegram_group",
                )
                session.add(new_user)
                await session.commit()
                logger.info(f"Создан пользователь {user.id} с представлением")
        except Exception as e:
            logger.error(f"Ошибка при сохранении представления: {e}")

    # Генерируем персонализированный ответ на представление
    try:
        logger.info(f"Генерируем персональный ответ на представление для {user.first_name}")
        response = await generate_introduction_response(
            first_name=user.first_name,
            introduction_text=intro_text,
        )
        await message.reply(response)
        logger.info(f"Ответ на представление отправлен пользователю {user.id}")
    except Exception as e:
        logger.error(f"Ошибка при отправке ответа на представление: {e}")
        # Fallback
        await message.reply(
            f"Спасибо за знакомство, {user.first_name}! 👍\n"
            f"Приятно познакомиться! Не стесняйся общаться и задавать вопросы. 😊"
        )
