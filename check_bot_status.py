#!/usr/bin/env python3
"""
Скрипт для проверки статуса Telegram бота
"""
import os
import sys
import asyncio
import aiohttp
from pathlib import Path

# Добавляем корневую директорию в путь
sys.path.insert(0, str(Path(__file__).parent))

from app.config import load_settings


async def check_bot_status():
    """Проверяет статус бота через Telegram API"""
    settings = load_settings()

    if not settings.bot_token or settings.bot_token == "123456:REPLACE_ME":
        print("❌ Ошибка: BOT_TOKEN не настроен в .env файле")
        return False

    url = f"https://api.telegram.org/bot{settings.bot_token}/getMe"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("ok"):
                        bot_info = data.get("result", {})
                        print("✅ Бот работает!")
                        print(f"   Имя: {bot_info.get('first_name')}")
                        print(f"   Username: @{bot_info.get('username')}")
                        print(f"   ID: {bot_info.get('id')}")
                        return True
                    else:
                        print(f"❌ Ошибка API: {data}")
                        return False
                else:
                    print(f"❌ HTTP {response.status}: {await response.text()}")
                    return False
    except Exception as e:
        print(f"❌ Ошибка подключения: {e}")
        return False


async def check_webhook_info():
    """Проверяет информацию о webhook (если используется)"""
    settings = load_settings()
    url = f"https://api.telegram.org/bot{settings.bot_token}/getWebhookInfo"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("ok"):
                        webhook_info = data.get("result", {})
                        webhook_url = webhook_info.get("url", "")

                        if webhook_url:
                            print(f"\n📡 Режим работы: Webhook")
                            print(f"   URL: {webhook_url}")
                            print(f"   Pending updates: {webhook_info.get('pending_update_count', 0)}")
                            if webhook_info.get('last_error_message'):
                                print(f"   ⚠️  Последняя ошибка: {webhook_info.get('last_error_message')}")
                        else:
                            print(f"\n📡 Режим работы: Long Polling (как в коде)")
                        return True
    except Exception as e:
        print(f"⚠️  Не удалось получить webhook info: {e}")

    return False


async def main():
    print("🔍 Проверка статуса бота...\n")

    # Проверяем наличие .env
    if not os.path.exists(".env"):
        print("⚠️  Файл .env не найден. Используйте .env.example как шаблон.")
        return

    # Проверяем статус бота
    bot_ok = await check_bot_status()

    if bot_ok:
        # Проверяем webhook info
        await check_webhook_info()

        print("\n✅ Бот настроен и доступен через Telegram API")
        print("   Если бот не отвечает на сообщения, проверьте:")
        print("   1. Запущен ли процесс на Railway")
        print("   2. Логи в Railway Dashboard")
        print("   3. Добавлен ли бот в группу как администратор")
    else:
        print("\n❌ Бот недоступен. Проверьте BOT_TOKEN в .env файле")


if __name__ == "__main__":
    asyncio.run(main())
