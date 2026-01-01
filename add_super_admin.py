#!/usr/bin/env python3
import asyncio
from supabase._async.client import create_client as create_async_client

SUPER_ADMIN_TG_ID = 1379584180
SUPABASE_URL = "https://ndpkxustvcijykzxqxrn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGt4dXN0dmNpanlrenhxeHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTU2NzUsImV4cCI6MjA4MjU3MTY3NX0.D9jdEgX8qjSqNvmXpu-uCSFDw6SCd7UG8pQNSOvgrKE"

async def add_super_admin():
    supabase = await create_async_client(SUPABASE_URL, SUPABASE_KEY)

    # Get user
    existing = await supabase.table("bot_users").select("*").eq("tg_user_id", SUPER_ADMIN_TG_ID).execute()
    if not existing.data:
        print(f"❌ User not found")
        return

    user = existing.data[0]
    user_id = user['id']
    print(f"✅ User: {user.get('first_name')} (user_id={user_id})")

    # Update points
    await supabase.table("bot_users").update({"points": 25000}).eq("id", user_id).execute()
    print(f"✅ Points: 25000 XP")

    # Check if profile exists
    profile = await supabase.table("bot_profiles").select("*").eq("user_id", user_id).execute()

    if profile.data:
        print(f"✅ Profile already exists, updating...")
        await supabase.table("bot_profiles").update({
            "bio": "Основатель MAIN Community. Строю нетворкинг-платформу для предпринимателей.",
            "occupation": "Founder & CEO",
            "looking_for": "Партнёры, инвесторы, амбициозные проекты",
            "can_help_with": "Бизнес-стратегия, нетворкинг, развитие сообществ",
            "moderation_status": "approved",
            "is_visible": True,
        }).eq("user_id", user_id).execute()
    else:
        print(f"   No profile, creating with high id...")
        # Get max id to avoid conflicts
        max_id_result = await supabase.table("bot_profiles").select("id").order("id", desc=True).limit(1).execute()
        next_id = (max_id_result.data[0]['id'] + 1) if max_id_result.data else 1000

        await supabase.table("bot_profiles").insert({
            "id": next_id,
            "user_id": user_id,
            "bio": "Основатель MAIN Community. Строю нетворкинг-платформу для предпринимателей.",
            "occupation": "Founder & CEO",
            "looking_for": "Партнёры, инвесторы, амбициозные проекты",
            "can_help_with": "Бизнес-стратегия, нетворкинг, развитие сообществ",
            "city": "Минск",
            "moderation_status": "approved",
            "is_visible": True,
        }).execute()
        print(f"✅ Profile created with id={next_id}")

    # Verify
    final_user = await supabase.table("bot_users").select("*").eq("id", user_id).execute()
    final_profile = await supabase.table("bot_profiles").select("*").eq("user_id", user_id).execute()

    print(f"\n🎖️ SUPER ADMIN READY!")
    print(f"   Имя: {final_user.data[0].get('first_name')}")
    print(f"   XP: {final_user.data[0].get('points')} (Генерал)")
    if final_profile.data:
        print(f"   Профессия: {final_profile.data[0].get('occupation')}")
        print(f"   Город: {final_profile.data[0].get('city')}")

asyncio.run(add_super_admin())
