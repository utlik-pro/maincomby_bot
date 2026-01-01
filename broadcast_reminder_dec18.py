#!/usr/bin/env python3
"""Рассылка напоминания о мероприятии 18 декабря ВСЕМ незарегистрированным."""

import asyncio
import json
from datetime import datetime
from pathlib import Path
from aiogram import Bot
from sqlalchemy import select, and_
from loguru import logger

from app.db.session import create_engine, create_session_factory, init_models
from app.db.models import User, Event, EventRegistration
from app.config import load_settings


# Путь к файлу для отслеживания отправленных
SENT_FILE = "broadcast_reminder_dec18_sent.json"

# Текст напоминания
REMINDER_TEXT = """⚡️ Последний шанс!

Завтра мы будем рожать ИИ-агента прямо на сцене. Без репетиций.

Алекс Шкор покажет, как за 30 минут создать рабочего ИИ-агента с нуля. Это скилл, который будет кормить тебя следующий год!

А Олег Зелинский расскажет, почему одни ИИ-кампании взрывают рынок, а другие — собирают хейт.

📅 Завтра, 18:30
📍 Бетон, Кальварийская 17

⚠️ Осталось 12 мест

/start → Регистрация"""


def save_sent_users(user_ids, stats):
    """Сохраняет список пользователей, которым отправлено напоминание."""
    data = {
        'sent_at': datetime.utcnow().isoformat(),
        'user_ids': list(user_ids),
        'stats': stats
    }
    with open(SENT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


async def main():
    """Основная функция рассылки."""
    logger.info("🚀 Начинаю рассылку напоминаний о мероприятии 18 декабря")

    # Инициализация
    settings = load_settings()
    bot = Bot(token=settings.bot_token)
    engine = create_engine()
    await init_models(engine)
    session_factory = create_session_factory(engine)

    async with session_factory() as session:
        # 1. Находим мероприятие 18 декабря (id=3)
        event_result = await session.execute(
            select(Event).where(Event.id == 3)
        )
        event = event_result.scalar_one_or_none()

        if not event:
            logger.error("❌ Мероприятие не найдено в БД")
            return

        logger.info(f"📋 Мероприятие: {event.title}")

        # 2. Получаем ID зарегистрированных пользователей
        registered_query = (
            select(EventRegistration.user_id)
            .where(
                and_(
                    EventRegistration.event_id == event.id,
                    EventRegistration.status == "registered"
                )
            )
        )
        registered_result = await session.execute(registered_query)
        registered_user_ids = {row[0] for row in registered_result.all()}

        logger.info(f"✅ Уже зарегистрировано: {len(registered_user_ids)} человек (пропускаем)")

        # 3. Получаем ВСЕХ пользователей, исключая зарегистрированных и забаненных
        query = select(User).where(
            and_(
                User.banned == False,
                User.id.not_in(registered_user_ids) if registered_user_ids else True
            )
        )
        result = await session.execute(query)
        users_to_notify = result.scalars().all()

        logger.info(f"🎯 Будет отправлено: {len(users_to_notify)} пользователям")

        if not users_to_notify:
            logger.info("✅ Некому отправлять! Выход.")
            return

    # 4. Начинаем рассылку
    success_count = 0
    blocked_count = 0
    failed_count = 0
    sent_user_ids = []

    logger.info(f"\n📤 Начинаю отправку напоминаний...")

    for i, user in enumerate(users_to_notify, 1):
        try:
            await bot.send_message(
                chat_id=user.tg_user_id,
                text=REMINDER_TEXT,
                parse_mode="HTML"
            )
            success_count += 1
            sent_user_ids.append(user.tg_user_id)

            # Логируем каждые 50 пользователей
            if i % 50 == 0:
                logger.info(f"📊 Прогресс: {i}/{len(users_to_notify)} (успешно: {success_count}, блокировки: {blocked_count}, ошибки: {failed_count})")

            # Anti-flood защита
            await asyncio.sleep(0.05)

        except Exception as e:
            error_message = str(e).lower()

            if "blocked" in error_message or "bot was blocked" in error_message:
                blocked_count += 1
                logger.debug(f"🚫 Пользователь {user.tg_user_id} заблокировал бота")
            elif "deactivated" in error_message:
                blocked_count += 1
                logger.debug(f"🚫 Аккаунт {user.tg_user_id} деактивирован")
            else:
                failed_count += 1
                logger.error(f"❌ Ошибка отправки пользователю {user.tg_user_id}: {e}")

    # 5. Финальный отчет
    stats = {
        'total_registered': len(registered_user_ids),
        'target_audience': len(users_to_notify),
        'sent_successfully': success_count,
        'blocked_by_users': blocked_count,
        'failed': failed_count
    }

    save_sent_users(sent_user_ids, stats)

    logger.info("\n" + "="*60)
    logger.info("✅ Рассылка напоминаний завершена!")
    logger.info("="*60)
    logger.info(f"\n📊 Результаты:")
    logger.info(f"✅ Зарегистрировано (пропущено): {stats['total_registered']}")
    logger.info(f"🎯 Целевая аудитория: {stats['target_audience']}")
    logger.info(f"✅ Отправлено успешно: {stats['sent_successfully']}")
    logger.info(f"🚫 Заблокировали бота: {stats['blocked_by_users']}")
    logger.info(f"❌ Ошибки отправки: {stats['failed']}")
    logger.info(f"\n💾 Данные сохранены в: {SENT_FILE}")
    logger.info("="*60)

    await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
