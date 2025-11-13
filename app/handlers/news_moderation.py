from __future__ import annotations

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..config import load_settings
from ..db.models import SourceChannel, PendingPost
from ..db.session import create_engine, create_session_factory
from ..services.channel_monitor import approve_post, reject_post, process_new_channel_message

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


async def is_admin(user_id: int) -> bool:
    """Проверяет, является ли пользователь администратором."""
    settings = load_settings()
    return user_id in settings.admin_ids


@router.message(Command("add_source_channel"))
async def cmd_add_source_channel(message: Message):
    """Добавляет канал-источник для мониторинга."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут добавлять каналы.")
        return
    
    # Формат: /add_source_channel @channel_username или channel_id
    args = message.text.split()[1:] if message.text else []
    if not args:
        await message.reply(
            "Использование: /add_source_channel @channel_username или /add_source_channel channel_id\n"
            "Пример: /add_source_channel @competitor_channel"
        )
        return
    
    channel_input = args[0].strip()
    async with get_session() as session:
        try:
            # Если это username, получаем ID канала через бота
            if channel_input.startswith("@"):
                channel_username = channel_input[1:]
                # Пытаемся получить информацию о канале
                try:
                    chat = await message.bot.get_chat(channel_input)
                    channel_id = chat.id
                    channel_title = chat.title
                except Exception as e:
                    await message.reply(f"Не удалось найти канал {channel_input}: {e}")
                    return
            else:
                # Это ID канала
                try:
                    channel_id = int(channel_input)
                    chat = await message.bot.get_chat(channel_id)
                    channel_username = chat.username
                    channel_title = chat.title
                except Exception:
                    await message.reply(f"Неверный формат канала: {channel_input}")
                    return
            
            # Проверяем, не добавлен ли уже канал
            result = await session.execute(
                select(SourceChannel).where(SourceChannel.channel_id == channel_id)
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                await message.reply(f"Канал {channel_input} уже добавлен.")
                return
            
            # Создаем запись
            source_channel = SourceChannel(
                channel_id=channel_id,
                channel_username=channel_username,
                channel_title=channel_title,
                enabled=True,
            )
            session.add(source_channel)
            await session.commit()
            
            await message.reply(
                f"Канал {channel_input} ({channel_title or channel_id}) добавлен как источник новостей."
            )
        except Exception as e:
            logger.error(f"Ошибка при добавлении канала: {e}")
            await message.reply(f"Ошибка: {e}")


@router.message(Command("add_default_channels"))
async def cmd_add_default_channels(message: Message):
    """Добавляет предустановленные каналы-источники."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут добавлять каналы.")
        return
    
    # Предустановленные каналы
    default_channels = [
        "@elkornacio",  # ElKornacio - технологии и бизнес
        "@tips_ai",  # Tips AI | IT & AI
        "@data_secrets",  # Data Secrets - машинное обучение
        "@ii_community",  # ИИ - полное погружение в мир ИИ
        "@cryptoEssay",  # e/acc - AI, web3, технологии
        "@lovedeathtransformers",  # Love. Death. Transformers
        "@ArtificialIntelligencedl",  # Artificial Intelligence
    ]
    
    async with get_session() as session:
        added = []
        skipped = []
        errors = []
        
        for channel_username in default_channels:
            try:
                # Получаем информацию о канале
                try:
                    chat = await message.bot.get_chat(channel_username)
                    channel_id = chat.id
                    channel_title = chat.title
                except Exception as e:
                    errors.append(f"{channel_username}: {e}")
                    continue
                
                # Проверяем, не добавлен ли уже
                result = await session.execute(
                    select(SourceChannel).where(SourceChannel.channel_id == channel_id)
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    skipped.append(channel_username)
                    continue
                
                # Создаем запись
                source_channel = SourceChannel(
                    channel_id=channel_id,
                    channel_username=channel_username[1:],  # Убираем @
                    channel_title=channel_title,
                    enabled=True,
                )
                session.add(source_channel)
                added.append(channel_username)
            except Exception as e:
                logger.error(f"Ошибка при добавлении {channel_username}: {e}")
                errors.append(f"{channel_username}: {e}")
        
        await session.commit()
        
        # Формируем ответ
        response = "Результат добавления каналов:\n\n"
        if added:
            response += f"Добавлено ({len(added)}):\n"
            for ch in added:
                response += f"  • {ch}\n"
            response += "\n"
        if skipped:
            response += f"Пропущено (уже добавлены, {len(skipped)}):\n"
            for ch in skipped:
                response += f"  • {ch}\n"
            response += "\n"
        if errors:
            response += f"Ошибки ({len(errors)}):\n"
            for err in errors[:5]:  # Показываем первые 5 ошибок
                response += f"  • {err}\n"
            if len(errors) > 5:
                response += f"  ... и еще {len(errors) - 5} ошибок\n"
        
        await message.reply(response)


@router.message(Command("list_source_channels"))
async def cmd_list_source_channels(message: Message):
    """Список каналов-источников."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут просматривать каналы.")
        return
    
    async with get_session() as session:
        result = await session.execute(select(SourceChannel))
        channels = result.scalars().all()
        
        if not channels:
            await message.reply("Каналы-источники не добавлены.")
            return
        
        text = "Каналы-источники:\n\n"
        for ch in channels:
            status = "[ON]" if ch.enabled else "[OFF]"
            text += f"{status} {ch.channel_username or ch.channel_id} ({ch.channel_title or 'N/A'})\n"
        
        await message.reply(text)


@router.message(Command("list_pending"))
async def cmd_list_pending(message: Message):
    """Список постов на модерации."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут просматривать посты на модерации.")
        return
    
    async with get_session() as session:
        result = await session.execute(
            select(PendingPost).where(PendingPost.status == "pending").order_by(PendingPost.created_at.desc()).limit(10)
        )
        posts = result.scalars().all()
        
        if not posts:
            await message.reply("Нет постов на модерации.")
            return
        
        text = "Посты на модерации:\n\n"
        for post in posts:
            source = post.source_channel.channel_username or post.source_channel.channel_id
            text += f"ID: {post.id}\n"
            text += f"Источник: {source}\n"
            adapted = post.adapted_text or post.original_text[:100]
            text += f"Текст: {adapted[:100]}...\n"
            text += f"/approve_{post.id} /reject_{post.id}\n\n"
        
        await message.reply(text[:4096])  # Ограничение Telegram


