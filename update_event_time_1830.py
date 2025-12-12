#!/usr/bin/env python3
"""Изменение времени мероприятия 18 декабря на 18:30."""

import asyncio
from datetime import datetime
from sqlalchemy import select, update
from app.db.session import create_engine, create_session_factory, init_models
from app.db.models import Event


async def main():
    # Инициализация БД
    engine = create_engine()
    await init_models(engine)
    session_factory = create_session_factory(engine)

    async with session_factory() as session:
        # Находим мероприятие 18 декабря
        result = await session.execute(
            select(Event).where(
                Event.event_date >= datetime(2025, 12, 18, 0, 0, 0),
                Event.event_date < datetime(2025, 12, 19, 0, 0, 0)
            )
        )
        event = result.scalar_one_or_none()

        if not event:
            print("❌ Мероприятие 18 декабря не найдено")
            return

        print(f"Найдено мероприятие: {event.title}")
        print(f"Текущее время: {event.event_date.strftime('%d.%m.%Y %H:%M')}")

        # Изменяем время на 18:30
        new_date = event.event_date.replace(hour=18, minute=30)

        await session.execute(
            update(Event)
            .where(Event.id == event.id)
            .values(event_date=new_date)
        )
        await session.commit()

        print(f"✅ Время изменено на: {new_date.strftime('%d.%m.%Y %H:%M')}")


if __name__ == "__main__":
    asyncio.run(main())
