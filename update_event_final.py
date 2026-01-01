#!/usr/bin/env python3
"""
Финальное обновление мероприятия: год 2025 и адрес
"""

import asyncio
from datetime import datetime
from app.db.session import create_engine, create_session_factory, init_models
from app.db.models import Event
from sqlalchemy import select

async def main():
    engine = create_engine()
    await init_models(engine)
    session_factory = create_session_factory(engine)

    async with session_factory() as session:
        # Находим мероприятие ID 3
        result = await session.execute(
            select(Event).where(Event.id == 3)
        )
        event = result.scalar_one_or_none()

        if event:
            # Обновляем дату на 2025 год
            event.event_date = datetime(2025, 12, 18, 19, 0)
            event.registration_deadline = datetime(2025, 12, 18, 18, 0)

            # Обновляем адрес
            event.location = "Пространство Бетон, Кальварийская ул., 17"
            event.location_url = "https://yandex.by/maps/-/CDdkFVjz"  # Ссылка на Yandex карты

            await session.commit()

            print(f"✅ Мероприятие обновлено!")
            print(f"📅 Дата: {event.event_date.strftime('%d.%m.%Y %H:%M')}")
            print(f"🏙 Город: {event.city}")
            print(f"📍 Адрес: {event.location}")
            print(f"🗺 Карты: {event.location_url}")
        else:
            print("❌ Мероприятие не найдено")

if __name__ == "__main__":
    asyncio.run(main())
