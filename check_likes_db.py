
import asyncio
import os
from app.services.supabase_sync import get_supabase
from dotenv import load_dotenv

load_dotenv()

async def debug_likes():
    supabase = get_supabase()
    
    # 1. First, find the user (assuming it's one of the admins or the user reporting issues)
    # We'll list the last 5 users to identify the likely candidate
    print("--- recent users ---")
    users = supabase.table('bot_users').select('id, first_name, username, telegram_id').order('created_at', desc=True).limit(5).execute()
    for u in users.data:
        print(u)
        
    # Ask for user ID to check (or just check the first one if it looks like admin)
    # For this script we'll just check the most recent user and any user with username 'admin' or similar
    
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
