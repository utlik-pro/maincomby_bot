#!/usr/bin/env python3
"""
Проверка доступа бота к каналу @maincomby и получение ID
"""

import asyncio
import os
from dotenv import load_dotenv
from aiogram import Bot

load_dotenv()

async def main():
    bot = Bot(token=os.getenv("BOT_TOKEN"))

    # Пробуем разные варианты
    channel_variants = [
        "@maincomby",
        "-1001186851947",  # ID из WELCOME_CHAT_ID (может совпадать)
        "maincomby"
    ]

    print("🔍 Проверка доступа к каналу @maincomby...\n")

    for variant in channel_variants:
        try:
            print(f"Пробую: {variant}")
            chat = await bot.get_chat(variant)

            print(f"\n✅ УСПЕХ! Информация о канале:\n")
            print(f"📝 Название: {chat.title}")
            print(f"🆔 ID: {chat.id}")
            print(f"🔗 Username: @{chat.username if chat.username else 'нет'}")
            print(f"📊 Тип: {chat.type}")
            print(f"👥 Участников: {chat.member_count if hasattr(chat, 'member_count') else 'неизвестно'}")

            # Проверяем статус бота
            try:
                bot_member = await bot.get_chat_member(chat.id, bot.id)
                print(f"🤖 Статус бота: {bot_member.status}")

                if bot_member.status in ["administrator", "creator"]:
                    print(f"✅ Бот является администратором!")
                else:
                    print(f"⚠️  Бот НЕ администратор. Статус: {bot_member.status}")
                    print(f"⚠️  Добавьте бота администратором для проверки подписки!")
            except Exception as e:
                print(f"⚠️  Не удалось проверить статус бота: {e}")

            print(f"\n📋 Добавьте в .env файл:")
            print(f"CHECK_SUBSCRIPTION_CHANNEL_ID={chat.id}")
            print(f"CHECK_SUBSCRIPTION_CHANNEL_URL=https://t.me/{chat.username if chat.username else 'ССЫЛКА'}")

            break

        except Exception as e:
            print(f"❌ Ошибка: {e}\n")
    else:
        print("❌ Не удалось получить доступ к каналу @maincomby")
        print("\nВозможные причины:")
        print("1. Бот не добавлен в канал")
        print("2. Неверный username канала")
        print("\n💡 Решение:")
        print("1. Добавьте бота в канал @maincomby")
        print("2. Сделайте бота администратором (минимальные права)")
        print("3. Или перешлите сообщение из канала боту (запустите get_channel_id.py)")

    await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())
