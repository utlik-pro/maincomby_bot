#!/usr/bin/env python3
"""
Обновление города мероприятия на Минск
"""

import asyncio
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
            event.city = "Минск"
            event.title = "M.AI.N Meetup #5 - Минск"
            await session.commit()
            print(f"✅ Мероприятие обновлено!")
            print(f"🏙 Город: {event.city}")
            print(f"📝 Название: {event.title}")
        else:
            print("❌ Мероприятие не найдено")

if __name__ == "__main__":
    asyncio.run(main())
