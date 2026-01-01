#!/usr/bin/env python3
"""
Sync bot_events to web events table
This makes bot events visible in the web admin panel
"""

from supabase import create_client
from datetime import datetime

SUPABASE_URL = "https://ndpkxustvcijykzxqxrn.supabase.co"
SUPABASE_KEY = "sb_publishable_SBb7mMchz99ZIfoPgnxQDQ_bbQpePNZ"

def main():
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("=== Syncing Bot Events to Web Events ===\n")

    # Get all bot events
    bot_events = client.table("bot_events").select("*").execute()
    print(f"Found {len(bot_events.data)} bot events\n")

    for event in bot_events.data:
        print(f"Processing: {event['title']}")

        # Check if already exists in web events (by title match)
        existing = client.table("events").select("id").eq("title", event['title']).execute()

        web_event = {
            "title": event['title'],
            "description": event['description'],
            "date": event['event_date'],
            "location_name": event['location'],
            "location_address": event['location'],
            "speaker": event['speakers'],  # Store speakers text in speaker field
            "is_published": event['is_active'],
            "duration_minutes": 120,  # Default 2 hours
            "price": 0,
            "telegram_bot_url": "https://t.me/maincomby_bot",
        }

        if existing.data:
            # Update existing
            result = client.table("events").update(web_event).eq("id", existing.data[0]['id']).execute()
            print(f"  Updated existing event (id={existing.data[0]['id']})")
        else:
            # Insert new
            result = client.table("events").insert(web_event).execute()
            print(f"  Created new event (id={result.data[0]['id']})")

            # Link bot_event to web_event
            client.table("bot_events").update({
                "web_event_id": result.data[0]['id']
            }).eq("id", event['id']).execute()
            print(f"  Linked bot_event {event['id']} to web_event {result.data[0]['id']}")

    print("\n=== Creating Speakers ===\n")

    # Create speakers from known data
    speakers_data = [
        {
            "name": "Дима Утлик",
            "title": "CEO Utlik Co, глава M.AI.N Community",
            "description": "Основатель M.AI.N Community, специалист по AI-инструментам для продуктивности",
            "is_active": True
        },
        {
            "name": "Никита Карпук",
            "title": "ТОП-менеджер AAR & HDR MCB Logistics",
            "description": "Эксперт по применению AI в корпоративном управлении",
            "is_active": True
        },
        {
            "name": "Сергей Савицкий",
            "title": "CEO QIRE lab",
            "description": "Специалист по AI-презентациям и автоматизации",
            "is_active": True
        },
        {
            "name": "Олег Зелинский",
            "title": "CEO брендинговой студии limb, бренд-стратег",
            "description": "Эксперт по брендингу и стратегии",
            "is_active": True
        },
        {
            "name": "Алекс Шкор",
            "title": "ИИ архитектор, CEO Collective Intelligence Labs",
            "description": "Специалист по архитектуре ИИ систем",
            "is_active": True
        },
        {
            "name": "Яна Мартыненко",
            "title": "Development Manager M.AI.N Community",
            "description": "Менеджер по развитию сообщества",
            "is_active": True
        }
    ]

    for speaker in speakers_data:
        # Check if speaker exists
        existing = client.table("speakers").select("id").eq("name", speaker['name']).execute()

        if existing.data:
            print(f"Speaker '{speaker['name']}' already exists")
        else:
            result = client.table("speakers").insert(speaker).execute()
            print(f"Created speaker: {speaker['name']} (id={result.data[0]['id']})")

    print("\n=== Creating Location ===\n")

    # Create default location
    locations_data = [
        {
            "name": "Пространство Бетон",
            "address": "Кальварийская ул., 17, Минск",
            "is_active": True
        },
        {
            "name": "Технопарк Гродно",
            "address": "ул. Гаспадарчая, 21А, Гродно",
            "is_active": True
        }
    ]

    for loc in locations_data:
        existing = client.table("locations").select("id").eq("name", loc['name']).execute()

        if existing.data:
            print(f"Location '{loc['name']}' already exists")
        else:
            result = client.table("locations").insert(loc).execute()
            print(f"Created location: {loc['name']} (id={result.data[0]['id']})")

    print("\n=== Sync Complete! ===")

    # Verify
    print("\nVerification:")
    events = client.table("events").select("id,title").execute()
    print(f"  Events: {len(events.data)}")
    speakers = client.table("speakers").select("id,name").execute()
    print(f"  Speakers: {len(speakers.data)}")
    locations = client.table("locations").select("id,name").execute()
    print(f"  Locations: {len(locations.data)}")

if __name__ == "__main__":
    main()
