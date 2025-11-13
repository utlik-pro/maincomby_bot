from __future__ import annotations

from aiogram import Router, F
from aiogram.types import Message

router = Router()


@router.message(F.text.contains("?"))
async def track_questions(message: Message):
    # MVP: tag questions; later: persist and notify admins
    # Avoid spamming for commands and bot mentions
    if message.text and not message.text.startswith("/") and "@" not in message.text:
        await message.reply("Вижу вопрос — передам модераторам!")


@router.message(F.reply_to_message, F.text.startswith("/warn"))
async def warn_user(message: Message):
    # MVP: simple acknowledge; later: increment warns in DB and check ban threshold
    target = message.reply_to_message.from_user
    if not target:
        return
    await message.reply(f"Предупреждение пользователю @{target.username or target.id}")


@router.message(F.reply_to_message, F.text.startswith("/ban"))
async def ban_user(message: Message):
    target = message.reply_to_message.from_user
    if not target:
        return
    await message.chat.ban(user_id=target.id)
    await message.reply(f"Пользователь @{target.username or target.id} забанен")


@router.message(F.reply_to_message, F.text.startswith("/del"))
async def delete_message(message: Message):
    try:
        await message.bot.delete_message(message.chat.id, message.reply_to_message.message_id)
    finally:
        await message.delete()

