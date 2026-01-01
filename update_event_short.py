#!/usr/bin/env python3
"""
Обновление описания мероприятия - короткий формат
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
            # Короткое описание в стиле других событий
            event.description = """M.AI.N Meetup в Минске. ИИ в маркетинге и бизнесе.

Олег Зелинский расскажет почему ИИ делает одни кампании успешными, а другие - темой для хейта. Как нейросети усиливают бренды и помогают сохранять человечность.

Дима Утлик покажет полный цикл работы с ИИ: от кода до видео. Какую задачу какому "специалисту" делегировать - Grok, Gemini, Claude или Sora."""

            # Короткие описания спикеров
            event.speakers = """Олег Зелинский - CEO брендинговой студии limb, бренд-стратег

Дима Утлик - CEO Utlik.Co, глава M.AI.N Community"""

            await session.commit()

            print(f"✅ Описание обновлено!")
            print(f"\n📝 ОПИСАНИЕ:")
            print(event.description)
            print(f"\n👤 СПИКЕРЫ:")
            print(event.speakers)
        else:
            print("❌ Мероприятие не найдено")

if __name__ == "__main__":
    asyncio.run(main())
