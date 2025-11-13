from __future__ import annotations

from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message

from ..config import load_settings


router = Router()


@router.message(Command("chat_id"))
async def cmd_chat_id(message: Message):
    settings = load_settings()
    if message.from_user.id not in settings.admin_ids:
        await message.reply("Только администраторы могут использовать эту команду.")
        return

    chat = message.chat
    await message.reply(
        f"Chat ID: {chat.id}\nType: {chat.type}\nTitle: {getattr(chat, 'title', None)}"
    )


