#!/usr/bin/env python3
"""Рассылка приглашения на мероприятие 18 декабря ВСЕМ пользователям (кроме уже зарегистрированных)."""

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


# Путь к файлу для отслеживания отправленных приглашений
SENT_FILE = "broadcast_dec18_sent.json"

# Текст приглашения
INVITATION_TEXT = """🍳 <b>Приглашаем на ИИшницу №5 от M.AI.N Community!</b> 🍳

📅 <b>Когда:</b> 18 декабря, 18:30
🏙 <b>Город:</b> Минск
📍 <b>Место:</b> Пространство Бетон, Кальварийская ул., 17

<b>👆 Что вас ждет:</b>
• Интересные кейсы применения ИИ в бизнесе
• Нетворкинг с единомышленниками
• Обмен опытом и знакомства
• Атмосфера креатива и инноваций

Это отличный шанс прокачать свои знания, познакомиться с единомышленниками и узнать новое о развитии ИИ в реальных бизнес-кейсах!

👉 <b>Зарегистрируйтесь через /start</b>

Будем рады видеть вас! 🎉"""


def load_sent_users():
    """Загружает список пользователей, которые уже получили приглашение."""
    if Path(SENT_FILE).exists():
        with open(SENT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return set(data.get('user_ids', []))
    return set()


def save_sent_users(user_ids, stats):
    """Сохраняет список пользователей, которым отправлено приглашение."""
    data = {
        'sent_at': datetime.utcnow().isoformat(),
        'user_ids': list(user_ids),
        'stats': stats
    }
    with open(SENT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


async def main():
    """Основная функция рассылки."""
    logger.info("🚀 Начинаю рассылку приглашений на мероприятие 18 декабря")

    # Инициализация
    settings = load_settings()
    bot = Bot(token=settings.bot_token)
    engine = create_engine()
    await init_models(engine)
    session_factory = create_session_factory(engine)

    # Загрузка списка уже отправленных
    already_sent_ids = load_sent_users()
    logger.info(f"📨 Уже отправлено ранее: {len(already_sent_ids)} пользователей")

    async with session_factory() as session:
        # 1. Находим мероприятие 18 декабря
        event_result = await session.execute(
            select(Event).where(
                and_(
                    Event.event_date >= datetime(2025, 12, 18, 0, 0, 0),
                    Event.event_date < datetime(2025, 12, 19, 0, 0, 0)
                )
            )
        )
        event = event_result.scalar_one_or_none()

        if not event:
            logger.error("❌ Мероприятие 18 декабря не найдено в БД")
            return

        logger.info(f"📋 Мероприятие: {event.title}")
        logger.info(f"📅 Дата: {event.event_date.strftime('%d.%m.%Y %H:%M')}")

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

        logger.info(f"✅ Уже зарегистрировано на мероприятие: {len(registered_user_ids)} человек (пропускаем)")

        # 3. Получаем ВСЕХ пользователей, исключая зарегистрированных
        if registered_user_ids:
            query = select(User).where(User.id.not_in(registered_user_ids))
        else:
            query = select(User)

        result = await session.execute(query)
        all_users = result.scalars().all()

        # Фильтруем тех, кто уже получил приглашение
        users_to_invite = [u for u in all_users if u.tg_user_id not in already_sent_ids]

        logger.info(f"👥 Всего пользователей в БД: {len(all_users) + len(registered_user_ids)}")
        logger.info(f"📨 Целевая аудитория (незарегистрированные): {len(all_users)}")
        logger.info(f"🎯 Нужно отправить: {len(users_to_invite)}")

        if not users_to_invite:
            logger.info("✅ Всем уже отправлено! Выход.")
            return

    # 4. Начинаем рассылку
    success_count = 0
    blocked_count = 0
    failed_count = 0
    sent_user_ids = already_sent_ids.copy()

    logger.info(f"\n📤 Начинаю отправку приглашений...")

    for i, user in enumerate(users_to_invite, 1):
        try:
            await bot.send_message(
                chat_id=user.tg_user_id,
                text=INVITATION_TEXT,
                parse_mode="HTML"
            )
            success_count += 1
            sent_user_ids.add(user.tg_user_id)

            # Логируем каждые 50 пользователей
            if i % 50 == 0:
                logger.info(f"📊 Прогресс: {i}/{len(users_to_invite)} (успешно: {success_count}, блокировки: {blocked_count}, ошибки: {failed_count})")

            # Anti-flood защита
            await asyncio.sleep(0.05)

        except Exception as e:
            error_message = str(e).lower()

            if "blocked" in error_message or "bot was blocked" in error_message:
                blocked_count += 1
                logger.debug(f"🚫 Пользователь {user.tg_user_id} заблокировал бота")
            else:
                failed_count += 1
                logger.error(f"❌ Ошибка отправки пользователю {user.tg_user_id}: {e}")

    # 5. Финальный отчет
    stats = {
        'total_users_in_db': len(all_users) + len(registered_user_ids),
        'registered_users_skipped': len(registered_user_ids),
        'target_audience': len(all_users),
        'already_sent_before': len(already_sent_ids),
        'attempted_to_send': len(users_to_invite),
        'sent_successfully': success_count,
        'blocked_by_users': blocked_count,
        'failed': failed_count
    }

    save_sent_users(sent_user_ids, stats)

    logger.info("\n" + "="*60)
    logger.info("✅ <b>Рассылка завершена!</b>")
    logger.info("="*60)
    logger.info(f"\n📊 <b>Результаты:</b>")
    logger.info(f"👥 Всего пользователей в БД: {stats['total_users_in_db']}")
    logger.info(f"✅ Уже зарегистрировано (пропущено): {stats['registered_users_skipped']}")
    logger.info(f"📨 Целевая аудитория: {stats['target_audience']}")
    logger.info(f"📤 Уже получили ранее: {stats['already_sent_before']}")
    logger.info(f"🎯 Попытка отправки: {stats['attempted_to_send']}")
    logger.info(f"✅ Отправлено успешно: {stats['sent_successfully']}")
    logger.info(f"🚫 Заблокировали бота: {stats['blocked_by_users']}")
    logger.info(f"❌ Ошибки отправки: {stats['failed']}")
    logger.info(f"\n💾 Данные сохранены в: {SENT_FILE}")
    logger.info("="*60)

    await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
