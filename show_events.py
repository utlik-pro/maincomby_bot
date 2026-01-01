#!/usr/bin/env python3
"""
Показать все мероприятия из БД
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
            select(Event).order_by(Event.id)
        )
        events = result.scalars().all()

        for event in events:
            print(f"\n{'='*80}")
            print(f"ID: {event.id}")
            print(f"Название: {event.title}")
            print(f"Дата: {event.event_date}")
            print(f"Город: {event.city}")
            print(f"Адрес: {event.location}")
            print(f"\nОПИСАНИЕ:")
            print(event.description[:500] if event.description else "Нет описания")
            print(f"\nСПИКЕРЫ:")
            print(event.speakers[:300] if event.speakers else "Нет спикеров")
            print('='*80)

if __name__ == "__main__":
    asyncio.run(main())
