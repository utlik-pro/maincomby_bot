#!/usr/bin/env python3
import asyncio
from supabase._async.client import create_client as create_async_client

SUPABASE_URL = "https://ndpkxustvcijykzxqxrn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGt4dXN0dmNpanlrenhxeHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTU2NzUsImV4cCI6MjA4MjU3MTY3NX0.D9jdEgX8qjSqNvmXpu-uCSFDw6SCd7UG8pQNSOvgrKE"

async def check():
    supabase = await create_async_client(SUPABASE_URL, SUPABASE_KEY)

    # Check all profiles (first 5)
    profiles = await supabase.table("bot_profiles").select("*").limit(5).execute()
    print("=== All profiles (first 5) ===")
    for p in profiles.data:
        print(f"  ID: {p.get('id')}, user_id: {p.get('user_id')}, city: {p.get('city')}, occupation: {p.get('occupation')}")

    # Check profile with user_id = 1
    print("\n=== Profile with user_id=1 ===")
    p1 = await supabase.table("bot_profiles").select("*").eq("user_id", 1).execute()
    print(f"  Found: {len(p1.data)} profiles")
    for p in p1.data:
        print(f"  {p}")

    # Check profile with id = 1
    print("\n=== Profile with id=1 ===")
    pid1 = await supabase.table("bot_profiles").select("*").eq("id", 1).execute()
    print(f"  Found: {len(pid1.data)} profiles")
    for p in pid1.data:
        print(f"  {p}")

asyncio.run(check())
