#!/usr/bin/env python3
"""
Скрипт для получения ID канала.
Использование:
1. Перешлите любое сообщение из канала @maincomby боту
2. Запустите этот скрипт
3. Напишите боту любое сообщение
4. Скрипт выведет ID канала
"""

import asyncio
import os
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, F
from aiogram.types import Message

load_dotenv()

async def main():
    bot = Bot(token=os.getenv("BOT_TOKEN"))
    dp = Dispatcher()

    @dp.message(F.forward_from_chat)
    async def get_forwarded_chat_id(message: Message):
        """Получить ID канала из пересланного сообщения"""
        chat = message.forward_from_chat
        if chat:
            info = (
                f"✅ <b>Информация о канале:</b>\n\n"
                f"📝 Название: {chat.title}\n"
                f"🆔 ID: <code>{chat.id}</code>\n"
                f"🔗 Username: @{chat.username if chat.username else 'нет'}\n"
                f"📊 Тип: {chat.type}\n\n"
                f"<b>Добавьте в .env:</b>\n"
                f"<code>CHECK_SUBSCRIPTION_CHANNEL_ID={chat.id}</code>\n"
                f"<code>CHECK_SUBSCRIPTION_CHANNEL_URL=https://t.me/{chat.username if chat.username else 'ССЫЛКА'}</code>"
            )
            await message.answer(info, parse_mode="HTML")
        else:
            await message.answer("❌ Не удалось получить информацию о канале")

    @dp.message()
    async def echo(message: Message):
        await message.answer(
            "👋 Привет! Перешлите мне любое сообщение из канала @maincomby,\n"
            "и я покажу вам ID канала для настройки проверки подписки."
        )

    print("🤖 Бот запущен. Перешлите сообщение из канала...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