@router.message(F.text.regexp(r"^/approve_(\d+)$"))
async def cmd_approve_post(message: Message):
    """Одобряет пост."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут одобрять посты.")
        return
    
    import re
    match = re.match(r"^/approve_(\d+)$", message.text)
    if not match:
        return
    
    post_id = int(match.group(1))
    
    async with get_session() as session:
        try:
            success = await approve_post(message.bot, session, post_id, message.from_user.id)
            
            if success:
                await message.reply(f"Пост {post_id} одобрен и опубликован.")
            else:
                await message.reply(f"Не удалось одобрить пост {post_id}.")
        except Exception as e:
            logger.error(f"Ошибка при одобрении поста: {e}")
            await message.reply(f"Ошибка: {e}")


@router.message(F.text.regexp(r"^/reject_(\d+)$"))
async def cmd_reject_post(message: Message):
    """Отклоняет пост."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут отклонять посты.")
        return
    
    import re
    match = re.match(r"^/reject_(\d+)$", message.text)
    if not match:
        return
    
    post_id = int(match.group(1))
    
    async with get_session() as session:
        try:
            success = await reject_post(message.bot, session, post_id)

            if success:
                await message.reply(f"Пост {post_id} отклонен.")
            else:
                await message.reply(f"Не удалось отклонить пост {post_id}.")
        except Exception as e:
            logger.error(f"Ошибка при отклонении поста: {e}")
            await message.reply(f"Ошибка: {e}")


@router.message(F.chat.type.in_(["channel", "supergroup"]))
async def handle_channel_message(message: Message):
    """Обрабатывает сообщения из каналов-источников."""
    if message.chat.type not in ["channel", "supergroup"]:
        return

    # Проверяем, что это канал-источник
    async with get_session() as session:
        try:
            from sqlalchemy import select
            result = await session.execute(
                select(SourceChannel).where(SourceChannel.channel_id == message.chat.id)
            )
            source_channel = result.scalar_one_or_none()

            if not source_channel or not source_channel.enabled:
                return

            # Обрабатываем сообщение
            await process_new_channel_message(
                message.bot,
                session,
                message,
                message.chat.id,
            )
        except Exception as e:
            logger.error(f"Ошибка при обработке сообщения из канала: {e}")


@router.callback_query(F.data.regexp(r"^approve_(\d+)$"))
async def callback_approve_post(callback: CallbackQuery):
    """Обрабатывает нажатие на кнопку 'Одобрить'."""
    if not await is_admin(callback.from_user.id):
        await callback.answer("Только администраторы могут одобрять посты.", show_alert=True)
        return

    import re
    match = re.match(r"^approve_(\d+)$", callback.data)
    if not match:
        return

    post_id = int(match.group(1))

    async with get_session() as session:
        try:
            success = await approve_post(callback.bot, session, post_id, callback.from_user.id)

            if success:
                await callback.answer("✅ Пост одобрен и опубликован!", show_alert=True)
            else:
                await callback.answer("❌ Не удалось одобрить пост.", show_alert=True)
        except Exception as e:
            logger.error(f"Ошибка при одобрении поста через callback: {e}")
            await callback.answer(f"Ошибка: {e}", show_alert=True)


@router.callback_query(F.data.regexp(r"^reject_(\d+)$"))
async def callback_reject_post(callback: CallbackQuery):
    """Обрабатывает нажатие на кнопку 'Отклонить'."""
    if not await is_admin(callback.from_user.id):
        await callback.answer("Только администраторы могут отклонять посты.", show_alert=True)
        return

    import re
    match = re.match(r"^reject_(\d+)$", callback.data)
    if not match:
        return

    post_id = int(match.group(1))

    async with get_session() as session:
        try:
            success = await reject_post(callback.bot, session, post_id)

            if success:
                await callback.answer("❌ Пост отклонен.", show_alert=True)
            else:
                await callback.answer("❌ Не удалось отклонить пост.", show_alert=True)
        except Exception as e:
            logger.error(f"Ошибка при отклонении поста через callback: {e}")
            await callback.answer(f"Ошибка: {e}", show_alert=True)

