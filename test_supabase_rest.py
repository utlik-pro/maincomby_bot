#!/usr/bin/env python3
"""Test Supabase REST API connection"""

from supabase import create_client

SUPABASE_URL = "https://ndpkxustvcijykzxqxrn.supabase.co"
SUPABASE_KEY = "sb_publishable_SBb7mMchz99ZIfoPgnxQDQ_bbQpePNZ"

def main():
    print("Testing Supabase REST API...")

    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Test reading bot_users
    print("\nReading bot_users...")
    result = client.table("bot_users").select("id, tg_user_id, username, first_name").limit(5).execute()
    print(f"Found {len(result.data)} users:")
    for user in result.data:
        print(f"  - {user['first_name']} (@{user['username']})")

    # Test reading bot_events
    print("\nReading bot_events...")
    result = client.table("bot_events").select("id, title, event_date").execute()
    print(f"Found {len(result.data)} events:")
    for event in result.data:
        print(f"  - {event['title']}")

    # Test inserting a user
    print("\nTesting insert (will upsert existing user)...")
    result = client.table("bot_users").upsert({
        "tg_user_id": 999999999,
        "username": "test_migration",
        "first_name": "Test",
        "last_name": "User"
    }).execute()
    print(f"Insert result: {result.data}")

    # Delete test user
    print("\nCleaning up test user...")
    client.table("bot_users").delete().eq("tg_user_id", 999999999).execute()
    print("Test user deleted")

    print("\n✅ REST API connection works!")

if __name__ == "__main__":
    main()
