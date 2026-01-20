
import asyncio
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

async def debug_likes():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        print(f"Error: SUPABASE_URL or keys not found. URL={url}, KEY_PRESENT={bool(key)}")
        return

    supabase: Client = create_client(url, key)
    
    # 1. First, find the user (assuming it's one of the admins or the user reporting issues)
    # We'll list the last 5 users to identify the likely candidate
    print("--- recent users ---")
    users = supabase.table('bot_users').select('id, first_name, username, tg_user_id').order('first_seen_at', desc=True).limit(5).execute()
    for u in users.data:
        print(u)
    
    target_users = users.data
    
    for user in target_users:
        user_id = user['id']
        print(f"\nChecking likes for user {user['first_name']} (ID: {user_id})...")
        
        # Check incoming swipes (Who liked this user)
        # action='like' or 'superlike'
        likes = supabase.table('bot_swipes').select('*').eq('swiped_id', user_id).in_('action', ['like', 'superlike']).execute()
        
        print(f"Total incoming likes: {len(likes.data)}")
        for like in likes.data:
            print(f" - Liker ID: {like['swiper_id']}, Action: {like['action']}, Date: {like['swiped_at']}")

if __name__ == "__main__":
    asyncio.run(debug_likes())
