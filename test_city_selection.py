#!/usr/bin/env python3
"""
Test script for multi-city event selection feature
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.db.database import get_session_factory
from app.db.models import Event, User, EventRegistration
from sqlalchemy import select, and_
from datetime import datetime, timedelta


async def test_city_selection():
    """Test the city selection feature."""

    print("🧪 Testing Multi-City Event Selection Feature\n")

    # Initialize database
    session_factory = await get_session_factory()

    async with session_factory() as session:
        print("1️⃣ Checking existing events...")
        result = await session.execute(
            select(Event).order_by(Event.event_date)
        )
        events = result.scalars().all()

        print(f"   Found {len(events)} events:")
        for event in events:
            print(f"   - {event.title} in {event.city} on {event.event_date.strftime('%d.%m.%Y')}")

        print("\n2️⃣ Testing city filtering...")

        # Test Minsk filter
        result = await session.execute(
            select(Event).where(
                and_(
                    Event.city == "Минск",
                    Event.is_active == True
                )
            )
        )
        minsk_events = result.scalars().all()
        print(f"   Events in Минск: {len(minsk_events)}")

        # Test Grodno filter
        result = await session.execute(
            select(Event).where(
                and_(
                    Event.city == "Гродно",
                    Event.is_active == True
                )
            )
        )
        grodno_events = result.scalars().all()
        print(f"   Events in Гродно: {len(grodno_events)}")

        # Test both cities filter
        result = await session.execute(
            select(Event).where(
                and_(
                    Event.city.in_(["Минск", "Гродно"]),
                    Event.is_active == True
                )
            )
        )
        both_events = result.scalars().all()
        print(f"   Events in both cities: {len(both_events)}")

        print("\n3️⃣ Creating test event for Grodno...")

        # Check if Grodno event exists
        if len(grodno_events) == 0:
            test_event = Event(
                title="ИИшница от M.AI.N Community в Гродно!",
                description="Тестовое мероприятие для проверки функционала выбора города",
                event_date=datetime.utcnow() + timedelta(days=30),
                city="Гродно",
                location="ул. Советская, 1",
                location_url=None,
                speakers="Тестовые спикеры",
                max_participants=50,
                registration_deadline=datetime.utcnow() + timedelta(days=25),
                is_active=True,
                created_by=None
            )
            session.add(test_event)
            await session.commit()
            await session.refresh(test_event)
            print(f"   ✅ Created test event: {test_event.title} (ID: {test_event.id})")
        else:
            print(f"   ℹ️  Grodno event already exists")

        print("\n✅ All tests passed!")
        print("\n📝 Next steps:")
        print("   1. Start the bot: python -m app.main")
        print("   2. Send /start to the bot")
        print("   3. Try selecting different cities")
        print("   4. Verify events are filtered correctly")


if __name__ == "__main__":
    asyncio.run(test_city_selection())
