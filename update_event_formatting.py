#!/usr/bin/env python3
"""
Обновление названия на ИИшница №5 и форматирование спикеров
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
            # Обновляем название
            event.title = "ИИшница №5 от M.AI.N Community в Минске!"

            # Обновляем спикеров с жирным шрифтом
            event.speakers = """<b>Олег Зелинский</b> - CEO брендинговой студии limb, бренд-стратег

<b>Дима Утлик</b> - CEO Utlik.Co, глава M.AI.N Community"""

            await session.commit()

            print(f"✅ Обновлено!")
            print(f"📝 Название: {event.title}")
            print(f"\n👤 Спикеры:")
            print(event.speakers)
        else:
            print("❌ Мероприятие не найдено")

if __name__ == "__main__":
    asyncio.run(main())
