from __future__ import annotations

from typing import Optional

from aiogram import Bot
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import load_settings
from ..db.models import PendingPost, SourceChannel
from .llm import adapt_news_from_competitor


async def check_source_channels(bot: Bot, session: AsyncSession) -> None:
    """Проверяет каналы-источники на новые посты."""
    settings = load_settings()
    
    # Получаем все активные каналы
    from sqlalchemy import select
    result = await session.execute(select(SourceChannel).where(SourceChannel.enabled == True))
    channels = result.scalars().all()
    
    for channel in channels:
        try:
            await check_channel_for_new_posts(bot, session, channel, settings)
        except Exception as e:
            logger.error(f"Ошибка при проверке канала {channel.channel_username}: {e}")


async def check_channel_for_new_posts(
    bot: Bot,
    session: AsyncSession,
    channel: SourceChannel,
    settings,
) -> None:
    """Проверяет конкретный канал на новые посты."""
    try:
        # Получаем последние сообщения из канала
        # Для каналов нужно использовать get_chat_member или получить через forward
        # Проще всего - если бот добавлен в канал, получать сообщения через события
        
        # Здесь мы будем полагаться на обработчик событий новых сообщений
        # В реальности лучше использовать периодическую проверку через getUpdates
        # или подписаться на события канала
        
        logger.debug(f"Проверка канала {channel.channel_username} пропущена (используется event-based)")
    except Exception as e:
        logger.error(f"Ошибка при проверке канала {channel.channel_id}: {e}")


async def process_new_channel_message(
    bot: Bot,
    session: AsyncSession,
    message: Message,
    channel_id: int,
) -> None:
    """Обрабатывает новое сообщение из канала-источника."""
    settings = load_settings()
    
    # Проверяем, что это канал-источник
    from sqlalchemy import select
    result = await session.execute(
        select(SourceChannel).where(SourceChannel.channel_id == channel_id)
    )
    source_channel = result.scalar_one_or_none()
    
    if not source_channel or not source_channel.enabled:
        return
    
    # Проверяем, не обрабатывали ли мы уже это сообщение
    existing = await session.execute(
        select(PendingPost).where(
            PendingPost.source_channel_id == source_channel.id,
            PendingPost.original_message_id == message.message_id,
        )
    )
    if existing.scalar_one_or_none():
        return
    
    # Извлекаем текст сообщения
    text = message.text or message.caption or ""
    if not text.strip():
        return  # Пропускаем сообщения без текста
    
    # Адаптируем новость через LLM
    adapted_text = await adapt_news_from_competitor(text)
    
    # Если адаптированный текст пустой - значит это реклама, пропускаем
    if not adapted_text:
        logger.info(f"Пост {message.message_id} из {source_channel.channel_username} пропущен (реклама)")
        return
    
    # Создаем запись в БД
    pending_post = PendingPost(
        source_channel_id=source_channel.id,
        original_message_id=message.message_id,
        original_text=text,
        adapted_text=adapted_text,
        status="pending",
    )
    session.add(pending_post)
    await session.commit()
    await session.refresh(pending_post)
    
    # Отправляем на модерацию в промежуточный канал
    if settings.intermediate_chat_id:
        try:
            # Создаем inline-кнопки для модерации
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [
                    InlineKeyboardButton(text="✅ Одобрить", callback_data=f"approve_{pending_post.id}"),
                    InlineKeyboardButton(text="❌ Отклонить", callback_data=f"reject_{pending_post.id}"),
                ]
            ])

            moderation_msg = await bot.send_message(
                settings.intermediate_chat_id,
                f"<b>Новость из {source_channel.channel_username or source_channel.channel_title}</b>\n\n"
                f"<b>Оригинал:</b>\n{text[:500]}...\n\n"
                f"<b>Адаптировано:</b>\n{adapted_text}",
                parse_mode="HTML",
                reply_markup=keyboard,
            )

            pending_post.moderation_chat_id = moderation_msg.chat.id
            pending_post.moderation_message_id = moderation_msg.message_id
            await session.commit()

            logger.info(f"Пост {pending_post.id} отправлен на модерацию")
        except Exception as e:
            logger.error(f"Ошибка при отправке на модерацию: {e}")


async def approve_post(bot: Bot, session: AsyncSession, post_id: int, admin_id: int) -> bool:
    """Одобряет пост и публикует в целевой канал."""
    settings = load_settings()

    from sqlalchemy import select
    result = await session.execute(select(PendingPost).where(PendingPost.id == post_id))
    post = result.scalar_one_or_none()

    if not post or post.status != "pending":
        return False

    # Публикуем в целевой канал
    if settings.target_channel_id and post.adapted_text:
        try:
            await bot.send_message(
                settings.target_channel_id,
                post.adapted_text,
                parse_mode="HTML",
            )

            post.status = "approved"
            post.approved_by = admin_id
            from datetime import datetime
            post.approved_at = datetime.utcnow()
            await session.commit()

            # Обновляем сообщение в промежуточном канале (убираем кнопки)
            if post.moderation_chat_id and post.moderation_message_id:
                try:
                    await bot.edit_message_reply_markup(
                        chat_id=post.moderation_chat_id,
                        message_id=post.moderation_message_id,
                        reply_markup=None,
                    )
                except Exception:
                    pass  # Игнорируем ошибки редактирования

            logger.info(f"Пост {post_id} одобрен и опубликован")
            return True
        except Exception as e:
            logger.error(f"Ошибка при публикации поста {post_id}: {e}")
            return False

    return False


async def reject_post(bot: Bot, session: AsyncSession, post_id: int) -> bool:
    """Отклоняет пост."""
    from sqlalchemy import select
    result = await session.execute(select(PendingPost).where(PendingPost.id == post_id))
    post = result.scalar_one_or_none()

    if not post or post.status != "pending":
        return False

    post.status = "rejected"
    await session.commit()

    # Обновляем сообщение в промежуточном канале (убираем кнопки)
    if post.moderation_chat_id and post.moderation_message_id:
        try:
            await bot.edit_message_reply_markup(
                chat_id=post.moderation_chat_id,
                message_id=post.moderation_message_id,
                reply_markup=None,
            )
        except Exception:
            pass  # Игнорируем ошибки редактирования

    logger.info(f"Пост {post_id} отклонен")
    return True

