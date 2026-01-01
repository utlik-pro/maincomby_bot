#!/usr/bin/env python3
"""
Обновление названия мероприятия на ИИшница
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
        result = await session.execute(
            select(Event).where(Event.id == 3)
        )
        event = result.scalar_one_or_none()

        if event:
            event.title = "ИИшница от M.AI.N Community в Минске!"
            await session.commit()

            print(f"✅ Название обновлено!")
            print(f"📝 {event.title}")
            print(f"📅 {event.event_date.strftime('%d.%m.%Y %H:%M')}")
            print(f"📍 {event.location}")
        else:
            print("❌ Мероприятие не найдено")

if __name__ == "__main__":
    asyncio.run(main())
