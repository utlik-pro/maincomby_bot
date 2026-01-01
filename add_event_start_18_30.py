"""Add 'Старт 18-30' event to database"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import load_settings
from app.db.models import Event


async def add_event():
    """Add 'Старт 18-30' event"""
    settings = load_settings()
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # Минск timezone UTC+3
    minsk_tz = timezone(timedelta(hours=3))
    event_datetime = datetime(2024, 12, 18, 18, 30, tzinfo=minsk_tz)

    # Convert to UTC for storage
    event_datetime_utc = event_datetime.astimezone(timezone.utc)

    async with async_session() as session:
        # Check if event already exists
        result = await session.execute(
            text("SELECT * FROM events WHERE title = :title AND event_date = :date"),
            {"title": "Старт 18-30", "date": event_datetime_utc}
        )
        existing = result.fetchone()

        if existing:
            print("⚠️ Event 'Старт 18-30' already exists!")
            await engine.dispose()
            return

        # Create new event
        event = Event(
            title="Старт 18-30",
            description="""🍳 Вечерняя ИИшница от M.AI.N Community в Минске! 🍳

🏙 Город: Минск
🗓 Дата: 18.12.2024
🕙 Время: 18:30 (регистрация) | 19:00 (начало)
📍 Место: Пространство Бетон, Кальварийская ул., 17

Это отличный шанс прокачать свои знания, познакомиться с единомышленниками и узнать новое о развитии ИИ в реальных бизнес-кейсах!""",
            event_date=event_datetime_utc,
            city="Минск",
            location="Пространство Бетон, Кальварийская ул., 17",
            location_url="https://maps.google.com/?q=53.8933,27.5490",  # Approximate coordinates
            max_participants=100,  # Можно изменить при необходимости
            is_active=True,
            created_by=1379584180  # Admin ID from config
        )

        session.add(event)
        await session.commit()

        print(f"✅ Event 'Старт 18-30' created successfully!")
        print(f"   Date: {event_datetime.strftime('%Y-%m-%d %H:%M')} (Minsk time)")
        print(f"   City: {event.city}")
        print(f"   Location: {event.location}")

    await engine.dispose()


if __name__ == "__main__":
    print("Adding event: Старт 18-30")
    asyncio.run(add_event())
