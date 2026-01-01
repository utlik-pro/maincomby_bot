#!/usr/bin/env python3
"""
Тест проверки подписки на канал.
Проверяет, работает ли middleware check_subscription.
"""

import asyncio
import os
from dotenv import load_dotenv
from aiogram import Bot

load_dotenv()

async def main():
    bot = Bot(token=os.getenv("BOT_TOKEN"))

    # Тестовый пользователь (не из admin_ids)
    test_user_id = 5435629127  # Из логов

    print("🔍 Тест проверки подписки на канал @maincomby\n")

    # Проверяем конфигурацию
    channel_id = -1002494730191

    try:
        # Проверяем статус тестового пользователя
        print(f"Проверяю статус пользователя {test_user_id} в канале...")
        member = await bot.get_chat_member(chat_id=channel_id, user_id=test_user_id)

        print(f"\n📊 Статус пользователя {test_user_id}:")
        print(f"   Статус: {member.status}")
        print(f"   Имя: {member.user.first_name}")
        print(f"   Username: @{member.user.username if member.user.username else 'нет'}")

        if member.status in ["member", "administrator", "creator"]:
            print(f"\n✅ Пользователь ПОДПИСАН на канал")
            print(f"   → Middleware НЕ должен блокировать")
        else:
            print(f"\n❌ Пользователь НЕ ПОДПИСАН на канал")
            print(f"   → Middleware ДОЛЖЕН показать сообщение с кнопкой подписки")

    except Exception as e:
        print(f"\n❌ Ошибка при проверке: {e}")

    # Проверяем права бота
    try:
        bot_member = await bot.get_chat_member(channel_id, (await bot.get_me()).id)
        print(f"\n🤖 Статус бота в канале:")
        print(f"   Статус: {bot_member.status}")

        if bot_member.status in ["administrator", "creator"]:
            print(f"   ✅ Бот является администратором - проверка подписки работает")
        else:
            print(f"   ❌ Бот НЕ администратор - проверка подписки НЕ РАБОТАЕТ!")
            print(f"   → Добавьте бота администратором канала")

    except Exception as e:
        print(f"\n❌ Ошибка при проверке прав бота: {e}")

    await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())
