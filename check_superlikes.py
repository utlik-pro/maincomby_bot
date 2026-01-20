
import urllib.request
import json
import os
import ssl

# Allow unverified context just in case, though standard certs should be fine
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

URL = "https://ndpkxustvcijykzxqxrn.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGt4dXN0dmNpanlrenhxeHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTU2NzUsImV4cCI6MjA4MjU3MTY3NX0.D9jdEgX8qjSqNvmXpu-uCSFDw6SCd7UG8pQNSOvgrKE"

headers = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json"
}

def fetch(endpoint):
    req = urllib.request.Request(f"{URL}{endpoint}", headers=headers)
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return json.loads(response.read())
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}")
        try:
            if hasattr(e, 'read'):
               print(f"Details: {e.read().decode()}")
        except:
            pass
        return None

print("Fetching recent superlikes...")
swipes = fetch("/rest/v1/bot_swipes?action=eq.superlike&select=*&order=swiped_at.desc&limit=5")

if not swipes:
    print("No SuperLikes found or error occurred.")
else:
    print(f"Found {len(swipes)} SuperLikes.")
    for swipe in swipes:
        swiper_id = swipe.get('swiper_id')
        swiped_id = swipe.get('swiped_id')
        created_at = swipe.get('swiped_at') or swipe.get('created_at')

        print(f"\n[Time: {created_at}]")
        
        # Get Swiper info
        swiper = fetch(f"/rest/v1/bot_users?id=eq.{swiper_id}&select=tg_user_id,username,first_name,last_name")
        swiper_info = swiper[0] if swiper else {"id": swiper_id}
        
        fn = swiper_info.get('first_name') or ""
        ln = swiper_info.get('last_name') or ""
        un = swiper_info.get('username') or "N/A"
        uid = swiper_info.get('tg_user_id')
        print(f"From: {fn} {ln} (@{un}) [TG ID: {uid}]")

        # Get Swiped info
        swiped = fetch(f"/rest/v1/bot_users?id=eq.{swiped_id}&select=tg_user_id,username,first_name,last_name")
        swiped_info = swiped[0] if swiped else {"id": swiped_id}

        fn = swiped_info.get('first_name') or ""
        ln = swiped_info.get('last_name') or ""
        un = swiped_info.get('username') or "N/A"
        uid = swiped_info.get('tg_user_id')
        print(f"To:   {fn} {ln} (@{un}) [TG ID: {uid}]")
