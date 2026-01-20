
import asyncio
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

async def debug_id1_likes():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print(f"Error: Credentials missing. URL={url}")
        return

    supabase: Client = create_client(url, key)
    
    USER_ID = 1
    print(f"Checking incoming likes for User ID {USER_ID}...")
    
    # 1. Check bot_swipes
    print("\n--- bot_swipes (incoming) ---")
    swipes = supabase.table('bot_swipes').select('*').eq('swiped_id', USER_ID).in_('action', ['like', 'superlike']).execute()
    print(f"Count: {len(swipes.data)}")
    for s in swipes.data:
        print(f" - From {s['swiper_id']} ({s['action']})")
        
    if not swipes.data:
        print("No incoming likes found.")
        return

    liker_ids = [s['swiper_id'] for s in swipes.data]
    print(f"\nLiker IDs: {liker_ids}")
    
    # 2. Check profiles for these likers
    print("\n--- bot_profiles check ---")
    profiles = supabase.table('bot_profiles').select('user_id, city').in_('user_id', liker_ids).execute()
    print(f"Found {len(profiles.data)} profiles matching liker IDs.")
    for p in profiles.data:
        print(f" - Profile for {p['user_id']}")

if __name__ == "__main__":
    asyncio.run(debug_id1_likes())
